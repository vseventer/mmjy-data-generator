/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mark van Seventer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Strict mode.
'use strict';

// SET-UP.
// =======

// Standard lib.
var fs   = require('fs'),
    util = require('util');

// Package modules.
var async = require('async'),
    slug  = require('slug');

// Local modules.
var config      = require('./config'),
    parser      = require('./lib/parser'),
    polygon     = require('./lib/polygon'),
    roundCoords = require('./lib/coords').round;

// HELPERS.
// ========

// Appends the provided shapes to the provided features.
var appendShapesToGeoJSONFeatures = function(features, shapes) {
  return features.map(function(feature) {
    var shape = shapes[feature.properties.id];
    if(null == shape) {
      console.log('Skipping: no shape for %s (%s).', feature.properties.code, feature.properties.name);
      return feature;
    }

    // Convert to MultiPolygon.
    if('Polygon' === shape.type) {
      shape = { type: 'MultiPolygon', coordinates: [ shape.coordinates ] };
    }

    // Append shape to geometry.
    feature.geometry.geometries.push(polygon.reduce(shape));
    return feature;
  });
};

// Converts the provided record to continent record.
var recordToContinent = function(record) {
  // Update properties.
  config.continents.filter(function(continent) {
    if(continent.id === record.name) {
      console.log('Setting %s continent code to %s.', record.name, continent.code);
      record.name          = continent.name || continent.id;          // Update name.
      record.continentCode = continent.code || record.continentCode;  // Update code.
      record.bbox          = continent.bbox || record.bbox;           // Update bbox.
      record.countries     = continent.cc2  || record.cc2.split(','); // Update countries.
    }
  });
  return record;
};

// Converts the provided record to GeoJSON feature.
var recordToGeoJSONFeature = function(type) {
  var codeField = util.format('%sCode', type),
      codes     = [ ]; // Avoid duplicates.
  return function(record) {
    var code = record[codeField]; // Init.

    // Ensure the code field is unique.
    if(-1 !== codes.indexOf(code)) {
      console.warn('Duplicate %s for %s (%s).', codeField, code, record.name);
      code = util.format('_%s', code); // Prepend with `_`.
    }
    codes.push(code); // Append.

    // Return the feature.
    return {
      type: 'Feature',
      properties: {
        id   : record.geonameId,
        code : code,
        name : record.name,
        slug : slug(record.name, { lower: true }),
        continent: 'country' === type ? record.continentCode : undefined, // Omitted if `undefined`.
        countries: record.countries // Omitted if `undefined`.
      },
      geometry: {
        type: 'GeometryCollection',
        geometries: [{
          type: 'Point',
          coordinates: roundCoords([ record.lng, record.lat ])
        }, {
          type: 'Polygon',
          coordinates: [
            [
              roundCoords([ record.bbox.east, record.bbox.north ]),
              roundCoords([ record.bbox.east, record.bbox.south ]),
              roundCoords([ record.bbox.west, record.bbox.south ]),
              roundCoords([ record.bbox.west, record.bbox.north ]),
              roundCoords([ record.bbox.east, record.bbox.north ])
            ]
          ]
        }]
      }
    };
  };
};

// Requires a source file.
var requireSrc = function(file, callback) {
  var data = require(file);
  if(data.geonames) { // Format is OK.
    return callback(null, data.geonames);
  }
  var err = util.format('Source %s: %s.', file, data.status.message);
  callback(new Error(err));
};

// Sorts the provided array by the provided field.
var sort = function(arr, field) {
  field = field || 'name'; // Cast.
  arr.sort(function(x, y) {
    return x.properties[field] < y.properties[field] ? -1 : 1;
  });
  return arr;
};

// Updates the country listing for the provided continents.
var updateCountriesForGeoJSONFeatures = function(continents, countries) {
  continents.features = continents.features.map(function(continent) {
    continent.properties.countries = countries.features.filter(function(country) {
      return country.properties.continent === continent.properties.code;
    }).map(function(country) {
      return country.properties.code;
    });
    console.log('Setting %s country listing to %s.', continent.properties.name, continent.properties.countries);
    return continent;
  });
  return continents;
};

// Updates the continent code for the provided countries.
var updateContinentForGeoJSONFeatures = function(features, continents) {
  return features.map(function(feature) {
    continents.features.filter(function(continent) {
      if(null != continent.properties.countries &&
       -1 !== continent.properties.countries.indexOf(feature.properties.code)) {
        console.log('Setting %s continent code to %s.', feature.properties.name, continent.properties.code);
        feature.properties.continent = continent.properties.code;
      }
    });
    return feature;
  });
};

// RUN.
// ====
async.auto({
  // Source.
  srcContinents: function(callback) {
    return requireSrc(config.src.continents, callback);
  },
  srcCountries: function(callback) {
    return requireSrc(config.src.countries, callback);
  },

  srcCaribbean: function(callback) {
    return requireSrc(config.src.caribbean, callback);
  },
  srcCentralAmerica: function(callback) {
    return requireSrc(config.src.centralAmerica, callback);
  },
  srcMiddleEast: function(callback) {
    return requireSrc(config.src.middleEast, callback);
  },

  // Continents.
  continents: [ 'srcContinents', 'custom', function(callback, results) {
    // Import, merge, and convert.
    var continents = results.srcContinents; // Extract.
    continents.push.apply(continents, results.custom); // Merge.
    var result = continents.map(recordToGeoJSONFeature('continent'));

    // Format as collection and continue.
    result = {
      type: 'FeatureCollection',
      features: sort(result)
    };
    return callback(null, result); // Continue.
  } ],

  custom: [ 'srcCaribbean', 'srcCentralAmerica', 'srcMiddleEast', function(callback, results) {
    callback(null, [
      recordToContinent(results.srcCaribbean[0]),
      recordToContinent(results.srcCentralAmerica[0]),
      recordToContinent(results.srcMiddleEast[0])
    ]);
  } ],

  reference: [ 'continents', 'countries', function(callback, results) {
    var result = updateCountriesForGeoJSONFeatures(results.continents, results.countries);
    callback(null, result); // Continue.
  } ],

  // Countries.
  countries: [ 'srcCountries', 'continents', 'shapes', function(callback, results) {
    // Import and convert.
    var countries = results.srcCountries.map(recordToGeoJSONFeature('country'));

    // Apply continent mapping and shapes.
    countries = updateContinentForGeoJSONFeatures(countries, results.continents);
    countries = appendShapesToGeoJSONFeatures(countries, results.shapes);

    // Format as collection and continue.
    var result = {
      type: 'FeatureCollection',
      features: sort(countries)
    };
    return callback(null, result);
  } ],

  // Shapes.
  rawShapes: function(callback) {
    return parser(config.src.shapes, null, callback);
  },
  shapes: [ 'rawShapes', function(callback, results) {
    // Format as geonameId -> geometry mapping.
    var result = results.rawShapes.reduce(function(map, record) {
      map[record.geoNameId] = JSON.parse(record.geoJSON);
      return map;
    }, { });
    return callback(null, result);
  } ],

  // Output.
  writeContinents: [ 'continents', 'reference', function(callback, results) {
    var content = JSON.stringify(results.reference, null, 2);
    fs.writeFile(config.dest.continents, content, callback);
  } ],
  writeCountries: [ 'countries', function(callback, results) {
    var content = JSON.stringify(results.countries, null, 2);
    fs.writeFile(config.dest.countries, content, callback);
  } ]
}, function(err) {
  // Handle errors.
  if(null !== err) {
    console.error(err);
    process.exit(1);
  }

  // Done.
  console.log('Written %s.', config.dest.continents);
  console.log('Written %s.', config.dest.countries);
});
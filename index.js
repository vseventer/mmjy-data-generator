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

// Standard lib.
var fs   = require('fs'),
    path = require('path');

// Package modules.
var async = require('async'),
    slug  = require('slug');

// Local modules.
var config  = require('./config'),
    parser  = require('./lib/parser'),
    polygon = require('./lib/polygon'),
    roundCoords = require('./lib/coords').round;

// Configure.
var paths = {
  src  : path.join(__dirname, './src'),
  dest : path.join(__dirname, './out', config.dest),
};
paths.centroids = path.join(paths.src, './centroids.csv');
paths.countries = path.join(paths.src, './countries.csv');
paths.shapes    = path.join(paths.src, './shapes.csv');

// Helper function which merges countries with their shapes.
var combine = function(countries, centroids, shapes, callback) {
  // Format countries as GeoJSON features.
  var result = countries.map(function(country) {
    // Continent.
    var continent = country.continent;
    if(-1 !== config.continents.caribbean.indexOf(country.iso)) {
      continent = config.continents.caribbeanCode;
      console.log('Updating continent to %s for: %s (%s).', continent, country.name, country.iso);
    }
    else if(-1 !== config.continents.centralAmerica.indexOf(country.iso)) {
      continent = config.continents.centralAmericaCode;
      console.log('Updating continent to %s for: %s (%s).', continent, country.name, country.iso);
    }
    else if(-1 !== config.continents.middleEast.indexOf(country.iso)) {
      continent = config.continents.middleEastCode;
      console.log('Updating continent to %s for: %s (%s).', continent, country.name, country.iso);
    }

    // Initialize.
    var feature = {
      type: 'Feature',
      properties: {
        code      : country.iso,
        name      : country.name,
        slug      : slug(country.name, { lower: true }),
        continent : continent
      },
      geometry: {
        type: 'GeometryCollection',
        geometries: [ ]
      }
    };

    // Add centroid.
    var centroid = config.centroids[country.iso] || centroids[country.iso] || null;
    if(null === centroid) {
      console.warn('No centroid found for: %s (%s).', country.iso, country.name);
    }
    else { // Append to feature.
      centroid = roundCoords(centroid); // Simplify.
      feature.geometry.geometries.push({ type: 'Point', coordinates: centroid });
    }

    // Add shape.
    var shape = shapes[country.geonameid] || null;
    if(null === shape) {
      console.warn('No shape found for: %s (%s).', country.iso, country.name);
    }
    else { // Append to feature.
      shape = polygon.reduce(shape); // Simplify.
      feature.geometry.geometries.push(shape);
    }
    return feature;
  });

  // Sort and continue.
  result.sort(function(x, y) {
    return x.properties.name < y.properties.name ? -1 : 1;
  });
  callback(null, result); // Continue.
};

// Run.
async.auto({
  // Import centroids CSV.
  importCentroids: function(callback) {
    var opts = { columns: [ 'iso', 'lat', 'lng' ], delimiter: ',' };
    return parser(paths.centroids, opts, callback);
  },

  // Import countries CSV.
  importCountries: function(callback) {
    return parser(paths.countries, { columns: config.csvColumns }, callback);
  },

  // Import shapes CSV.
  importShapes: function(callback) {
    return parser(paths.shapes, null, callback);
  },

  // Process centroids.
  centroids: [ 'importCentroids', function(callback, results) {
    var result = results.importCentroids.reduce(function(prev, current) {
      prev[current.iso] = [ current.lng, current.lat ];
      return prev;
    }, { });
    return callback(null, result); // Continue.
  } ],

  // Process shapes.
  shapes: [ 'importShapes', function(callback, results) {
    var result = results.importShapes.reduce(function(prev, current) {
      prev[current.geoNameId] = JSON.parse(current.geoJSON);
      return prev;
    }, { });
    return callback(null, result); // Continue.
  } ],

  // Process countries.
  countries: [ 'importCountries', 'centroids', 'shapes', function(callback, results) {
    return combine(results.importCountries, results.centroids, results.shapes, callback);
  } ]
}, function(err, results) {
  if(null !== err) {
    console.error(err);
    process.exit(1);
  }

  // Convert to FeatureCollection.
  var result = {
    type: 'FeatureCollection',
    features: results.countries
  };

  // Write to file.
  fs.writeFileSync(paths.dest, JSON.stringify(result, null, 2));

  // Done.
  console.log('Written %d countries to file: %s.', results.countries.length, paths.dest);
});
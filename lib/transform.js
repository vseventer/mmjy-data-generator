/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Mark van Seventer
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
var util = require('util');

// Package modules.
var find    = require('lodash.find'),
    matches = require('lodash.matchesproperty'),
    polygon = require('./polygon'),
    sort    = require('lodash.sortby');

// Local modules.
var format = require('./format');

// CONTINENTS.
// ===========
var transformContinent = function(continent, map) {
  // Countries.
  var countries = map.countries.features.reduce(function(list, country) {
    if(continent.continentCode === country.properties.continent.code) {
      list.push({
        code : country.properties.code,
        slug : country.properties.slug,
        name : country.properties.name
      });
    }
    return list;
  }, [ ]);

  // Return the feature.
  return {
    type: 'Feature',
    properties: {
      id   : continent.geonameId,
      code : continent.continentCode,
      slug : format.slugify(continent.name),
      name : continent.name,
      countries  : sort(countries, 'name'),
      population : 0 !== continent.population ? format.number(continent.population) : null,
      timezone   : continent.hasOwnProperty('timezone') ? format.timezone(continent.timezone) : null
    },
    geometry: {
      type: 'GeometryCollection',
      geometries: [{
        type: 'Point',
        coordinates: format.coords([ continent.lng, continent.lat ])
      }, {
        type: 'Polygon',
        coordinates: format.bbox(continent.bbox)
      }]
    }
  };
};

// COUNTRIES.
// ==========
var transformCountry = function(country, map) {
  // Init.
  var geometries = [ ],
      languages  = [ ],
      neighbours = [ ],
      source = find(map['api.countries'], matches('geonameId', country.geonameid)) || null; // Lookup.

  // Continent.
  var continent = find(map['src.continents'], matches('cc', [ country.iso2 ])) ||
   find(map['src.continents'], matches('continentCode', country.continent)) || null; // Lookup.
  if(null !== continent) {
    continent = {
      code : continent.continentCode,
      slug : format.slugify(continent.name),
      name : continent.name
    };
  }
  else {
    console.warn('COUNTRY: %s: no continent.', country.name);
  }

  // Languages.
  var languageCodes = country.languages.split(',');
  languageCodes.forEach(function(code) {
    var isoCode  = code.substr(0, 2),
        language = map.languages[isoCode] || null; // Lookup.
    if(null !== language && !find(languages, matches('code', isoCode))) { // Add only once.
      languages.push({ code: language.iso1, name: language.name });
    }
  });

  // Neighbours.
  var neighbourCodes = country.neighbours.split(',');
  neighbourCodes.forEach(function(code) {
    var country = find(map['src.countries'], matches('iso2', code)) || null; // Lookup.
    if(null !== country) {
      neighbours.push({
        code : country.iso2,
        slug : format.slugify(country.name),
        name : country.name
      });
    }
  });

  // Point.
  if(null !== source && source.hasOwnProperty('lng') && source.hasOwnProperty('lat')) {
    geometries.push({
      type: 'Point',
      coordinates: format.coords([ source.lng, source.lat ])
    });
  }
  else {
    console.warn('COUNTRY: %s: no point coordinate.', country.name);
  }

  // Box.
  if(null !== source && source.hasOwnProperty('bbox')) {
    geometries.push({
      type: 'Polygon',
      coordinates: format.bbox(source.bbox)
    });
  }
  else {
    console.warn('COUNTRY: %s: no box coordinates.', country.name);
  }

  // Shapes.
  var shape = map.shapes[country.geonameid] || null; // Lookup.
  if(null !== shape) {
    geometries.push(polygon.reduce(shape.geometry));
  }
  else {
    console.warn('COUNTRY: %s: no shape coordinates.', country.name);
  }

  // Currency.
  var currency = null;
  if(null !== country.currencyCode && null !== country.currencyName) {
    currency = { code: country.currencyCode, name: country.currencyName };
  }

  // Timezone.
  var timezone = null;
  if(null !== source && source.hasOwnProperty('timezone')) {
    timezone = format.timezone(source.timezone);
  }
  else {
    console.warn('COUNTRY: %s: no timezone.', country.name);
  }

  // Return the feature.
  return {
    type: 'Feature',
    properties: {
      id   : country.geonameid,
      code : country.iso2,
      slug : format.slugify(country.name),
      name : country.name,
      toponym    : null !== source ? source.toponymName || country.name : country.name,
      continent  : continent,
      area       : 0 !== country.area ? format.number(country.area) : null,
      capital    : country.capital || null,
      currency   : currency,
      languages  : sort(languages,  'name'),
      neighbours : sort(neighbours, 'name'),
      population : 0 !== country.population ? format.number(country.population) : null,
      timezone   : timezone
    },
    geometry: {
      type: 'GeometryCollection',
      geometries: geometries
    }
  };
};

// CUSTOM CONTINENTS.
var transformCustom = function(continents, map) {
  return continents.map(function(continent) {
    var data = find(map.continents, matches('id', continent.name));
    continent.continentCode = data.code;
    continent.name = data.name || continent.name;
    continent.bbox = data.bbox || continent.bbox;
    continent.cc   = data.cc2  || continent.cc2.split(',');
    return continent;
  });
};

// PLACES.
var transformPlace = function(place, map) {
  // Country.
  var property = 'properties.code'.split('.'),
      country  = find(map.countries.features, matches(property, place.countryCode)) || null; // Lookup.
  if(null !== country) {
    country = {
      code : country.properties.code,
      slug : country.properties.slug,
      name : country.properties.name
    };
  }
  else {
    console.warn('PLACE: %s: no country.', place.name);
  }

  // Find region.
  var admin1 = util.format('%s.%s', place.countryCode, place.admin1),
      region = find(map.codes, matches('code', admin1)) || null; // Lookup.
  if(null !== region) {
    region = region.name; // Extract.
  }
  else {
    console.log('PLACE: %s: no region.', place.name);
  }

  // Timezone.
  var timezone = find(map.timezones, matches('name', place.timezone)) || null; // Lookup.
  if(null !== timezone) {
    timezone = format.timezone(timezone);
  }
  else {
    console.warn('PLACE: %s: no timezone.', place.name);
  }

  // Return the feature.
  return {
    type: 'Feature',
    properties: {
      id   : parseInt(place.geonameid, 10),
      slug : map.matter[place.geonameid],
      name : place.name,
      region     : region,
      country    : country,
      population : 0 !== place.population ? format.number(place.population) : null,
      timezone   : timezone
    },
    geometry: {
      type: 'Point',
      coordinates: format.coords([ place.longitude, place.latitude ])
    }
  };
};

// Helper.
var apply = function(fn) {
  // Apply `fn` to the returned exported function.
  return function(list, map) {
    // Sanitize elements.
    var features = list.map(function(element) {
      return fn(element, map);
    });

    // Detect duplicate slugs.
    var arr = features.map(function(feature) {
      return feature.properties.slug;
    });
    arr.forEach(function(slug, index) {
      if(arr.indexOf(slug) !== index) {
        console.log('DUPLICATE SLUG: %s', slug, features[index].properties.name);
      }
    });

    // Return as sorted feature collection.
    return {
      type: 'FeatureCollection',
      features: sort(features, 'properties.name')
    };
  };
};

// Exports.
module.exports = {
  continents : apply(transformContinent),
  countries  : apply(transformCountry),
  custom     : transformCustom,
  places     : apply(transformPlace)
};
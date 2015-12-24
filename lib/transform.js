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
var util = require('util');

// Package modules.
var find    = require('lodash.find'),
    matches = require('lodash.matchesproperty'),
    polygon = require('./polygon'),
    sort    = require('lodash.sortby');

// Local modules.
var format = require('./format');

// CITIES.
// =======
var transformCity = function(city, map) {
  // Country.
  var property = 'properties.code'.split('.'),
      country  = find(map.countries.features, matches(property, city.countryCode)) || null; // Lookup.
  if(null !== country) {
    country = {
      code : country.properties.code,
      slug : country.properties.slug,
      name : country.properties.name
    };
  }
  else {
    console.warn('CITY: %s: no country.', city.name);
  }

  // Append state to US cities.
  if('US' === country.code) {
    console.log('CITY: %s: appending state %s.', city.name, city.admin1);
    city.name = util.format('%s, %s', city.name, city.admin1);
  }

  // Timezone.
  var timezone = find(map.timezones, matches('name', city.timezone)) || null; // Lookup.
  if(null !== timezone) {
    timezone = format.timezone(timezone);
  }
  else {
    console.warn('CITY: %s: no timezone.', city.name);
  }

  // Return the feature.
  var slug = util.format('%s-%s', city.name, country.code);
  return {
    type: 'Feature',
    properties: {
      id   : city.geonameid,
      slug : format.slugify(slug),
      name : city.name,
      country    : country,
      population : format.number(city.population),
      timezone   : timezone
    },
    geometry: {
      type: 'Point',
      coordinates: format.coords([ city.longitude, city.latitude ])
    }
  };
};

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
      population : format.number(continent.population),
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
        language = find(map.languages, matches('ISO 639-1', isoCode)) || null; // Lookup.
    if(null !== language && !find(languages, matches('code', isoCode))) { // Add only once.
      languages.push({ code: language['ISO 639-1'], name: language['Language Name'] });
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
  var shape = find(map.shapes, matches('geoNameId', country.geonameid)) || null; // Lookup.
  if(null !== shape) {
    var geojson = JSON.parse(shape.geoJSON);
    geometries.push(polygon.reduce(geojson));
  }
  else {
    console.warn('COUNTRY: %s: no shape coordinates.', country.name);
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
      area       : format.number(country.area),
      capital    : country.capital || null,
      currency   : { code: country.currencyCode, name: country.currencyName },
      languages  : sort(languages,  'name'),
      neighbours : sort(neighbours, 'name'),
      population : format.number(country.population),
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

// Helper.
var apply = function(fn) {
  // Apply `fn` to the returned exported function.
  return function(list, map) {
    // Sanitize elements.
    var features = list.map(function(element) {
      return fn(element, map);
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
  cities     : apply(transformCity),
  continents : apply(transformContinent),
  countries  : apply(transformCountry),
  custom     : transformCustom
};
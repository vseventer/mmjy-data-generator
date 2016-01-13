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

// Package modules.
var async = require('async');

// Local modules.
var config = require('./config'),
    reader = require('./lib/reader'),
    transform = require('./lib/transform'),
    writer = require('./lib/writer');

// Run.
async.auto({
  // CODES.
  // ======
  codes: reader.bind(null, config.src.codes, { headers: config.csv.code }),

  // CONTINENTS.
  // ===========
  'src.continents': [ 'custom', function(callback, results) {
    var data = require(config.src.continents).geonames.concat(results.custom);
    return callback(null, data);
  } ],
  continents: [ 'src.continents', 'countries', function(callback, results) {
    var data = transform.continents(results['src.continents'], results);
    return callback(null, data);
  } ],
  'dest.continents': [ 'continents', function(callback, results) {
    return writer(config.dest.continents, results.continents, callback);
  } ],

  // COUNTRIES.
  // ==========
  'api.countries': function(callback) {
    var data = require(config.src.countries.api).geonames;
    return callback(null, data);
  },
  'src.countries': reader.bind(null, config.src.countries.csv, { headers: config.csv.country }),
  countries: [ 'api.countries', 'src.continents', 'src.countries', 'languages', 'shapes', 'timezones', function(callback, results) {
    var data = transform.countries(results['src.countries'], results);
    return callback(null, data);
  } ],
  'dest.countries': [ 'countries', function(callback, results) {
    return writer(config.dest.countries, results.countries, callback);
  } ],

  // CITIES.
  // =======
  'src.cities': reader.bind(null, config.src.cities, { headers: config.csv.geoname }),
  cities: [ 'src.cities', 'codes', 'timezones', 'countries', function(callback, results) {
    var data = transform.cities(results['src.cities'], results);
    return callback(null, data);
  } ],
  'dest.cities': [ 'cities', function(callback, results) {
    return writer(config.dest.cities, results.cities, callback);
  } ],

  // CUSTOM CONTINENTS.
  // ==================
  'src.custom': function(callback) {
    var data = Array.prototype.concat.apply([ ], [
      require(config.src.custom.caribbean).geonames,
      require(config.src.custom.centralAmerica).geonames,
      require(config.src.custom.middleEast).geonames
    ]);
    return callback(null, data);
  },
  custom: [ 'src.custom', function(callback, results) {
    var data = transform.custom(results['src.custom'], config);
    return callback(null, data);
  } ],

  // LANGUAGES.
  // ==========
  languages: reader.bind(null, config.src.languages, { }),

  // SHAPES.
  // =======
  shapes: reader.bind(null, config.src.shapes, { }),

  // TIMEZONES.
  // ==========
  timezones: reader.bind(null, config.src.timezones, { headers: config.csv.timezone })
}, function(err, results) {
  if(null !== err) {
    console.error(err);
    process.exit(1);
  }

  console.log('CITIES: %d features in %s.',     results.cities.features.length,     config.dest.cities);
  console.log('COUNTRIES: %d features in %s.',  results.countries.features.length,  config.dest.countries);
  console.log('CONTINENTS: %d features in %s.', results.continents.features.length, config.dest.continents);
});
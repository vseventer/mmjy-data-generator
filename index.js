/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Mark van Seventer
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
var async = require('async'),
    glob  = require('glob');

// Local modules.
var config = require('./config'),
    format = require('./lib/format'),
    matter = require('./lib/matter'),
    reader = require('./lib/reader'),
    transform = require('./lib/transform'),
    writer = require('./lib/writer');

// Run.
async.auto({
  // CODES.
  // ======
  'src.codes': reader.bind(reader, config.src.codes, { headers: config.csv.codes }),
  codes: [ 'src.codes', function(results, callback) {
    var data = format.indexBy(results['src.codes'], 'code');
    return callback(null, data);
  } ],

  // CONTINENTS.
  // ===========
  'src.continents': [ 'custom', function(results, callback) {
    var data = require(config.src.continents).geonames.concat(results.custom);
    return callback(null, data);
  } ],
  continents: [ 'src.continents', 'countries', function(results, callback) {
    var data = transform.continents(results['src.continents'], results);
    return callback(null, data);
  } ],
  'dest.continents': [ 'continents', function(results, callback) {
    return writer(config.dest.continents, results.continents, callback);
  } ],

  // COUNTRIES.
  // ==========
  'api.countries': function(callback) {
    var data = require(config.src.countries.api).geonames;
    return callback(null, data);
  },
  'src.countries': reader.bind(reader, config.src.countries.csv, { headers: config.csv.country }),
  countries: [ 'api.countries', 'src.continents', 'src.countries', 'languages', 'shapes', 'timezones', function(results, callback) {
    var data = transform.countries(results['src.countries'], results);
    return callback(null, data);
  } ],
  'dest.countries': [ 'countries', function(results, callback) {
    return writer(config.dest.countries, results.countries, callback);
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
  custom: [ 'src.custom', function(results, callback) {
    var data = transform.custom(results['src.custom'], config);
    return callback(null, data);
  } ],

  // LANGUAGES.
  // ==========
  'src.languages': reader.bind(reader, config.src.languages, {
    headers   : config.csv.languages,
    skipFirst : true
  }),
  languages: [ 'src.languages', function(results, callback) {
    var data = format.indexBy(results['src.languages'], 'iso1');
    return callback(null, data);
  } ],

  // MATTER.
  // =======
  'src.matter': function(callback) {
    glob(config.pattern, { nocase: true, nosort: true }, callback);
  },
  matter: [ 'src.matter', function(results, callback) {
    var data = matter(results['src.matter']);
    callback(null, data);
  } ],
  'dest.matter': [ 'matter', 'places', function(results, callback) {
    // Calculate difference between all and added places.
    var added = results.places.features.map(function(place) {
      return place.properties.id;
    });

    // Log missing places and continue.
    Object.keys(results.matter).forEach(function(geonameid) {
      var key = parseInt(geonameid, 10);
      if(-1 === added.indexOf(key)) {
        console.log('PLACE: %d (%s): no match.', key, results.matter[geonameid]);
      }
    });
    return callback();
  } ],

  // PLACES.
  // =======
  'src.places': [ 'codes', 'countries', 'matter', 'timezones', function(results, callback) {
    var validateFn = function(feature) {
      if(!results.matter.hasOwnProperty(feature.geonameid)) {
        return false;
      }
      console.log('PLACE: %s: adding %s.', results.matter[feature.geonameid], feature.name);
      return true;
    };
    return reader(config.src.places, { autoParse: false, headers: config.csv.geoname, validate: validateFn }, callback);
  } ],
  places: [ 'matter', 'src.places', function(results, callback) {
    var data = transform.places(results['src.places'], results);
    return callback(null, data);
  } ],
  'dest.places': [ 'places', function(results, callback) {
    return writer(config.dest.places, results.places, callback);
  } ],

  // SHAPES.
  // =======
  'src.shapes': function(callback) {
    var data = require(config.src.shapes);
    return callback(null, data);
  },
  shapes: [ 'src.shapes', function(results, callback) {
    var data = format.indexByNested(results['src.shapes'].features, 'properties', 'geoNameId');
    return callback(null, data);
  } ],

  // TIMEZONES.
  // ==========
  'src.timezones': reader.bind(reader, config.src.timezones, {
    headers   : config.csv.timezones,
    skipFirst : true
  }),
  timezones: [ 'src.timezones', function(results, callback) {
    var data = format.indexBy(results['src.timezones'], 'name');
    return callback(null, data);
  } ]
}, function(err, results) {
  if(null !== err) {
    console.error(err);
    process.exit(1);
  }

  console.log('COUNTRIES: %d features in %s.',  results.countries.features.length,  config.dest.countries);
  console.log('CONTINENTS: %d features in %s.', results.continents.features.length, config.dest.continents);
  console.log('PLACES: %d features in %s.',     results.places.features.length,     config.dest.places);
});
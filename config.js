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

// Standard lib.
var path = require('path');

// Configure.
var src  = path.join(__dirname, './src'),
    dest = path.join(__dirname, './out'),
    hugo = path.join(__dirname, '../markmyjourney/'); // Path to MarkMyJourney repo.

// Exports.
module.exports = {
  // Frontmatter glob pattern.
  pattern: path.join(hugo, 'content/**/*.md'),

  // Source.
  src: {
    codes      : path.join(src, 'codes.csv'),
    continents : path.join(src, 'continents.json'),
    countries  : {
      api : path.join(src, 'countries.json'),
      csv : path.join(src, 'countries.csv')
    },
    languages : path.join(src, 'languages.csv'),
    places    : path.join(src, 'places.csv'),
    shapes    : path.join(src, 'shapes.json'),
    timezones : path.join(src, 'timezones.csv'),

    custom: {
      caribbean      : path.join(src, 'caribbean.json'),
      centralAmerica : path.join(src, 'central-america.json'),
      middleEast     : path.join(src, 'middle-east.json')
    }
  },

  // Destination.
  dest: {
    continents : path.join(dest, 'continents.json'),
    countries  : path.join(dest, 'countries.json'),
    places     : path.join(dest, 'places.json')
  },

  // Custom continents.
  continents: [{
    id   : 'Caribbean',
    name : 'Caribbean', // Fix GeoNames typo.
    code : 'CR'
  }, {
    id   : 'Central America',
    code : 'CA'
  }, {
    id   : 'Middle East',
    code : 'ME',
    bbox : {
      north : 18.9999989031009, // Turkey.
      east  : 63.317471, // Iran.
      south : 12.1110910264462, // Yemen.
      west  : 24.698111  // Egypt.
    },
    cc2: [
      'BH', // Bahrain.
      'EG', // Egypt.
      'IR', // Iran.
      'IQ', // Iraq.
      'IL', // Israel.
      'JO', // Jordan.
      'KW', // Kuwait.
      'LB', // Lebanon.
      'OM', // Oman.
      'PS', // Palestine.
      'QA', // Qatar.
      'SA', // Saudi Arabia.
      'SY', // Syria.
      'TR', // Turkey.
      'AE', // United Arab Emirates.
      'YE'  // Yemen.
    ]
  }],

  // CSV field mappings.
  csv: {
    // CODES.
    // ======
    codes: [
      'code',
      'name',
      'asciiname',
      'geonameid'
    ],

    // COUNTRIES.
    // ==========
    country: [
      'iso2',
      'iso3',
      'iso',
      'fips',
      'name',
      'capital',
      'area',
      'population',
      'continent',
      'tld',
      'currencyCode',
      'currencyName',
      'phone',
      'postalCodeFormat',
      'postalCodeRegex',
      'languages',
      'geonameid',
      'neighbours',
      'fips2'
    ],

    // GEONAMES.
    // =========
    geoname: [ // @see http://download.geonames.org/export/dump/
      'geonameid',    // Id of record in geonames database.
      'name',         // Name of geographical point.
      'asciiName',    // Name of geographical point in plain ascii characters.
      'alternateNames', // Alternatenames, comma separated, ascii names automatically transliterated.
      'latitude',     // Latitude in decimal degrees (WGS84).
      'longitude',    // Longitude in decimal degrees (WGS84).
      'featureClass', // @see http://www.geonames.org/export/codes.html
      'featureCode',  // @see http://www.geonames.org/export/codes.html
      'countryCode',  // ISO-3166 2-letter country code.
      'cc2',          // Alternate country codes, comma separated, ISO-3166 2-letter country code.
      'admin1',       // Fipscode.
      'admin2',       // Code for the second administrative division, a county in the US.
      'admin3',       // Code for the third administrative division.
      'admin4',       // Code for the fourth administrative division.
      'population',
      'elevation',    // In meters.
      'dem',          // Digital elevation model, SRTM3 or GTOPO30.
      'timezone',     // Timezone id.
      'modificationDate' // Date of last modification.
    ],

    // LANGUAGES.
    // ==========
    languages: [
      'iso3',
      'iso2',
      'iso1',
      'name'
    ],

    // SHAPES.
    // =======
    shapes: [
      'geonameid',
      'geoJSON'
    ],

    // TIMEZONES.
    // ==========
    timezones: [
      'countryCode',
      'name',
      'gmt',
      'dst',
      'raw'
    ]
  },

  maxLength: 250 // Maximum polygon length.
};
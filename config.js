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
var path = require('path');

// Configure.
var src  = path.join(__dirname, './src'),
    dest = path.join(__dirname, './out');

// Exports.
module.exports = {
  // Source.
  src: {
    continents : path.join(src, 'continents.json'),
    countries  : path.join(src, 'countries.json'),
    countries2 : path.join(src, 'countries.csv'),
    languages  : path.join(src, 'languages.csv'),
    shapes     : path.join(src, 'shapes.csv'),

    caribbean      : path.join(src, 'caribbean.json'),
    centralAmerica : path.join(src, 'central-america.json'),
    middleEast     : path.join(src, 'middle-east.json')
  },

  // Destination.
  dest: {
    continents : path.join(dest, 'continents.json'),
    countries  : path.join(dest, 'countries.json')
  },

  // Custom continents.
  continents: [{
    id   : 'Carribean',
    name : 'Caribbean', // Fix GeoNames typo.
    code : 'CR'
  }, {
    id   : 'Central America',
    code : 'CA'
  }, {
    id   : 'Middle East',
    code : 'ME',
    bbox : {
      north : 39.777222, // Iran.
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
      'AE', // United Arab Emirates.
      'YE'  // Yemen.
    ]
  }],

  // Secondary country mapping.
  columns: [
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

  // Maximum polygon length.
  maxLength: 250
};
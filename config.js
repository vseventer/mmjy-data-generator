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

// Exports.
module.exports = {
  // Destination filename.
  dest: 'countries.geo.json',

  // Custom centroid mapping.
  centroids: {
    'AX' : [  60.20,   19.81 ], // Aland Islands.
    'BL' : [  17.9,   -62.83 ], // Saint Barthelemey.
    'BQ' : [  12.18,  -68.23 ], // Bonaire, Saint Eustatius and Saba.
    'CW' : [  12.18,  -69    ], // Curacao.
    'GG' : [  49.45,   -2.55 ], // Guernsey.
    'IM' : [  54.25,   -4.5  ], // Isle of Men.
    'JE' : [  49.19,   -2.11 ], // Jersey.
    'MF' : [  18.07,  -63.05 ], // Saint Martin.
    'PN' : [ -25.07, -130.10 ], // Pitcairn.
    'SS' : [   4.85,   31.6  ], // South Sudan.
    'SX' : [  18.07,  -63.05 ], // Sint Maarten.
    'TL' : [  -8.57,  125.57 ], // Timor Leste.
    'XK' : [  42.58,   21    ]  // Kosovo.
  },

  // Custom continent mapping.
  continents: {
    // Caribbean.
    caribbeanCode: 'CR',
    caribbean: [
      'AI', // Anguilla.
      'AG', // Antigua and Barbuda.
      'AW', // Aruba.
      'BB', // Barbados.
      'BQ', // Bonaire, Saint Eustasius and Saba.
      'KY', // Cayman Islands.
      'CU', // Cuba.
      'CW', // Curacao.
      'DM', // Dominica.
      'DO', // Dominican Republic.
      'GD', // Grenada.
      'GP', // Guadeloupe.
      'HT', // Haiti.
      'JM', // Jamaica.
      'MQ', // Martinique.
      'MS', // Montserrat.
      'PR', // Puerto Rico.
      'BL', // Saint Barthelemy.
      'KN', // Saint Kitts and Nevis.
      'LC', // Saint Lucia.
      'MF', // Saint Martin.
      'VC', // Saint Vincent and the Grenadines.
      'SX', // Sint Maarten.
      'TT', // Trinidad and Tobago.
      'TC', // Turks and Caicos Islands.
      'VG', // British Virgin Islands.
      'VI'  // U.S. Virgin Islands.
    ],

    // Central America.
    centralAmericaCode: 'CA',
    centralAmerica: [
      'BZ', // Belize.
      'CR', // Costa Rica.
      'SV', // El Salvador.
      'GF', // French Guiana.
      'GT', // Guatemala.
      'GY', // Guyana.
      'HN', // Honduras.
      'NI', // Nicaragua.
      'PA', // Panama.
      'SR'  // Suriname.
    ],

    // Middle East.
    middleEastCode: 'ME',
    middleEast: [
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
  },

  // Country CSV-mapping.
  csvColumns: [
    'iso', 'iso3', 'iso-numeric', 'fips', 'name', 'capital', 'area', 'population', 'continent',
    'tld', 'currencyCode', 'currencyName', 'phone', 'postalCode', 'postalCodeRegex', 'languages',
    'geonameid', 'neighbours', 'fipsCode'
  ]
};
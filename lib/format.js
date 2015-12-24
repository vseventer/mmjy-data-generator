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
var moment  = require('moment'),
    numeral = require('numeral'),
    slug    = require('slug');

// Configure.
var DEFAULT_PRECISION = 2;

// Rounds the provided coordinate to the provided precision.
var coords = function(coords, precision) {
  precision = null != precision ? precision : DEFAULT_PRECISION;
  return [
    parseFloat(parseFloat(coords[0]).toFixed(precision)),
    parseFloat(parseFloat(coords[1]).toFixed(precision))
  ];
};

// Returns a box polygon for the provided box.
var bbox = function(box) {
  return [
    [
      coords([ box.east, box.north ]),
      coords([ box.east, box.south ]),
      coords([ box.west, box.south ]),
      coords([ box.west, box.north ]),
      coords([ box.east, box.north ])
    ]
  ];
};

// Formats the provided number to a human-readable format.
var number = function(number) {
  var rounded = number > 1e3 ? Math.round(number / 1000) * 1000 : number,
      format  = number > 1e6 ? '0.0a' : '0,0';
  return numeral(rounded).format(format);
};

// Slugifies the provided value.
var slugify = function(value) {
  return slug(value, { lower: true });
};

// Formats the provided timezone offset to UTC.
var timezoneOffset = function(offset) {
  var date = moment();
  date.utcOffset(offset); // Apply offset.
  return date.format('UTCZ'); // Return formatted offset.
};

// Formats the provided timezone object.
var timezone = function(obj) {
  return {
    name: obj.timeZoneId || obj.name,
    dstOffset : timezoneOffset(obj.dstOffset),
    gmtOffset : timezoneOffset(obj.gmtOffset)
  };
};

// Exports.
module.exports = {
  bbox     : bbox,
  coords   : coords,
  number   : number,
  slugify  : slugify,
  timezone : timezone
};
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
var fs = require('fs');

// Package modules.
var csvParse     = require('csv-parse'),
    objectAssign = require('object-assign');

// Exports.
module.exports = function(src, opts, callback) {
  // Initialize.
  var options = objectAssign({
    auto_parse : true, // Support native data-types.
    columns    : true, // Auto-discover.
    delimiter  : '\t',
    relax      : true  // Continue on reconverable errors.
  }, opts);
  var parser = csvParse(options);

  // Add event listeners.
  var result = [ ];
  parser.on('error', callback);
  parser.on('readable', function() {
    var feature;
    while(null !== (feature = parser.read())) {
      // Skip comments.
      var firstColumn = Object.keys(feature)[0],
          firstValue  = feature[firstColumn];
      if(firstValue.indexOf && 0 === firstValue.indexOf('#')) {
        continue;
      }

      // Append to result.
      result.push(feature);
    }
  });
  parser.on('finish', function() {
    callback(null, result);
  });

  // Run.
  fs.createReadStream(src).pipe(parser);
};
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

// Package modules.
var csv = require('fast-csv'),
    objectAssign = require('object-assign');

// Local modules.
var format = require('./format');

// Configure.
var noop = function(value) {
  return value;
};

// Helpers.
var isComment = function(feature) {
  var column = Object.keys(feature).shift(),
      value  = feature[column];
  return null != value.indexOf && 0 === value.indexOf('#');
};

// Exports.
module.exports = function(src, opts, callback) {
  // Cast.
  if('function' === typeof opts) {
    callback = opts; // Replace.
    opts     = { };  // Reset.
  }

  // Initialize.
  var options = objectAssign({
    autoParse : true,  // Attempt to parse field types.
    delimiter : '\t',  // Use tab as delimiter.
    headers   : true,  // Auto-discover.
    quote     : null,  // Ignore quoting.
    skipFirst : false, // Ignore first line (useful to override headers).
    validate  : function() { return true; }  // Keep record.
  }, opts);

  // Run.
  var count = 0;
  var parser = csv
    .fromPath(src, options)
    .transform(options.autoParse ? format.autoParse : noop)
    .validate(function(feature) {
      count += 1; // Update.

      // Report progress.
      if(0 === count % 100000) {
        console.log('CSV: %s: %d processed.', src, count);
      }

      // Validate the feature.
      if(1 === count && options.skipFirst) {
        return false;
      }
      return !isComment(feature) && options.validate(feature);
    });

  // Add event listeners.
  var result = [ ];
  parser.on('error', callback);
  parser.on('data', function(feature) {
    result.push(feature);
  });
  parser.on('end', function() {
    callback(null, result);
  });
};
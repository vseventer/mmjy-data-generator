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
var matter = require('gray-matter');

// Configure.
var opts = {
  delims : '+++',
  lang   : 'toml'
};

// Helper.
var extractMatter = function(src) {
  var result = matter.read(src, opts);
  return result.data;
};

// Exports.
module.exports = function(files) {
  return files
    .map(extractMatter)
    .reduce(function(prev, current) {
      prev.push.apply(prev, current.places || [ ]);
      prev.push.apply(prev, current.route  || [ ]);
      return prev;
    }, [ ])
    .filter(function(value, index, self) {
      return self.indexOf(value) === index; // Remove duplicates.
    })
    .reduce(function(obj, field) {
      var key = field.split('-').shift(); // Extract `geonameid`.
      obj[key] = field;
      return obj;
    }, { });
};
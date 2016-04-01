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

// Local modules.
var config = require('../config'),
    format = require('./format');

// Configure.
var ANTEMERIDIAN_THRESHOLD = 150,
    MIN_SET_LENGTH = 4,
    TOLERANCE_STEP = 0.1;

// Returns the total length of all elements of the provided array.
var totalLength = function(arr) {
  return arr.reduce(function(total, inner) {
    total += inner[0].length;
    return total;
  }, 0);
};

// Wraps the provided MultiPolygon around the antemeridian.
var wrapAroundAntemeridian = function(multiPolygon) {
  var wrapLeft  = false,
      wrapRight = false;
  multiPolygon.coordinates = multiPolygon.coordinates.map(function(polygon) {
    return polygon.map(function(set) {
      return set.map(function(coords) {
        var longitude = coords[0]; // Init.

        // Wrap around antemeridian only if wrapping is required.
        if(-ANTEMERIDIAN_THRESHOLD > longitude) { // Longitude is close to eastern antemeridian.
          // If we already detected a coord close to the western antemeridian, convert east to west.
          if(wrapRight) {
            longitude += 360;
          }

          // Otherwise, enable wrapping around eastern antemeridian.
          wrapLeft = !wrapRight && true;
        }
        else if(ANTEMERIDIAN_THRESHOLD < longitude) { // Longitude is close to western antemeridian.
          // If we already detected a coord close to the eastern antemeridian, convert west to east.
          if(wrapLeft) {
            longitude -= 360;
          }

          // Otherwise, enable wrapping around western antemeridian.
          wrapRight = !wrapLeft && true;
        }
        return [ longitude, coords[1] ];
      });
    });
  });
  return multiPolygon;
};

// Reduces provided Polygon coordinates.
var reducePolygon = function(polygon, tolerance) {
  // Iterate through the polygon.
  return polygon.map(function(set) {
    var previous = null; // Reset.
    set = set.reduce(function(prev, current) {
      current = format.coords(current); // Round.
      if(null === previous ||
       current[0] >= previous[0] + tolerance || current[0] <= previous[0] - tolerance ||
       current[1] >= previous[1] + tolerance || current[1] <= previous[1] - tolerance
      ) {
        previous = current; // Update.
        prev.push(current);
      }
      return prev; // Continue.
    }, [ ]);

    // Ensure the last element in the Polygon matches the first.
    // NOTE: `previous` is the last element in `set` here.
    if(set[0][0] !== previous[0] || set[0][1] !== previous[1]) {
      set.push(set[0]); // Append.
    }
    return set;
  }).filter(function(set) {
    // Remove sets with less elements than required to make a polygon.
    return MIN_SET_LENGTH <= set.length;
  });
};

// Reduces provided MultiPolygon.
var reduce = function(multiPolygon, step) {
  // Init.
  var coords,
      length,
      tolerance = 0;
  step = null != step ? step : TOLERANCE_STEP;

  // In-loop functions.
  var fnNotEmpty = function(el) {
    return 0 !== el.length;
  };
  var fnReduce = function(tolerance) {
    return function(el) {
      return reducePolygon(el, tolerance);
    };
  };

  // Iterate over the shape to ensure the final result contains at least one coordinate set.
  do {
    coords = multiPolygon.coordinates.map(fnReduce(tolerance)).filter(fnNotEmpty);
    length = totalLength(coords);
    tolerance += step;
  }
  while(config.maxLength < length); // Continue until the length is within max length.

  // Simplify MultiPolygons and return.
  if(0 === coords.length) { // Retry with lower step.
    return reduce(multiPolygon, 0.025);
  }
  if(1 === coords.length) {
    return { type: 'Polygon', coordinates: coords[0] };
  }
  return { type: multiPolygon.type, coordinates: coords };
};

// Exports.
module.exports = {
  reduce: function(polygon) {
    // Ensure both Polygons and MultiPolygons are handled correctly.
    if('Polygon' === polygon.type) {
      polygon = { type: 'MultiPolygon', coordinates: [ polygon.coordinates ] };
    }
    var normalized = wrapAroundAntemeridian(polygon);
    return reduce(normalized);
  }
};
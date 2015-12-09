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

// Local modules.
var roundCoords = require('./coords').round;

// Configure.
var MIN_SET_LENGTH = 4,
    PRECISION      = 1,
    TOLERANCE      = 0.4;

// Reduces provided Polygon coordinates.
var reducePolygon = function(polygon, tolerance) {
  tolerance = tolerance || TOLERANCE; // Cast.

  // Iterate through the polygon.
  return polygon.map(function(set) {
    var previous = null; // Reset.
    return set.reduce(function(prev, current) {
      current = roundCoords(current, PRECISION); // Round.
      if(null === previous ||
       current[0] >= previous[0] + tolerance || current[0] <= previous[0] - tolerance ||
       current[1] >= previous[1] + tolerance || current[1] <= previous[1] - tolerance
      ) {
        previous = current; // Update.
        prev.push(current);
      }
      return prev; // Continue.
    }, [ ]);
  }).filter(function(set) {
    // Remove sets with less elements than required to make a polygon.
    return MIN_SET_LENGTH <= set.length;
  });
};

// Reduces provided (Multi)Polygon.
var reduce = function(polygon) {
  // Init.
  var coords,
      tolerance = TOLERANCE;

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
    // Handle MultiPolygons.
    if('MultiPolygon' === polygon.type) {
      coords = polygon.coordinates.map(fnReduce(tolerance)).filter(fnNotEmpty);
    }
    else { // Polygons.
      coords = reducePolygon(polygon.coordinates, tolerance);
    }
    tolerance /= 1.25; // Increase tolerance by 25%.
  }
  while(0 === coords.length); // Continue until there is a coordinate set.

  // Simplify MultiPolygons.
  if('MultiPolygon' === polygon.type && 1 === coords.length) {
    return { type: 'Polygon', coordinates: coords[0] };
  }

  // Return the result.
  return { type: polygon.type, coordinates: coords };
};

// Exports.
module.exports = { reduce: reduce, roundCoords: roundCoords };
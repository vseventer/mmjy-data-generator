# Changelog

## 0.5.1 (December 21, 2016)
* Updated `async`, `fast-csv`, `glob`, `gray-matter`, `lodash.find`,
  `lodash.matchesproperty`, `lodash.sortby`, `moment`, and `numeral`
  dependencies.

## 0.5.0 (August 11, 2016)
* Updated `async`, `jshint-stylish`, `lodash.find`, `lodash.matchesproperty`,
  `lodash.sortby`, `moment`, and `object-assign` dependencies.

## 0.4.1 (April 2, 2016)
* Optimized `lib/polygon.js`.
* Updated `fast-csv`, `glob`, `lodash.find`, `lodash.matchesproperty`,
  `lodash.sortby`, and `moment` dependencies.

## 0.4.0 (February 10, 2016)
* Decreased polygon tolerance step from `0.1` to `0.025` if initial iteration
  did not yield any coordinates. Required for: Maldives and Marshall Islands.
* Updated polygon algorithm to wrap longitudes around antemeridian. Affects:
  Asia, Oceania, Fiji, Kiribati, New Zealand, Russia, and
  United States Minor Outlying Islands.

## 0.3.0 (January 18, 2016)
* Added `places.json` with places of interest based on external metadata.
* Optimized parsing and transform algorithms.
* Removed `cities.json`.
* Updated copyright to `2016`.

## 0.2.2 (January 13, 2016)
* Use `fast-csv` instead of `csv-parse`.

## 0.2.1 (January 5, 2016)
* Added region data to `cities.json`.
* Bump dependencies.
* Display warning for non-unique slugs.
* Format population as `null` instead of `0`.

## 0.2.0 (December 24, 2015)
* Added `cities.json`.
* Added additional fields to all generated features.
* Refactored code.

## 0.1.0 (December 10, 2015)
* Initial version.
/**
  * permalinks <https://github.com/assemble/permalinks>
  *
  * Copyright (c) 2014, Jon Schlinkert, Brian Woodward, contributors.
  * Licensed under the MIT License
  *
  */

var path = require('path');
var strings = require('strings');
var digits = require('digits');
var randomatic = require('randomatic');
var _str = require('underscore.string');
var _ = require('lodash');


module.exports = function(structure, context, options) {
  var args = arguments;

  if (_.isObject(structure) && args.length === 2) {
    options = context;
    context = structure;
    structure = options.structure || '';
  } else if (_.isObject(structure) && args.length === 1) {
    options = structure;
    context = options.context || {};
    structure = options.structure || '';
  }

  options = options || {};

  // strings middleware, normalizes patterns to return a generic key/value object
  var normalize = function (patterns) {
    return function () {
      return _.map(patterns, function (config) {
        return new strings.Pattern(config.pattern, config.replacement);
      });
    };
  };

  // Allow user-defined length to be provided (for array of files)
  var len = options.length || 3;
  var i = options.index || 0;


  var specialPatterns = {
    num:    new strings.Pattern(/:\bnum\b/, digits.pad(i, {auto: len})),
    digits: new strings.Pattern(/:(0)+/, function (match) {
      var matchLen = String(match).length - 1;
      return digits.pad(i, {digits: matchLen});
    }),
    random: new strings.Pattern(/:random\(([^)]+)\)/, function (a, b) {
      var len, chars;
      if(b.match(/,/)) {
        len = parseInt(b.split(',')[1], 10);
        chars = b.split(',')[0];
        return randomatic(chars, len);
      } else {
        var len = b.length;
        return randomatic(b, len);
      }
    })
  };

  // register the replacements as middleware
  strings
    .use(specialPatterns) // specialPatterns
    .use(context)         // expose context data to Strings
    .use(strings.dates(context.date, _.pick(options, 'lang'))) // date patterns
    .use(normalize(options.replacements || [])); // wrap any additional replacement patterns


  // Presets: pre-formatted permalink structures. If a preset
  // is defined, append it to the user-defined structure.
  if(options.preset && String(options.preset).length !== 0) {

    // The preset
    var presets = {
      numbered:  path.join((structure || ''), ':num-:basename:ext'),
      pretty:    path.join((structure || ''), ':basename/index:ext'),
      dayname:   path.join((structure || ''), ':YYYY/:MM/:DD/:basename/index:ext'),
      monthname: path.join((structure || ''), ':YYYY/:MM/:basename/index:ext')
    };
    // Presets are joined to structures, so if a preset is specified
    // use the preset the new structure.
    structure = String(_.values(_.pick(presets, options.preset)));
  }


  var permalink = strings.run(structure).replace(/\\/g, '/');
  return permalink;
}

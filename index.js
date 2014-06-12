/*!
 * permalinks <https://github.com/assemble/permalinks>
 *
 * Copyright (c) 2014, Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT License
 *
 */

var path = require('path');
var Strings = require('strings');
var digits = require('digits');
var randomatic = require('randomatic');
var _str = require('underscore.string');
var _ = require('lodash');


var join = function() {
  var filepath = path.join.apply(path, arguments);
  return filepath.replace(/\\/g, '/');
};


module.exports = function Permalinks(structure, context, options) {
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

  var permalinks = new Strings(context);

  // Allow user-defined length to be provided (for array of files)
  var l = options.length || 3;
  var i = options.index || 0;



  permalinks.parser('custom', options.replacements);
  permalinks.parser('path', [
    {
      pattern: /:basename/,
      replacement: function() {
        return this.basename;
      }
    },
    {
      pattern: /:dirname/,
      replacement: function() {
        return this.dirname;
      }
    },
    {
      pattern: /\b:extname\b/,
      replacement: function(pattern) {
        return this.extname;
      }
    },
    {
      pattern: /\b:ext\b/,
      replacement: function(pattern) {
        return this.ext;
      }
    }
  ]);

  permalinks.parser('date',   require('strings-parser-date')());
  permalinks.parser('random', {
    pattern: /:random\(([^)]+)\)/,
    replacement: function (a, b, c) {
      var len, chars;
      if(b.match(/,/)) {
        len = parseInt(b.split(',')[1], 10);
        chars = b.split(',')[0];
        return randomatic(chars, len);
      } else {
        var len = b.length;
        return randomatic(b, len);
      }
    }
  });

  permalinks.parser('digits', {
    pattern: /:(0)+/,
    replacement: function (match) {
      var matchLen = String(match).length - 1;
      return digits.pad(i, {digits: matchLen});
    }
  });

  permalinks.parser('num', {
    pattern: /:\bnum\b/,
    replacement: digits.pad(i, {auto: l})
  });

  permalinks.parser('prop', {
    pattern: /:(\w+)/g,
    replacement: function(match, prop) {
      return this[prop] || prop;
    }
  });



  // Presets: pre-formatted permalink propstrings. If a preset is specified
  // in the options, append it to the user-defined propstring.
  permalinks.propstring('numbered',  join((structure || ''), ':num-:basename:ext'));
  permalinks.propstring('pretty',    join((structure || ''), ':basename/index:ext'));
  permalinks.propstring('dayname',   join((structure || ''), ':YYYY/:MM/:DD/:basename/index:ext'));
  permalinks.propstring('monthname', join((structure || ''), ':YYYY/:MM/:basename/index:ext'));

  if(options.preset && String(options.preset).length !== 0) {
    // Presets are joined to propstrings, so if a preset is
    // specified use the preset the new propstring.
    structure = permalinks.propstring(options.preset);
  }

  var parsers = Object.keys(permalinks._parsers);

  // Process replacement patterns
  return permalinks.process(structure, parsers, context);
}

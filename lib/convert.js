'use strict';

var utils = require('./utils');

module.exports = function(pattern, options) {
  var firstChar = pattern.charAt(0);
  var lastChar = pattern.slice(-1);
  var opts = Object.assign({}, options);
  var segs = utils.splitPath(pattern);
  var len = segs.length;
  var idx = -1;
  while (++idx < len) {
    segs[idx] = convert(segs[idx], pattern, firstChar, lastChar, opts);
  }
  return segs.join('/');
};

function convert(str, pattern, firstChar, lastChar, options) {
  var re = /\\?:(?=[!/\w#*$_>^])(\^|([-!/\w#*$_>^.]+)(?:\((.*)\))*[!\w*$_.)]*)/g;

  return str.replace(re, function(match, exp, name, inner, idx, input) {
    if (match.indexOf('://') === 0) {
      return match;
    }

    if (match.charAt(0) === '\\') {
      return match.slice(1);
    }

    var isLast = pattern.slice(-match.length) === match;
    var i = lastIndex(inner, exp);
    var suffix = '';

    if (isLast && i !== -1 && exp.slice(-1) !== ')' && firstChar !== ' ' && lastChar !== ' ') {
      suffix = exp.slice(i);
      exp = exp.slice(0, i);
    }

    var val = utils.splitArgs(exp)
      .join('')
      .replace(/([*>]) */, '$1 ');

    var res = match[0] === '\\'
      ? match.slice(1)
      : parse(name, val, inner);

    return res + suffix;
  });
}

function parse(name, exp, inner) {
  var aft = '';
  var ws = /\s+$/.exec(exp);
  if (ws) {
    aft = ws[0];
    exp = exp.trim();
  }

  var idx = exp.indexOf('(');
  var last = exp.slice(-1);
  if (last === '.' || (last === '-' && exp.slice(-2, -1) !== '-')) {
    exp = exp.slice(0, -1);
    aft = last;
  }

  if (idx !== -1) {
    var aftIdx = exp.lastIndexOf(')');
    var prefix = exp.slice(0, idx);
    var suffix = exp.slice(idx + 1, aftIdx);
    var append = exp.slice(aftIdx + 1) || '';
    if (append) {
      aft = append + aft;
    }

    if (!suffix) {
      return `{{${prefix}}}` + aft;
    }
    return `{{${prefix} ${suffix}}}` + aft;
  }
  return `{{${exp}}}` + aft;
}

function lastIndex(args, exp) {
  var segs = args ? utils.splitArgs(args) : [];

  if (segs.length > 1) {
    return -1;
  }

  if (!args || args.trim() !== '.') {
    return exp.lastIndexOf('.');
  }

  return -1;
}

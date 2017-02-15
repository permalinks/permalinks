'use strict';

var utils = require('./utils');

module.exports = function(pattern) {
  var segs = utils.splitPath(pattern);
  var len = segs.length;
  var idx = -1;
  while (++idx < len) {
    segs[idx] = convert(segs[idx], idx === len - 1);
  }
  return segs.join('/');
};

function convert(str, isLast) {
  var re = /\\?:(?=[!/\w#*$_>^])(\^|([-!/\w#*$_>^. ]+)(?:\((.*)\))*[!\w*$_. )]*)/g;

  return str.replace(re, function(match, exp, name, inner, idx, input) {
    if (match.indexOf('://') === 0) {
      return match;
    }

    var i = lastIndex(inner, exp);
    var suffix = '';

    if (isLast && i !== -1) {
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
  var idx = exp.indexOf('(');
  var last = exp.slice(-1);
  if (last === '.' || (last === '-' && exp.slice(-2, -1) !== '-')) {
    exp = exp.slice(0, -1);
    aft = last;
  }

  if (idx !== -1) {
    var prefix = exp.slice(0, idx);
    var suffix = exp.slice(idx + 1, -1);
    if (!suffix.trim()) {
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

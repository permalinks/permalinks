'use strict';

var utils = require('./utils');

module.exports = function(filepath) {
  var segs = utils.splitPath(filepath);
  var len = segs.length;
  var idx = -1;
  while (++idx < len) {
    segs[idx] = convert(segs[idx], idx === len - 1);
  }
  return segs.join('/');
};

function convert(str, last) {
  var re = /\\?:(?=[!\w*$_>])(([-!\w*$_>. ]+)(?:\((.*?)\))*[!\w*$_. )]*)/g;

  return str.replace(re, function(match, args, name, inner, idx, input) {
    var i = args.lastIndexOf('.');
    var suffix = '';

    if (last && i !== -1) {
      suffix = args.slice(i);
      args = args.slice(0, i);
    }

    args = utils.splitArgs(args).join('');
    var res = match[0] === '\\'
      ? match.slice(1)
      : parse(args);

    res = res.replace(/([*>]) */, '$1 ');
    return res + suffix;
  });
};

function parse(args) {
  var aft = '';
  var idx = args.indexOf('(');
  var last = args.slice(-1);
  if (last === '.' || (last === '-' && args.slice(-2, -1) !== '-')) {
    args = args.slice(0, -1);
    aft = last;
  }

  if (idx !== -1) {
    var prefix = args.slice(0, idx);
    var suffix = args.slice(idx + 1, -1);
    return `{{${prefix} ${suffix}}}` + aft;
  }
  return `{{${args}}}` + aft;
}

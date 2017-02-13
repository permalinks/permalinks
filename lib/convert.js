'use strict';

module.exports = function(str) {
  var re = /\\?:(?=[!\w*$_>])(([-!\w*$_>. ]+)(?:\(([^"]*"?.*?"?)\))*[!\w*$_. )]*)/g;

  return str.replace(re, function(match, args, name, inner, idx, input) {
    var rest = input.slice(idx + match.length);
    var suffix = '';

    var i = args.lastIndexOf('.');
    if (rest === '' && i !== -1) {
      suffix = args.slice(i);
      args = args.slice(0, i);
    }

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

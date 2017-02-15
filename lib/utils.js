'use strict';

var path = require('path');
var utils = module.exports = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('assign-deep', 'assign');
require('deep-bind');
require('get-value', 'get');
require('isobject', 'isObject');
require('parse-filepath', 'parse');
require('vinyl', 'File');
require = fn;

utils.normalizeFile = function(val, options) {
  function format(file) {
    if (!utils.isObject(file)) {
      throw new TypeError('expected file to be a string or object');
    }

    if (file._isVinyl) {
      return file.clone({contents: false});
    }

    var newFile = {};
    if (file.path) {
      newFile = utils.toFile(file.path, options);

    } else {
      var filepath = path.format(file) || file.basename;
      if (filepath) {
        newFile = utils.toFile(filepath, options);
      }
    }

    for (var key in file) {
      if (file.hasOwnProperty(key) && typeof file[key] === 'string') {
        newFile[key] = file[key];
      }
    }

    newFile.data = utils.assign({}, newFile.data, file.data);
    return newFile;
  }

  var file = format(val);
  file.data = file.data || {};
  if (typeof file.data.permalink === 'string') {
    file.data.permalink = { structure: file.data.permalink };
  }

  return file;
};

utils.toFile = function(filepath, options) {
  var cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  var file = new utils.File({path: filepath});
  file.data = { permalink: {} };
  file.base = cwd;
  file.cwd = cwd;
  return file;
};

utils.splitPath = function(str) {
  var args = [''];
  var len = str.length;
  var idx = -1;
  var closeIdx;

  while (++idx < len) {
    var ch = str[idx];
    var next = str[idx + 1];

    if (ch === '\\') {
      args[args.length - 1] += ch + next;
      idx++;
      continue;

    } else {
      if (ch === '"') {
        closeIdx = utils.getClose(str, '"', idx + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed double quote: ' + str);
        }

        ch = str.slice(idx, closeIdx + 1);
        idx = closeIdx;
      } else if (ch === '(') {

        closeIdx = utils.getClose(str, ')', idx + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed paren: ' + str);
        }

        ch = str.slice(idx, closeIdx + 1);
        idx = closeIdx;
      }

      if (ch === '/') {
        if (next === '/') {
          args[args.length - 1] += ch + next;
          idx++;
          continue;
        }

        args.push('');
      } else {
        args[args.length - 1] += ch;
      }
    }
  }

  return args;
};

utils.splitArgs = function(str) {
  var args = [''];
  var len = str.length;
  var idx = -1;
  var closeIdx;

  while (++idx < len) {
    var ch = str[idx];
    var next = str[idx + 1];

    if (ch === '\\') {
      args[args.length - 1] += ch + next;
      idx++;
      continue;

    } else {
      if (ch === '"') {
        closeIdx = utils.getClose(str, '"', idx + 1);
        if (closeIdx === -1) {
          throw new Error('unclosed double quote: ' + str);
        }

        ch = str.slice(idx, closeIdx + 1);
        idx = closeIdx;
      }

      if (ch === ',') {
        args.push('');
      } else {
        args[args.length - 1] += ch;
      }
    }
  }

  return args;
};

utils.getClose = function(input, ch, index) {
  var idx = input.indexOf(ch, index);
  if (input.charAt(idx - 1) === '\\') {
    return utils.getClose(input, ch, idx + 1);
  }
  return idx;
};

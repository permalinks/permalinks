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
require('handlebars');
require('isobject', 'isObject');
require('parse-filepath', 'parse');
require('vinyl', 'File');
require = fn;

utils.formatFile = function(val, options) {
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

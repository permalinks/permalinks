'use strict';

const path = require('path');
const merge = require('mixin-deep');
const get = require('get-value');
const typeOf = require('kind-of');
const File = require('vinyl');

exports.normalizeFile = function(val, options) {
  function format(file) {
    if (typeOf(file) !== 'object') {
      throw new TypeError('expected file to be a string or object');
    }

    if (File.isVinyl(file)) {
      return file.clone({contents: false});
    }

    let newFile = {};
    if (file.path) {
      newFile = exports.toFile(file.path, options);

    } else {
      const filepath = path.format(file) || file.basename;
      if (filepath) {
        newFile = exports.toFile(filepath, options);
      }
    }

    for (const key in file) {
      if (file.hasOwnProperty(key) && typeof file[key] === 'string') {
        newFile[key] = file[key];
      }
    }

    newFile.data = merge({}, newFile.data, file.data);
    return newFile;
  }

  const file = format(val);
  if (!file.data) file.data = {};
  return file;
};

exports.getStructure = function(file) {
  let structure = get(file, 'data.permalink');
  if (typeof structure !== 'string') {
    structure = get(file, 'data.permalink.structure');
  }
  if (typeof structure === 'string') {
    return structure;
  }
};

exports.toFile = function(filepath, options) {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const file = new File({path: filepath});
  file.data = { permalink: {} };
  file.base = cwd;
  file.cwd = cwd;
  return file;
};

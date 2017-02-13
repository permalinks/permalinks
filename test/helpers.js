'use strict';

var File = require('vinyl');
var assert = require('assert');
var moment = require('moment');
var random = require('randomatic');
var Permalinks = require('..');

describe('helpers', function() {
  it('should use helpers to replace :params', function() {
    var file = new File({path: 'foo/bar/baz.hbs'});
    var permalinks = new Permalinks();

    permalinks.helper('zzz', function() {
      return this.file.stem;
    });

    var fixture = permalinks.format(':zzz/index.html', file);
    assert.equal(fixture, 'baz/index.html');
  });

  it('should use helpers with arguments to replace :params', function() {
    var file = new File({path: 'foo/bar/baz.hbs'});
    var permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    var fixture = permalinks.format(':zzz(aaa)/index.html', file, {aaa: 'bbb'});
    assert.equal(fixture, 'bbb/index.html');
  });

  it('should use helpers with subexpressions to replace :params', function() {
    var file = new File({path: 'foo/bar/baz.hbs'});
    var permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    permalinks.helper('upper', function(val) {
      return val.toUpperCase();
    });

    var locals = {aaa: 'bbb'};
    var structure = ':upper((zzz aaa))/index.html';
    var fixture = permalinks.format(structure, file, locals);
    assert.equal(fixture, 'BBB/index.html');
  });

  it('should use helpers with nested subexpressions', function() {
    var file = new File({path: 'foo/bar/baz.hbs'});
    var permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    permalinks.helper('upper', function(val) {
      return val.toUpperCase();
    });

    permalinks.helper('dashify', function(val) {
      return val.split('').join('-');
    });

    var locals = {aaa: 'bbb'};
    var structure = ':upper((zzz (dashify aaa)))/index.html';
    var fixture = permalinks.format(structure, file, locals);
    assert.equal(fixture, 'B-B-B/index.html');
  });

  it('should support helpers with comma-separated arguments', function() {
    var permalinks = new Permalinks();

    permalinks.helper('random', function(val) {
      return random.apply(null, val.split(','));
    });

    var file = {basename: 'favicon', section: 'images', ext: '.png'};
    var actual = permalinks.format(':section/:random("0Aa,9")-:basename:ext', file);
    assert.equal(actual.length, 28);
  });

  it('should call helperMissing when variables are not resolved', function() {
    var file = {basename: 'foo', ext: '.md'};
    var permalinks = new Permalinks();

    permalinks.helper('helperMissing', function(options) {
      switch (options.name) {
        case 'YYYY':
        case 'MM':
        case 'DD':
          return moment(new Date()).format(options.name);
        default: {
          throw new Error('cannot resolve :' + options.name);
        }
      }
    });

    var expected = moment(new Date()).format('YYYY/MM/DD') + '/foo/index.md';
    var actual = permalinks.format(':YYYY/:MM/:DD/:basename/index:ext', file);
    assert.equal(actual, expected);
  });
});

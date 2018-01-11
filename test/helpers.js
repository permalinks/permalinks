'use strict';

const File = require('vinyl');
const assert = require('assert');
const moment = require('moment');
const random = require('randomatic');
const Permalinks = require('..');

describe('helpers', function() {
  it('should use helpers to replace :params', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.helper('zzz', function() {
      return this.file.stem;
    });

    const fixture = permalinks.format(':zzz/index.html', file);
    assert.equal(fixture, 'baz/index.html');
  });

  it('should call the "file" helper on every pattern', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();
    let count = 0;

    permalinks.helper('file', function(file, data, locals) {
      data.num = ++count;
    });

    assert.equal(permalinks.format(':stem-:num', file), 'baz-1');
    assert.equal(permalinks.format(':stem-:num', file), 'baz-2');
    assert.equal(permalinks.format(':stem-:num', file), 'baz-3');
    assert.equal(count, 3);
  });

  it('should use helpers with arguments to replace :params', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    const fixture = permalinks.format(':zzz(aaa)/index.html', file, {aaa: 'bbb'});
    assert.equal(fixture, 'bbb/index.html');
  });

  it('should use helpers with subexpressions to replace :params', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    permalinks.helper('upper', function(val) {
      return val.toUpperCase();
    });

    const locals = {aaa: 'bbb'};
    const structure = ':upper((zzz aaa))/index.html';
    const fixture = permalinks.format(structure, file, locals);
    assert.equal(fixture, 'BBB/index.html');
  });

  it('should use helpers with nested subexpressions', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.helper('zzz', function(val) {
      return val;
    });

    permalinks.helper('upper', function(val) {
      return val.toUpperCase();
    });

    permalinks.helper('dashify', function(val) {
      return val.split('').join('-');
    });

    const locals = {aaa: 'bbb'};
    const structure = ':upper((zzz (dashify aaa)))/index.html';
    const fixture = permalinks.format(structure, file, locals);
    assert.equal(fixture, 'B-B-B/index.html');
  });

  it('should support helpers with comma-separated arguments', function() {
    const permalinks = new Permalinks();

    permalinks.helper('random', function(val) {
      return random.apply(null, val.split(','));
    });

    const file = {basename: 'favicon', section: 'images', ext: '.png'};
    const actual = permalinks.format(':section/:random("0Aa,9")-:basename:ext', file);
    assert.equal(actual.length, 28);
  });

  it('should call helperMissing when variables are not resolved', function() {
    const file = {basename: 'foo', ext: '.md'};
    const permalinks = new Permalinks();

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

    const expected = moment(new Date()).format('YYYY/MM/DD') + '/foo/index.md';
    const actual = permalinks.format(':YYYY/:MM/:DD/:basename/index:ext', file);
    assert.equal(actual, expected);
  });
});

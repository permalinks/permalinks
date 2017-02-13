'use strict';

var assert = require('assert');
var moment = require('moment');
var Permalinks = require('..');
var permalink = require('..');
var random = require('randomatic');
var File = require('vinyl');
var permalinks;

describe('permalinks:', function() {
  describe('variables', function() {
    it('should replace :params with data from locals', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      var fixture = permalink(':name/index.html', file, {name: 'abc'});
      assert.equal(fixture, 'abc/index.html');
    });

    it('should replace :params with path segments', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      assert.equal(permalink(':stem/index.html', file), 'baz/index.html');
      assert.equal(permalink(':dirname/index.html', file), 'foo/bar/index.html');
    });
  });

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

    it('when a structure is defined with :random()', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      var permalinks = new Permalinks();

      permalinks.helper('random', function(val) {
        return random.apply(null, val.split(','));
      });

      var file = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/';
      var actual = permalinks.format(':section/:random("0Aa,9")-:basename:ext', file);
      assert.equal(actual.length, 28);
    });

    it('should call helperMissing when variables are not resolved', function() {
      var file = {basename: 'foo', ext: '.md'};
      var permalinks = new Permalinks();

      permalinks.helper('helperMissing', function(options) {
        var name = options.name;
        var file = this.file;

        switch (name) {
          case 'YYYY':
          case 'MM':
          case 'DD':
            return moment(new Date()).format(name);
          default: {
            throw new Error('cannot resolve :' + name);
            break;
          }
        }
      });

      var expected = moment(new Date()).format('YYYY/MM/DD') + '/foo/index.md';
      var actual = permalinks.format(':YYYY/:MM/:DD/:basename/index:ext', file);
      assert.equal(actual, expected);
    });

  // it('should parse the path using a date', function() {
  //   var obj = {basename: 'foo', ext: ''};
  //   var expected = '2014/04/29';
  //   var actual = permalink(':YYYY/:MM/:DD', obj);
  //   expect(actual.split('/')).to.have.length.above(2);
  // });
  });

  describe('presets', function() {
    it('should use presets', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      var permalinks = new Permalinks();

      permalinks.preset('pretty', 'blog/:stem/index.html');
      var fixture = permalinks.format('pretty', file);
      assert.equal(fixture, 'blog/baz/index.html');
    });

    it('should work when preset is defined as a variable', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      var permalinks = new Permalinks();

      permalinks.preset('pretty', 'blog/:stem/index.html');
      var fixture = permalinks.format(':pretty', file);
      assert.equal(fixture, 'blog/baz/index.html');
    });

    it('should work when multiple presets are used', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      var permalinks = new Permalinks();

      permalinks.preset('one', 'blog');
      permalinks.preset('two', ':stem/index.html');
      var fixture = permalinks.format(':one/:two', file);
      assert.equal(fixture, 'blog/baz/index.html');
    });
  });
});

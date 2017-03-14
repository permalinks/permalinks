'use strict';

var File = require('vinyl');
var assert = require('assert');
var permalink = require('..');

describe('permalinks:', function() {
  describe('params:', function() {
    it('should replace :params with data from locals', function() {
      assert.equal(permalink(':name', 'foo.hbs', {name: 'abc'}), 'abc');
    });

    it('should replace :params with data from the given path', function() {
      assert.equal(permalink(':stem', 'foo.hbs', {name: 'abc'}), 'foo');
    });
  });

  describe('variables', function() {
    it('should replace :params with data from locals', function() {
      var fixture = permalink(':name/index.html', 'foo/bar/baz.hbs', {name: 'abc'});
      assert.equal(fixture, 'abc/index.html');
    });

    it('should replace :params with path segments', function() {
      assert.equal(permalink(':stem/index.html', 'foo/bar/baz.hbs'), 'baz/index.html');
      assert.equal(permalink(':dirname/index.html', 'foo/bar/baz.hbs'), 'foo/bar/index.html');
    });

    it('should work with handlebars syntax', function() {
      assert.equal(permalink('{{stem}}/index.html', 'foo/bar/baz.hbs'), 'baz/index.html');
      assert.equal(permalink('{{dirname}}/index.html', 'foo/bar/baz.hbs'), 'foo/bar/index.html');
    });
  });

  describe('file objects', function() {
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

    it('should work with handlebars syntax', function() {
      var file = new File({path: 'foo/bar/baz.hbs'});
      assert.equal(permalink('{{stem}}/index.html', file), 'baz/index.html');
      assert.equal(permalink('{{dirname}}/index.html', file), 'foo/bar/index.html');
    });
  });
});

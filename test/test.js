'use strict';

var File = require('vinyl');
var assert = require('assert');
var permalink = require('..');

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
});

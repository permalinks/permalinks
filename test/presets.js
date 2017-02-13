'use strict';

var assert = require('assert');
var Permalinks = require('..');
var File = require('vinyl');

describe('presets', function() {
  it('should cache a preset', function() {
    var permalinks = new Permalinks();
    permalinks.preset('pretty', 'blog/:stem/index.html');
    assert.equal(permalinks.presets.pretty, 'blog/:stem/index.html');
  });

  it('should use a preset to format a permalink', function() {
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

'use strict';

const assert = require('assert');
const Permalinks = require('..');
const File = require('vinyl');

describe('presets', function() {
  it('should cache a preset', function() {
    const permalinks = new Permalinks();
    permalinks.preset('pretty', 'blog/:stem/index.html');
    assert.equal(permalinks.presets.pretty, 'blog/:stem/index.html');
  });

  it('should use a preset to format a permalink', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.preset('pretty', 'blog/:stem/index.html');
    const fixture = permalinks.format('pretty', file);
    assert.equal(fixture, 'blog/baz/index.html');
  });

  it('should work when preset is defined as a variable', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.preset('pretty', 'blog/:stem/index.html');
    const fixture = permalinks.format('dist/:pretty', file);
    assert.equal(fixture, 'dist/blog/baz/index.html');
  });

  it('should work when multiple presets are used', function() {
    const file = new File({path: 'foo/bar/baz.hbs'});
    const permalinks = new Permalinks();

    permalinks.preset('one', 'blog');
    permalinks.preset('two', ':stem/index.html');
    const fixture = permalinks.format(':one/:two', file);
    assert.equal(fixture, 'blog/baz/index.html');
  });
});

'use strict';

const assert = require('assert');
const permalink = require('..');

describe('file properties:', function() {
  it('should context segments, without original path', function() {
    assert.equal(permalink(':basename:ext', {basename: 'foo', ext: '.html'}), 'foo.html');
    assert.equal(permalink(':basename/index:ext', {basename: 'foo', ext: ''}), 'foo/index');
    assert.equal(permalink(':section', {section: 'foo', ext: ''}), 'foo');
    assert.equal(permalink(':section', {section: 'foo'}), 'foo');
    assert.equal(permalink(':section/abc', {section: 'foo'}), 'foo/abc');
  });

  it('should handle file as a string', function() {
    const actual = permalink(':stem/:dirname/index:ext', {path: 'a/b/c.md'}, {ext: '.html'});
    assert.equal(actual, 'c/a/b/index.html');
  });

  it('should use permalink defined on file.data as a string', function() {
    const file = {
      path: 'a/b/c.md',
      data: {
        permalink: ':basename'
      }
    };

    const actual = permalink(':stem/:dirname/index:ext', file, {ext: '.html'});
    assert.equal(actual, 'c.md');
  });

  it('should use permalink defined on file.data as an object', function() {
    const file = {
      path: 'a/b/c.md',
      data: {
        permalink: {
          structure: ':basename'
        }
      }
    };

    const actual = permalink(':stem/:dirname/index:ext', file, {ext: '.html'});
    assert.equal(actual, 'c.md');
  });

  it('should handle file as a non-vinyl object', function() {
    const actual = permalink(':dirname/:stem/index:ext', {path: 'a/b/c.md'}, {ext: '.html'});
    assert.equal(actual, 'a/b/c/index.html');
  });

  it('should replace arbitrary segments', function() {
    const obj = {basename: 'favicon', section: 'images', ext: '.png', num: '0000'};
    const expected = 'images/favicon-0000.png';
    const actual = permalink(':section/:basename-:num:ext', obj);
    assert.equal(actual, expected);
  });

  it('when the :date structure is used', function() {
    const file = {basename: 'foo', ext: '.md', date: '2013-02-13'};
    assert.equal(permalink(':date/index:ext', file), '2013-02-13/index.md');
  });
});

'use strict';

require('mocha');
var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function() {
  describe('utils.splitPath', function() {
    it('should not split if no slashes exist', function() {
      assert.deepEqual(utils.splitPath(':foo'), [':foo']);
      assert.deepEqual(utils.splitPath(':foo:bar'), [':foo:bar']);
    });

    it('should split path-separated variables', function() {
      assert.deepEqual(utils.splitPath(':foo/:bar'), [':foo', ':bar']);
      assert.deepEqual(utils.splitPath(':root/:a:b:c/foo.hbs'), [':root', ':a:b:c', 'foo.hbs']);
      assert.deepEqual(utils.splitPath(':a:b:c/:foo.hbs'), [':a:b:c', ':foo.hbs']);
    });

    it('should not split invalid path separators', function() {
      assert.deepEqual(utils.splitPath('http://breakdance.io'), ['http://breakdance.io']);
      assert.deepEqual(utils.splitPath('https://foo:bar'), ['https://foo:bar']);
      assert.deepEqual(utils.splitPath('http://foo:bar'), ['http://foo:bar']);
      assert.deepEqual(utils.splitPath('://foo:bar'), ['://foo:bar']);
    });

    it('should not split escaped segments', function() {
      assert.deepEqual(utils.splitPath('\\:foo:bar'), ['\\:foo:bar']);
      assert.deepEqual(utils.splitPath('\\/foo:bar'), ['\\/foo:bar']);
      assert.deepEqual(utils.splitPath('\\/foo\\/bar'), ['\\/foo\\/bar']);
      assert.deepEqual(utils.splitPath('/foo\\/bar'), ['', 'foo\\/bar']);
    });

    it('should not split segments inside quotes', function() {
      assert.deepEqual(utils.splitPath('"/foo":bar'), ['"/foo":bar']);
      assert.deepEqual(utils.splitPath('"/foo/"bar'), ['"/foo/"bar']);
      assert.deepEqual(utils.splitPath('/foo"/"bar'), ['', 'foo"/"bar']);
      assert.deepEqual(utils.splitPath('/"foo/bar"'), ['', '"foo/bar"']);
    });

    it('should not split segments inside arguments in quotes', function() {
      assert.deepEqual(utils.splitPath(':a("foo/bar/baz")'), [':a("foo/bar/baz")']);
      assert.deepEqual(utils.splitPath(':a("foo/bar")'), [':a("foo/bar")']);
      assert.deepEqual(utils.splitPath(':date(file, "YYYY/MM/DD")/:stem/index.html'), [':date(file, "YYYY/MM/DD")', ':stem', 'index.html']);
    });

    it('should support escaped quotes', function() {
      assert.deepEqual(utils.splitPath(':a("foo\\"bar/baz")'), [':a("foo\\"bar/baz")']);
    });

    it('should split variables with dot-notation', function() {
      assert.deepEqual(utils.splitPath(':foo.bar/:baz.qux/fez'), [':foo.bar', ':baz.qux', 'fez']);
    });

    it('should not confuse file extensions as dot-notation', function() {
      assert.deepEqual(utils.splitPath(':foo.bar/:baz.qux'), [':foo.bar', ':baz.qux']);
      assert.deepEqual(utils.splitPath(':foo.bar/:b.a.z.qux'), [':foo.bar', ':b.a.z.qux']);
      assert.deepEqual(utils.splitPath(':foo.bar/:baz.:qux'), [':foo.bar', ':baz.:qux']);
      assert.deepEqual(utils.splitPath(':foo.bar/:b.az.:qux'), [':foo.bar', ':b.az.:qux']);
      assert.deepEqual(utils.splitPath(':foo.bar/:b.:az.:qux'), [':foo.bar', ':b.:az.:qux']);
    });

    it('should split helper expressions', function() {
      assert.deepEqual(utils.splitPath(':a(foo)'), [':a(foo)']);
      assert.deepEqual(utils.splitPath(':root/:a(foo)'), [':root', ':a(foo)']);
      assert.deepEqual(utils.splitPath(':root/:a:b(foo)'), [':root', ':a:b(foo)']);
    });

    it('should work with file extensions', function() {
      assert.deepEqual(utils.splitPath(':base/:upper(name)/index.:ext'), [':base', ':upper(name)', 'index.:ext']);
    });

    it('should split helper expressions with quotes', function() {
      assert.deepEqual(utils.splitPath(':a("foo")'), [':a("foo")']);
      assert.deepEqual(utils.splitPath(':root/:a("foo")'), [':root', ':a("foo")']);
      assert.deepEqual(utils.splitPath(':root/:a:b("foo")'), [':root', ':a:b("foo")']);
      assert.deepEqual(utils.splitPath(':a("foo,bar")'), [':a("foo,bar")']);
      assert.deepEqual(utils.splitPath(':root/:a("foo,bar")'), [':root', ':a("foo,bar")']);
      assert.deepEqual(utils.splitPath(':root/:a:b("foo,bar")'), [':root', ':a:b("foo,bar")']);
      assert.deepEqual(utils.splitPath(':a("foo bar")'), [':a("foo bar")']);
      assert.deepEqual(utils.splitPath(':root/:a("foo bar")'), [':root', ':a("foo bar")']);
      assert.deepEqual(utils.splitPath(':root/:a:b("foo bar")'), [':root', ':a:b("foo bar")']);
    });

    it('should split multiple helper expressions', function() {
      var fixture = ':root/:a:b("foo,bar")/:c:d("baz,qux")/xyz.hbs';
      var expected = [':root', ':a:b("foo,bar")', ':c:d("baz,qux")', 'xyz.hbs'];
      assert.deepEqual(utils.splitPath(fixture), expected);
    });

    it('should split nested helper expressions', function() {
      var units = [
        [
          ':name("foo" (lower "bar"))',
          [':name("foo" (lower "bar"))']
        ],
        [
          ':name((lower "bar"))',
          [':name((lower "bar"))']
        ],
        [
          ':name(lower "bar")',
          [':name(lower "bar")']
        ],
        [
          ':root/:name("foo" (lower "bar"))/foo.hbs',
          [':root', ':name("foo" (lower "bar"))', 'foo.hbs']
        ],
        [
          '\\:root/:name("foo" (lower "bar"))/foo.hbs',
          ['\\:root', ':name("foo" (lower "bar"))', 'foo.hbs']
        ],
        [
          '\\:root/:name("foo" (lower (upper "bar")))/foo.hbs',
          ['\\:root', ':name("foo" (lower (upper "bar")))', 'foo.hbs']
        ]
      ];

      units.forEach(function(arr) {
        assert.deepEqual(utils.splitPath(arr[0]), arr[1]);
      });
    });
  });
});

'use strict';

require('mocha');
var assert = require('assert');
var convert = require('../lib/convert');

describe('convert syntax', function() {
  it('should convert a variable to handlebars', function() {
    assert.equal(convert(':foo'), '{{foo}}');
  });

  it('should convert path-separated variables to handlebars', function() {
    assert.equal(convert(':foo/:bar'), '{{foo}}/{{bar}}');
  });

  it('should convert multiple variables in a segment', function() {
    assert.equal(convert(':foo:bar'), '{{foo}}{{bar}}');
    assert.equal(convert(':root/:a:b:c/foo.hbs'), '{{root}}/{{a}}{{b}}{{c}}/foo.hbs');
    assert.equal(convert(':a:b:c/:foo.hbs'), '{{a}}{{b}}{{c}}/{{foo}}.hbs');
  });

  it('should not convert invalid segments', function() {
    assert.equal(convert('http://breakdance.io'), 'http://breakdance.io');
    assert.equal(convert('https://foo:bar'), 'https://foo{{bar}}');
    assert.equal(convert('http://foo:bar'), 'http://foo{{bar}}');
    assert.equal(convert('://foo:bar'), '://foo{{bar}}');
    assert.equal(convert(':&foo:bar'), ':&foo{{bar}}');
    assert.equal(convert('::foo:bar'), ':{{foo}}{{bar}}');
    assert.equal(convert(':$foo:bar'), '{{$foo}}{{bar}}');
    assert.equal(convert(':-$foo:bar'), ':-$foo{{bar}}');
    assert.equal(convert(':$-foo:bar'), '{{$-foo}}{{bar}}');
    assert.equal(convert(':$$foo:bar'), '{{$$foo}}{{bar}}');
    assert.equal(convert(':f-o-o:bar'), '{{f-o-o}}{{bar}}');
    assert.equal(convert(':f_o_o:bar'), '{{f_o_o}}{{bar}}');
    assert.equal(convert(':!--foo--:bar'), '{{!--foo--}}{{bar}}');
    assert.equal(convert(':!foo:bar'), '{{!foo}}{{bar}}');
    assert.equal(convert(':*foo:bar'), '{{* foo}}{{bar}}');
    assert.equal(convert(':>foo:bar'), '{{> foo}}{{bar}}');
  });

  it('should not convert escaped segments', function() {
    assert.equal(convert('\\:foo:bar'), ':foo{{bar}}');
  });

  it('should convert variables with dot-notation', function() {
    assert.equal(convert(':foo.bar/:baz.qux/fez'), '{{foo.bar}}/{{baz.qux}}/fez');
  });

  it('should not confuse file extensions as dot-notation', function() {
    assert.equal(convert(':foo.bar/:baz.qux'), '{{foo.bar}}/{{baz}}.qux');
    assert.equal(convert(':foo.bar/:b.a.z.qux'), '{{foo.bar}}/{{b.a.z}}.qux');
    assert.equal(convert(':foo.bar/:baz.:qux'), '{{foo.bar}}/{{baz}}.{{qux}}');
    assert.equal(convert(':foo.bar/:b.az.:qux'), '{{foo.bar}}/{{b.az}}.{{qux}}');
    assert.equal(convert(':foo.bar/:b.:az.:qux'), '{{foo.bar}}/{{b}}.{{az}}.{{qux}}');
  });

  it('should convert helper expressions', function() {
    assert.equal(convert(':a(foo)'), '{{a foo}}');
    assert.equal(convert(':a(foo)'), '{{a foo}}');
    assert.equal(convert(':root/:a(foo)'), '{{root}}/{{a foo}}');
    assert.equal(convert(':root/:a:b(foo)'), '{{root}}/{{a}}{{b foo}}');
  });

  it('should work with file extensions', function() {
    assert.equal(convert(':base/:upper(name)/index.:ext'), '{{base}}/{{upper name}}/index.{{ext}}');
  });

  it('should convert helper expressions with quotes', function() {
    assert.equal(convert(':a("foo")'), '{{a "foo"}}');
    assert.equal(convert(':root/:a("foo")'), '{{root}}/{{a "foo"}}');
    assert.equal(convert(':root/:a:b("foo")'), '{{root}}/{{a}}{{b "foo"}}');
    assert.equal(convert(':a("foo,bar")'), '{{a "foo,bar"}}');
    assert.equal(convert(':root/:a("foo,bar")'), '{{root}}/{{a "foo,bar"}}');
    assert.equal(convert(':root/:a:b("foo,bar")'), '{{root}}/{{a}}{{b "foo,bar"}}');
    assert.equal(convert(':a("foo bar")'), '{{a "foo bar"}}');
    assert.equal(convert(':root/:a("foo bar")'), '{{root}}/{{a "foo bar"}}');
    assert.equal(convert(':root/:a:b("foo bar")'), '{{root}}/{{a}}{{b "foo bar"}}');
  });

  it('should convert multiple helper expressions', function() {
    var fixture = ':root/:a:b("foo,bar")/:c:d("baz,qux")/xyz.hbs';
    var expected = '{{root}}/{{a}}{{b "foo,bar"}}/{{c}}{{d "baz,qux"}}/xyz.hbs';
    assert.equal(convert(fixture), expected);
  });

  it('should convert nested helper expressions', function() {
    [[
      ':name("foo" (lower "bar"))',
      '{{name "foo" (lower "bar")}}'
    ],
    [
      ':name((lower "bar"))',
      '{{name (lower "bar")}}'
    ],
    [
      ':name(lower "bar")',
      '{{name lower "bar"}}'
    ],
    [
      ':root/:name("foo" (lower "bar"))/foo.hbs',
      '{{root}}/{{name "foo" (lower "bar")}}/foo.hbs'
    ],
    [
      '\\:root/:name("foo" (lower "bar"))/foo.hbs',
      ':root/{{name "foo" (lower "bar")}}/foo.hbs'
    ],
    [
      '\\:root/:name("foo" (lower (upper "bar")))/foo.hbs',
      ':root/{{name "foo" (lower (upper "bar"))}}/foo.hbs'
    ]].forEach(function(arr) {
      assert.equal(convert(arr[0]), arr[1]);
    });
  });
});

'use strict';

require('mocha');
const assert = require('assert');
const convert = require('../lib/convert');

describe('convert syntax', function() {
  it('should convert a variable to handlebars', function() {
    assert.equal(convert(':foo'), '{{foo}}');
  });

  it('should convert when colon is in the middle of text', function() {
    assert.equal(convert('a:foo'), 'a{{foo}}');
  });

  it('should convert path-separated variables to handlebars', function() {
    assert.equal(convert(':foo/:bar'), '{{foo}}/{{bar}}');
  });

  it('should convert variables followed by a slash', function() {
    assert.equal(convert(':foo/'), '{{foo}}/');
    assert.equal(convert(':foo/:bar/'), '{{foo}}/{{bar}}/');
  });

  it('should convert variables with a leading slash', function() {
    assert.equal(convert('/:foo'), '/{{foo}}');
    assert.equal(convert('/:foo/'), '/{{foo}}/');
    assert.equal(convert('/:foo/:bar/'), '/{{foo}}/{{bar}}/');
  });

  it('should convert variables followed by a space', function() {
    assert.equal(convert(':foo(bar (baz (a (b (c)))))/:abc/:xxx(bbb)'), '{{foo bar (baz (a (b (c))))}}/{{abc}}/{{xxx bbb}}');
    assert.equal(convert(':foo(bar (baz (a (b (c)))))/:abc/:xxx(bbb) - :bar'), '{{foo bar (baz (a (b (c))))}}/{{abc}}/{{xxx bbb}} - {{bar}}');
    assert.equal(convert(':foo '), '{{foo}} ');
    assert.equal(convert(':foo :bar '), '{{foo}} {{bar}} ');
    assert.equal(convert(':title - :num '), '{{title}} - {{num}} ');
    assert.equal(convert(' - :upper(site.title) | page :num'), ' - {{upper site.title}} | page {{num}}');
    assert.equal(convert(' - :upper(site.title)'), ' - {{upper site.title}}');
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
    assert.equal(convert(':-$foo:bar'), '{{-$foo}}{{bar}}');
    assert.equal(convert(':$-foo:bar'), '{{$-foo}}{{bar}}');
    assert.equal(convert(':$$foo:bar'), '{{$$foo}}{{bar}}');
    assert.equal(convert(':f-o-o:bar'), '{{f-o-o}}{{bar}}');
    assert.equal(convert(':f_o_o:bar'), '{{f_o_o}}{{bar}}');
    assert.equal(convert(':!--foo--:bar'), '{{!--foo--}}{{bar}}');
    assert.equal(convert(':!foo:bar'), '{{!foo}}{{bar}}');
    assert.equal(convert(':#if(bar):foo:^other:/if'), '{{#if bar}}{{foo}}{{^}}other{{/if}}');
    assert.equal(convert(':^foo:bar'), '{{^}}foo{{bar}}');
    assert.equal(convert(':*foo:bar'), '{{* foo}}{{bar}}');
    assert.equal(convert(':>foo:bar'), '{{> foo}}{{bar}}');
  });

  it('should not convert escaped segments', function() {
    assert.equal(convert('\\:foo:bar'), ':foo{{bar}}');
  });

  it('should throw an error on when an invalid block is defined', function() {
    assert.throws(function() {
      convert(':#if(bar):foo:^other:/zzz');
    }, /does not match/);
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

  it('should disregard extensions when last character is a space', function() {
    assert.equal(convert(':foo.bar/:baz.qux '), '{{foo.bar}}/{{baz}}.qux ');
    assert.equal(convert(':foo.bar/:b.a.z.qux '), '{{foo.bar}}/{{b.a.z}}.qux ');
    assert.equal(convert(':foo.bar/:baz.:qux '), '{{foo.bar}}/{{baz}}.{{qux}} ');
    assert.equal(convert(' - :site.title '), ' - {{site.title}} ');
    assert.equal(convert(' - :upper(site.title).hbs '), ' - {{upper site.title}}.hbs ');
  });

  it('should disregard extensions when first character is a space', function() {
    assert.equal(convert(' :foo.bar/:baz.qux'), ' {{foo.bar}}/{{baz.qux}}');
    assert.equal(convert(' :foo.bar/:b.a.z.qux'), ' {{foo.bar}}/{{b.a.z.qux}}');
    assert.equal(convert(' :foo.bar/:baz.:qux'), ' {{foo.bar}}/{{baz}}.{{qux}}');
    assert.equal(convert(' - :site.title'), ' - {{site.title}}');
    assert.equal(convert(' - :upper(site.title).hbs'), ' - {{upper site.title}}.hbs');
  });

  it('should convert empty helper expressions', function() {
    assert.equal(convert(':a()'), '{{a}}');
  });

  it('should convert helper expressions with arguments', function() {
    assert.equal(convert(':a(foo)'), '{{a foo}}');
    assert.equal(convert(':a(foo)'), '{{a foo}}');
    assert.equal(convert(':root/:a(foo)'), '{{root}}/{{a foo}}');
    assert.equal(convert(':root/:a:b(foo)'), '{{root}}/{{a}}{{b foo}}');
  });

  it('should convert helper expressions with dot arguments', function() {
    assert.equal(convert(':a(., "foo")'), '{{a . "foo"}}');
    assert.equal(convert(':a(.)'), '{{a .}}');
  });

  it('should convert helper expressions with hash arguments', function() {
    assert.equal(convert(':a(., foo="bar")'), '{{a . foo="bar"}}');
    assert.equal(convert(':a(foo="bar")'), '{{a foo="bar"}}');
  });

  it('should convert helper expressions with slashes in arguments', function() {
    assert.equal(convert(':date(file, "YYYY/MM/DD")/:stem/index.html'), '{{date file "YYYY/MM/DD"}}/{{stem}}/index.html');
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
    var units = [
      [
        ':name("foo" (lower "bar"))',
        '{{name "foo" (lower "bar")}}'
      ],
      [
        ':name(foo (lower "bar"))',
        '{{name foo (lower "bar")}}'
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
        ':root/:name(. (lower .))/foo.hbs',
        '{{root}}/{{name . (lower .)}}/foo.hbs'
      ],
      [
        ':root/:name("foo" (lower .))/foo.hbs',
        '{{root}}/{{name "foo" (lower .)}}/foo.hbs'
      ],
      [
        '\\:root/:name("foo" (lower "bar"))/foo.hbs',
        ':root/{{name "foo" (lower "bar")}}/foo.hbs'
      ],
      [
        '\\:root/:name("foo" (lower (upper "bar")))/foo.hbs',
        ':root/{{name "foo" (lower (upper "bar"))}}/foo.hbs'
      ]
    ];

    units.forEach(function(arr) {
      assert.equal(convert(arr[0]), arr[1]);
    });
  });
});

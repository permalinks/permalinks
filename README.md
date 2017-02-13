# permalinks [![NPM version](https://img.shields.io/npm/v/permalinks.svg?style=flat)](https://www.npmjs.com/package/permalinks) [![NPM monthly downloads](https://img.shields.io/npm/dm/permalinks.svg?style=flat)](https://npmjs.org/package/permalinks)  [![NPM total downloads](https://img.shields.io/npm/dt/permalinks.svg?style=flat)](https://npmjs.org/package/permalinks) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/permalinks.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/permalinks)

> Adds permalink or URL routing/URL rewriting logic to any node.js project. Can be used in static site generators, build systems, web applications or anywhere you need to do path transformation or prop-string replacements.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save permalinks
```

## Quickstart

You can add permalinks to any JavaScript project using node's `require()` system with the following line of code:

```js
var permalinks = require('permalinks');
```

To create a permalink, pass the `structure` with `:prop` placeholders to replace, and a `file` to use

```js
console.log(permalinks(':name/index.html', {path: 'src/about.hbs'}));
//=> 'about/index.html'
```

## Usage

```js
var permalinks = require('permalinks');
console.log(permalinks(':stem/index.html', {path: 'src/about.hbs'}));
//=> 'about/index.html'
```

**Constructor**

The main export is a constructor function that takes a permalink `structure` and a `file` for creating the permalink.

```js
var Permalinks = require('permalinks');

var options = {};
var permalinks = new Permalinks(options);

var file = new File({path: 'src/about.hbs'});
console.log(permalinks.format(':stem/index.html', file));
//=> 'about/index.html'

// If a structure is passed, the the [.format](#format)
// method is called, which expects the second argument to be a `file`
// object or string.
var permalinks = new Permalinks(':foo/index.html', file, options);
```

## Data

As long as a file is provided with a `file.path`, the following built-in `file` variables will be automatically available on the context:

| **variable** | **description** | 
| --- | --- |
| `path` | The original, full file path, if defined |
| `dirname` | The full file path, excluding `basename` |
| `basename` | The basename of a file, including file extension |
| `stem` | The basename of a file, excluding file extension |
| `name` | Alias for `stem` |
| `extname` | File extension |

**Examples**

### Custom data

Any of the built-in `file` variable can be overridden by setting the properties directly.

## file helper

A special built-in `file` helper is called on every file and then removed from the context before rendering.

```js
permalinks.helper('file', function(file, data, locals) {
  // do stuff with file, data and locals
});
```

This is useful for modifying the context or setting properties on files before generating permalinks.

**Example**

```js
var file = new File({path: 'foo/bar/baz.hbs'});
var permalinks = new Permalinks();
var count = 0;

permalinks.helper('file', function(file, data, locals) {
  data.num = ++count;
});

console.log(permalinks.format(':num-:basename', file));
//=> '1-baz.hbs'
console.log(permalinks.format(':num-:basename', file));
//=> '2-baz.hbs'
console.log(permalinks.format(':num-:basename', file));
//=> '3-baz.hbs'
console.log(count);
//=> 3
```

## API

### [Permalinks](index.js#L18)

Create an instance of `Permalinks` with the given `options`

**Params**

* `options` **{Options|String}**

**Example**

```js
var permalinks = new Permalinks();
console.log(permalinks.format(':stem/index.html'), {path: 'src/about.hbs'});
//=> 'about/index.html'
```

### [.parse](index.js#L65)

Uses [parse-filepath](https://github.com/jonschlinkert/parse-filepath) to parse the `file.path` on the given file object. This method is called by the [format](#format) method, but you can use it directly and pass the results as `locals` (the last argument) to the `.format` method if you need to override or modify any path segments.

**Params**

* `file` **{Object}**
* `returns` **{Object}**

**Example**

```js
console.log(permalinks.parse({path: 'foo/bar/baz.md'}));
// { root: '',
//   dir: 'foo/bar',
//   base: 'baz.md',
//   ext: '.md',
//   name: 'baz',
//   extname: '.md',
//   basename: 'baz.md',
//   dirname: 'foo/bar',
//   stem: 'baz',
//   path: 'foo/bar/baz.md',
//   absolute: [Getter/Setter],
//   isAbsolute: [Getter/Setter] }
```

### [.format](index.js#L96)

Generate a permalink by replacing `:prop` placeholders in the specified `structure` with data from the given `file` and `locals`.

**Params**

* `structure` **{String}**: Permalink structure or the name of a registered [preset](#preset).
* `file` **{Object|String}**: File object or file path string.
* `locals` **{Object}**: Any additional data to use for resolving placeholders.
* `returns` **{String}**

**Example**

```js
var fp = permalinks.format('blog/:stem/index.html', {path: 'src/about.hbs'});
console.log(fp);
//=> 'blog/about/index.html'
```

### [.preset](index.js#L132)

Define a permalink `preset` with the given `name` and `structure`.

**Params**

* `name` **{String}**: If only the name is passed,
* `structure` **{String|Object}**
* `returns` **{Object}**: Returns the `Permalinks` instance for chaining

**Example**

```js
permalinks.preset('blog', 'blog/:stem/index.html');
var url = permalinks.format('blog', {path: 'src/about.hbs'});
console.log(url);
//=> 'blog/about/index.html'
```

### [.helper](index.js#L180)

Define permalink helper `name` with the given `fn`. Helpers work like any other variable on the context, but they can optionally take any number of arguments and can be nested to build up the resulting string.

**Params**

* `name` **{String}**: Helper name
* `fn` **{Function}**
* `returns` **{Object}**: Returns the Permalink instance for chaining.

**Example**

```js
permalinks.helper('date', function(file, format) {
  return moment(file.data.date).format(format);
});

var structure1 = ':date(file, "YYYY/MM/DD")/:stem/index.html';
var file1 = permalinks.format(structure1, {
  data: {date: '2017-01-01'},
  path: 'src/about.tmpl'
});

var structure2 = ':name(upper(stem))/index.html';
var file2 = permalinks.format(structure2, {
  data: {date: '2017-01-01'},
  path: 'src/about.tmpl'
});

console.log(file1);
//=> '2017/01/01/about/index.html'

console.log(file2);
//=> '2017/01/01/about/index.html'
```

<details>
<summary><strong>SEO Recommendations</strong></summary>

Permalinks are important for SEO, but it's a good idea to spend some time thinking about the strategy you want to use before you decide on a URL structure.

### Use semantic relevance

The most important aspect of a URL is that it makes semantic sense to humans. The more interesting the URL is to humans, the more interesting it will be to search engines.

The following are all good permalink structures, in order of [my own](https://github.com/jonschlinkert) personal preference. Pick the one that makes the most sense for your site:

* `/:postname` (a semantic, descriptive, catchy post name is best permalink structure whenever possible)
* `/:category/:postname/`
* `/:author/:postname` (popular with [medium](https://medium.com)-style blogging platforms)
* `/:category/:author/:postname`

It's not unusualy for big sites to use different structures for different parts of the site (blog, products, etc).

### Avoid date-based permalinks

Contrary to what might seem like an idiomatic pattern, based on the widespread adoption of using dates to categorize blog posts, dates tend to, well... _date_ your content.

Date-based URL's tend to _decrease click through rates_ on older articles. Think about it, who prefers reading out of date content? Try to use a URL strategy that doesn't go out of its way to emphasize the date, and you'll keep your posts feeling like fresh content.

There are plenty of valid use cases for using date-based URL's, like for categorizing movies, albums, breaking news, and so on. But in general, if you're writing about topics that aren't more relevant to users _specifically because of the date of the material_, it's recommend that you avoid using a date-based permalink structure for your blog or documentation, because there is a good chance it will do more harm than good over the long term.

### Numeric permalinks

Numeric or `:id` based permalinks are better than date-based, but they don't really offer much usability or SEO benefit.

## Summary

The best URL structure is one that:

* provides the _highest degree of semantic relevance_ to the content, and
* is _useful to both search engines and humans_

Happy blogging!
</details>

## About

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
MIT

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.2, on February 13, 2017._
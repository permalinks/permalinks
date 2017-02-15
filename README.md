# permalinks [![NPM version](https://img.shields.io/npm/v/permalinks.svg?style=flat)](https://www.npmjs.com/package/permalinks) [![NPM monthly downloads](https://img.shields.io/npm/dm/permalinks.svg?style=flat)](https://npmjs.org/package/permalinks)  [![NPM total downloads](https://img.shields.io/npm/dt/permalinks.svg?style=flat)](https://npmjs.org/package/permalinks) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/permalinks.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/permalinks)

> Adds permalink or URL routing/URL rewriting logic to any node.js project. Can be used in static site generators, build systems, web applications or anywhere you need to do path transformation or prop-string replacements.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save permalinks
```

## Usage

You can add permalinks to any JavaScript project using node's `require()` system with the following line of code:

```js
var permalinks = require('permalinks');
```

To create a permalink, pass a `structure` (strong) with placeholders (like `:prop`) to replace, and the `file` with path information to use:

```js
var structure = ':category/:name/index.html';
var file = {path: 'src/about.hbs'};
var locals = {category: 'blog'};

console.log(permalinks(structure, file, locals));
//=> 'blog/about/index.html'
```

<details>
<summary><strong>Constructor usage</strong></summary>

The main export can be used as a constructor function. If you need to [register helpers](#helpers) or use any of the `Permalinks` methods, you will need to first create an instance of `Permalinks`.

```js
var Permalinks = require('permalinks');

var options = {};
var permalinks = new Permalinks(options);
var file = {path: 'src/about.hbs'};

console.log(permalinks.format(':stem/index.html', file));
//=> 'about/index.html'
```
</details>

## Files

### File conventions

For convenience, files can be defined as a string or an object. If defined as a string, permalinks will convert the filepath to the `file.path` property of an object.

In other words, both of the following paths:

```js
var file = 'a/b/c.md';
var file = {path: 'a/b/c.md'};
```

...will convert to `{path: 'a/b/c.md'}`.

### File path properties

Values on the provided `file` object are used to resolve placeholders in the permalink structure. File values can be overridden by [locals](#locals) or [helpers](#helpers).

As long as a file is provided with at least a `file.path` property, most of the following built-in `file` variables will be automatically available on the context.

| **variable** | **description** | 
| --- | --- |
| `file.cwd` | Gets and sets current working directory. Will always be normalized and have trailing separators removed. Throws when set to any value other than non-empty strings. |
| `file.base` | Gets and sets base directory. Used for created relative paths. When `null` or `undefined`, it simply proxies the `file.cwd` property. Will always be normalized and have trailing separators removed. Throws when set to any value other than non-empty strings or `null`/`undefined`. |
| `file.path` | Gets and sets the absolute pathname string or `undefined`. This value is always normalized and trailing separators are removed. Throws when set to any value other than a string. |
| `file.relative` | Gets the result of `path.relative(file.base, file.path)`. This is a getter and will throws if set or when `file.path` is not set. |
| `file.dirname` | Gets and sets the dirname of `file.path`. Will always be normalized and have trailing separators removed. Throws when `file.dirname` is not exlicitly defined and/or `file.path` is not set. |
| `file.basename` | Gets and sets the basename of `file.path`. Throws when `file.basename` is not exlicitly defined and/or `file.path` is not set. |
| `file.stem` | Gets and sets stem (filename without suffix) of `file.path`. Throws when `file.stem` is not exlicitly defined and/or  `file.path` is not set. |
| `file.name` | Alias for `file.stem` |
| `file.extname` | Gets and sets extname of `file.path`. |

## Data

TODO

### locals

TODO

### file.data

TODO

### options.data

TODO

## Helpers

Helper functions can be used to resolve placeholders in permalink structures. For example:

```js
var url = permalinks.format(':foo', {path: 'about.hbs'});
```

### Registering helpers

Helpers are registered using the `permalinks.helper()` method.

```js

permalinks.helper('foo', function() {

});
```

<details>
<summary><strong>Helper example</strong></summary>

Use a `date` helper to dynamically generate paths based on the date defined in YAML front matter of a file.

```js
var moment = require('moment');
var Permalinks = require('permalinks');
var permalinks = new Permalinks();

var file = {
  path: 'src/about.hbs',
  data: {
    date: '2017-02-14'
  }
};

// "file.data" is merged onto "this.context" 
permalinks.helper('date', function(format) {
  return moment(this.context.date).format(format || 'YYYY/MM/DD');
});

console.log(permalinks.format(':date/:stem/index.html', file));
//=> '2017/02/14/about/index.html'
```

Helpers can also optionally take arguments:

```js
console.log(permalinks.format(':date("YYYY")/:stem/index.html', file));
//=> '2017/about/index.html'
```
</details>

See the [helper unit tests](test) for more examples.

### file helper

A special built-in `file` helper is called on every file and then removed from the context before rendering.

```js
permalinks.helper('file', function(file, data, locals) {
  // do stuff with file, data and locals
});
```

This is useful for modifying the context or setting properties on files before generating permalinks.

<details>
<summary><strong>`file` helper example</strong></summary>

Use the `file` helper to increment a value for pagination or something similar:

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

</details>

## About

### Related projects

* [handlebars](https://www.npmjs.com/package/handlebars): Handlebars provides the power necessary to let you build semantic templates effectively with no frustration | [homepage](http://www.handlebarsjs.com/ "Handlebars provides the power necessary to let you build semantic templates effectively with no frustration")
* [parse-filepath](https://www.npmjs.com/package/parse-filepath): Pollyfill for node.js `path.parse`, parses a filepath into an object. | [homepage](https://github.com/jonschlinkert/parse-filepath "Pollyfill for node.js `path.parse`, parses a filepath into an object.")
* [vinyl](https://www.npmjs.com/package/vinyl): Virtual file format. | [homepage](https://github.com/gulpjs/vinyl#readme "Virtual file format.")

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

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.2, on February 15, 2017._
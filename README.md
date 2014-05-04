# permalinks [![NPM version](https://badge.fury.io/js/permalinks.png)](http://badge.fury.io/js/permalinks)

> Adds permalink or URL routing/URL rewriting logic to any node.js project. Can be used in static site generators, build systems, web applications or anywhere you need to do path transformation or prop-string replacements.

For an implementation example, see Assemble's [permalinks middleware](https://github.com/assemble/assemble-middleware-permalinks).

## Table of Contents

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
* [Docs](#docs)
  * [How it works](#how-it-works)
  * [Special Patterns](#special-patterns)
  * [Custom replacement patterns](#custom-replacement-patterns)
  * [Date patterns](#date-patterns)
* [Options](#options)
  * [structure](#structure)
  * [preset](#preset)
* [Usage Examples](#usage-examples)
  * [Pretty URLs](#pretty-urls)
  * [Using presets](#using-presets)
  * [Dest extension](#dest-extension)
  * [Path separators](#path-separators)
* [More examples](#more-examples)
* [Contributing](#contributing)
* [Authors](#authors)
* [License](#license)

<!-- toc stop -->
## Install
Install with [npm](npmjs.org):

```bash
npm i permalinks --save
```


## Usage

```js
var permalinks = require('permalinks');
```

At minimum, you must pass a structure and a context:

```js
permalinks( structure, context, options );
```

For example:

```js
var context = {first: "brian", last: "woodward"};
permalinks('people/:last/:first/index.html', context);

// results in:
// => 'people/woodward/brian/index.html'
```

## Docs

### How it works
Pass a **structure** and a **context**:

```js
var structure = ':a/:b/:c';
var context = {
  a: 'foo',
  b: 'bar',
  c: 'baz'
};
permalinks(structure, context)
//=> foo/bar/baz
```

A more dynamic example would be parsing filepaths using the [node.js path module](http://nodejs.org/api/path.html), passing an object with the parsed values as context:

```js
// a "source" filepath
var src = 'src/content/interesting-post.md';
var context = {
  ext: path.extname(src),
  basename: path.basename(src, path.extname(src)),
  dirname: path.dirname(src)
};
var structure = 'blog/posts/:YYYY/:MM/:basename.html';

// the resulting ("destination") filepath
var dest = permalinks(structure, context);
// => blog/posts/2014/05/interesting-post.html
```

### Special Patterns
> A few special replacement patterns were created for this lib.

#### `:num`

Automatically adds sequential, "padded" numbers, using the provided `length` to determine the amount of padding.

For example, given you have `permalinks({structure: ':num-:basename', context: context, length: foo})`

* if `foo` is 1-9, the result would be `1-foo.html`, `2-bar.html`, `3-baz.html` and so on.
* if `foo` is 1,000 the result would be `0001-foo.html`, `0002-bar.html`, `0003-baz.html`, ... `1000-quux.html`.

#### `:000`
Adds sequential digits. Similar to `:num`, but the number of digits is determined by the number of zeros defined.

Example:

* `:00` will result in two-digit numbers
* `:000` will result in three-digit numbers
* `:00000000` will result in eight-digit numbers, and so on...



#### `:random( pattern, number )`

Adds randomized characters based on the pattern provided in the parentheses. `pattern` defines the pattern you wish to use, and `number` is an optional parameter to define the number of characters to generate.

For example, `:random(A, 4)` (whitespace insenstive) would result in randomized 4-digit uppercase letters, like, `ZAKH`, `UJSL`... and so on.

**no second parameter**

If a second parameter is not provided, then the  `length()` of the characters used in the first parameter will be used to determine the number of digits to output. For example:

* `:random(AAAA)` is equivelant to `:random(A, 4)`
* `:random(AAA0)` and `:random(AA00)` and `:random(A0A0)` are equivelant to `:random(A0, 4)`

**valid characters (and examples)**

* `:random(aa)`: results in double-digit, randomized, lower-case letters (`abcdefghijklmnopqrstuvwxyz`)
* `:random(AAA)`: results in triple-digit, randomized, upper-case letters (`ABCDEFGHIJKLMNOPQRSTUVWXYZ`)
* `:random(0, 6)`: results in six-digit, randomized nubmers (`0123456789`)
* `:random(!, 5)`: results in single-digit randomized, _valid_ non-letter characters (`~!@#$%^&()_+-={}[];\',.`)
* `:random(A!a0, 9)`: results in nine-digit, randomized characters (any of the above)

_The order in which the characters are provided has no impact on the outcome._

### Custom replacement patterns
Adding patterns is easy, just add a `replacements: []` property to the `permalinks` option, then add any number of patterns to the array. For example, let's say we want to add the `:project` variable to our permalinks:

```js
var options = {
  structure: ':year/:month/:day/:project/:slug:ext',
  replacements: [
    // replacement patterns here!
  ]
};
...
```

Since `:project` is not a built-in variable, we need to add a replacement pattern so that any permalinks that include this variable will actually work:

```js
var options = {
  structure: ':year/:month/:day/:project/:slug:ext',
  replacements: [
    {
      pattern: ':project',
      replacement: require('./package.json').name
    }
  ]
};
```

If you have some replacement patterns you'd like to implement, if you think they're common enough that they should be built into this plugin, please submit a pull request.

#### with custom properties

Any string pattern is acceptable, as long as a `:` precedes the variable, but don't forget that there must also be a matching property in the context!

### Date patterns
> This plugin uses the incredibly feature rich and flexible [moment.js](http://momentjs.com/) for parsing dates. Please consult the [moment.js documentation](http://momentjs.com/docs/) for usage information and for the full list of available options.

For the date variables to work, a `date` property must exist on the page object.

```yaml
---
date: 2014-01-29 3:45 PM
---
```

Or

```js
pages: [
  {
    data: {
      title: 'All about permalinks, the novel.',
      description: 'This rivoting sequel to War & Peace will have you sleeping in no time.'
      date: '2014-01-29 3:45 PM'
    },
    content: ""
  }
]
```

#### Common date patterns

* `:year`: The year of the date, four digits, for example `2014`
* `:month`: Month of the year, for example `01`
* `:day`: Day of the month, for example `13`
* `:hour`: Hour of the day, for example `24`
* `:minute`: Minute of the hour, for example `01`
* `:second`: Second of the minute, for example `59`

For the following examples, let's assume we have a date in the YAML front matter of a page formatted like this:

```yaml
---
date: 2014-01-29 3:45 PM
---
```
(_note that this property doesn't have to be in YAML front matter, it just needs to be in the `page.data` object, so this works fine with `options.pages` collections as well._)

#### Full date
* `:date`:       Eqivelant to the full date: `YYYY-MM-DD`. Example: `2014-01-29`

#### Year
* `:YYYY`:      The full year of the date. Example: `2014`
* `:YY`:        The two-digit year of the date. Example: `14`
* `:year`:      alias for `YYYY`

#### Month name
* `:MMMM`:      The full name of the month. Example `January`.
* `:MMM`:       The name of the month. Example: `Jan`
* `:monthname`: alias for `MMMM`

#### Month number
* `:MM`:        The double-digit number of the month. Example: `01`
* `:M`:         The single-digit number of the month. Example: `1`
* `:month`:     alias for `MM`
* `:mo`:        alias for `M`

#### Day of the month
* `:day`:       alias for `DD`
* `:DD`:        The double-digit day of the month. Example: `29`
* `:D`:         The double-digit day of the month. Example: `29`

#### Day of the week
* `:dddd`:      Day of the week. Example: `monday`
* `:ddd`:       Day of the week. Example: `mon`
* `:dd`:        Day of the week. Example: `Mo`
* `:d`:         Day of the week. Example: `2`

#### Hour
* `:HH`:        The double-digit time of day on a 24 hour clock. Example `15`
* `:H`:         The single-digit time of day on a 24 hour clock. Example `3`
* `:hh`:        The double-digit time of day on a 12 hour clock. Example `03`
* `:h`:         The single-digit time of day on a 12 hour clock. Example `3`
* `:hour`:      alias for `HH`

#### Minute
* `:mm`:        Minutes. Example: `45`.
* `:m`:         Minutes. Example: `45`.
* `:min`:       Alias for `mm`|`m`.
* `:minute`:    Alias for `mm`|`m`.

#### Second
* `:ss`:        Seconds. Example: `09`.
* `:s`:         Seconds. Example: `9`.
* `:sec`:       Alias for `ss`|`s`.
* `:second`:    Alias for `ss`|`s`.

## Options
### structure
Type: `String`

Default: `undefined`

The permalink pattern to use for building paths and generated files.

### preset
Type: `String`

Default: `undefined`

The following presets are currently available:

* `numbered`:  expands to `:num-:basename:ext`
* `pretty`: expands to `:basename/index:html`
* `dayname`: expands to `:YYYY/:MM/:DD/:basename/index:ext`
* `monthname`: expands to `:YYYY/:MM/:basename/index:ext`


#### how presets work

In a nutshell, a preset is simply a pre-defined permalink `structure`, so instead of having to type out `:foo/:bar/:baz/basename:html`, you can just use `pretty`. Presets expand into permalink structures following this pattern:

```js
preset
//=> :bar/index:html
```

Additionally, if a `structure` is also defined, the `preset` will be appended to it.

```js
structure + preset
//=> :foo + :bar/index:html
```

_If you would like to see another preset, [please submit an issue](https://github.com/jonschlinkert/permalinks/issues/new)._

## Usage Examples
### Pretty URLs

Pretty links involve saving an `index.html` to each directory, with the tile, file name, slug, or some other variable as the `:basename` of the directory. For example:

```js
var url = fs.readdirSync('./').map(function(filepath) {
  var ext = path.extname(filepath);
  var basename = path.basename(filepath, ext);
  return permalinks(':basename/index.:ext', {
    basename: basename,
    ext: ext
  });
});
```

results in something like:

```js
['my-node-js-post/index.html', ...]
```

### Using presets

Presets allow you to achieve certain permalinks structures without having to explicitly define each URL segment. For example, in the previous example we created pretty URLs., Here is how we would do the same with `presets`:

```js
var options = {
  preset: 'pretty',
  context: {
    basename: basename,
    ext: ext
  }
};
permalinks(options);
```

The above example won't necessarily save a whole lot of time, but it's a nice way of ensuring that you're getting pretty links with whatever permalinks structure you define. To some, this might be particularly useful when "stacked" with more complex permalink structures, e.g.:

```js
var options = {
  preset: 'pretty',
  structure: ':archives/:categories'
};
```

which expands to: `:archives/:categories/:basename:/index:ext`, and would result in:

```js
archives/categories/foo/index.html
```

### Dest extension

In most cases your generated HTML will have the `.html` extension, then using `:index.html` is probably fine. But if you happen to switch back and forthing between projects that alternate between `.htm` and `.html`, you can use `:index:ext` instead.


### Path separators

You don't have to use slashes (`/`) only in your permalinks, you can use `-` or `_` wherever you need them as well. For example, this is perfectly valid:

```
:YYYY_:MM-:DD/:slug:category:foo/:bar/index.html
```

**Warning**, this should be obvious, but make sure not to use a `.` in the middle of your paths, especially if you use Windows.

## More examples

Keep in mind that the date is formatted the way you want it, you don't need to follow these examples. Also, some of these variables will only work if you add that property to your pages, and setup the replacement patterns.

```js
':YYYY/:MM/:DD/news/:id/index:ext'
//=> dest + '/2014/01/01/news/001/index.html'

':YYYY/:MM/:DD/:mm/:ss/news/:id/index:ext'
//=> dest + '/2014/01/01/40/16/news/001/index.html'

':year/:month/:day/:basename:ext'
//=> dest + '/2014/01/01/my-post.html'

'blog/:year-:month-:day/:basename:ext'
//=> dest + 'blog/2014-01-01/my-post.html'

':date/:basename:ext'
//=> dest + '2014-01-01/my-post.html'

':year/:month/:day/:category/index.html'
//=> dest + '/2014/01/01/javascript/index.html'

':year/:month/:day/:slug/index.html'
//=> dest + '/2014/01/01/business-finance/index.html'
```

## Contributing
Find a bug? Have a feature request? Please [create an Issue](https://github.com/jonschlinkert/permalinks/issues).

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality,
and run `docs` in the command line to build the docs with [Verb](https://github.com/assemble/verb).

Pull requests are also encouraged, and if you find this project useful please consider "starring" it to show your support! Thanks!

## Authors

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on May 04, 2014._
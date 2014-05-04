## Pretty URLs

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

## Using presets

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

## Dest extension

In most cases your generated HTML will have the `.html` extension, then using `:index.html` is probably fine. But if you happen to switch back and forthing between projects that alternate between `.htm` and `.html`, you can use `:index:ext` instead.


## Path separators

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
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
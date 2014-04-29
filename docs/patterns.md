### Permalink structure

> Replacement patterns for dynamically constructing permalinks, as well as the corresponding directory structures.

Given this config:

```js
permalinks(':year/:month/:day/:basename:ext', someContext)
// the generated directory structure and resulting path would look something like:
//=> '2014/01/01/an-inspiring-post.html'
```

### How replacement patterns work

Replacement patterns are used to describe how a string should be parsed. For example, if you were to parse filepaths using the node.js path module, and you passed an object with the parsed values as context, e.g

```js
var filepath = 'foo/bar/baz/interesting-post.md';
var context = {
  ext: path.extname(filepath),
  basename: path.basename(filepath, path.extname(filepath)),
  dirname: path.dirname(filepath)
};
var structure = 'blog/posts/:YYYY/:MM/:basename.html';
var url = permalinks(structure, context);
```

Given the above:

* `:YYYY`: would result in `2014`
* `:MM`: would result in `05`
* `:basename`: would result in `interesting-post`

Thus, the `url` variable would return: `blog/posts/2014/05/interesting-post.html`.
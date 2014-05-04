## dateFormats
Type: `Array`

Default: `["YYYY-MM-DD"]`

Array of custom date formats for [Moment.js](http://momentjs.com/) to use for parsing dates.

```js
var options = {
  dateFormats: ["YYYY-MM-DD", "MM-DD-YYYY", "YYYY-MM-DDTHH:mm:ss.SSS"]
};
```

## lang
Type: `String`

Default: `en`

Set the "global" language for [Moment.js](http://momentjs.com/) to use for converting dates:

```js
options: {
  permalinks: {
    structure: ':year/:month/:day/:basename:ext',
    lang: 'fr'
  }
  files: {
    'blog/': ['templates/blog/*.hbs']
  }
}
...
//=> blog/2013/mars/13/my-post.html
```
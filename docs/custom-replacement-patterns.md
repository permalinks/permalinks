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

### with custom properties

Any string pattern is acceptable, as long as a `:` precedes the variable, but don't forget that there must also be a matching property in the context!
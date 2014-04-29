## structure
Type: `String`

Default: `undefined`

The permalink pattern to use for building paths and generated files.

## preset
Type: `String`

Default: `undefined`

The following presets are currently available:

* `numbered`:  expands to `:num-:basename:ext`
* `pretty`: expands to `:basename/index:html`
* `dayname`: expands to `:YYYY/:MM/:DD/:basename/index:ext`
* `monthname`: expands to `:YYYY/:MM/:basename/index:ext`


### how presets work

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

_If you would like to see another preset, [please submit an issue]({%= bugs.url %}/new)._
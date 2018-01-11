'use strict';

/**
 * Module dependencies
 */

const assert = require('assert');
const deepBind = require('deep-bind');
const merge = require('mixin-deep');
const parse = require('parse-filepath');
const typeOf = require('kind-of');
const use = require('use');

/**
 * Local dependencies
 */

const convert = require('./lib/convert');
const slugify = require('./lib/slugify');
const utils = require('./lib/utils');

/**
 * Create an instance of `Permalinks` with the given `options`
 *
 * ```js
 * const permalinks = new Permalinks();
 * console.log(permalinks.format(':stem/index.html'), {path: 'src/about.hbs'});
 * //=> 'about/index.html'
 * ```
 * @param {Options|String} `options`
 * @api public
 */

class Permalinks {
  constructor(options) {
    this.format = this.format.bind(this);
    this.parse = this.parse.bind(this);
    this.options = Object.assign({}, options);
    this.helpers = this.options.helpers || {};
    this.presets = this.options.presets || {};
    this.data = this.options.data || {};
    this.fns = [];

    use(this, { prop: '_fns' });

    if (!this.helpers.helperMissing) {
      this.helper('helperMissing', helperMissing);
    }
    if (!this.helpers.slugify) {
      this.helper('slugify', slugify);
    }
  }

  /**
   * Uses [parse-filepath][] to parse the `file.path` on the given file
   * object. This method is called by the [format](#format) method, but
   * you can use it directly and pass the results as `locals` (the last
   * argument) to the `.format` method if you need to override or modify
   * any path segments.
   *
   * ```js
   * console.log(permalinks.parse({path: 'foo/bar/baz.md'}));
   * // { root: '',
   * //   dir: 'foo/bar',
   * //   base: 'baz.md',
   * //   ext: '.md',
   * //   name: 'baz',
   * //   extname: '.md',
   * //   basename: 'baz.md',
   * //   dirname: 'foo/bar',
   * //   stem: 'baz',
   * //   path: 'foo/bar/baz.md',
   * //   absolute: [Getter/Setter],
   * //   isAbsolute: [Getter/Setter] }
   * ```
   * @param {Object} `file`
   * @return {Object}
   * @api public
   */

  parse(file) {
    if (typeOf(file) !== 'object') {
      throw new TypeError('expected file to be an object');
    }

    if (!file.path || this.options.file === false) {
      return file;
    }

    const data = parse(file.path);
    for (const key of Object.keys(file)) {
      if (typeof file[key] === 'string') {
        data[key] = file[key];
      }
    }
    return data;
  }

  /**
   * Generate a permalink by replacing `:prop` placeholders in the specified
   * `structure` with data from the given `file` and `locals`.
   *
   * ```js
   * const fp = permalinks.format('blog/:stem/index.html', {path: 'src/about.hbs'});
   * console.log(fp);
   * //=> 'blog/about/index.html'
   * ```
   * @param {String} `structure` Permalink structure or the name of a registered [preset](#preset).
   * @param {Object|String} `file` File object or file path string.
   * @param {Object} `locals` Any additional data to use for resolving placeholders.
   * @return {String}
   * @api public
   */

  format(structure, file, locals) {
    if (typeof structure !== 'string') {
      locals = file;
      file = structure;
      structure = null;
    }

    file = this.normalizeFile(file);
    const context = this.buildContext(file, locals, this.options);
    const pattern = utils.getStructure(file) || this.preset(structure);

    assert.equal(typeOf(pattern), 'string', 'expected pattern to be a string');
    return this.render(pattern, context);
  }

  /**
   * Define a permalink `preset` with the given `name` and `structure`.
   *
   * ```js
   * permalinks.preset('blog', 'blog/:stem/index.html');
   * const url = permalinks.format('blog', {path: 'src/about.hbs'});
   * console.log(url);
   * //=> 'blog/about/index.html'
   * ```
   * @param {String} `name` If only the name is passed,
   * @param {String} `structure`
   * @return {Object} Returns the `Permalinks` instance for chaining
   * @api public
   */

  preset(name, structure) {
    if (arguments.length === 1) {
      return this.presets[name] || name;
    }

    this.presets[name] = structure;
    return this;
  }

  /**
   * Define permalink helper `name` with the given `fn`. Helpers work like any
   * other variable on the context, but they can optionally take any number of
   * arguments and can be nested to build up the resulting string.
   *
   * ```js
   * permalinks.helper('date', function(file, format) {
   *   return moment(file.data.date).format(format);
   * });
   *
   * const structure1 = ':date(file, "YYYY/MM/DD")/:stem/index.html';
   * const file1 = permalinks.format(structure1, {
   *   data: {date: '2017-01-01'},
   *   path: 'src/about.tmpl'
   * });
   *
   * const structure2 = ':name(upper(stem))/index.html';
   * const file2 = permalinks.format(structure2, {
   *   data: {date: '2017-01-01'},
   *   path: 'src/about.tmpl'
   * });
   *
   * console.log(file1);
   * //=> '2017/01/01/about/index.html'
   *
   * console.log(file2);
   * //=> '2017/01/01/about/index.html'
   * ```
   *
   * @param {String} `name` Helper name
   * @param {Function} `fn`
   * @return {Object} Returns the Permalink instance for chaining.
   * @api public
   */

  helper(name, fn) {
    this.helpers[name] = fn;
    return this;
  }

  /**
   * Add a function for calculating the context at render time. Any
   * number of context functions may be used, and they are called in
   * the order in which they are defined.
   *
   * ```js
   * permalinks.context(function(file, context) {
   *   context.site = { title: 'My Blog' };
   * });
   *
   * permalinks.helper('title', function() {
   *   return this.file.data.title || this.context.site.title;
   * });
   * ```
   *
   * @param {Function} `fn` Function that takes the `file` being rendered and the `context` as arguments. The permalinks instance is exposed as `this` inside the function.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  context(fn) {
    this.fns.push(fn);
    return this;
  }

  /**
   * Create the context to use when rendering permalinks. In addition to creating
   * the data object that is used for resolving `:props`, this method also binds
   * a context that is exposed as `this` inside helpers. In particular, the `this`
   * object in helpers exposes the Permalinks instance as `this.app`, the file
   * being rendered as `this.file`, and the [.format](#format) and [.parse](#parse)
   * methods, allowing you to create reusable helper functions that can be published
   * and shared without requiring a local instance of Permalinks to be used in
   * the library.
   *
   * ```js
   * permalinks.context(file, locals, options);
   * ```
   * @param {Object} `file`
   * @param {Object} `locals`
   * @param {Object} `options`
   * @return {Object}
   */

  buildContext(file, locals) {
    const opts = Object.assign({}, this.options);
    const fileData = merge({}, file.data, file.data.permalink);
    const context = merge({}, this.parse(file), this.data, locals, fileData);
    const ctx = merge({}, {app: this}, {options: opts});
    const data = {};

    for (const key of Object.keys(context)) {
      const val = context[key];
      if (typeof val === 'function') {
        helpers[key] = val;
      } else {
        data[key] = val;
      }
    }

    // add special properties to context
    ctx.app.format = this.format;
    ctx.app.parse = this.parse;
    ctx.context = data;
    ctx.file = file;

    for (const name of Object.keys(this.presets)) {
      if (!this.helpers[name]) {
        this.helper(name, () => this.format(this.presets[name], file));
      }
    }

    // bind the context to helpers
    let helpers = deepBind(Object.assign({}, this.helpers), ctx);

    // call user-defined context functions
    for (const fn of this.fns) {
      fn.call(this, ctx.file, ctx.context);
    }

    // call "file" helper
    if (typeof helpers.file === 'function') {
      helpers.file(file, data, locals);
      delete helpers.file;
    }

    data.file = file;

    return {
      options: opts,
      helpers: helpers,
      data: data
    };
  }

  /**
   * Calls [handlebars][] to render the specified template `string` using
   * the given `options`.
   *
   * @param {String} `str`
   * @param {Object} `options`
   * @return {String} Returns the fully resolved permalink string.
   */

  render(structure, config) {
    const handlebars = require('handlebars');
    const hbs = handlebars.create();
    hbs.registerHelper(config.helpers);

    const str = convert(structure, config.options);
    const fn = hbs.compile(str);
    return fn(config.data);
  }

  /**
   * Normalize the given `file` to be a [vinyl][] file object.
   *
   * ```js
   * const file = permalinks.normalizeFile('foo.hbs');
   * console.log(file);
   * //=> '<File "foo.hbs">'
   * ```
   *
   * @param {String|Object} `file` If `file` is a string, it will be converted to the `file.path` on a file object.
   * @param {Object} `file`
   * @param {Object} `options`
   * @return {Object} Returns the normalize [vinyl][] file.
   * @api public
   */

  normalizeFile(file, options) {
    const opts = Object.assign({}, this.options, options);

    if (typeof file === 'string') {
      file = { path: file, created: true };
    }

    if (opts.file === false) {
      return file;
    }
    return utils.normalizeFile(file, opts);
  }
}

/**
 * Default helper for handling missing ":params"
 */

function helperMissing() {
  const args = [].slice.call(arguments);
  const options = args.pop();
  throw new Error(`cannot resolve permalink variable: ":${options.name}"`);
}

/**
 * Expose `Permalinks`
 */

module.exports = function(structure, options) {
  if (typeof structure === 'string') {
    const permalinks = new Permalinks(options);
    return permalinks.format(...arguments);
  }
  return new Permalinks(...arguments);
};

module.exports.Permalinks = Permalinks;

'use strict';

var use = require('use');
var handlebars = require('handlebars');
var convert = require('./lib/convert');
var utils = require('./lib/utils');

/**
 * Create an instance of `Permalinks` with the given `options`
 *
 * ```js
 * var permalinks = new Permalinks();
 * console.log(permalinks.format(':stem/index.html'), {path: 'src/about.hbs'});
 * //=> 'about/index.html'
 * ```
 * @param {Options|String} `options`
 * @api public
 */

function Permalinks(options) {
  if (typeof options === 'string') {
    let proto = Object.create(Permalinks.prototype);
    Permalinks.call(proto);
    return proto.format.apply(proto, arguments);
  }

  if (!(this instanceof Permalinks)) {
    let proto = Object.create(Permalinks.prototype);
    Permalinks.call(proto);
    return proto;
  }

  this.options = utils.assign({}, options);
  this.helpers = this.options.helpers || {};
  this.presets = this.options.presets || {};
  this.data = this.options.data || {};
  this.fns = [];
  use(this);
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

Permalinks.prototype.parse = function(file) {
  if (!utils.isObject(file)) {
    throw new TypeError('expected file to be an object');
  }
  if (!file.path) return file;
  var data = utils.parse(file.path);
  for (var key in file) {
    if (file.hasOwnProperty(key) && typeof file[key] === 'string') {
      data[key] = file[key];
    }
  }
  return data;
};

/**
 * Generate a permalink by replacing `:prop` placeholders in the specified
 * `structure` with data from the given `file` and `locals`.
 *
 * ```js
 * var fp = permalinks.format('blog/:stem/index.html', {path: 'src/about.hbs'});
 * console.log(fp);
 * //=> 'blog/about/index.html'
 * ```
 * @param {String} `structure` Permalink structure or the name of a registered [preset](#preset).
 * @param {Object|String} `file` File object or file path string.
 * @param {Object} `locals` Any additional data to use for resolving placeholders.
 * @return {String}
 * @api public
 */

Permalinks.prototype.format = function(structure, file, locals) {
  if (typeof structure !== 'string') {
    locals = file;
    file = structure;
    structure = null;
  }

  if (typeof file === 'string') {
    file = { path: file };
  }

  file = this.normalizeFile(file, this.options);
  var context = this.context(file, locals, this.options);
  var pattern = utils.get(file, 'data.permalink.structure') || this.preset(structure);
  return this.render(pattern, context);
};

/**
 * Define a permalink `preset` with the given `name` and `structure`.
 *
 * ```js
 * permalinks.preset('blog', 'blog/:stem/index.html');
 * var url = permalinks.format('blog', {path: 'src/about.hbs'});
 * console.log(url);
 * //=> 'blog/about/index.html'
 * ```
 * @param {String} `name` If only the name is passed,
 * @param {String} `structure`
 * @return {Object} Returns the `Permalinks` instance for chaining
 * @api public
 */

Permalinks.prototype.preset = function(name, structure) {
  if (arguments.length === 1) {
    return this.presets[name] || name;
  }
  this.presets[name] = structure;
  if (!this.helpers[name]) {
    this.helper(name, function() {
      return this.app.format(structure, this.file);
    });
  }
  return this;
};

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
 * var structure1 = ':date(file, "YYYY/MM/DD")/:stem/index.html';
 * var file1 = permalinks.format(structure1, {
 *   data: {date: '2017-01-01'},
 *   path: 'src/about.tmpl'
 * });
 *
 * var structure2 = ':name(upper(stem))/index.html';
 * var file2 = permalinks.format(structure2, {
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

Permalinks.prototype.helper = function(name, fn) {
  if (name === 'context') {
    this.fns.push(fn);
  } else {
    this.helpers[name] = fn;
  }
  return this;
};

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

Permalinks.prototype.context = function(file, locals, options) {
  var opts = utils.assign({}, this.options, options);
  var fileData = utils.assign({}, file.data, file.data.permalink);
  var context = utils.assign({}, this.parse(file), this.data, locals, fileData);
  var helpers = utils.assign({}, this.helpers);
  var ctx = utils.assign({}, {app: this}, {options: opts});
  var data = {};

  for (var key in context) {
    if (context.hasOwnProperty(key)) {
      var val = context[key];
      if (typeof val === 'function') {
        helpers[key] = val;
      } else {
        data[key] = val;
      }
    }
  }

  ctx.app.format = this.format.bind(this);
  ctx.app.parse = this.parse.bind(this);
  ctx.context = data;
  ctx.file = file;

  for (var i = 0; i < this.fns.length; i++) {
    this.fns[i].call(this, ctx.context);
  }

  helpers = utils.deepBind(helpers, ctx);
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
};

/**
 * Calls [handlebars][] to render the specified template `string` using
 * the given `options`.
 *
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String} Returns the fully resolved permalink string.
 */

Permalinks.prototype.render = function(structure, options) {
  if (!this.helpers.helperMissing) {
    this.helper('helperMissing', helperMissing);
  }

  var hbs = handlebars.create();
  hbs.registerHelper(options.helpers);

  var str = convert(structure);
  var fn = hbs.compile(str);
  return fn(options.data);
};

/**
 *
 *
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String} Returns the fully resolved permalink string.
 */

Permalinks.prototype.normalizeFile = function(file, options) {
  return utils.normalizeFile(file, options);
};

/**
 * Default helper for managing missing variables
 */

function helperMissing() {
  var args = [].slice.call(arguments);
  var options = args.pop();
  throw new Error(`cannot resolve permalink variable: ":${options.name}"`);
}

/**
 * Expose `Permalinks`
 */

module.exports = Permalinks;

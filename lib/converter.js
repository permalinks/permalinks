'use strict';

var extend = require('extend-shallow');
var snapdragon = require('snapdragon');
var capture = require('snapdragon-capture');
var compilers = require('./compilers');
var parsers = require('./parsers');

function Converter(options) {
  if (typeof options === 'string') {
    let proto = Object.create(Converter.prototype);
    Converter.call(proto);
    return proto.convert.apply(proto, arguments);
  }

  if (!(this instanceof Converter)) {
    let proto = Object.create(Converter.prototype);
    Converter.call(proto);
    return proto;
  }

  this.options = extend({}, options);
}

Converter.prototype.convert = function(str, options) {
  var ast = this.parse(str, options);
  return this.compile(ast, options);
};

Converter.prototype.parse = function(str, options) {
  var parser = new snapdragon.Parser(options);
  parser.use(capture())
  parser.use(parsers(options));
  return parser.parse(str, options);
};

Converter.prototype.compile = function(ast, options) {
  var compiler = new snapdragon.Compiler(options);
  compiler.use(compilers(options));
  var res = compiler.compile(ast, options);
  return res.output;
};

/**
 * Expose `convert`
 */

module.exports = Converter;

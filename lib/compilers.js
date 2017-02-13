'use strict';

var util = require('snapdragon-util');

module.exports = function(options) {
  return function(compiler) {
    compiler
      .set('text', function(node) {
        this.emit(node.val);
      })

      /**
       * Slash "/"
       */

      .set('slash', function(node) {
        this.emit('/');
      })

      /**
       * Parentheses "(...)"
       */

      .set('paren', function(node) {
        util.mapVisit(node, function(tok) {
          // console.log(node)
        })
        this.mapVisit(node);
      })
      .set('paren.open', function(node) {
        this.emit(node.val);
      })
      .set('paren.close', function(node) {
        this.emit(node.val);
      })

      /**
       * Params ":prop"
       */

      .set('param', function(node) {
        this.mapVisit(node);
      })
      .set('param.open', function(node) {
        this.emit('{{');
      })
      .set('param.close', function(node) {
        this.emit('}}');
      })

      /**
       * End of string
       */

      .set('eos', function(node) {
      });
  };
};

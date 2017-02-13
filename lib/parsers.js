'use strict';

var util = require('snapdragon-util');
var not = require('regex-not');
var utils = module.exports;
var cached;

function textRegex() {
  if (cached) return cached;
  var regex = not('^([:\\/])+?', {strictClose: false});
  return (cached = regex);
}

module.exports = function(options) {
  var state = {
    paren: [],
    quote: [],
    param: []
  };

  return function(parser) {
    function prev() {
      return state.param.length
        ? util.last(state.param)
        : util.last(parser.nodes);
    }

    function closeSegments() {
      if (state.quote.length) close('quote');
      if (state.param.length) close('param');
      if (state.paren.length) close('paren');
    }

    function close(type, val) {
      var parent = state[type].pop();

      if (typeof parent === 'undefined') {
        throw new Error(`missing opening: "${type}"`);
      }

      var closer = parser.closer({
        type: type + '.close',
        val: val
      });

      parser.pop(type);
      parent.addNode(closer);
      return parent;
    }

    function open(type, val) {
      var opener = parser.node({
        type: type,
        nodes: []
      });

      var open = parser.node({
        type: type + '.open',
        val: val
      });

      opener.addNode(open);
      parser.push(type, opener);
      return opener;
    }

    parser.on('error', function(err) {
      console.log('PARSER ERROR');
      console.log(err);
      process.exit(1);
    });

    parser.on('token', function(token) {
      console.log(token.type);
    });

    parser
      .set('escaped', function() {
        let match = this.match(/^\\(.)/);
        if (match) {
          return this.node(match[1]);
        }
      })
      .set('slash', function() {
        let match = this.match(/^\//);
        if (match) {
          // closeSegments();
          return this.node({
            type: 'slash',
            val: match[0]
          });
        }
      })

      .set('paren.open', function() {
        let match = this.match(/^\(/);
        if (match) {
          return open('paren', match[0]);
        }
      })
      .set('paren.close', function() {
        let match = this.match(/^\)/);
        if (!match) return;

        var parent = paren.pop();
        if (!parent) {
          throw new Error('missing opening ")"');
        }
        var close = this.node({
          type: 'paren.close',
          val: match[0]
        });
        parent.addNode(close);
      })
      .set('param', function() {
        let match = this.match(/^:/);
        if (!match) return;

        closeSegments();
        return open('param', match[0]);
      })
      .capture('text', /^[^\/:()]+/)
      .set('eos', function() {
        if (this.input) return;
        closeSegments();
      })
  };
};

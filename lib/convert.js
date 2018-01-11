'use strict';

const Lexer = require('snapdragon-lexer');
const chars = { '"': '"', "'": "'" };

module.exports = function(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  const opts = Object.assign({ separator: ',' }, options);
  const lexer = new Lexer(opts);
  const blocks = [];
  let prev = null;

  lexer.on('token', tok => {
    if (lexer.isInside('hbs')) {
      lexer.stack.last.nodes.push(tok);
      if (prev && prev.isClose && tok.type === 'text') {
        const open = blocks[blocks.length - 1];
        if (open.block !== tok.value) {
          throw new Error(`"{{#${open.block}}}" does not match "{{/${tok.value}}}"`);
        }
      }
      if (prev && prev.isOpen && tok.type === 'text') {
        prev.block = tok.value;
      }
    }
    prev = tok;
  });

  /**
   * Handlers
   */

  lexer
    .capture('paren.open', /^\(/, function(token) {
      const node = this.token('paren');
      node.nodes = [token];
      token.parent = node;

      if (this.isInside('hbs')) {
        this.append(' ');
        token.append = false;
        node.append = false;
      }

      this.stack.push(node);
      return token;
    })
    .capture('paren.close', /^\)/, function(token) {
      const node = this.stack.pop();
      if (node.type !== 'paren') {
        throw new Error('missing opening: (');
      }
      if (node.append === false) {
        token.value = '';
      }

      if (this.last(this.stash).trim() === '') {
        this.stash.pop();
      }

      node.nodes.push(token);
      return token;
    })
    .capture('quote', /^['"]/, function(token) {
      if (this.isClose(token.value)) {
        const open = this.stack.pop();
        if (open) {
          open.closed = true;
          this.unwind(open, true);
        }
      } else {
        token.queue = [];
        token.append = false;
        token.isClose = val => val === chars[token.value];
        this.stack.push(token);
      }
      return token;
    })
    .capture('escape', /^\\(.)/, function(token) {
      if (opts.preserveEscaping !== true && token.value !== '\\\\') {
        token.value = token.value.slice(1);
      }
      return token;
    })
    .capture('slash', /^\//, function(token) {
      close();
      return token;
    })
    .capture('space', /^ +/, function(token) {
      close();
      return token;
    })
    .capture('colon', /^:/, function(token) {
      const isInside = this.isInside('hbs');
      const prev = this.prev();
      const type = prev ? prev.type : null;

      if (type === 'hbs') {
        this.stack.pop();
        this.stash.pop();
        this.stash.push(':');
      }

      close();

      if (this.string.slice(0, 2) === '//') {
        token.type = 'text';
        return token;
      }

      if (!isInside && (type && !/^(slash|text|space|dot|dash)$/.test(type))) {
        token.type === 'text';
      } else {

        token.type = 'hbs';
        token.value = '{{';
        const ch = this.string[0];
        if (ch === '/' || ch === '#') {
          token[ch === '/' ? 'isClose' : 'isOpen'] = true;
          token.value += ch;
          this.consume(1);
        }
        token.nodes = [new this.Token('hbs.open', token.value)];
        this.stack.push(token);
      }
      return token;
    })
    .capture('comma', /^,/, function(token) {
      if (!this.stack.length && this.last(this.stash) !== '') {
        this.stash.push('');
      }
      if (!this.isInside('quote')) {
        token.value = '';
      }
      return token;
    })
    .capture('dash', /^-/, function(token) {
      if (this.isInside('hbs')) {
        const prev = this.prev();
        if ((!this.string || this.string[0] === ':') && prev.type !== 'dash') {
          close();
        }
      }
      return token;
    })
    .capture('dot', /^\./, function(token) {
      if (this.consumed[0] !== ' ' && this.isInside('hbs') && !/[({})./]/.test(this.string)) {
        close();
      }
      const prev = this.prev();
      if ((prev && prev.type === 'paren.close') || this.string[0] === ':') {
        close();
      }
      return token;
    })
    .capture('text', /^[^-\\\\"',:/() .]+/, function(token) {
      if (this.isInside('quote')) {
        this.append(token.value);
        token.append = false;
        return token;
      }

      if (this.isInside('hbs') && /[^!^>/#\w$*]/.test(token.value)) {
        this.stack.pop();
        this.stash.pop();
        this.stash.push(':');
      }

      if (token.value.length > 1) {
        switch (token.value[0]) {
          case '*':
            token.value = '* ' + token.value.slice(1);
            break;
          case '>':
            token.value = '> ' + token.value.slice(1);
            break;
          case '^':
            this.append('^');
            close();
            token.value = token.value.slice(1);
            break;
          default: {
            break;
          }
        }
      }

      return token;
    });

  function close() {
    if (lexer.stack.length && lexer.last(lexer.stack).type === 'hbs') {
      const node = lexer.stack.pop();

      lexer.append('}}');
      node.nodes.push(lexer.token('hbs.close', '}}'));

      if (node.nodes[0].value.slice(-1) === '#') {
        blocks.push(node);
      }
    }
  }

  /**
   * Custom lexer methods
   */

  lexer.isClose = function(ch) {
    const open = this.stack.last;
    if (open && open.closed === true) return false;
    if (open && typeof open.isClose === 'function') {
      return open.isClose(ch);
    }
  };

  lexer.append = function(val) {
    if (!val) return;
    const last = this.last(this.stack);
    if (last && last.queue) {
      last.queue.push(val);
    } else {
      this.stash.push(val);
    }
  };

  // add queued strings back to the stash
  lexer.unwind = function(token, append) {
    if (!token) return;
    if (token.type === 'hbs') {
      this.append('}}');
      return;
    }

    if (token.queue && token.type === 'quote') {
      this.append(token.value);
      this.append(token.queue.shift());

      while (token.queue.length) {
        let val = token.queue.shift();
        if (append) {
          this.append(val);
          continue;
        }

        if (val !== this.options.separator) {
          this.stash.push(val);
        }
      }
    }
  };

  // start tokenizing
  lexer.tokenize(str);

  // ensure the stack is empty
  if (lexer.options.strict === true) {
    lexer.fail();
  }

  lexer.unwind(lexer.stack.pop());
  lexer.fail();
  return lexer.stash.join('');
};

/**
  * permalinks <https://github.com/assemble/permalinks>
  *
  * Copyright (c) 2014, Jon Schlinkert, Brian Woodward, contributors.
  * Licensed under the MIT License
  *
  */

var expect = require('chai').expect;
var permalinks = require('../');


// Custom function for task assemble:filename_replacement
var toPostName = function(str) {
  var path = require('path');
  var name = path.basename(str, path.extname(str));
  var re = /\d{4}-\d{2}-\d{2}-(.+)/;
  // $1 = yyyy, $2 = mm, $3 = dd, $4 = basename
  return name.replace(re, '$1');
};

// Custom function for task assemble:filename_replacement
var toDateFolders = function(str) {
  var path = require('path');
  var name = path.basename(str, path.extname(str));
  var re = /(\d{4})-(\d{2})-(\d{2})-(.+)/;
  // $1 = yyyy, $2 = mm, $3 = dd, $4 = basename
  return name.replace(re, function(str, yr, mo, day, basename) {
    return yr + '/' + mo + '/' + day + '/' + basename;
  });
};


describe('custom replacement patterns:', function() {
  describe('paths', function() {
    var opts = {
      replacements: [{
        pattern: ':post',
        replacement: function(src) {
          return toPostName(this.src);
        }
      }]
    };
    it('should replace :basename', function() {
      var obj = {src: 'test/fixtures/posts/2014-12-31-last-year.md'};
      var expected = 'last-year/index.html';
      var actual = permalinks(':post/index.html', obj, opts);
      expect(actual).to.eql(expected);
    });
  });
});

describe('custom replacement patterns:', function() {
  describe('paths', function() {
    var opts = {
      replacements: [{
        pattern: ':post',
        replacement: function(src) {
          return toDateFolders(this.src);
        }
      }]
    };
    it('should replace :basename', function() {
      var obj = {src: 'test/fixtures/posts/2014-12-31-last-year.md', destBase: 'blog'};
      var expected = 'blog/2014/12/31/last-year/index.html';
      var actual = permalinks(':destBase/:post/index.html', obj, opts);
      expect(actual).to.eql(expected);
    });
  });
});


describe('permalinks:', function() {
  describe('paths', function() {
    it('should replace :basename', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var expected = 'foo/index.html';
      var actual = permalinks({preset: 'pretty', context: obj});
      expect(actual).to.eql(expected);
    });
  });

  describe('paths', function() {
    it('should replace :basename', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var expected = 'foo/index.html';
      var actual = permalinks(obj, {preset: 'pretty'});
      expect(actual).to.eql(expected);
    });
  });
});

describe('when a custom replacement pattern is supplied:', function() {
  describe('paths', function() {
    it('should replace :basename', function() {
      var context = {basename: 'foo', ext: '.html'};
      var options = {
        replacements: [
          {
            pattern: /:project/,
            replacement: require('../package.json').name
          }
        ]
      };
      var expected = 'permalinks/foo/index.html';
      var actual = permalinks(':project/:basename/index:ext', context, options);

      expect(actual).to.eql(expected);
    });
  });

  describe('paths', function() {
    it('should replace :basename', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var expected = 'foo/index.html';
      var actual = permalinks(obj, {preset: 'pretty'});
      expect(actual).to.eql(expected);
    });
  });
});

describe('permalinks:', function() {
  describe('paths', function() {
    it('should replace :basename', function() {
      var obj = {basename: 'foo'};
      var expected = 'foo';
      var actual = permalinks(':basename', obj);
      expect(actual).to.eql(expected);
    });

    it('should foo', function() {
      var obj = {basename: 'foo', ext: ''};
      var expected = 'foo';
      var actual = permalinks(':basename:ext', obj);
      expect(actual).to.equal(expected);
    });

    it('should replace :basename', function() {
      var obj = {basename: 'foo', ext: '.html'};
      var expected = 'foo.html';
      var actual = permalinks(':basename:ext', obj);
      expect(actual).to.eql(expected);
    });

    it('should foo', function() {
      var obj = {basename: 'foo', ext: ''};
      var expected = 'foo/index';
      var actual = permalinks(':basename/index:ext', obj);
      expect(actual).to.equal(expected);
    });

    it('should foo', function() {
      var obj = {section: 'foo'};
      var expected = 'foo';
      var actual = permalinks(':section', obj);
      expect(actual).to.equal(expected);
    });

    it('when an arbitrary property is on the context', function() {
      var obj = {section: 'foo', ext: ''};
      var expected = 'foo';
      var actual = permalinks(':section', obj);
      expect(actual).to.equal(expected);
    });

    it('when :0000 is passed', function() {
      var obj = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/favicon-0000.png';
      var actual = permalinks(':section/:basename-:0000:ext', obj);
      expect(actual).to.equal(expected);
    });

    it('when :0000 is passed', function() {
      var obj = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/favicon-0121.png';
      var actual = permalinks(':section/:basename-:0000:ext', obj, {index: 121});
      expect(actual).to.equal(expected);
    });

    it('should foo', function() {
      var obj = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/favicon-0.png';
      var actual = permalinks(':section/:basename-:num:ext', obj);
      expect(actual).to.equal(expected);
    });

    it('should foo', function() {
      var obj = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/favicon-0000.png';
      var actual = permalinks(':section/:basename-:num:ext', obj, {length: 1000});
      expect(actual).to.equal(expected);
    });

    it('when a structure is defined with :random()', function() {
      var obj = {basename: 'favicon', section: 'images', ext: '.png'};
      var expected = 'images/';
      var actual = permalinks(':section/:random(0Aa,9)-:basename:ext', obj);
      expect(actual.length).to.equal(28);
    });

    it('when a structure is passed with a year, month and day pattern', function() {
      var obj = {basename: 'foo', ext: '.md'};
      var expected = '2014/04/29/foo/index.md';
      var actual = permalinks(':YYYY/:MM/:DD/:basename/index:ext', obj);
      expect(actual.split('/')).to.have.length.above(4);
      expect(actual.split('/')[0]).to.equal(String(new Date().getFullYear()));
    });

    it('when the :date structure is used', function() {
      var obj = {basename: 'foo', ext: '.md', date: '2013-02-13'};
      var expected = '2013/02/13/index.md';
      var actual = permalinks(':date/index:ext', obj);
      expect(actual).to.equal(expected);
    });

    it('should parse the path using a date', function() {
      var obj = {basename: 'foo', ext: ''};
      var expected = '2014/04/29';
      var actual = permalinks(':YYYY/:MM/:DD', obj);
      expect(actual.split('/')).to.have.length.above(2);
    });
  });
});
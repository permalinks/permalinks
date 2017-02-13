'use strict';

var moment = require('moment');
var Permalinks = require('./');

/**
 * Examples
 */

var permalinks = new Permalinks();

permalinks.helper('date', function(format) {
  // console.log(this)
  return moment(this.file.data.date).format(format || 'YYYY/MM/DD');
});

permalinks.helper('file', function(file, data) {
  // if (file.data.date) {
  //   var re = /^(\d{4})-(\d{2})-(\d{2})/;
  //   var match = re.exec(file.data.date);
  //   console.log(match)
  // }
});

var File = require('vinyl');
var file = new File({path: 'src/content/first-blog-post.md'});
file.data = {
  permalink: {
    structure: ':site/:stem/index.html',
  },
  site: 'foo',
  root: 'blog',
  date: '2015-01-21',
  slug: 'first-post',
  ext: '.html'
};

// permalinks.preset('post', '{{#each segs}}{{this}}/{{/each}}{{date "YYYY/MM/DD"}}/{{stem}}.html');
// file.data.permalink = permalinks.format('post', file, {
//   segs: file.path.split('').filter(s => s !== '/')
// });

// permalinks.preset('post', '{{root}}/{{date "YYYY/MM/DD"}}/{{stem}}/index.html');
// file.data.permalink = permalinks.format(file);
// console.log(file.data.permalink);

permalinks.preset('post', ':root/:date("YYYY/MM/DD")/:stem/index:ext');
var res = permalinks.format('post', file);
// console.log(res);


// module.exports = function(options) {
//   return function(app) {
//     app.define('permalinks', new Permalinks());
//     app.define('permalink', function(structure, file, locals) {
//       return this.permalinks.format(structure, file, locals);
//     });

//     view.define('permalink', function(structure, locals) {
//       return app.permalinks.format(structure, this, locals);
//     });
//   };
// };

// var structure = ':date(file, "YYYY/MM/DD")/:stem/index.html';
// permalinks.helper('date', function(file, format) {
//   console.log(arguments)
//   return moment(file.data.date).format(format);
// });

var file = { path: 'src/about.tmpl', data: {date: '2017-01-01'}};
// console.log(permalinks.format(structure, file));
//=> '2017/01/01/about/index.html'



permalinks.helper('date', function(file, format) {
 return moment(file.data.date).format(format);
});

permalinks.helper('prefix', function(str) {
  return this.prefix + str
});

permalinks.helper('upper', function(str) {
  // console.log(str.toUpperCase())
  return str.toUpperCase();
});

var structure1 = ':date(file, "YYYY/MM/DD")/:stem/index.html';
var file1 = permalinks.format(structure1, {
  data: {date: '2017-01-01'},
  path: 'src/about.tmpl'
});

var structure2 = ':prefix((upper stem))/index.html';
var file2 = permalinks.format(structure2, {
  data: {date: '2017-01-01'},
  path: 'src/about.tmpl'
});

// console.log(file1);
//=> '2017/01/01/about/index.html'

// console.log(file2);
//=> '2017/01/01/about/index.html'

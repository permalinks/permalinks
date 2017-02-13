
var Converter = require('./lib/converter');
var converter = new Converter();

console.log(converter.convert(':foo/:bar'));
// console.log(converter.convert(':foo/:bar()'));

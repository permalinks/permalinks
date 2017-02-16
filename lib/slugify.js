'use strict';

var diacritics = require('diacritics-map');

module.exports = function(str, options) {
  str = str.split(/[\s|$&#`~=\\\/@+*!?(){}[\]<>=.,;:'"^]/).join('-');
  str = str.split(/[\u0000-\u001f]/).join('');
  str = str.split(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/).join('');
  return replaceDiacritics(str);
};

/**
 * Replace diacritics in the given string with english language
 * equivalents. This is necessary for slugifying headings to
 * be conformant with how github slugifies headings.
 */

function replaceDiacritics(str) {
  return str.replace(/[À-ž]/g, function(match) {
    return diacritics[match] || match;
  });
}

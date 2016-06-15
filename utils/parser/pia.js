/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var peg = require('pegjs');

let parser = peg.buildParser(require('raw!./pia.pegjs'), {trace: true});

module.exports = parser;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// INTERNAL DEPENDECY

var Store = require('./store/Store.js');
var Router = require('./view/View.js').Router;


// CODE

Store.dispatch({type: 'START_APP'});

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var { createStore, applyMiddleware, compose } = require('redux');
var reduxLoop    = require('redux-loop').install();
var reduxLogger  = require('redux-logger')();
var Vue          = require('vue');


// INTERNAL DEPENDENCY

var reducer = require('../reducers/main.js');

// CODE

let Store = null;

if (!window.$Store) {
	let initialState = {
		test: 1,
		stateChanges: {},
		MIDI: {
			isRequesting: false,
			access: null,
			inputs: [],
			selectedInput: null
		}
	};

	let storeEnhancer = compose(reduxLoop, applyMiddleware(reduxLogger));
	Store = createStore(reducer,
	                    initialState,
	                    storeEnhancer);
	
	window.$Store = Store;
} else {
	Store = window.$Store;
}

module.exports = Store;

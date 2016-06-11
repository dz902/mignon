/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var { createStore, applyMiddleware, compose } = require('redux');
var reduxLoop    = require('redux-loop').install();
var reduxLogger  = require('redux-logger')();


// INTERNAL DEPENDENCY

var reducer = require('../reducers/main.js');

// CODE

	let initialState = {
		test: 1,
		stateChanges: {},
		MIDI: {
			isRequesting: false,
			access: null,
			selectedInput: null
		}
	};

	let storeEnhancer = compose(reduxLoop, applyMiddleware(reduxLogger));
	let Store = createStore(reducer,
	                        initialState,
	                        storeEnhancer);

module.exports = Store;

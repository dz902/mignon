/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var { createStore, applyMiddleware, compose } = require('redux');
var reduxLoop    = require('redux-loop').install();
var reduxLogger  = require('redux-logger')();


// INTERNAL DEPENDENCY

var { reducer } = require('../reducers/main.js');

// CODE

let initialState = {
	statePatch: {},
	config: {
		samplingRate: 100, // The Science and Psychology of Music Performance: Creative Strategy for Teaching and Learning pp.295
	},
	MIDI: {
		access: undefined,
		selectedInput: undefined,
	},
	score: {
		data: undefined,
		model: {
			doc: undefined,
			beats: [],
			notes: []
		}
	},
	performance: {
		currentBeat: 0, // for each staff
		noteSeq: [],
		trackedNotes: []
	}
};

let storeEnhancer = compose(reduxLoop, applyMiddleware(reduxLogger));
let Store = createStore(reducer,
	                      initialState,
	                      storeEnhancer);

module.exports = Store;

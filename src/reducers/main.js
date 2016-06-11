/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const merge = require('assign-deep');
const handleActions = require('redux-actions').handleActions;
const { Effects, loop } = require('redux-loop');


// INTERNAL DEPENDENCY

const API = require('../actions/API.js');


// CODE

const reducerMap = {
	START_APP: startApp,
	GRANT_MIDI_ACCESS: grantMIDIAccess,
	LIST_MIDI_INPUTS: updateMIDIInputs,
	UPDATE_MIDI_INPUT: updateMIDIInputs
};

const reducer = handleActions(reducerMap);


// SUB-REDUCERS

function startApp(state, action) {
	return loop(
		state,
		Effects.promise(requestMIDIAccess)
	);
}

function grantMIDIAccess(state, action) {
	let stateChanges = {};

	if (action.error) {
			return state;
	} else {
		let access = action.payload;

		stateChanges = {
			MIDI: {
				isRequesting: false,
				access: access,
				inputs: access.inputs
			}
		};

		return createState(state, stateChanges);
	}
}

function updateMIDIInputs(state, action) {
	let access = state.MIDI.access;
	let stateChanges = {
		MIDI: {
			inputs: access.inputs
		}
	};

	return createState(state, stateChanges);
}

// SIDE-EFFECTS

function requestMIDIAccess() {
	return navigator.requestMIDIAccess()
		              .then( access => API.GRANT_MIDI_ACCESS(access) )
		              .catch( error => API.GRANT_MIDI_ACCESS(error) );
}

// HELPERS

function createState(state, stateChanges) {
	let newState = assign(state, 
	                      stateChanges, 
	                      { stateChanges: null }, // delete previous state changes or will be merged
	                      { stateChanges: stateChanges });

	return newState;
}

// check prototype, only merge regular Object
/* 
  addition, modify, deletion

  inputs = ['A', 'B', 'C'];

  inputs = ['A', 'B', 'C', 'D']; [undefined, undefined, undefined, 'D']

	inputs = ['A', 'B', 'D']; [undefined, undefined, 'D', null]

  inputs = ['A', 'B']; [undefined, undefined, null]
*/
function assign(target /*, ...resources*/) {
	let args = Array.from(arguments);
	let initalValue, keysFunc;

	if (target.constructor === Object) {
		initalValue = {};
		keysFunc = Object.keys;
	} else if (target.constructor === Array) {
		initalValue = [];
		keysFunc = (a) => Array.from(a.keys());
	} else {
		// non-organic data, direct assign
		return args[args.length-1];
	}

	let result = args.reduce(function(reduction, resource) {
		if (resource.constructor !== target.constructor) {
			throw new Error(`Target and resource type do not match.`);
		}

		keysFunc(resource).forEach(function(k) {
			let v = resource[k];
			
			if (v === undefined) {
				// do nothing
			} else if (v === null) {
				// deletion
				delete reduction[k];
			} else if (reduction[k]) {
				// modification
				reduction[k] = assign(reduction[k], v);
			} else {
				// insertion
				reduction[k] = v;
			}
		});
		
		return reduction;
	}, initalValue);

	Object.freeze(result);

	return result;
}

module.exports = reducer;

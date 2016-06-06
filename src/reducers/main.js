/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const handleActions = require('redux-actions').handleActions;
const { Effects, loop } = require('redux-loop');


// INTERNAL DEPENDENCY

const API = require('../actions/API.js');
const Store = require('../store/Store.js');


// CODE


const reducerMap = {
	START_APP: startApp,
	GRANT_MIDI_ACCESS: grantMIDIAccess,
	LIST_MIDI_INPUTS: listMIDIInputs
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
		return loop(
			state,
			Effects.none()
		);
	} else {
		let access = action.payload;

		stateChanges = {
			MIDI: {
				isRequesting: false,
				access: access
			}
		};

		return loop(
			createState(state, stateChanges),
			Effects.call(watchMIDIState, access)
		);
	}
	
	return state;
}

function listMIDIInputs(state, action) {
	let access = action.payload;
	let stateChanges = {
		MIDI: {
			inputs: access.inputs
		}
	};

	return loop(
		createState(state, stateChanges),
		Effects.none()
	);
}

// SIDE-EFFECTS

function requestMIDIAccess() {
	return navigator.requestMIDIAccess()
		              .then( access => API.GRANT_MIDI_ACCESS(access) )
		              .catch( error => API.GRANT_MIDI_ACCESS(error) );
}

function watchMIDIState(access) {
	access.onstatechange = function(connEvt) {
		let input = connEvt.port;

		Store.dispatch(API.UPDATE_MIDI_INPUT(input));
	};

	return API.LIST_MIDI_INPUTS(access);
}

// HELPERS

function createState(state, stateChanges) {
	let newState = Object.assign({}, 
	                             state, 
	                             stateChanges, 
	                             { stateChanges: stateChanges }); // track changes for Vue

	return newState;
}


module.exports = reducer;

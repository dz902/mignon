/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const dispatch      = require('redux').dispatch;
const handleActions = require('redux-actions').handleActions;
const { Effects, loop } = require('redux-loop');


// INTERNAL DEPENDENCY

const API = require('../actions/API.js');


// CODE

const initialState = {
	MIDI: {
		isRequesting: false,
		access: null,
		selectedInput: null
	}
};

const reducerMap = {
	START_APP: startApp,
	GRANT_MIDI_ACCESS: grantMIDIAccess
};

const reducer = handleActions(reducerMap, initialState);


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
			Effects.constant(pollMIDIInput, access)
		);
	}
	
	return state;
}

function pollMIDIInput(state, action) {

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

		dispatch(API.POLL_MIDI_INPUT(input));
	};
}

// HELPERS

function createState(state, stateChanges) {
	let newState = Object.assign({}, state, stateChanges);

	return Object.freeze(newState);
}


module.exports = reducer;

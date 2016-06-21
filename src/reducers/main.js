/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const handleActions = require('redux-actions').handleActions;
const { Effects, loop } = require('redux-loop');


// INTERNAL DEPENDENCY

const API = require('../actions/API');
const createState = require('../lib/utils/createState');
const trackMIDINote = require('./trackMIDINote'); 

// CODE

const reducerMap = {
	START_APP: startApp,
	GRANT_MIDI_ACCESS: grantMIDIAccess,
	LIST_MIDI_INPUTS: updateMIDIInputs,
	UPDATE_MIDI_INPUT: updateMIDIInputs,
	TRACK_MIDI_NOTE: trackMIDINote,
	LOAD_SCORE: loadScore
};

const reducer = handleActions(reducerMap);


// SUB-REDUCERS

function startApp(state, action) {
	return loop(
		state,
		Effects.constant(API.LOAD_SCORE(require('raw!../../var/scores/chopin.mei')))
	);
}

function grantMIDIAccess(state, action) {
	let statePatch = {};

	if (action.error) {
			return state;
	} else {
		let access = action.payload;

		statePatch = {
			MIDI: {
				isRequesting: false,
				access: access,
				inputs: access.inputs
			}
		};

		return createState(state, statePatch);
	}
}

function updateMIDIInputs(state, action) {
	let access = state.MIDI.access;
	let statePatch = {
		MIDI: {
			inputs: access.inputs
		}
	};

	return createState(state, statePatch);
}

function trackTimedNote(state, action) {

}

function loadScore(state, action) {
	let scoreDataAndModel = action.payload;
	let statePatch = {
		score: {
			data: scoreDataAndModel.data,
			model: scoreDataAndModel.model
		}
	};

	return createState(state, statePatch);
}

// HELPERS

module.exports = reducer;

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

function trackTimedNote(state, action) {
	let note = action.payload;
	let noteSeq    = state.MIDI.noteSeq,
	    noteBuffer = state.MIDI.noteBuffer,
	    samplingRate = state.config.samplingRate;

	if (note.type === 'NOTE_OFF') {
		return state;
	}

	// set note buffer

	let noteBufferChanges = [];
	noteBufferChanges[note.noteNumber] = note;

	// normalize note timing to detect chords

	let normalizedNoteTiming = Math.floor(note.receivedTime / samplingRate) * samplingRate;
	normalizedNoteTiming = Number.parseInt(normalizedNoteTiming);
	
	// detect chords and add to note sequences
	
	let noteSeqChanges  = [];
	noteSeqChanges[normalizedNoteTiming] = [];
	
	let notesAtSameTiming = noteSeq[normalizedNoteTiming];
	
	if (notesAtSameTiming) {
		noteSeqChanges[normalizedNoteTiming][note.noteNumber] = note;
	} else {
		let noteGroup = [];
		noteGroup[note.noteNumber] = note;
		noteSeqChanges[normalizedNoteTiming] = noteGroup;
	}

	let stateChanges = {
		MIDI: {
			noteSeq: noteSeqChanges,
			noteBuffer: noteBufferChanges
		}
	};

	return createState(state, stateChanges);
}

function loadScore(state, action) {
	let scoreDataAndModel = action.payload;
	let stateChanges = {
		score: {
			data: scoreDataAndModel.data,
			model: scoreDataAndModel.model
		}
	};

	return createState(state, stateChanges);
}

// HELPERS

module.exports = {
	reducerMap: reducerMap,
	reducer: reducer
};

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const handleActions = require('redux-actions').handleActions;
const { Effects, loop } = require('redux-loop');


// INTERNAL DEPENDENCY

const API = require('../actions/API.js');


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
		Effects.constant(API.LOAD_SCORE(require('raw!../../var/scores/test.pia')))
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

function trackMIDINote(state, action) {
	var note = action.payload;
	var noteSeq        = state.performance.noteSeq;
	var lastNoteGroup  = last(noteSeq);
	var lastNote       = last(lastNoteGroup);
	var currentBeat    = state.performance.currentBeat;
	var scoreNotesByBeat = state.score.beats;
	var scoreNotesOnBeat = null;
	var noteSeqChanges = [];
	var stateChanges   = {
		performance: {
			noteSeq: noteSeqChanges,
			beats: []
		}
	};

	if (!lastNote) {
		noteSeqChanges = [note];
	} else {
		if (note.receivedTime - lastNote.receivedTime <= state.config.samplingRate) {
			noteSeqChanges[noteSeq.length-1] = getAppendChange(lastNoteGroup, note);
		} else {
			noteSeqChanges[noteSeq.length] = [note];
			currentBeat += 1;
			stateChanges.performance.currentBeat = currentBeat;
		}
	}

	scoreNotesOnBeat = scoreNotesByBeat[currentBeat];

	if (scoreNotesOnBeat) {
		let scoreNotePlayed = scoreNotesOnBeat[note.noteNumber];
		let notePerformance = null;
		
		if (scoreNotePlayed) {
			notePerformance = {
				noteId: scoreNotePlayed.noteId,
				pressed: true
			};
		} else {
			notePerformance = {
				extra: true,
				note: note
			};
		}
	
		stateChanges.performance.beats[currentBeat] = getBracketChange(note.noteNumber, notePerformance);
	} else {
		stateChanges = {};
	}

	return createState(state, stateChanges);
}

function loadScore(state, action) {
	let stateChanges = {
		score: {
			measures: action.payload
		}
	};

	return createState(state, stateChanges);
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

	if (target === null || target === undefined) {
		throw new Error(`[assign] Target cannot be null or undefined (now: ${String(target)})`);
	} else if (target.constructor === Object) {
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
		if (resource === null || resource === undefined || 
		    resource.constructor !== target.constructor) {
			throw new Error(`[assign] Target and resource type do not match.`);
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

function last(arr) {
	return Array.isArray(arr) && arr.length > 0 ? 
		     arr[arr.length-1] : undefined;
}

function getAppendChange(arr, val) {
	let change = [];

	if (Array.isArray(arr) && arr.length > 0) {
		change[arr.length] = val;
	} else {
		change.push(val);
	}

	return change;
}

function getBracketChange(idx, val) {
	if (idx < 0) {
		throw new Error('[getReassignmentChange] Index is less than zero.');
	}

	let change = [];
	change[idx] = val;

	return change;
}

module.exports = {
	reducerMap: reducerMap,
	reducer: reducer
};

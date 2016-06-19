/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const last = require('../lib/utils/arrayEnhancers/last');
const first = require('../lib/utils/arrayEnhancers/first');
const getAppendPatch  = require('../lib/utils/patchMakers/getAppendPatch');
const getBracketPatch = require('../lib/utils/patchMakers/getBracketPatch');
const createState = require('../lib/utils/createState');
const Fraction = require('fraction.js');

function trackMIDINote(state, action) {
	let MIDINote = action.payload;
	let perf = state.performance, 
	    beats = state.score.model.beats,
	    samplingRate = state.config.samplingRate;
	let noteSeq = perf.noteSeq,
	    currentBeat = perf.currentBeat;
	let lastNoteGroup = last(noteSeq);
	let baseNote = first(lastNoteGroup);
	let noteSeqPatch = [],
	    currentBeatPatch;

	// check for chord

	let noBaseNoteFound = (baseNote === undefined);
	if (noBaseNoteFound) {
		// just start recording
		noteSeqPatch= [MIDINote];
	} else {
		let intervalBetweenBaseNoteAndCurrentNote = MIDINote.receivedTime - baseNote.receivedTime;
		if (intervalBetweenBaseNoteAndCurrentNote <= samplingRate) {
			// interval between base note and current note smaller than sampling rate = a chord note
			noteSeqPatch[noteSeq.length-1] = getAppendPatch(lastNoteGroup, MIDINote);
		} else {
			// a new note, advance beat counter
			noteSeqPatch[noteSeq.length-1] = [MIDINote];
			currentBeat = currentBeat + 1;
		}
	}

	// compare

	let targetNotes = beats[currentBeat][1]; // 0 = beat value, 1 = notes

	console.log(targetNotes.some(note => note.noteNumber === MIDINote.noteNumber));
	/*
	
	let scoreModel = perf.score.model;



	var noteSeq        = state.performance.noteBuffer;
	var lastNoteGroup  = last(noteSeq);
	var benchmarkNote  = first(lastNoteGroup);
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
			noteSeqChanges[noteSeq.length-1] = getAppendPatch(lastNoteGroup, note);
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
	
		stateChanges.performance.beats[currentBeat] = getBracketPatch(note.noteNumber, notePerformance);
	} else {
		stateChanges = {};
	}*/

	return state;
}

module.exports = trackMIDINote;

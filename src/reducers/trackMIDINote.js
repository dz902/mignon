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
	    currentBeatPatch = currentBeat;

	// check for note-off
	
	if (MIDINote.type === 'note-off') {
		return createState(state);
	}

	// check for chord

	let noBaseNoteFound = (baseNote === undefined);
	if (noBaseNoteFound) {
		// just start recording
		
		noteSeqPatch = [ [MIDINote] ];
	} else {
		let intervalBetweenBaseNoteAndCurrentNote = MIDINote.receivedTime - baseNote.receivedTime;
		if (intervalBetweenBaseNoteAndCurrentNote <= samplingRate) {
			// interval between base note and current note smaller than sampling rate = a chord note
			
			noteSeqPatch[noteSeq.length-1] = getAppendPatch(lastNoteGroup, MIDINote);
		} else {
			// a new note, advance beat counter

			noteSeqPatch[noteSeq.length-1] = [MIDINote];
			currentBeatPatch = currentBeat + 1;
		}
	}

	// compare notes

	let targetNotes = beats[currentBeatPatch][1]; // 0 = beat value, 1 = notes

	console.log(targetNotes.some(note => note.noteNumber === MIDINote.noteNumber));

	let statePatch = {
		performance: {
			noteSeq: noteSeqPatch,
			currentBeat: currentBeatPatch
		}
	};

	return createState(state, statePatch);
}

module.exports = trackMIDINote;

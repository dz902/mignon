/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const { Effects, loop } = require('redux-loop');
const Fraction = require('fraction.js');

const API = require('../actions/API');
const last  = require('../lib/utils/arrayEnhancers/last'),
      first = require('../lib/utils/arrayEnhancers/first');
const getAppendPatch  = require('../lib/utils/patchMakers/getAppendPatch'),
      getBracketPatch = require('../lib/utils/patchMakers/getBracketPatch');
const getPitchNames = require('../lib/utils/MIDIHelpers/getPitchNames'),
      getPitchNameFromNoteNumber = require('../lib/utils/MIDIHelpers/getPitchNameFromNoteNumber');
const createState = require('../lib/utils/createState');

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

	// do nothing for note-off
	
	if (MIDINote.type === 'note-off') {
		return createState(state);
	}

	// check for chord

	let isFirstNote = (baseNote === undefined);
	
	if (isFirstNote) {
		noteSeqPatch = [ [MIDINote] ];
	} else {
		let baseNoteInterval = MIDINote.receivedTime - baseNote.receivedTime;
		let isChordNote = (baseNoteInterval <= samplingRate);

		if (isChordNote) {
			noteSeqPatch[noteSeq.length-1] = getAppendPatch(lastNoteGroup, MIDINote); // TODO: refactor patcher
		} else {
			noteSeqPatch[noteSeq.length] = [MIDINote];
			currentBeatPatch = currentBeat + 1;
		}
	}

	// compare notes

	let targetNotes = beats[currentBeatPatch][1]; // 0 = beat value, 1 = notes
	let trackedNote = {
		info: null,
		note: null
	};
	
	let correctNote = targetNotes[MIDINote.noteNumber];
	let correctNoteNotFound = (correctNote === undefined);
	
	if (correctNoteNotFound) {
		// create extra note

		let pitchName = getPitchNameFromNoteNumber(MIDINote.noteNumber);
		let octave    = Math.floor(MIDINote.noteNumber / 12);

		let extraNote = first(targetNotes).ref.cloneNode();

		extraNote.setAttribute('pname', pitchName);
		extraNote.setAttribute('oct', octave-1);
		extraNote.setAttribute('xml:id', 'dextra'+performance.now().toString().replace(/\./, ''));
		extraNote.setAttribute('perf_extra', 'true');
		
		// find a slot to insert extra note
		
		let nearestDistance = Infinity, 
		    nearestNote;
		let pitchNames = getPitchNames();

		targetNotes.filter(note => note.type === 'note').forEach((note) => {
			let targetNoteNumber = note.noteNumber;
			let distance = Math.abs(targetNoteNumber - MIDINote.noteNumber);

			if (distance < nearestDistance) {
				nearestNote = note;
				nearestDistance = distance;
			}
		});

		// check for unreasonable distance, allowing only half octave away

		let notTooFar = (nearestDistance <= 6);

		if (notTooFar) {
			let nearestNoteElem = nearestNote.ref;
			let nearestNoteIsChordNote = (nearestNoteElem.parentElement.tagName === 'chord');

			if (nearestNoteIsChordNote) {
				nearestNoteElem.parentElement.appendChild(extraNote);
			} else {
				let noteParent = nearestNoteElem.parentElement; // could be staff layer or beam
				let chordNoteElem = document.createElement('chord');
				
				chordNoteElem.setAttribute('dur', nearestNoteElem.getAttribute('dur'));
				chordNoteElem.setAttribute('stem.dir', nearestNoteElem.getAttribute('stem.dir'));
				chordNoteElem.appendChild(extraNote);

				noteParent.replaceChild(chordNoteElem, nearestNoteElem);
				
				chordNoteElem.appendChild(nearestNoteElem); // append after replace, preventing auto-remove
			}
		}
		
		trackedNote = {
			extra: true,
			note: extraNote
		};
	} else {
		correctNote.ref.setAttribute('perf_pressed', true);

		trackedNote = {
			pressed: true,
			note: correctNote
		};
	}

	let trackedNotesPatch = getAppendPatch(perf.trackedNotes, trackedNote);
	let statePatch = {
		performance: {
			currentBeat: currentBeatPatch,
			noteSeq: noteSeqPatch,
			trackedNotes: trackedNotesPatch
		}
	};

	let xmlSerializer = new XMLSerializer();
	let xmlString = xmlSerializer.serializeToString(state.score.model.doc);
	document.getElementById('test').textContent = xmlString;
	document.getElementById('xml').innerHTML = xmlString;
	
	return loop(createState(state, statePatch),
	            Effects.constant(API.LOAD_SCORE(xmlString)));
}

module.exports = trackMIDINote;

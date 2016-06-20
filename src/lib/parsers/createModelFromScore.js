/* jslint browser: true, node: true, sub: true, multistr: true, esversion: 6 */
'use strict';

const Fraction = require('fraction.js');
const getPitchNames = require('../utils/MIDIHelpers/getPitchNames');

const extractAttr = function extractAttr(mark, attrName) {
	let attr = mark.getAttribute(attrName);
	return attr === null || "" ? null : attr;
};

const extractDuration = function extractDuration(mark) {
	let duration = extractAttr(mark, 'dur');

	return parseInt(duration, 10);
};

const extractOctave = function extractOctave(mark) {
	let octave = extractAttr(mark, 'oct');

	return parseInt(octave, 10) + 1; // MIDI is one octave higher
};

const extractID = function extractID(mark) {
	return extractAttr(mark, 'xml:id');
};

const calculateNoteNumber = function calculateNoteNumber(modelNote, key) {
	const pitchNames = getPitchNames(key);

	if (modelNote.pitchName === null) {
		return -1;
	}
	
	let accidental = modelNote.accidental === undefined ? "" : modelNote.accidental;
	let pitchValue = pitchNames.indexOf(modelNote.pitchName+accidental);
	
	if (pitchValue === -1) {
		pitchValue = pitchNames.indexOf(modelNote.pitchName);

		switch (modelNote.accidental) {
			case 'f':
				pitchValue -= 1;
				break;
			case 's':
				pitchValue += 1;
				break;
			case 'ff':
				pitchValue -= 2;
				break;
			case 'ss':
				pitchValue += 2;
				break;
		}
	}

	return pitchValue + modelNote.octave*12; // MEI octave is 1 octave lower
};

const processRest = function processRest(mark) {
	let modelRest = processNote(mark);

	modelRest.type = 'rest';

	delete modelRest.octave;
	delete modelRest.pitchName;
	delete modelRest.accidental;
	delete modelRest.noteNumber;

	return modelRest;
};

const processNote = function processNote(mark, key) {
	let modelNote = {
		type: 'note',
		id: extractID(mark),
		pitchName: extractAttr(mark, 'pname'),
		accidental: extractAttr(mark, 'accid.ges') || undefined,
		duration: extractDuration(mark),
		octave: extractOctave(mark),
		ref: mark
	};
	
	modelNote.noteNumber = calculateNoteNumber(modelNote);

	return modelNote;
};

const processChord = function processChord(mark, key) {
	let notes = qsa(mark, 'note');

	notes = notes.map((note) => {
		return processNote(note, key);
	});

	return {
		type: 'chord',
		id: extractID(mark),
		duration: extractDuration(mark),
		notes: notes
	};
};

const qsa = function qsa(doc, selector) {
	return Array.from(doc.querySelectorAll(selector));
};

const qs = function qs() {
	let elem = qsa.apply(null, arguments);
	
	return elem[0];
};


// MAIN

const createModelFromScore = function createModelFromScore(scoreData) {
	let parser = new DOMParser();

	let doc = parser.parseFromString(scoreData, 'application/xml');

	let keyElem = qs(doc, 'work key');
	let keyPitch = keyElem.getAttribute('pname'),
	    keyAccidental = keyElem.getAttribute('accid'),
	    keyMode = keyElem.getAttribute('mode');
	let key = {
		keyPitch: keyPitch,
		keyAccidental: keyAccidental,
		keyMode: keyMode
	};

	let beatCounters = [],
	    beats = new Map();
	
	let staves = qsa(doc, 'music score staff');
	let notes = staves.reduce((reduction, staff) => {
		let staffNumber = parseInt(extractAttr(staff, 'n'), 10);
		
		if (!reduction[staffNumber]) {
			reduction[staffNumber] = [];
		}

		let marks = qsa(staff, `layer > rest, 
		                        layer > chord, 
		                        layer > note, 
		                        layer > beam > chord, 
		                        layer > beam > note`);
		
		marks.forEach((mark) => {
			let modelMark = {};

			switch (mark.tagName) {
				case 'rest':
					modelMark = processRest(mark);
					break;
				case 'chord':
					modelMark = processChord(mark, key);
					break;
				case 'note':
					modelMark = processNote(mark, key);
					break;
				default:
					throw new Error(`[createModelFromScore] Unknown element type (element: ${mark}).`);
			}

			let currentBeat = beatCounters[staffNumber] || new Fraction(0);

			if (modelMark.type !== 'rest') {
				let currentBeatStr = currentBeat.toString();
				let notes = modelMark.type === 'chord' ? modelMark.notes : [modelMark]; // treat note as chord for easy looping
				
				let noteGroupOfCurrentBeat = beats.get(currentBeatStr) || [];
				
				notes.forEach((note) => {
					noteGroupOfCurrentBeat[note.noteNumber] = note;
				});

				beats.set(currentBeatStr, noteGroupOfCurrentBeat);
			}

			beatCounters[staffNumber] = currentBeat.add([1, modelMark.duration]); // duration as denominator

			reduction[staffNumber].push(modelMark);
		});

		return reduction;
	}, []);

	beats = Array.from(beats);
	beats.sort((a, b) => {
		return (new Fraction(a[0])).compare(b[0]);
	});

	return {
		doc: doc,
		notes: notes,
		beats: beats
	};
};

module.exports = createModelFromScore;

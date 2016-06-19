/* jslint browser: true, node: true, sub: true, multistr: true, esversion: 6 */
'use strict';

const Fraction = require('fraction.js');

var extractAttr = function extractAttr(mark, attrName) {
	let attr = mark.attributes.getNamedItem(attrName);
	return attr === null ? null : attr.value;
};

var extractDuration = function extractDuration(mark) {
	let duration = extractAttr(mark, 'dur');

	return parseInt(duration, 10);
};

var extractOctave = function extractOctave(mark) {
	let octave = extractAttr(mark, 'oct');

	return parseInt(octave, 10) + 1; // MIDI is one octave higher
};

var extractID = function extractID(mark) {
	return extractAttr(mark, 'xml:id');
};

var calculateNoteNumber = function calculateNoteNumber(modelNote) {
	const STEP_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

	if (modelNote.pitchName === null) {
		return -1;
	}

	let accidentalModifier;

	switch (modelNote.accidental) {
		case 'f':
			accidentalModifier = -1;
			break;
		case 's':
			accidentalModifier = 1;
			break;
		case 'ff':
			accidentalModifier = -2;
			break;
		case 'ss':
			accidentalModifier = 2;
			break;
		default:
			accidentalModifier = 0;
	}

	return STEP_NAMES.indexOf(modelNote.pitchName) + modelNote.octave*12 + accidentalModifier;
};

var processRest = function processRest(mark) {
	let modelRest = processNote(mark);

	modelRest.type = 'rest';

	delete modelRest.octave;
	delete modelRest.pitchName;
	delete modelRest.accidental;
	delete modelRest.noteNumber;

	return modelRest;
};

var processNote = function processNote(mark) {
	let modelNote = {
		type: 'note',
		id: extractID(mark),
		pitchName: extractAttr(mark, 'pname'),
		accidental: extractAttr(mark, 'accid.ges'),
		duration: extractDuration(mark),
		octave: extractOctave(mark),
		ref: mark
	};
	
	modelNote.noteNumber = calculateNoteNumber(modelNote);

	return modelNote;
};

var processChord = function processChord(mark) {
	let notes = qsa(mark, 'note');

	notes = notes.map((note) => {
		return processNote(note);
	});

	return {
		type: 'chord',
		id: extractID(mark),
		duration: extractDuration(mark),
		notes: notes
	};
};

var qsa = function qsa(doc, selector) {
	return Array.from(doc.querySelectorAll(selector));
};


// MAIN

var createModelFromScore = function createModelFromScore(scoreData) {
	let parser = new DOMParser();

	let doc = parser.parseFromString(scoreData, 'application/xml');
	let staves = qsa(doc, 'music score staff');

	let beatCounters = [];
	let beats = new Map();
	
	let notes = staves.reduce((reduction, staff) => {
		let staffNumber = parseInt(extractAttr(staff, 'n'), 10);
		
		if (!reduction[staffNumber]) {
			reduction[staffNumber] = [];
		}

		let marks = qsa(staff, 'layer > rest, layer > chord, layer > note, layer > beam > note');
		
		marks.forEach((mark) => {
			let modelMark = {};

			switch (mark.tagName) {
				case 'rest':
					modelMark = processRest(mark);
					break;
				case 'chord':
					modelMark = processChord(mark);
					break;
				case 'note':
					modelMark = processNote(mark);
					break;
				default:
					throw new Error(`[createModelFromScore] Unknown element type (element: ${mark}).`);
			}

			let currentBeat = beatCounters[staffNumber] || new Fraction(0);

			if (modelMark.type !== 'rest') {
				let currentBeatStr = currentBeat.toString();
				let noteGroupOfCurrentBeat = beats.get(currentBeatStr) || [];
				
				noteGroupOfCurrentBeat[modelMark.noteNumber] = modelMark;
				beats.set(currentBeatStr, noteGroupOfCurrentBeat);
			}

			beatCounters[staffNumber] = currentBeat.add([1, modelMark.duration]);

			reduction[staffNumber].push(modelMark);
		});

		return reduction;
	}, []);

	beats = Array.from(beats);
	beats.sort((a, b) => {
		return (new Fraction(a[0])).compare(b[0]);
	});

	return {
		notes: notes,
		beats: beats
	};
};

module.exports = createModelFromScore;

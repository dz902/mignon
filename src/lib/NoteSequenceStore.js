/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDECY

var Store = require('./Store.js');
var BasicLogic = require('./BasicLogic.js');
var Dispatcher = require('./Dispatcher.js');

// CONSTANT

const MIDI = require('./constants/InputMessageTypes.js').MIDI;
const CHORD_TIMING_GAP = 20; // ms

// PRIVATE

let _storeInstance = null;

// STATE

let _noteSequence = Immutable.List();

// PUBLIC

class NoteSequenceStore extends Store {
	constructor() {
		super();

		Logic.listenToNoteThen(Logic.addNoteToSequenceAndNotify);
		
		_storeInstance = this;
	}

	// GETTER

	get noteSequence() {
		return _noteSequence;
	}

	get noteSequenceWithChords() {
		if (_noteSequence.length < 2) {
			return this.noteSequence;
		}

		let chordTimeBound = 0, noteSequence = _noteSequence;

		let noteSequenceWithChords = noteSequence.reduce(function(reduction, value) {
			// first run

			if (reduction.size === 0) {
				return reduction.push(value);
			}
			
			// only group note-ons

			if (value.get('type') != 'NOTE_ON') {
				return reduction.push(value);
			}

			if (chordTimeBound === 0) {
				chordTimeBound = value.get('receivedTime');
			}

			// timing check

			if (value.get('receivedTime') > chordTimeBound) {
				reduction.push(value);

				chordTimeBound = value.get('receivedTime') + CHORD_TIMING_GAP;
			} else {
				var lastOnNoteIndex = reduction.findLastIndex(v => v.get('type') == 'NOTE_ON' || Immutable.List.isList(v));
				var lastOnNote = reduction.get(lastOnNoteIndex);

				if (Immutable.List.isList(lastOnNote)) {
					return reduction.set(lastOnNoteIndex, lastOnNote.push(value));
				} else {
					return reduction.set(lastOnNoteIndex, Immutable.List([lastOnNote, value]));
				}
			}

			return reduction;
		}, Immutable.List());

		noteSequenceWithChords = noteSequenceWithChords.map(function(note) {
			if (Array.isArray(note)) {
				note.sort((a, b) => a.get('noteNumber') > b.get('noteNumber'));
			}

			return note;
		});

		return Immutable.List(noteSequenceWithChords);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	listenToNoteThen(callback) {
		Dispatcher.listen(function(message, note) {
			switch (message) {
				case MIDI.NOTE_ON:
				case MIDI.NOTE_OFF:
					callback.call(Logic, message, note);
					break;
				default:
					// do nothing
				}
		});

		return this;
	}

	addNoteToSequenceAndNotify(message, note) {
		_noteSequence.push(note.toJS());
		_storeInstance.notify();

		return this;
	}
}

var Logic = new _Logic();

module.exports = NoteSequenceStore;

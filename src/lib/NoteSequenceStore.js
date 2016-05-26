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

const INPUT = require('./constants/InputMessageTypes.js');

// PRIVATE

let _storeInstance = null;
let _noteSequence  = Immutable.List();

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
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	listenToNoteThen(callback) {
		Dispatcher.listen(function(message, note) {
			switch (message) {
				case INPUT.MIDI.NOTE_ON:
				case INPUT.MIDI.NOTE_OFF:
					callback.call(Logic, message, note);
					break;
				default:
					// do nothing
			}
		});

		return this;
	}

	addNoteToSequenceAndNotify(message, note) {
		_noteSequence = _noteSequence.push(note);
		_storeInstance.notify();

		return this;
	}
}

var Logic = new _Logic();

module.exports = NoteSequenceStore;

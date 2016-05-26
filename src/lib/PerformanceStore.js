/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);
var Fraction = require('fraction.js');

// INTERNAL DEPENDECY

var Store = require('./Store.js');
var BasicLogic = require('./BasicLogic.js');

// PRIVATE

let _scoreStore = null,
    _noteSequenceStore = null,
    _noteOnSequenceCache = null;

// PUBLIC

class PerformanceStore extends Store {
	constructor(scoreStore, noteSequenceStore) {
		super();

		_scoreStore = scoreStore;
		noteSequenceStore.observeChangesThen((newStore) => this.trackPerformance(newStore));
	}

	trackPerformance(noteSequenceStore) {
		Logic.log(this, 'Tracking performance')
		     .checkPlayedNotesForOccurence(noteSequenceStore);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	checkPlayedNotesForOccurence(noteSequenceStore) {
		let noteOnOnlySequence = noteSequenceStore.noteSequence
		                                          .filter(note => note.get('type') == 'NOTE_ON');

		if (!_noteOnSequenceCache) {
			_noteOnSequenceCache = noteOnOnlySequence;
		} else if (noteOnOnlySequence.equals(_noteOnSequenceCache)) {
			return;
		}

		let notesByBeatList = _scoreStore.notesByBeat.toList();
		
		noteOnOnlySequence.zipWith(function(playedNote, scoreNote) {
			console.info('played');
			console.log('score');
		}, notesByBeatList);

		_noteOnSequenceCache = noteOnOnlySequence; // update cache
	}
}

var Logic = new _Logic();

module.exports = PerformanceStore;

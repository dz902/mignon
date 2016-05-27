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
    _notesByBeat = null;

// STATE

let _performanceScore = null;

// PUBLIC

class PerformanceStore extends Store {
	constructor(scoreStore, noteSequenceStore) {
		super();

		scoreStore.observeChangesThen((newStore) => _scoreStore);
		noteSequenceStore.observeChangesThen((newStore) => this.trackPerformance(newStore));

		_scoreStore = scoreStore;
		_noteSequenceStore = noteSequenceStore;
	}

	trackPerformance(noteSequenceStore) {
		Logic.log(this, 'Tracking performance')
		     .groupNotesByBeats(_scoreStore.score.toJS())
		     .checkPlayedNotesForOccurence(noteSequenceStore);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	groupNotesByBeats(score) {
		var notesByBeat = {};

		for (let voice of score.voices) {
			let currentBeat = Fraction(0).toString();
			
			for (let note of voice) {
				if (!notesByBeat[currentBeat]) notesByBeat[currentBeat] = [];
			
				switch (note.type) {
					case 'NOTE':
						notesByBeat[currentBeat].push(note);
						break;
					case 'CHORD':
						for (let n of note.notes) notesByBeat[currentBeat].push(n);
						break;
					default:
						throw new Error('Unknown type.');
				}
			
				var exactDuration = Fraction(1, note.duration);

				currentBeat = Fraction(currentBeat).add(exactDuration);
			}
		}

		_notesByBeat = notesByBeat;

		return this;
	}
	
	checkPlayedNotesForOccurence(noteSequenceStore) {
		let isNoteOff = noteSequenceStore.noteSequence.last().get('type') == 'NOTE_OFF';

		if (isNoteOff) {
			return;
		}

		let noteOnOnlySequence = noteSequenceStore.noteSequenceWithChords
		                                          .filterNot(note => note.get('type') == 'NOTE_OFF');

		let notesByBeatList = Immutable.fromJS(_notesByBeat).toList();

		let _performanceScore = noteOnOnlySequence.zipWith(function(playedNote, scoreNote) {
			console.info('played', playedNote);
			console.log('score', scoreNote);
			
			if (!Immutable.List.isList(playedNote)) {
				playedNote = Immutable.List([playedNote].fill(null, 1, scoreNote.size-1));
			}

			if (scoreNote.size > playedNote.size) {
				playedNote = playedNote.concat([scoreNote.size-playedNote.size].fill(null));
			} else if (scoreNote.size < playedNote.size) {
				scoreNote = scoreNote.concat([playedNote.size-scoreNote.size].fill(null));
			}

			return playedNote.zipWith(function(p, s) {
				let performanceNote = {};

				if (s === null) {
					// extra note
					
					performanceNote = {
						type: 'NOTE',
						pitch: p.get('pitch'),
						duration: '?',
						performance: {
							extra: true
						}
					};
				} else if (p === null) {
					// missing note
					
					performanceNote = {
						type: 'NOTE',
						pitch: s.get('pitch'),
						duration: s.get('duration'), // TODO: get duration from note off
						performance: {
							missing: true
						}
					};
				} else if (p.get('noteNumber') != s.get('noteNumber')) { // TODO: compare note number instead of pitch mark
					performanceNote = {
						type: 'NOTE',
						pitch: s.get('pitch'),
						duration: s.get('duration'),
						performance: {
							pitch: p.get('pitch') // TODO: get offset?
						}
					};
				} else {
					performanceNote = {
						type: 'NOTE',
						pitch: s.get('pitch'),
						duration: s.get('duration'),
						performance: {
							// TODO: duration? evenness? timing? speed?
						}
					};
				}

				if (p !== null) {
					performanceNote.performance.timing = p.get('receivedTime');
				}

				console.log('p', p); console.log('s', s);

				return performanceNote;
			}, scoreNote);
		}, notesByBeatList);

		console.log(_performanceScore);
	}
}

var Logic = new _Logic();

module.exports = PerformanceStore;

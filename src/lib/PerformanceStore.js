/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var List = Immutable.List;
var OrderedMap = Immutable.OrderedMap;
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);
var Fraction = require('fraction.js');

// INTERNAL DEPENDECY

var Dispatcher = require('./Dispatcher.js');
var MIDI = require('./constants/InputMessageTypes.js').MIDI;
var Store = require('./Store.js');
var BasicLogic = require('./BasicLogic.js');

// CONSTANT

const CHORD_TIMING_GAP = 50; // ms

// PRIVATE

let _instance = null,
    _scoreStore = null,
    _notesByBeat = Immutable.OrderedMap(),
    _notesByOrder = Immutable.List(),
    _noteSequence = Immutable.List();

// STATE

let _performanceScore = null;

// PUBLIC

class PerformanceStore extends Store {
	constructor(scoreStore) {
		super();

		_instance = this;
		
		Logic.groupNotesByBeats(scoreStore.score);
		Logic.listenToNoteThen(Logic.trackPerformance);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	listenToNoteThen(callback) {
		Dispatcher.listen(function(message, data) {
			switch (message) {
				case MIDI.NOTE_ON:
				case MIDI.NOTE_OFF:
					let note = data;
					this.trackPerformance(note);
					break;
				default:
					// do nothing
				}
		}.bind(this));

		return this;
	}

	trackPerformance(note) {
		this.log(_instance, 'adding note', note);

		_noteSequence = _noteSequence.push(note);

		this.log(_instance, 'note sequence updated', _noteSequence);

		Logic.checkPlayedNotesForOccurence(_noteSequence);
	}

	groupNotesByBeats(score) {
		_notesByBeat = score.get('voices').reduce(function(reduction, voice) {
			let currentBeat = Fraction(0);
			
			let groupedVoice = voice.reduce(function(r, mark) {
				switch (mark.get('type')) {
					case 'NOTE':
					case 'CHORD':
						r = r.updateIn([currentBeat.toString()], List(), m => m.concat(mark.get('notes')));
						
						break;
					case 'SPACER':
						// still need to advance beat counter 
						break;
					default:
						return r;
				}
				
				currentBeat = currentBeat.add(Fraction(1, parseInt(mark.get('duration'))));
				
				return r;
			}, Immutable.Map());

			return reduction.mergeWith((a, b) => a.concat(b), groupedVoice);
		}, Immutable.Map());

		_notesByOrder = _notesByBeat.flip().sort((a, b) => Fraction(a).compare(Fraction(b))).flip().toList(); // sort by key

		this.log(_instance, ' score notes grouped by beat ', _notesByBeat);
		this.log(_instance, ' score notes grouped by order ', _notesByOrder);

		return this;
	}
	
	checkPlayedNotesForOccurence(noteSequence) {
		noteSequence = this.groupChordsInNoteSequence(noteSequence);

		let isNoteOff = noteSequence.last().get('type') == 'NOTE_OFF';

		if (isNoteOff) {
			this.log(_instance, 'note off ignored');
			return;
		}

		let noteOnOnlySequence = noteSequence.filterNot(note => note.get('type') == 'NOTE_OFF');

		let _performanceScore = noteOnOnlySequence.zipWith(function(playedNote, scoreNote) {
			// uniforming played notes as Lists

			if (!Immutable.List.isList(playedNote)) {
				playedNote = Immutable.List([playedNote]);
			}

			console.info('played', playedNote);
			console.log('score', scoreNote);

			// rearrange notes so they are aligned to score notes of same pitch

			let rearrangedPlayedNote = Immutable.List();
			
			scoreNote.forEach(function(note, i) {
				var correspondingNoteIndex = playedNote.findIndex(n => n.get('noteNumber') == note.get('noteNumber'));
				
				if (correspondingNoteIndex < 0) {
					return;
				}

				rearrangedPlayedNote = rearrangedPlayedNote.set(i, playedNote.get(correspondingNoteIndex));
				playedNote = playedNote.splice(correspondingNoteIndex, 1);
			});
			
			rearrangedPlayedNote = rearrangedPlayedNote.concat(playedNote);
			console.log('con', rearrangedPlayedNote);

			// before zipping, stuff both sides with null

			if (scoreNote.size > rearrangedPlayedNote.size) {
				rearrangedPlayedNote = rearrangedPlayedNote.concat(new Array(scoreNote.size-rearrangedPlayedNote.size));
			} else if (scoreNote.size < rearrangedPlayedNote.size) {
				scoreNote = scoreNote.concat(new Array(rearrangedPlayedNote.size-scoreNote.size));
			}
			
			return rearrangedPlayedNote.zipWith(function(p, s) {
				let performanceNote = {};

				if (!s) {
					// extra note
					
					performanceNote = {
						type: 'NOTE',
						pitch: p.get('pitch'),
						duration: '?',
						performance: {
							extra: true
						}
					};
				} else if (!p) {
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

				if (s) {
					performanceNote.noteNumber = s.get('noteNumber');
				}

				if (p) {
					performanceNote.performance.noteNumber = p.get('noteNumber');
					performanceNote.performance.timing = p.get('receivedTime');
				}

				console.log('p', p); console.log('s', s);

				return performanceNote;
			}, scoreNote);
		}, _notesByOrder);

		this.log(_instance, 'performance tracked', _performanceScore);
	}
	
	groupChordsInNoteSequence() {
		if (_noteSequence.length < 2) {
			return _noteSequence;
		}
		
		let chordTimeBound = 0, noteSequence = _noteSequence;

		let noteSequenceWithChords = noteSequence.reduce(function(reduction, value) {
			// only group note-ons

			if (value.get('type') != 'NOTE_ON') {
				return reduction.push(value);
			}

			if (chordTimeBound === 0) {
				chordTimeBound = value.get('receivedTime') + CHORD_TIMING_GAP;
			}

			if (reduction.size === 0) {
				return reduction.push(value);
			}

			// timing check

			if (value.get('receivedTime') > chordTimeBound) {
				chordTimeBound = value.get('receivedTime') + CHORD_TIMING_GAP;

				return reduction.push(value);
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
			if (Immutable.List.isList(note)) {
				note = note.sort((a, b) => a.get('noteNumber') > b.get('noteNumber'));
			}

			return note;
		});

		this.log(_instance, 'chords detected', noteSequenceWithChords);

		return noteSequenceWithChords;
	}
}

var Logic = new _Logic();

module.exports = PerformanceStore;

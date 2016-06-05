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

let _instance     = null,
    _scoreStore   = null,
    _notesByBeat  = Immutable.OrderedMap(),
    _notesByOrder = Immutable.List(),
    _noteSequence = Immutable.List();

// STATE

let _performanceScore = null;

// PUBLIC

class PerformanceStore extends Store {
	constructor(scoreStore) {
		super();

		_instance = this;
		_scoreStore = scoreStore;
		_performanceScore = scoreStore.score;
		
		Logic.groupScoreNotes(scoreStore.score);
		Logic.listenToNoteThen(Logic.trackPerformance);
	}
	
	get performanceScore() {
		return _performanceScore;
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	listenToNoteThen(callback) {
		Dispatcher.listen(function(message, data) {
			switch (message) {
				case MIDI.NOTE_ON:
					let note = data;
					this.trackPerformance(note);
					break;
				case MIDI.NOTE_OFF:
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

		_performanceScore = createSimplePerformanceScore(_scoreStore.score, _noteSequence);

		this.log(_instance, 'performance tracked', _performanceScore);

		_instance.notify();
	}

	groupScoreNotes(score) {
		let voices = score.get('voices').map(function(voice, voiceId) {
			return voice.map(function(mark, markId) {
				if (mark.get('type') === 'CHORD') {
					let notes = mark.get('notes').map((n, id) => n.set('path', ['voices', voiceId, markId, 'notes', id]));
					return mark.set('notes', notes);
				} else {
					return mark.set('path', ['voices', voiceId, markId]);
				}
			});
		});

		score = score.set('voices', voices);

		_notesByBeat = score.get('voices').reduce(function(reduction, voice) {
			let currentBeat = Fraction(0);
			
			return voice.reduce(function(r, mark) {
				switch (mark.get('type')) {
					case 'NOTE':
						r = r.updateIn([currentBeat.toString()], List(), m => m.push(mark));
						break;
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
			}, reduction);
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
					performanceNote.id = s.get('id');
					performanceNote.voiceId = s.get('voiceId');
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
		this.log(_instance, 'p', createSimplePerformanceScore(_notesByOrder, noteOnOnlySequence));
		
		_instance.notify();
	}
	
	groupChordsInNoteSequence() {
		if (_noteSequence.length < 2) {
			return _noteSequence;
		}
		
		let chordTimeBound = _noteSequence.first().get('receivedTime') + CHORD_TIMING_GAP,
		    noteSequence = _noteSequence;

		let noteSequenceWithChords = noteSequence.reduce(function(reduction, value) {
			// only group note-ons

			if (value.get('type') != 'NOTE_ON') {
				return reduction.push(value);
			} else {
				if (reduction.size === 0) {
					return reduction.push(List([value]));
				}
			}

			// timing check

			if (value.get('receivedTime') > chordTimeBound) {
				chordTimeBound = value.get('receivedTime') + CHORD_TIMING_GAP;

				return reduction.push(List([value]));
			} else {
				var lastOnNoteIndex = reduction.findLastIndex(v => List.isList(v));

				if (lastOnNoteIndex >= 0) {
					return reduction.update(lastOnNoteIndex, v => v.push(value));
				} else {
					return reduction.push(List([value]));
				}
			}
			
			return reduction;
		}, List());

		noteSequenceWithChords = noteSequenceWithChords.map(function(note) {
			if (List.isList(note)) {
				console.log(note);
				note = note.sort((a, b) => a.get('noteNumber') > b.get('noteNumber'));
			}

			return note;
		});

		this.log(_instance, 'chords detected', noteSequenceWithChords);

		return noteSequenceWithChords;
	}
}

var Logic = new _Logic();

/* 
createPerformanceScore(score, noteSeq) -> score 

*/
function createSimplePerformanceScore(score, noteSeq) {
	noteSeq = Logic.groupChordsInNoteSequence(noteSeq);
	noteSeq = noteSeq.filterNot(v => !List.isList(v));

	let notesWithPerformance =  _notesByOrder.zipWith(function(scoreNote, playedNote) {
		// make score note and played note corresponds to each other

		let allNotes = List(new Array(127));

		scoreNote = scoreNote.reduce(function(reduction, value) {
			return reduction.update(value.get('noteNumber'), function(v) {
				if (!v) {
					return value;
				} else {
					return List.isList(v) ? v.push(value) : List([v, value]);
				}
			});
		}, allNotes);

		playedNote = playedNote.reduce(function(reduction, value) {
			return reduction.set(value.get('noteNumber'), value);
		}, allNotes);

		console.log('s', scoreNote);
		console.log('p', playedNote);
		// extra note does not have duration and position so we need a fake note

		let fakeNote = scoreNote.skipUntil(v => v).first();
		                        
		// have to use reduce because we need concat

		return scoreNote.reduce(function(r, s, index) {
			let p = playedNote.get(index);

			// both empty means n/a

			if (!s && !p) {
				return r;
			}

			// take score note as base or fake it

			let baseNote = s ? s : fakeNote;

			// store performance data here

			let performanceData = Immutable.Map();

			if (s && p) {
				// both present means right note hit

				performanceData = performanceData.set('noteNumber', p.get('noteNumber'))
				                                 .set('receivedTime', p.get('receivedTime'));
			} else if (s) {
				// only score means this note is missed

				performanceData = performanceData.set('missing', true);
			} else {
				// only played note means this note is extra

				if (List.isList(baseNote)) {
					// base note could be a list because two voices overlap, but we only show one extra note

					baseNote = baseNote.first();
				}

				baseNote = baseNote.set('pitch', p.get('pitch'))
				                   .set('noteNumber', p.get('noteNumber'));
				performanceData = performanceData.set('extra', true);
			}

			// add to performance

			if (List.isList(baseNote)) {
				baseNote = baseNote.map(function(v) {
					return v.set('performance', performanceData);
				});

				return r.concat(baseNote);
			} else {
				baseNote = baseNote.set('performance', performanceData);

				return r.push(baseNote);
			}
		}, List());
	}, noteSeq);

	// now we have our performance notes grouped by beats, flatten it and update original score

	notesWithPerformance = notesWithPerformance.flatten(1)
	                                           .sort((a, b) => a.getIn(['performance', 'extra']) ? 1 : -1)
	                                           .reduce(function(reduction, value) {
		if (value.getIn(['performance', 'extra'])) {
			if (value.get('path').indexOf('notes') != -1) {
				return reduction.updateIn(value.get('path').slice(0, -1), v => v.push(value));
			} else {
				return reduction.updateIn(value.get('path'), function(v) {
					if (v.get('type') == 'CHORD') {
						v = v.set('notes', v.get('notes').push(value));
					} else {
						v = v.set('type', 'CHORD');
						v = v.set('notes', List([v]).push(value));
					}

					return v;
				});
			}
		} else {
			return reduction.setIn(value.get('path'), value);
		}
	}, score);
	
	let markId = 0;

	notesWithPerformance = notesWithPerformance.update('voices', function(voices) {
		return voices.map(function(voice) {
			return voice.map(function(mark) {
				if (mark.get('type') == 'CHORD') {
					let notes = mark.get('notes').map(n => n.set('id', markId++));
					return mark.set('notes', notes);
				} else {
					return mark.set('id', markId++);
				}
			});
		});
	});
	
	return notesWithPerformance;
}


module.exports = PerformanceStore;

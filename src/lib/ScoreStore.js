/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var List = require('immutable').List;
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);
var Fraction = require('fraction.js');

// INTERNAL DEPENDECY

var Store = require('./Store.js');
var Parser = require('./grammar/ScoreParser.js').parser;

// CONSTANT

const STEP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// PRIVATE

let _score = Immutable.Map();
let _notesByBeat = Immutable.Map();

// PUBLIC

class ScoreStore extends Store {
	constructor() {
		super();

		this.parseScore();
	}

	// METHODS

	parseScore() {
		console.log(Parser);
		try {
			console.log(Parser.parse(require('raw!./scores/score.mam')));
		} catch (e) {
			// console.log(e);
		}

		_score = {
			'properties': {

			},
			'voices': [
				[
					{ type: 'CHORD', duration: '4', notes:
						[
							{ type: 'NOTE', pitch: 'E/5', duration: '4' },
							{ type: 'NOTE', pitch: 'G/5', duration: '4' },
						]
					},
					{ type: 'CHORD', duration: '8', notes:
						[
							{ type: 'NOTE', pitch: 'E/5', duration: '4' },
							{ type: 'NOTE', pitch: 'C/6', duration: '4' },
						]
					},
					{ type: 'CHORD', duration: '4', notes:
						[
							{ type: 'NOTE', pitch: 'E/5', duration: '4' },
							{ type: 'NOTE', pitch: 'C/6', duration: '4' },
						]
					},
					{ type: 'CHORD', duration: '8', notes:
						[
							{ type: 'NOTE', pitch: 'E/5', duration: '4' },
							{ type: 'NOTE', pitch: 'G/5', duration: '4' },
						]
					},
					{ type: 'BAR' },
					{ type: 'NOTE', pitch: 'C#/4', duration: '4' }, 
					{ type: 'NOTE', pitch: 'F#/4', duration: '4' }, 
					{ type: 'NOTE', pitch: 'B/4', duration: '4' }, 
					{ type: 'CHORD', duration: '2', notes:
						[
							{ type: 'NOTE', pitch: 'C#/5', duration: '4' },
							{ type: 'NOTE', pitch: 'F#/5', duration: '4' },
							{ type: 'NOTE', pitch: 'G#/5', duration: '4' }
						]
					}
				],
				[
					{ type: 'SPACER', duration: '4' },
					{ type: 'SPACER', duration: '4' },
					{ type: 'SPACER', duration: '4' },
					{ type: 'BAR' },
					{ type: 'NOTE', pitch: 'F#/5', duration: '4' },
					{ type: 'NOTE', pitch: 'F#/6', duration: '8' },
					{ type: 'NOTE', pitch: 'B#/6', duration: '8' }
				]
			]
		};

		let voiceId = 0, noteId = 0;

		for (let voice of _score.voices) {
			for (let note of voice) {
				if (note.type == 'NOTE') {
					note = [note];
				} else if (note.type == 'CHORD') {
					note = note.notes;
				} else {
					continue;
				}

				for (let n of note) {
					let [ , step, accidental, octave ] = n.pitch.match(/^([A-Ga-g])(b|bb|#|##|n)?\/([0-9]|10)$/);

					n.id = noteId;
					n.voiceId = voiceId;
					n.noteNumber = (STEP_NAMES.indexOf(step)) + parseInt(octave)*12;

					++noteId;
				}
			}

			++voiceId;
		}
		
		_score = Immutable.fromJS(_score);

		let voices = _score.get('voices').map(function(voice) {
			return voice.map(function(note) {
				if (note.get('type') == 'NOTE') {
					note = note.set('notes', List([note]));
				}

				return note;
			});
		});

		_score = _score.set('voices', voices);
	}


	// MSGS

	// GETTERS

	get score() {
		return _score;
	}
}

class _Logic {
	changeNoteToChords(note) {
		return note.set('notes', List([note]));
	}
}

var Logic = new _Logic();

module.exports = ScoreStore;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);
var Fraction = require('fraction.js');

// INTERNAL DEPENDECY

var Store = require('./Store.js');

// PRIVATE

let _score = Immutable.Map();
let _notesByBeat = Immutable.Map();

// PUBLIC

class ScoreStore extends Store {
	constructor() {
		super();

		var Mark = Immutable.Record({
			type: 'NOTE',
			properties: Immutable.Map({
				pitch: 'C/4',
				duration: '4'
			})
		}); 

		_score = Immutable.fromJS({
			'voices': [
				[
					{ type: 'NOTE', pitch: 'C#/4', duration: '4' }, 
					{ type: 'CHORD', duration: '2', notes:
						[
							{ type: 'NOTE', pitch: 'C#/5', duration: '4' },
							{ type: 'NOTE', pitch: 'E#/5', duration: '4' }
						]
					}
				]
			]
		});

		this.groupNotesByBeats();
	}

	// METHODS

	groupNotesByBeats() {
		var notesByBeat = {};

		for (let voice of _score.get('voices')) {
			let currentBeat = Fraction(0).toString();
			
			for (let note of voice) {
				if (!notesByBeat[currentBeat]) notesByBeat[currentBeat] = [];
			
				switch (note.get('type')) {
					case 'NOTE':
						notesByBeat[currentBeat].push(note);
						break;
					case 'CHORD':
						for (let n of note.get('notes')) notesByBeat[currentBeat].push(n);
						break;
					default:
						throw new Error('Unknown type.');
				}
			
				var exactDuration = Fraction(1, note.get('duration'));

				currentBeat = Fraction(currentBeat).add(exactDuration);
			}
		}

		_notesByBeat = Immutable.fromJS(notesByBeat);
	}

	// MSGS

	// GETTERS

	get score() {
		return _score;
	}
	
	get notesByBeat() {
		return _notesByBeat;
	}
}

module.exports = ScoreStore;

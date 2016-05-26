/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Immutable = require('immutable');
var MadMIDIScoreParser = require('./MIDIScoreParser.js');

class MadMIDIScore {
	constructor() {
		this._voices = [];
	}

	static parseScore(encodedScore) {
		var parsedScore = MadMIDIScoreParser.parse(encodedScore);

		console.log(parsedScore);

		var score = new MadMIDIScore();

		for (let voice of parsedScore.score) {
			score.addVoice(voice);
		}

		return score;
	}

	addVoice(voice) {
		var wrappedVoice = new MadMIDIScoreVoice(this);

		for (let mark of voice) {
			wrappedVoice.addMark(mark);
		}

		this._voices.push(wrappedVoice);
	}

	get voices() {
		return this._voices;
	}
}

class MadMIDIScoreVoice {
	constructor(score) {
		this._score = score;
		this._marks = Immutable.List();
	}

	get marks() {
		return this._marks;
	}

	setMark(index, mark) {
		var wrappedMark = this._createMark(mark);
		this._marks = this._marks.set(index, wrappedMark);
	}

	appendMark(index, mark) {
		var wrappedMark = this._marks.get(index).mergeWith(mark);
	}

	addMark(mark) {
		var wrappedMark = this._createMark(mark);
		this._marks = this._marks.push(wrappedMark);
	}
	
	_createMark(mark) {
		let wrappedMark = null;

		switch (mark.type) {
			case 'note':
				wrappedMark = new MadMIDIScoreMarkNote(mark);
				break;
			case 'chord':
				wrappedMark = new MadMIDIScoreMarkChord(mark.notes, mark.duration);
				break;
		}

		return wrappedMark;
	}
}

class MadMIDIScoreMark {
	get type() {
		return this.constructor.name.match(/^MadMIDIScoreMark(.+)$/)[1]
		                            .replace(/([a-z])([A-Z])/, '$1-$2')
		                            .toLowerCase();
	}
}

class MadMIDIScoreMarkNote extends MadMIDIScoreMark {
	constructor(note) {
		super();

		this.isHighlighted = false;

		this.step      = note.step;
		this.octave    = note.octave;
		this.duration  = note.duration;
	}

	setPitch() {

	}

	setDuration() {

	}

	highlight() {
		this.isHighlighted = true;
	}
	
	unhighlight() {
		this.isHighlighted = false;
		this.onchange(this);
	}
}

class MadMIDIScoreMarkChord extends MadMIDIScoreMark {
	constructor(notes, duration) {
		super();

		this.notes = [];
		this.duration = duration;
		
		for (let note of notes) {
			note.duration = this.duration;
			this.notes.push(new MadMIDIScoreMarkNote(note));
		}
	}

	mergeWith(mark) {
		this.notes.push(new MadMIDIScoreMarkNote(mark));
	}
}

class MIDIScoreParser {

}

module.exports = MadMIDIScore;

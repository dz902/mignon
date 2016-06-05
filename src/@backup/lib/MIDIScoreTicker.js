/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Immutable = require('immutable');
var Fraction = require('fraction.js');

class MadMIDIScoreTickable {

}

class MadMIDIScoreTicker {
	constructor(score) {
  	this.score = score;
  	this.internalTick = Fraction(0);
  	this.notesByTicks = Immutable.OrderedMap();
	}

	addNoteToTick(note) {
		var noteGroup = this.notesByTicks.get(this.internalTick.toString(), []);
		noteGroup.push(note);

		this.notesByTicks = this.notesByTicks.set(this.internalTick.toString(), noteGroup);

		return this;
	}

	moveTicker(durationFraction) {
		this.internalTick = this.internalTick.add(durationFraction);

		return this;
	}

	resetTicker() {
		this.internalTick = Fraction(0);

		return this;
	}

	groupNotesByTicks() {
		for (let voice of this.score.voices) {
			this.resetTicker();

			for (let note of voice.marks) {
				if (note.type == 'note') {
					this.addNoteToTick(note)
					    .moveTicker(Fraction(1, note.duration));
				} else if (note.type == 'chord') {
					let chord = note;

					for (let note of chord.notes) {
						this.addNoteToTick(note);
					}

					this.moveTicker(Fraction(1, chord.duration));
				}
			}
		}

		// 1. for every voice, check for playable note
		// 2. for every note, calculate its fractional ticking (start) time
		// 3. group notes by ticking time

		// 1. start ticking and refresh at a given rate (with fixed interval)
		// 2. get current ticking time and convert into fractional time
		// 3. compare current fractional time with next note group ticking time
		// 4. play notes if current time is at or ahead of next note group ticking time
		// 5. repeat until current time is before next note group, take note 
	}
}

module.exports = MadMIDIScoreTicker;

/*



		this.score = score;
		this.tickablesByBeat;
		this.voiceTicked = Array(score.length).fill(0);
		this.voiceTicks = Array(score.length).fill(0);

		for (let score of this.score.voices) {
			let currentBeat = 0;
			let noteLeftover = null;
			
			if (!this.tickablesByBeat[currentBeat]) {
				this.tickablesByBeat[currentBeat] = [];
			}

			for (let note of voice) {
				if (note.type == 'note') {
					if (voiceTicked + note.duration > 1) {
						this.tickablesByBeat[currentBeat].push(new MadMIDIScoreTickableBegin(note, note.duration - voiceTicked));

						++currentBeat;
						this.tickablesByBeat[currentBeat].push(new MadMIDIScoreTickableEnd(note))
					} else {
						this.tickablesByBeat[currentBeat].push(new MadMIDIScoreTickable(note));
						voiceTicked += 1 / note.duration;
					}

					if (voiceTicked >= 1) {
						
					}
				}
			}
		}


*/

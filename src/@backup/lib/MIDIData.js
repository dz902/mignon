/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const LOWER_NIBBLE_MASK = 0b00001111;
const DURATION_TIMER = [16].fill([]);
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class MIDIData {
	constructor(rawData, receivedTime) {
		this.rawData = rawData;
		this.timing = Math.round(receivedTime);

		this.statusCode = this.rawData[0] >> 4;
		this.channel = this.rawData[0] & LOWER_NIBBLE_MASK;

		switch (this.statusCode) {
			case 0b1001:
				this.setType('note on')
				    .extractNoteInfo()
				    .extractVelocity()
				    .checkForZeroVelocity()
				    .startDurationTimer();
				break;
			case 0b1000:
				this.setType('note off')
				    .extractNoteInfo()
				    .extractVelocity()
				    .calculateDuration();
				break;
			case 0b1111:
				this.processSystemMessage();
				break;
		}

		return Object.freeze(this);
	}

	processSystemMessage() {
		var type = (this.statusData == 0b1110) ? 'active sensing' : 'other';
		return this.setType(type);
	}

	setType(type) {
		this.type = type;
		return this;
	}

	startDurationTimer() {
		DURATION_TIMER[this.channel][this.noteNumber] = this.timing;
		return this;
	}

	calculateDuration() {
		var timingNoteOn = DURATION_TIMER[this.channel][this.noteNumber];
		this.duration = this.timing - timingNoteOn;
		return this;
	}

	extractNoteInfo() {
		this.noteNumber = this.rawData[1];
		this.note = NOTE_NAMES[this.noteNumber % 12];
		this.octave = Math.floor(this.noteNumber / 12);

		return this;
	}

	extractVelocity() {
		this.velocity = this.rawData[2];

		return this;
	}
	
	checkForZeroVelocity() {
		if (this.velocity === 0) {
			this.setType('note off');
		}

		return this;
	}

	extractPressure() {
		this.pressure = this.rawData[2];
		return this;
	}
}

module.exports = MIDIData;

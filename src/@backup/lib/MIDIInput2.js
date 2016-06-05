/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Dispatcher = require('./Dispatcher.js');

const LOWER_NIBBLE_MASK = 0b00001111;
const STEP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class MadMIDIData {
	constructor(rawData, receivedTime) {
		this.rawData = rawData;
		this.timing  = receivedTime;
	}

	extractChannel() {
		this.channel = this.rawData[0] & LOWER_NIBBLE_MASK;
		return this;
	}
}

class MadMIDIMessageNote extends MadMIDIData {
	constructor() {
		super(...arguments);

		this.extractNoteInfo()
		    .extractVelocity();
	}

	extractNoteInfo() {
		this.stepNumber = this.rawData[1];
		this.step       = STEP_NAMES[this.stepNumber % 12];
		this.octave     = Math.floor(this.stepNumber / 12);

		return this;
	}

	extractVelocity() {
		this.velocity = this.rawData[2];

		return this;
	}

	get type() {
		return this.constructor.name.match(/^MadMIDIMessage([a-z]+)$/i)[1].replace(/([a-z])([A-Z])/g, '$1-$2').toUpperCase();
	}
}

class MadMIDIMessageNoteOff extends MadMIDIMessageNote {
	setDuration(duration) {
		this.duration = duration;
	}
}

class MadMIDIMessageNoteOn extends MadMIDIMessageNote {
	constructor() {
		super(...arguments);

		this.onnoteoff = null;
	}

	finish(noteOff) {
		if (!(noteOff instanceof MadMIDIMessageNoteOff)) {
			throw new Error('[MadMIDIMessageNoteOn] trigger note off with non-note-off data ['+noteOff.constructor.name+']');
		}

		noteOff.setDuration(noteOff.timing - this.timing);
		
		if (this.onnoteoff) {
			this.onnoteoff.call(null, noteOff);
		}
	}

	off(callback) {
		this.onnoteoff = callback;
	}
}

/* ------- MIDIInput ------- */

const WRAPPER_LISTENERS = {
	0b1000: [MadMIDIMessageNoteOff, 'onnoteoff'],
	0b1001: [MadMIDIMessageNoteOn, 'onnoteon']	
};

const CHORD_TIMING_GAP = 20; // ms

class MadMIDIInput {
	constructor(input) {
		this.input = input;
		this.activeNotes = [16].fill([]);
		this.chordTimer = null;
		this.chordMessages = [];

		this.input.onmidimessage = function(messageEvent) {
			var rawData = messageEvent.data,
			    receivedTime = messageEvent.receivedTime;

			var statusCode = rawData[0] >> 4;
			var channel = rawData[0] & LOWER_NIBBLE_MASK;
			var message = null;

			var isZeroVelocityNote = (statusCode == 0b1001 && rawData[2] === 0);

			if (isZeroVelocityNote) {
				statusCode = 0b1000;
			}

			var wrapperListener = WRAPPER_LISTENERS[statusCode];

			if (wrapperListener) {
				var [wrapper, listener] = wrapperListener;

				message = new wrapper(rawData, receivedTime);
			}

			switch (statusCode) {
				case 0b1001:
					this.activeNotes[channel][message.noteNumber] = message;

					// block and buffers note on in case of a chord

					this.chordMessages.push(message);
					
					if (!this.chordTimer) {
						this.chordTimer = setTimeout(function() {
							if (this.chordMessages.length > 1) {
								message = this.chordMessages;
								message.sort((a, b) => a.stepNumber > b.stepNumber);
								message.type = 'note-on';
							} else {
								message = this.chordMessages[0];
							}

							this.invoke('onnoteon', message)
					    		.invoke('onnote', message);

					    this.chordTimer = null;
					    this.chordMessages = [];
						}.bind(this), CHORD_TIMING_GAP);
					}
					
					break;
				case 0b1000:
					if (this.activeNotes[channel][message.noteNumber]) {
						this.activeNotes[channel][message.noteNumber].finish(message);
						this.activeNotes[channel][message.noteNumber] = null;
					}

					this.invoke('onnoteoff', message)
					    .invoke('onnote', message);

					break;
			}
		}.bind(this);
	}

	invoke(callback, ...args) {
		if (this[callback]) {
			this[callback].call(null, ...args);
		}
		
		if (callback == 'onnote') {
			Dispatcher.broadcast('INPUT.NOTE', ...args);
		}

		return this;
	}

	listen(callback) {
		this.onnoteon = callback;
	}

	watch(callback) {
		// note on / note off
		this.onnote = callback;
	}

	feel() {
		// pressure change / aftertouch
	}

	observe() {
		// control (everthing?)
	}
}

module.exports = [MadMIDIInput, MadMIDIMessageNoteOn, MadMIDIMessageNoteOff];

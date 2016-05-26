/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var [MadMIDIInput, MadMIDIMessageNoteOn, MadMIDIMessageNoteOff] = require('./MIDIInput.js');

class MadPerformanceTracker {
	constructor(input) {
		// instant, period, overall
		// track: velocity, legato (timing between notes), note length, speed
		this.velocities = [];
		this.deltas = [];
		this.durations = [];
		this.timeOrigin = -1;
		this.noteOns = [];
		this.noteOffs = [];
		this.notesPerSecond = -1;
		
		this.onupdate = null;
		
		input.watch(this.record.bind(this));
	}

	record(message) {
		if (this.timeOrigin == -1) {
			this.timeOrigin = performance.now();
		}

		if (message instanceof MadMIDIMessageNoteOn) {
			if (this.noteOffs.length > 0) {
				var previousNoteOff = this.noteOffs.splice(-1)[0];
				
				this.recordDelta(previousNoteOff.timing - message.timing);
			}

			this.recordNoteOn(message)
			    .recordVelocity(message.velocity);

			// problem
			message.off(function(messageNoteOff) {
				this.recordNoteOff(messageNoteOff)
				    .recordDuration(messageNoteOff.duration);
			}.bind(this));
		}

		if (this.onupdate) {
			this.onupdate.call(null, this);
		}
	}

	recordVelocity(velocity) {
		this.velocities.push(velocity);
		return this;
	}

	recordDelta(delta) {
		this.deltas.push(delta);
		return this;
	}

	recordDuration(duration) {
		this.durations.push(duration);
		return this;
	}

	recordNoteOn(message) {
		this.noteOns.push(message);
		return this;
	}

	recordNoteOff(message) {
		this.noteOffs.push(message);
		return this;
	}
	
	observe(callback) {
		this.onupdate = callback;
	}

	getMeanOf(array) {
		var sum = 0;

		for (let value of array) {
			sum += value;
		}

		return sum / array.length;
	}

	getMedianOf(array) {
		array.sort( (a, b) => a > b ? 1 : -1 );

		return array[Math.floor(array.length / 2)];
	}
}

module.exports = MadPerformanceTracker;

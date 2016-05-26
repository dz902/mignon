/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDENCY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');

// CONSTANTS

const INPUT = require('./constants/InputMessageTypes.js');
const LOWER_NIBBLE_MASK = 0b00001111;
const STEP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MESSAGE_TYPE = {
	0b1000: 'NOTE_OFF',
	0b1001: 'NOTE_ON',
};
const CHORD_TIMING_GAP = 20;

// PRIVATE

let _instance = null;
let _access = null;
let _activeInput = null;
let _activeNotes = [16].fill([]);
let _chordBuffer = [];
let _chordTimer = null;

// PUBLIC

class MIDIInput {
	constructor() {
		navigator.requestMIDIAccess()
		         .then((access) => { this.initializeWithAccess(access); },
		               (error)  => { throw new Error(error); });

		_instance = this;
	}

	initializeWithAccess(access) {
		_access = access;

		Logic.pollMIDIInputsThen(function(inputs) {
			Logic.setActiveInput(inputs.values().next().value) // TODO: change awkward
			     .listenToMessageThen(Logic.processMIDIMessage);
		});
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	constructor() {
		super();
	}

	pollMIDIInputsThen(callback) {
		_access.onstatechange = function(connectionEvent) {
			let port = connectionEvent.port;

			if (port.type == 'output') {
				Logic.log(_instance, 'Output device connected/disconnected');
				return;
			} 

			switch (port.connection) {
				case 'pending':
					Logic.log(_instance, 'Input device pending');
					return;
				case 'closed':
					Logic.log(_instance, 'Input device closed');
					return;
				default:
				 // continue
			}

			Logic.detectMIDIInputsThen(callback);
		};
		
		if (_access.inputs.size === 0) {
			Logic.log(_instance, 'Detecting input devices');
		} else {
			_access.inputs.forEach(input => input.open());
		}

		return this;
	}

	detectMIDIInputsThen(callback) {
		let inputs = _access.inputs;

		for (let input of inputs.values()) {
			Logic.log(_instance, `Inputs detected (type=${ input.type }, manufacturer=${ input.manufacturer }, name=${ input.name })`);
		}
		
		callback.call(null, inputs);

		return this;
	}
	
	setActiveInput(input) {
		_activeInput = input;

		return this;
	}
	
	listenToMessageThen(callback) {
		let self = this;
		_activeInput.onmidimessage = function(messageEvent) {
			callback.call(self, messageEvent.data, messageEvent.receivedTime);
		};
		
		return this;
	}
	
	getMessageType(data) {
		var statusCode = data[0] >> 4;

		return MESSAGE_TYPE[statusCode] ? MESSAGE_TYPE[statusCode] : 'UNKNOWN';
	}
	
	processMIDIMessage(data, receivedTime) {
		switch (this.getMessageType(data)) {
			case 'NOTE_ON':
			case 'NOTE_OFF':
				this.processNoteMessage(data, receivedTime);
				break;
			default:
				// no op
		}
	}		

	processNoteMessage(data, receivedTime) {
		let processedMessage = 
		  this.buildMessage(data)
		      .setReceivedTime(receivedTime)
		      .extractStatusCode()
		      .extractChannel()
		      .extractNoteNumber()
		      .extractPitch()
		      .extractVelocity()
		      .checkForZeroVelocity()
	        .confirmType()
	        .finishBuilding();

		if (processedMessage.type == 'NOTE_ON') {
			this.markNoteAsActive(processedMessage)
			    .waitForChordNotesAndBroadcast(processedMessage);
		} else {
			this.setNoteDuration(processedMessage)
			    .markNoteAsInactiveAndBroadcast(processedMessage);
		}
	}

	setNoteDuration(message) {
		var noteOn = _activeNotes[message.channel][message.noteNumber];

		if (!noteOn) {
			return this;
		}

		message.duration = message.receivedTime - noteOn.receivedTime;
		
		return this;
	}

	markNoteAsActive(message) {
		_activeNotes[message.channel][message.noteNumber] = message;
		
		return this;
	}

	waitForChordNotesAndBroadcast(message) {
		// block and buffers note on in case of a chord

		_chordBuffer.push(message);
		
		let notBuffering = !_chordTimer;

		if (notBuffering) {
			_chordTimer = setTimeout(function() {
				if (_chordBuffer.length > 1) {
					message = _chordBuffer;
					message.sort((a, b) => a.noteNumber > b.noteNumber);
				} else {
					message = _chordBuffer[0];
				}

				_chordTimer = null;
				_chordBuffer = [];

				this.makeImmutableAndBroadcast(INPUT.MIDI.NOTE_ON, message);
			}.bind(this), CHORD_TIMING_GAP);
		}

		return this;
	}

	markNoteAsInactiveAndBroadcast(message) {
		_activeNotes[message.channel][message.noteNumber] = null;

		this.makeImmutableAndBroadcast(INPUT.MIDI.NOTE_OFF, message);
		
		return this;
	}

	makeImmutableAndBroadcast(message, note) {
		Dispatcher.broadcast(message, Immutable.fromJS(note));
		
		return this;
	}

	buildMessage(data) {
		let m = {}; // processed message
		let builder = {
			setReceivedTime: function(time) { m.receivedTime = time; return this; },
			extractStatusCode: function () { m.statusCode = data[0] >> 4; return this; },
			extractChannel: function() { m.channel = data[0] & LOWER_NIBBLE_MASK; return this; },
			extractNoteNumber: function() { m.noteNumber = data[1]; return this; },
			extractPitch: function() { m.pitch = `${ STEP_NAMES[m.noteNumber % 12] }/${ Math.floor(m.noteNumber / 12) }`; return this; },
			extractVelocity:function() { m.velocity = data[2]; return this; },
			checkForZeroVelocity: function() { m.statusCode = m.statusCode == 0b1001 && data[2] === 0 ? 0b1000 : m.statusCode; return this; },
			confirmType: function() { m.type = MESSAGE_TYPE[m.statusCode]; return this; },
			finishBuilding: function() { return m; },
		};

		return builder;
	}
}

var Logic = new _Logic();

module.exports = MIDIInput;

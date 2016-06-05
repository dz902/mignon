/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals MIDIInput */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDENCY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');

// CONSTANTS

const MIDI = require('./constants/InputMessageTypes.js').MIDI;
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
let _activeNotes = [16].fill([]);
let _chordBuffer = [];
let _chordTimer = null;

// PUBLIC

class WebMIDIInput {
	constructor() {
		navigator.requestMIDIAccess()
		         .then((access) => { Logic.initializeWithAccess(access); },
		               (error)  => { throw new Error(error); });

		_instance = this;
	}

	activateDevice(device) {
		if (!(device instanceof MIDIInput)) {
			throw new Error();
		}

		device.open()
		      .then(() => { Logic.listenToDevice(device); }, 
		            () => { throw new Error(); });
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	constructor() {
		super();
	}

	initializeWithAccess(access) {
		_access = access;

		_access.onstatechange = function(connectionEvent) {
			let device = connectionEvent.port;

			if (device.type == 'output') {
				return;
			}

			Logic.checkDeviceStatusAndBroadcast(device);
		};

		Dispatcher.broadcast(MIDI.ACCESS_OK, _instance);

		return this;
	}

	listenDevice(device) {
		device.onmidimessage = function(messageEvent) {
			var processedMessage = Logic.processMIDIMessage(messageEvent.data, messageEvent.receivedTime);

			switch (processedMessage.type) {
				case 'NOTE_ON':
					Logic.markNoteAsActiveAndBroadcast(processedMessage);
					break;
				case 'NOTE_OFF':
					Logic.setNoteDuration(processedMessage)
			    	   .markNoteAsInactiveAndBroadcast(processedMessage);
					break;
			}
		};
	}

	checkDeviceStatusAndBroadcast(device) {
		if (device.state == 'disconnected') {
			Logic.log(_instance, 'Input device disconnected'); // TODO: logging should go somewhere else
			Dispatcher.broadcast(MIDI.DEVICE_DISCONNECTED, device);
			return;
		}

		switch (device.connection) {
			case 'closed':
				Logic.log(_instance, 'Input device connected'); // we do not have close operation, so this must mean connection
				Dispatcher.broadcast(MIDI.DEVICE_CONNECTED, device);
				break;
			case 'pending':
				Logic.log(_instance, 'Input device pending');
				Dispatcher.broadcast(MIDI.DEVICE_PENDING, device);
				break;
			default:
				Logic.log(_instance, `Input device activated (type=${ device.type }, manufacturer=${ device.manufacturer }, name=${ device.name })`);
				Dispatcher.broadcast(MIDI.DEVICE_OPEN, device);
		}

		return this;
	}

	markNoteAsActiveAndBroadcast(message) {
		_activeNotes[message.channel][message.noteNumber] = message;
		
		this.makeImmutableAndBroadcast(MIDI.NOTE_ON, message);
console.log('on');
		return this;
	}

	markNoteAsInactiveAndBroadcast(message) {
		_activeNotes[message.channel][message.noteNumber] = null;
console.log('off');
		this.makeImmutableAndBroadcast(MIDI.NOTE_OFF, message);
		
		return this;
	}

	makeImmutableAndBroadcast(message, note) {
		Dispatcher.broadcast(message, Immutable.fromJS(note));
		
		return this;
	}

	// MIDI MESSAGE PROCESSING

	getMessageType(data) {
		var statusCode = data[0] >> 4;

		return MESSAGE_TYPE[statusCode] ? MESSAGE_TYPE[statusCode] : 'UNKNOWN';
	}
	
	processMIDIMessage(data, receivedTime) {
		switch (this.getMessageType(data)) {
			case 'NOTE_ON':
			case 'NOTE_OFF':
				return this.processNoteMessage(data, receivedTime);
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
	  
	  return processedMessage;
	}

	setNoteDuration(message) {
		var noteOn = _activeNotes[message.channel][message.noteNumber];

		if (!noteOn) {
			return this;
		}

		message.duration = message.receivedTime - noteOn.receivedTime;
		
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

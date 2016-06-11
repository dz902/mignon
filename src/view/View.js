/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var createView = require('monkey');
var $ = require('npm-zepto');


// INTERNAL DEPENDECY

var Store = require('../store/Store.js');
var API = require('../actions/API.js');


// CODE

let appElem = null;

const View = createView(require('./components/app.jade')(), initializer, patcher);

function initializer(mountingPoint) {
	appElem = mountingPoint;
}

function patcher(state) {
	if (state.MIDI) updateMIDI(state.MIDI);
}

// SUB-PATCHERS

function updateMIDI(stateMIDI) {
	if (stateMIDI.access) {
		stateMIDI.access.onstatechange = handleMIDIStateChange;
	}

	if (stateMIDI.inputs) {
		if (stateMIDI.inputs.size > 0) {
			appElem.querySelector('b').textContent = 'LISTENING';

			stateMIDI.inputs.forEach(inp => inp.onmidimessage = handleMIDIMessage);
		} else {
			appElem.querySelector('b').textContent = 'NO MIDI FOUND';
		}
	}
}

// EVENT HANDLERS

function handleMIDIStateChange(connEvt) {
	let device = connEvt.port;

	if (device.type !== 'input') {
		Store.dispatch(API.LOG(device));
	} else {
		Store.dispatch(API.UPDATE_MIDI_INPUT(device));
	}
}

function handleMIDIMessage(msgEvt) {
	let note = convertMIDIMessageToNote(msgEvt);

	if (note.type == 'UNKNOWN') {
		return;
	}
	
	Store.dispatch(API.RECEIVE_MIDI_NOTE(note));
}

// HELPERS

function convertMIDIMessageToNote(msgEvt) {
	let msgData = msgEvt.data;
	let typeId        = msgData[0] >> 4,
	    channelNumber = msgData[0] & 0b00001111,
	    noteNumber    = msgData[1],
	    velocity      = msgData[2];
	let noteMsg = {
		rawData: msgData,
		type: 'UNKNOWN'
	};

	if (typeId === 0b1000) {
		noteMsg.type = 'NOTE_OFF';
	} else if (typeId == 0b1001) {
		noteMsg.type = (velocity === 0 ? 'NOTE_OFF' : 'NOTE_ON');
	}

	if (noteMsg.type != 'UNKNOWN') {
		noteMsg.channelNumber = channelNumber;
		noteMsg.noteNumber    = noteNumber;
		noteMsg.velocity      = velocity;
	}

	return noteMsg;
}

module.exports = View;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var createView = require('monkey');
var $ = require('npm-zepto');


// INTERNAL DEPENDECY

var styles = require('./styles/main.sass');
var Store  = require('../store/Store.js');
var API    = require('../actions/API.js');
var createSVGFromScore = require('../lib/renderers/createSVGFromScore.js');


// CODE

var initializer, patcher, updateMIDI, updateScore;
var handleMIDIStateChange, handleMIDIMessage;
var convertMIDIMessageToNote;

// INIT & PATCHER

initializer = function initializer(rootElem) {
	navigator.requestMIDIAccess()
	         .then( access => Store.dispatch(API.GRANT_MIDI_ACCESS(access)) )
	         .catch( error => Store.dispatch(API.GRANT_MIDI_ACCESS(error)) );
};

patcher = function patcher(rootElem, state) {
	if (state.MIDI) updateMIDI(rootElem, state.MIDI);
	if (state.score) updateScore(rootElem, state.score);
};

// SUB-PATCHERS

updateMIDI = function updateMIDI(rootElem, stateMIDI) {
	if (stateMIDI.access) {
		stateMIDI.access.onstatechange = handleMIDIStateChange;
	}

	if (stateMIDI.inputs) {
		if (stateMIDI.inputs.size > 0) {
			rootElem.querySelector('b').textContent = `LISTENING TO (${Array.from(stateMIDI.inputs)[0][1]['name']})`;

			stateMIDI.inputs.forEach(inp => inp.onmidimessage = handleMIDIMessage);
		} else {
			rootElem.querySelector('b').textContent = 'NO MIDI FOUND';
		}
	}
};

updateScore = function updateScore(rootElem, stateScore) {
	let newScoreElem = createSVGFromScore(stateScore.data);
	let scoreElem = rootElem.querySelector('div#score');

	newScoreElem.setAttribute('id', 'score');
	rootElem.replaceChild(newScoreElem, scoreElem);
};

// EVENT HANDLERS

handleMIDIStateChange = function handleMIDIStateChange(connEvt) {
	let device = connEvt.port;

	if (device.type !== 'input') {
		Store.dispatch(API.LOG(device));
	} else {
		Store.dispatch(API.UPDATE_MIDI_INPUT(device));
	}
};

handleMIDIMessage = function handleMIDIMessage(msgEvt) {
	let note = convertMIDIMessageToNote(msgEvt);

	if (note.type == 'UNKNOWN') {
		return;
	}
	
	Store.dispatch(API.TRACK_MIDI_NOTE(note));
};

// HELPERS

convertMIDIMessageToNote = function convertMIDIMessageToNote(msgEvt) {
	let msgData = msgEvt.data;
	let typeId        = msgData[0] >> 4,
	    channelNumber = msgData[0] & 0b00001111,
	    noteNumber    = msgData[1],
	    velocity      = msgData[2];
	let noteMsg = {
		type: 'UNKNOWN',
		receivedTime: msgEvt.receivedTime,
		rawData: msgData
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
};

const View = createView(require('./components/app.jade')(), initializer, patcher);

module.exports = View;

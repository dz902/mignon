/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

const createView = require('monkey');


// INTERNAL DEPENDECY

const styles = require('./styles/main.sass');
const Store  = require('../store/Store');
const API    = require('../actions/API');
const createSVGFromScore = require('../lib/renderers/createSVGFromScore');


// CODE

var initializer, patcher, updateMIDI, updateScore;
var handleMIDIStateChange, handleMIDIMessage;
var convertMIDIMessageToNote;

const updatePerformance = function updatePerformance(rootElem, statePerf) {
	setTimeout(() => {
		let svg = rootElem.querySelector('div#score > svg');
		
		statePerf.trackedNotes.forEach((trackedNote) => {
			let note = svg.querySelector(`#${trackedNote.note.ref.getAttribute('xml:id')}`);
			
			note.setAttribute('perf_extra', trackedNote.extra);
			note.setAttribute('perf_pressed', trackedNote.pressed);
		});
	}, 1000);
};
// INIT & PATCHER

initializer = function initializer(rootElem) {
	navigator.requestMIDIAccess()
	         .then( access => Store.dispatch(API.GRANT_MIDI_ACCESS(access)) )
	         .catch( error => Store.dispatch(API.GRANT_MIDI_ACCESS(error)) );
};

patcher = function patcher(rootElem, state) {
	if (!state) return;
	if (state.MIDI) updateMIDI(rootElem, state.MIDI);
	if (state.score) updateScore(rootElem, state.score);
	if (state.performance) updatePerformance(rootElem, state.performance);
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

	if (note.type === undefined) {
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
		type: undefined,
		receivedTime: msgEvt.receivedTime,
		rawData: msgData
	};

	if (typeId === 0b1000) {
		noteMsg.type = 'note-off';
	} else if (typeId == 0b1001) {
		noteMsg.type = (velocity === 0 ? 'note-off' : 'note-on');
	}

	if (noteMsg.type === 'note-on' || noteMsg.type === 'note-off') {
		noteMsg.channelNumber = channelNumber;
		noteMsg.noteNumber    = noteNumber;
		noteMsg.velocity      = velocity;
	}

	return noteMsg;
};

const View = createView(require('./components/app.jade')(), initializer, patcher);

module.exports = View;

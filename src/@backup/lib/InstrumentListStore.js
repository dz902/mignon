/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDECY

var Store = require('./Store.js');
var BasicLogic = require('./BasicLogic.js');
var Dispatcher = require('./Dispatcher.js');
var WebMIDIInput = require('./WebMIDIInput.js');

// CONSTANTS

const INPUT = require('./constants/InputMessageTypes.js');
const MIDI = INPUT.MIDI;
const UI = INPUT.UI;
const INSTRUMENT_LIST = require('./constants/StoreMessageTypes.js').INSTRUMENT_LIST;

// PRIVATE

let _input = null;

// PUBLIC

class InstrumentListStore extends Store {
	constructor() {
		super();

		Dispatcher.listen(function(messageType, data) {
			switch (messageType) {
				case MIDI.ACCESS_OK:
					break;
				case MIDI.DEVICE_CONNECTED:
					// TODO: not here
					WebMIDIInput.activateDevice(data);
					break;
				case UI.SELECT_DEVICE:
					// TODO: above should be here
					break;
			}
		});
	}
}

module.exports = InstrumentListStore;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

const createAction = require('redux-actions').createAction;


// CODE

const API = {
	START_APP: createAction('START_APP'),
	GRANT_MIDI_ACCESS: createAction('GRANT_MIDI_ACCESS'),
	POLL_MIDI_INPUT: createAction('POLL_MIDI_INPUT'),
	UPDATE_MIDI_INPUT: createAction('UPDATE_MIDI_INPUT'),
	LIST_MIDI_INPUTS: createAction('LIST_MIDI_INPUTS'),
	RECEIVE_MIDI_NOTE: null,
	LOG: null
};

Object.keys(API).forEach(function(k) {
	if (API[k] === null) {
		API[k] = createAction(k);
	}
});

module.exports = API;

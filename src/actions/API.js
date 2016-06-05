/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

const createAction = require('redux-actions').createAction;


// CODE

const API = {
	START_APP: createAction('START_APP'),
	GRANT_MIDI_ACCESS: createAction('GRANT_MIDI_ACCESS'),
	POLL_MIDI_INPUT: createAction('POLL_MIDI_INPUT')
};

module.exports = API;

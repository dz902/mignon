/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

const createAction = require('redux-actions').createAction;
const createModelFromScore = require('../lib/parsers/createModelFromScore.js');


// CODE

const actionLoadScore = createAction('LOAD_SCORE', score => {
	return { data: score, model: createModelFromScore(score) };
});

const API = {
	START_APP: null,
	GRANT_MIDI_ACCESS: null,
	POLL_MIDI_INPUT: null,
	UPDATE_MIDI_INPUT: null,
	LIST_MIDI_INPUTS: null,
	RECEIVE_MIDI_NOTE: null,
	TRACK_MIDI_NOTE: null,
	LOAD_SCORE: actionLoadScore,
	LOG: null
};

Object.keys(API).forEach(function(k) {
	if (API[k] === null) {
		API[k] = createAction(k);
	}
});

module.exports = API;

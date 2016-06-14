/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect */
'use strict';

var { Effects, loop } = require('redux-loop');

var API = require('../../src/actions/API.js');
var { reducer, reducerMap } = require('../../src/reducers/main.js');
/*

	START_APP: createAction('START_APP'),
	GRANT_MIDI_ACCESS: createAction('GRANT_MIDI_ACCESS'),
	POLL_MIDI_INPUT: createAction('POLL_MIDI_INPUT'),
	UPDATE_MIDI_INPUT: createAction('UPDATE_MIDI_INPUT'),
	LIST_MIDI_INPUTS: createAction('LIST_MIDI_INPUTS'),
	RECEIVE_MIDI_NOTE: null,
	LOG: null
*/
describe('START_APP', () => {
	it('should alter no state', () => {
		let result = reducer({whatever: 'whatever'}, API.START_APP());
		let expected = {whatever: 'whatever'};
		
		expect(result).toEqual(expected);
	});
});

describe('GRANT_MIDI_ACCESS', () => {
	describe('on success', () => {
		it('should set MIDI.access and MIDI.inputs on success');
	});

	describe('on error', () => {
		it('should set MIDI.error on error');
	});
});

describe('UPDATE_MIDI_INPUT', () => {
	it('should update MIDI.inputs');
});

describe('RECEIVE_MIDI_NOTE', () => {
	it('should add note to buffer');

	describe('when note timing < last sampling time + sampling rate', () => {
		it('should see note as simutaneous with last note');
	});

	describe('when note timing > last sampling time + sampling rate', () => {
		it('should see note as a new note');
	});
});

/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect, before, beforeEach */
'use strict';

const { Effects, loop } = require('redux-loop');

const API = require('../../src/actions/API.js');
const Store = require('../../src/store/Store.js');

const loadScoreAction = API.LOAD_SCORE(require('raw!../../var/scores/chopin.mei'));

describe('TRACK_MIDI_NOTE', () => {
	beforeEach(() => {
		Store.dispatch(loadScoreAction);
	});

	describe('Press wrong note', () => {
		it('should create an extra note and not advance beat counter', () => {
			let gNote = createMIDINote('note-on', 55, 60, 1000);
			Store.dispatch(API.TRACK_MIDI_NOTE(gNote));

			let perf = Store.getState().performance;
			let trackedNotes = perf.trackedNotes;

			expect(trackedNotes[0].extra).toBe(true);
			expect(trackedNotes[0].note.ref.tagName).toBe('note');
			expect(perf.currentBeat).toBe(0);
		});
	
	});
	
	describe('Press wrong note after sampling interval', () => {
		it('should advance beat counter', () => {
			let state = Store.getState();
			let perf  = state.performance;
			let samplingRate = state.config.samplingRate;
			let gNote = createMIDINote('note-on', 55, 60, 1000+1+samplingRate);
			Store.dispatch(API.TRACK_MIDI_NOTE(gNote));

			state = Store.getState();

			expect(state.performance.currentBeat).toBe(1);
		});
	});

	describe('Press correct note', () => {
		it('should reference correct note', () => {
			let aFlatNote = createMIDINote('note-on', 56, 60, 4000);
			let fFlatNote = createMIDINote('note-on', 65, 60, 4090);
			
			Store.dispatch(API.TRACK_MIDI_NOTE(aFlatNote));
			Store.dispatch(API.TRACK_MIDI_NOTE(fFlatNote));

			let perf = Store.getState().performance;
			let trackedNotes = perf.trackedNotes;

			expect(trackedNotes[2].pressed).toBe(true);
			expect(trackedNotes[2].note.ref.tagName).toBe('note');
			expect(trackedNotes[3].pressed).toBe(true);
			expect(trackedNotes[3].note.ref.tagName).toBe('note');

			expect(perf.currentBeat).toBe(2);
		});
	});
});

function createNote(i, n, o, nn, d) {
	return {
		noteId: i,
		name: n,
		octave: o,
		noteNumber: nn,
		duration: d
	};
}

function createMIDINote(t, nn, vl, time) {
	 return {
	 	 type: t,
		 noteNumber: nn,
		 velocity: vl,
		 receivedTime: time
	 };
}

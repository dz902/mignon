/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect */
'use strict';

var { Effects, loop } = require('redux-loop');

var API = require('../../src/actions/API.js');
var { reducer, reducerMap } = require('../../src/reducers/main.js');

describe('TRACK_MIDI_NOTE', () => {
	describe('when chord hit matches chord of current beat', () => {
		var state;
		var notePressed, notePerformed, notesOfCurrentBeat;
		var expectedBeat;
		var result, expectedResult;

		notePressed = createMIDINote('NOTE_ON', 48, 60, 483470.9201490041);

		notePerformed = [];
		notePerformed[55] = {
			noteId: 2,
			pressed: true
		};
		
		notesOfCurrentBeat = [];
		notesOfCurrentBeat[48] = createNote(0, 'C', 4, 48, 4);
		notesOfCurrentBeat[52] = createNote(1, 'E', 4, 52, 4);
		notesOfCurrentBeat[55] = createNote(2, 'G', 4, 55, 4);

		state = {
			config: {
				samplingRate: 100
			},
			score: {
				measures: [
					{
						measureNumber: 1,
						notes: [
							[createNote(0, 'C', 4, 48, 4), createNote(1, 'E', 4, 52), createNote(2, 'G', 4, 55)]
						]
					}
				],
				beats: [
					notesOfCurrentBeat
				]
			},
			performance: {
				noteSeq: [
					[createMIDINote('NOTE_ON', 55, 60, 483468.0603250017)]
				],
				currentBeat: 0,
				beats: [notePerformed]
			}
		};

		expectedBeat = [];
		expectedBeat[48] = {
			noteId: 0,
			pressed: true
		};
		expectedBeat[55] = {
			noteId: 2,
			pressed: true
		};
		expectedResult = {
			performance: {
				noteSeq: [
					[createMIDINote('NOTE_ON', 55, 60, 483468.0603250017), notePressed]
				],
				currentBeat: 0,
				beats: [
					expectedBeat
				]
			}			
		};

		it('should record note presence', () => {
			result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));

			expect(result.performance).toEqual(expectedResult.performance);
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

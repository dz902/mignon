/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect, before, beforeEach */
'use strict';

var { Effects, loop } = require('redux-loop');

var API = require('../../src/actions/API.js');
var { reducer, reducerMap } = require('../../src/reducers/main.js');

describe('TRACK_MIDI_NOTE', () => {
	var state;
	var notePressed, notePerformed, notesOfCurrentBeat;
	var expectedBeat;
	var result, expectedResult;

	beforeEach(() => {
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
				beats: [
					notesOfCurrentBeat
				]
			},
			performance: {
				currentBeat: 0,
				noteSeq: [
					[createMIDINote('NOTE_ON', 55, 60, 1000)]
				],
				beats: [
					notePerformed
				]
			}
		};

		Object.freeze(state);
	});

	describe('when score[c-d-e], seq[d], perf[d:true] | quickly pressed [c]', () => {
		beforeEach(() => {
			notePressed = createMIDINote('NOTE_ON', 48, 60, 1100);
			result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
		});

		it('should set seq [c,d]', () => {
			expectedResult = {
				noteSeq: [ state.performance.noteSeq[0].concat(notePressed) ]
			};

			expect(result.performance.noteSeq).toEqual(expectedResult.noteSeq);
		});

		it('should set perf [c:true,d:true]', () => {
			expectedBeat = [];
			expectedBeat[48] = {
				noteId: 0,
				pressed: true
			};

			expectedResult = {
				performance: {
					beats: [
						Object.assign([], state.performance.beats[0], expectedBeat)
					]
				}			
			};

			expect(result.performance.beats).toEqual(expectedResult.performance.beats);
		});
		
		it('should not advance beat counter', () => {
			expect(result.performance.currentBeat).toBe(state.performance.currentBeat);
		});
	});

	describe('when score[c-d-e], seq[d], perf[d:true] | slowly pressed [c]', () => {
		beforeEach(() => {
			notePressed = createMIDINote('NOTE_ON', 48, 60, 1105);
			result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
		});

		it('should not change seq', () => {
			expect(result.performance.noteSeq).toEqual(state.performance.noteSeq);
		});

		it('should not change perf', () => {
			expect(result.performance.beats).toEqual(state.performance.beats);
		});
		
		it('should not advance beat counter', () => {
			expect(result.performance.currentBeat).toBe(state.performance.currentBeat);
		});
	});
	
	describe('when score[c-d-e][a-c], seq[d,e], perf[d:true,e:true] | pressed c', () => {
		beforeEach(() => {
			let newBeat = [];
			newBeat[57] = createNote(3, 'A', 4, 57, 4);
			newBeat[60] = createNote(4, 'C', 4, 60, 4);

			state.score.beats.push(newBeat);

			state.performance.noteSeq[0] = [
				createMIDINote('NOTE_ON', 50, 60, 1010),
				createMIDINote('NOTE_ON', 52, 60, 1050)
			];

			notePressed = createMIDINote('NOTE_ON', 57, 60, 2000);

			result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
		});

		it('should set seq[d,e][c]', () => {
			let expectedNoteSeq = [
				state.performance.noteSeq[0],
				[createMIDINote('NOTE_ON', 57, 60, 2000)]
			];

			expect(result.performance.noteSeq).toEqual(expectedNoteSeq);
		});

		it('should set perf[d,e][c:true]', () => {
			let expectedPerfBeats = [
				state.performance.beats[0],
				[]
			];

			expectedPerfBeats[1][57] = {
				pressed: true,
				noteId: 3
			};

			expect(result.performance.beats).toEqual(expectedPerfBeats);
		});
		
		it('should advance beat counter', () => {
			expect(result.performance.currentBeat).toBe(state.performance.currentBeat+1);
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

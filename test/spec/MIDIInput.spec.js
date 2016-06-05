/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect */
'use strict';
/*
var MIDIInput = require('../../src/modules/MIDIInput.js');
var isNoteMessage = MIDIInput.isNoteMessage;
var extractNoteData = MIDIInput.extractNoteData;

describe('MIDIInput functions', function() {
// ----


function unit(modifier) {
	let monadConstructor = function(value) {
		let monad = Object.create({});

		monad.bind = function(func, args) {
			return func(value, ...args);
		};

		if (typeof modifier === 'function') {
			value = modifier(monad, value);
		}

		return monad;
	};

	return monadConstructor;
}

const None = unit()(null);

const Maybe = unit();

const Just = unit();

// pollMIDIInput(e: MIDIConnectionEvent) -> MIDIInput
describe('()', function() {
	it('should return MIDIInput', function() {
		expect(true).toBe(true);
	});
});

// isNoteMessage(msgData: Array) -> Bool
describe('isNoteMessage()', function() {
	it('should return `true` when `msgData[0]` is "0b1000XXXX" (note-off)', function() {
		let v = isNoteMessage([0b10000000, 0b00001111, 0b01110111]);
		expect(v).toBe(true);
	});

	it('should return `true` when `msgData[0]` is "0b1001XXXX" (note-on)', function() {
		let v = isNoteMessage([0b10010000, 0b00001111, 0b01110111]);
		expect(v).toBe(true);
	});

	it('should return `false` when `msgData[0]` is otherwise', function() {
		let v = isNoteMessage([0b10100000, 0b00001111, 0b01110111]);
		expect(v).toBe(false);
	});
});

// extractNoteData(msgData: Array) -> Record/NoteMessage

describe('extractNoteData()', function() {
	it('shoud extract `type` ("NOTE_OFF") when `msgData[0]` is `0b1000XXXX`', function() {
		let v = extractNoteData([0b10000000, 0b00000000, 0b00001111]);
		expect(v.type).toBe('NOTE_OFF');
	});
	
	it('shoud extract `type` ("NOTE_OFF") when `msgData[0]` is `0b1001XXXX` and `msgData[2]` is `0`', function() {
		let v = extractNoteData([0b10010000, 0b00000000, 0b00000000]);
		expect(v.type).toBe('NOTE_OFF');
	});
	
	it('shoud extract `type` ("NOTE_ON") when `msgData[0]` is `0b1001XXXX` and `msgData[2]` is not `0`', function() {
		let v = extractNoteData([0b10010000, 0b00000000, 0b00001111]);
		expect(v.type).toBe('NOTE_ON');
	});
	
	it('shoud extract `channelNumber` (10) when `msgData[0]` is `0b10001010`', function() {
		let v = extractNoteData([0b10001010, 0b10001010, 0b00001111]);
		expect(v.channelNumber).toBe(10);
	});

	it('shoud extract `noteNumber` (60) when `msgData[0]` is `0b1001XXXX` and `msgData[1]` is `0b00111100`', function() {
		let v = extractNoteData([0b10011010, 0b00111100, 0b00001111]);
		expect(v.noteNumber).toBe(60);
	});

	it('shoud extract `velocity` (60) when `msgData[0]` is `0b1001XXXX` and `msgData[2]` is `0b00111100`', function() {
		let v = extractNoteData([0b10011010, 0b00001111, 0b00111100]);
		expect(v.velocity).toBe(60);
	});
});

// trackPerformance(score: Score, noteSeq: List) -> Score

describe('trackPerformance()', function() {
	it('should generate a `Score` with right performance data', function() {});
});

// generateRendererInstructions(score: Score) -> List

describe('generateRenderInstructions()', function() {
	it ('should generate a `List` of renderer instructions', function() {

	});
});


// ----
});*/

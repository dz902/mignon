/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const getPitchNames = require('./getPitchNames');

const getPitchNameFromNoteNumber = function getPitchNameFromNoteNumber(noteNumber, key) {
	if (!Number.isInteger(noteNumber) || noteNumber < 0 || noteNumber > 127) {
		throw new Error(`[getPitchNameFromNoteNumber] Note number is not 0-127 (given: ${noteNumber}).`);
	}

	let pitchNames = getPitchNames(key);
	let noteNumWithinOctave = noteNumber % 12;

	// do not return accidentals

	return pitchNames[noteNumWithinOctave].replace(/#/, '');
};

module.exports = getPitchNameFromNoteNumber;

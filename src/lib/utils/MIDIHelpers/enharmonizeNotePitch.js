/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

function enharmonizeNotePitch(note) {
	let pitchNames = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
	let pitchIndex = pitchNames.indexOf(note.pitchName);

	if (pitchIndex === -1) {
		throw new Error(`[enharmonizeNotePitch] Malformed pitch name (pitchName: ${note.pitchName}).`);
	}

	if (note.accidental === 's') {
		if (pitchIndex === pitchNames.length-1) {
			note.pitchName = pitchNames[0];
			note.octave += 1;
		} else {
			note.pitchName = pitchNames[pitchIndex+1];
		}

		note.accidental = 'f';
	} else if (note.accidental === 'f') {
		if (pitchIndex === pitchNames.length-1) {
			note.pitchName = pitchNames[0];
			note.octave += 1;
		} else {
			note.pitchName = pitchNames[pitchIndex+1];
		}

		note.accidental = 'f';
	}
}

module.exports = enharmonizeNotePitch;

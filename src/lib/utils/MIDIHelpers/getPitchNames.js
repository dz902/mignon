/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const getPitchNames = function getPitchNames(key) {
	let sharpScale = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
	let flatScale  = ['c', 'df', 'd', 'ef', 'e', 'f', 'gf', 'g', 'gf', 'a', 'bf', 'b'];

	let { pitchName, accidental, mode } = key || {};

	if (pitchName === 'f') {
		return flatScale;
	} else if (accidental === 's') {
		return sharpScale;
	} else {
		if (mode === 'major' && pitchName === 'f') {
			return flatScale;
		} else if (mode === 'minor' && ['d', 'g', 'c', 'f'].indexOf(pitchName) !== -1) {
			return flatScale;
		} else {
			return sharpScale;
		}
	}
};

module.exports = getPitchNames;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

const getPitchNames = function getPitchNames(key) {
	let sharpScale = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
	let flatScale  = ['c', 'df', 'd', 'ef', 'e', 'f', 'gf', 'g', 'gf', 'a', 'bf', 'b'];

	let { keyPitch, keyAccidental, keyMode } = key || {};

	if (keyPitch === 'f') {
		return flatScale;
	} else if (keyAccidental === 's') {
		return sharpScale;
	} else {
		if (keyMode === 'major' && keyPitch === 'f') {
			return flatScale;
		} else if (keyMode === 'minor' && ['d', 'g', 'c', 'f'].indexOf(keyPitch) !== -1) {
			return flatScale;
		} else {
			return sharpScale;
		}
	}
};

module.exports = getPitchNames;

/* jslint node: true, esversion: 6 */
'use strict';

function getBracketPatch(idx, val) {
	if (idx < 0) {
		throw new Error('[getBracketPatch] Index is less than zero.');
	}

	let change = [];
	change[idx] = val;

	return change;
}

module.exports = getBracketPatch;

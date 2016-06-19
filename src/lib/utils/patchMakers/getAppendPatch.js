/* jslint node: true, esversion: 6 */
'use strict';

function getAppendPatch(arr, val) {
	let change = [];

	if (Array.isArray(arr) && arr.length > 0) {
		change[arr.length] = val;
	} else {
		change.push(val);
	}

	return change;
}

module.exports = getAppendPatch;

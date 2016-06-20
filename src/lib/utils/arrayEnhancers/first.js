/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

function first(arr) {
	if (Array.isArray(arr) && arr.length > 0) {
		let firstItem = arr[0];
		let isSparseArray = (firstItem === undefined);

		if (isSparseArray) {
			let onlyValues = arr.filter(v => true);

			firstItem = onlyValues[0];
		}
		
		return firstItem;
	} else {
		return undefined;
	}
}

module.exports = first;

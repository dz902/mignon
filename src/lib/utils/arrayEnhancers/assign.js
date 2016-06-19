/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';


// check prototype, only merge regular Object
/* 
  addition, modify, deletion

  inputs = ['A', 'B', 'C'];

  inputs = ['A', 'B', 'C', 'D']; [undefined, undefined, undefined, 'D']

	inputs = ['A', 'B', 'D']; [undefined, undefined, 'D', null]

  inputs = ['A', 'B']; [undefined, undefined, null]
*/
function assign(target /*, ...resources*/) {
	let args = Array.from(arguments);
	let initalValue, keysFunc;

	if (target === null || target === undefined) {
		throw new Error(`[assign] Target cannot be null or undefined (now: ${String(target)})`);
	} else if (target.constructor === Object) {
		initalValue = {};
		keysFunc = Object.keys;
	} else if (target.constructor === Array) {
		initalValue = [];
		keysFunc = (a) => Array.from(a.keys());
	} else {
		// non-organic data, direct assign
		return args[args.length-1];
	}

	let result = args.reduce(function(reduction, resource) {
		if (resource === null || resource === undefined || 
		    resource.constructor !== target.constructor) {
			throw new Error(`[assign] Target and resource type do not match.`);
		}

		keysFunc(resource).forEach(function(k) {
			let v = resource[k];
			
			if (v === undefined) {
				// do nothing
			} else if (v === null) {
				// deletion
				delete reduction[k];
			} else if (reduction[k]) {
				// modification
				reduction[k] = assign(reduction[k], v);
			} else {
				// insertion
				reduction[k] = v;
			}
		});
		
		return reduction;
	}, initalValue);

	Object.freeze(result);

	return result;
}

module.exports = assign;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var assign = require('./arrayEnhancers/assign');

function createState(state, stateChanges) {
	let newState = assign(state, 
	                      stateChanges, 
	                      { stateChanges: null }, // delete previous state changes or will be merged
	                      { stateChanges: stateChanges });

	return newState;
}

module.exports = createState;

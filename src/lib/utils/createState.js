/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var assign = require('./arrayEnhancers/assign');

function createState(state, statePatch) {
	let newState = assign(state, 
	                      statePatch || {}, 
	                      { statePatch: null }, // delete previous state patch
	                      { statePatch: statePatch });

	return newState;
}

module.exports = createState;

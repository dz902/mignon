/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var $ = require('npm-zepto');

// INTERNAL DEPENDENCY

var Store   = require('../store/Store.js');


// CODE

const createView = function() {
	let listeners = {};
	let dispatcher = function() {};
	
	function applyChanges(stateChanges) {
		Object.keys(stateChanges).forEach(function(key) {
			if (listeners[key]) {
				listeners[key].forEach( listener => listener.call(null, stateChanges[key], dispatcher) );
			}
		});
	}

	function connectState(key, callback) {
		if (!listeners[key]) {
			listeners[key] = [];
		}

		listeners[key].push(callback);
	}

	function render(rootElem, initialState) {
		let test = require('./components/app.jade')();

		$(rootElem).html(test);
		
		applyChanges(initialState);
	}
	
	return {
		applyChanges: applyChanges,
		connectState: connectState,
		render: render
	};
};

const View = createView();

View.connectState('MIDI', function(changes, disptacher) {
	console.log(changes);
	
});

module.exports = { View: View };

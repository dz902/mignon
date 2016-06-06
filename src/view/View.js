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

	function setDispatcher(dispatcherFunc) {
		dispatcher = dispatcherFunc;
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
		setDispatcher: setDispatcher,
		connectState: connectState,
		render: render
	};
};

const View = createView();

View.setDispatcher(Store.dispatch);

View.connectState('MIDI', function(changes, disptacher) {
	console.log(changes);
	
	if (changes['access']) {
		$('#app b').html(String(changes['access']));
	}
});

Store.subscribe(function() {
	let stateChanges = Store.getState().stateChanges;

	View.applyChanges(stateChanges);
});

View.render('#app', Store.getState());

module.exports = { View: View };

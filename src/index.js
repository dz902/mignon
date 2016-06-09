/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// INTERNAL DEPENDECY

var Store = require('./store/Store.js');
var View = require('./view/View.js');


// CODE

Store.dispatch({type: 'START_APP'});

Store.subscribe(function() {
	let stateChanges = Store.getState().stateChanges;

	View.applyChanges(stateChanges);
});

View.render(Store);

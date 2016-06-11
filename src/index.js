/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// INTERNAL DEPENDECY

var Store = require('./store/Store.js');
var View = require('./view/View.js');


// CODE

View.render('#app', Store.getState());

Store.subscribe(function() {
	let stateChanges = Store.getState().stateChanges;

	View.patch(stateChanges);
});

Store.dispatch({type: 'START_APP'});

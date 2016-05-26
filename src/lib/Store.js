/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDENCY

var BasicLogic = require('./BasicLogic.js');

// PRIVATE

let _observers = Immutable.List();

// PUBLIC

class Store {
	observeChangesThen(callback) {
		let id = Logic.checkIfCallbackIsFunction(callback)
		              .addCallbackAsObserver(callback);

		Logic.log(this, `Add observer (id=${ id })`);

		return;
	}

	unobserve(id) {
		Logic.log(this, `Remove observer (id=${ id })`)
		     .removeObserverByID(id);
	}

	notify() {
		Logic.log(this, 'Notify updates')
		     .callEachObserverWithArgs(this);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	addCallbackAsObserver(callback) {
		_observers = _observers.push(callback);
		
		return (_observers.size - 1);
	}

	removeObserverByID(id) {
		if (!_observers.get(id)) {
			throw new Error();
		}

		_observers = _observers.remove(id);

		return this;
	}

	callEachObserverWithArgs() {
		for (let callback of _observers) {
			callback.call(null, ...arguments);
		}
	}
}

var Logic = new _Logic();


module.exports = Store;

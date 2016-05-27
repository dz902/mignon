/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDENCY

var BasicLogic = require('./BasicLogic.js');

// PRIVATE

let _listeners = Immutable.List();

// PUBLIC

class Dispatcher {
	constructor() {
	}

	listen(callback) {
		let callBackID = Logic.checkIfCallbackIsFunction(callback)
		                      .addCallbackAsListener(callback);
		
		return callBackID;
	}

	unlisten(id) {
		Logic.removeListenerByID(id);
	}

	broadcast(message, data) {
		Logic.log(this, `broadcasting ${ message }`)
		     .callEachListenerWithArgs(message, data);
	}
}

// DETAILED LOGIC

class _Logic extends BasicLogic {
	addCallbackAsListener(callback) {
		_listeners = _listeners.push(callback);
		
		return (_listeners.size - 1);
	}

	removeListenerByID(id) {
		if (!_listeners.get(id)) {
			throw new Error();
		}

		_listeners = _listeners.remove(id);

		return this;
	}

	callEachListenerWithArgs() {
		for (let callback of _listeners) {
			callback.call(null, ...arguments);
		}
	}
}

var Logic = new _Logic();

module.exports = new Dispatcher();

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

class BasicLogic {
	checkIfCallbackIsFunction(callback) {
		if ((typeof callback) != 'function') {
			throw new Error();
		}

		return this;
	}

	log(caller, message, ...args) {
		// console.log(`[${ caller.constructor.name }] ${ message }.`, ...args);

		return this;
	}
}

module.exports = BasicLogic;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

var Dispatcher = require('./Dispatcher.js');

// CONSTANTS

const TICKS_PER_SECOND = 50;

// PRIVATES

let _tick = 0,
    _tickStartTime = 0,
    _tickerTimer = null;

// PUBLIC

class TickerStore {
	constructor() {
		this.setTickStartTime()
		    .broadcastTickByInterval();
	}

	setTickStartTime() {
		_tickStartTime = Date.now();

		return this;
	}

	broadcastTickByInterval() {
		clearInterval(_tickerTimer);

		_tickerTimer = setInterval(function() {
			_tick += Date.now() - _tickStartTime;
			Dispatcher.broadcast('TICK');
		}, 1 / TICKS_PER_SECOND);

		return this;
	}
}

module.exports = TickerStore;

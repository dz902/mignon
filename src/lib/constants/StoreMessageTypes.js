var keyMirror = require('key-mirror-nested');

var STORE = keyMirror({
	INSTRUMENT_LIST: {
		LIST_POPULATE: 0,
		INSTRUMENT_ACTIVATE: 0,
	}
});

module.exports = STORE;

var keyMirror = require('key-mirror-nested');

var INPUT = keyMirror({
	UI: {
		SELECT_DEVICE: 0
	},
	MIDI: {
		DEVICE_CONNECTED: 0,
		DEVICE_DISCONNECTED: 0,
		DEVICE_OPEN: 0,
		DEVICE_PENDING: 0,
		DEVICE_CLOSED: 0,
		NOTE_ON: 0,
		NOTE_OFF: 0
	}
});

module.exports = INPUT;

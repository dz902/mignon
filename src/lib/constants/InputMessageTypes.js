var keyMirror = require('key-mirror-nested');

var INPUT = keyMirror({
	MIDI: {
		NOTE_ON: 0,
		NOTE_OFF: 0
	}
});

module.exports = INPUT;

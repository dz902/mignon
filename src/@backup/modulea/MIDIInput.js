/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

/*

register(callback: Function, ) -> 
dispatch(action: String, data: Any) -> 
dispatchDeviceConnectionAction: 

navigator.requestMIDIAccess
         .then(getMIDIInputs)
         .then(selectMIDIInput)
         .then(listenForMIDIMessages);

getMIDIInputs(MIDIAccess) -> MIDIInputMap
selectMIDIInput(MIDIInputMap, Integer) -> MIDIInput
listenForMIDIMessages(MIDIInput) -> True


navigator.requestMIDIAccess
         .then(function(access) {

	access.inputs.forEach(function(input) {
		input.open().then(function(input) {
			input.onmidimessage = function(msgEvent) {
				let note = extractNoteData(msgEvent.data);
				note = note.set('timing', msgEvent.receivedTime);

				console.log(note);
			}
		});
	});

});


*/

var MIDIInput = {
//-

pollMIDIInputs: function(access, pollFunc) {
	access.onstatechange = pollFunc;

	return 
},

isNoteMessage: function(msgData) {
	let higherNibbleData = msgData[0] >> 4;

	return (higherNibbleData == 0b1000 || higherNibbleData == 0b1001);
},

extractNoteData: function(msgData) {
	let typeId        = msgData[0] >> 4,
	    channelNumber = msgData[0] & 0b00001111,
	    noteNumber    = msgData[1],
	    velocity      = msgData[2];
	let noteMsg = {
		rawData: msgData,
		type: 'UNKNOWN'
	};

	if (typeId == 0b1000) {
		noteMsg.type = 'NOTE_OFF';
	} else if (typeId == 0b1001) {
		noteMsg.type = (velocity !== 0 ? 'NOTE_ON' : 'NOTE_OFF');
	}

	if (noteMsg.type != 'UNKNOWN') {
		noteMsg.channelNumber = channelNumber;
		noteMsg.noteNumber    = noteNumber;
		noteMsg.velocity      = velocity;
	}

	return noteMsg;
}


//-
};

module.exports = MIDIInput;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Performance = {
//-

// adjustMsgTimingToSamplingInterval
adjustMsgTimingToSamplingInterval: function(noteMsgSeq, samplingInterval) {
	if (noteMsgSeq.length === 0) {
		return noteMsgSeq;
	}

	let startingTiming = noteMsgSeq[0].timing;

	return noteMsgSeq.map(function(msg) {
		msg.rawTiming = msg.timing;
		msg.timing = Math.floor( (msg.timing - startingTiming) / samplingInterval ) * samplingInterval + startingTiming;

		return msg;
	});
}

//-
};

module.exports = Performance;


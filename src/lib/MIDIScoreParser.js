/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var yaml = require('js-yaml');

class MadMIDIScoreParser {
	static parse(yamlScore) {
		console.log(yamlScore);
		return yaml.safeLoad(yamlScore, {scheme: yaml.FAILSAFE_SCHEMA});
	}
}

module.exports = MadMIDIScoreParser;

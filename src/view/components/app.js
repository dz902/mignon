/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var $ = require('npm-zepto');

function createApp(state) {
	let HTML = require('./app.jade');
	
	let $app = $(HTML);

	if (state['access']) {
		$app.find('b').html(String(state['access']));
	}
}

module.exports = {};

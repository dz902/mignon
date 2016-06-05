/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var List = Immutable.List;
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDECY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');
var Renderer = require('./renderer/VexRenderer.js');

// PRIVATE

let _renderer = null;

// PUBLIC

class ScoreView {
	constructor(canvas) {
		_renderer = new Renderer(canvas);
	}

	render(score) {
		let voices = score.get('voices').map(function(voice) {
			return voice.map(function(note) {
				if (note.get('type') == 'NOTE') {
					note = note.set('notes', List([note]));
				}

				return note;
			});
		});
		
		score = score.set('voices', voices);

		_renderer.render(score);
	}
}


module.exports = ScoreView;

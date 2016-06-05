/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var $ = require('npm-zepto');
var Immutable = require('immutable');
var List = Immutable.List;
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);

// INTERNAL DEPENDECY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');
var Renderer = require('./renderer/VexRenderer.js');

// PRIVATE

let _canvas = null;
let _renderer = null;

// PUBLIC

class PerformanceView {
	constructor(canvas) {
		_canvas = canvas;
		_renderer = new Renderer(canvas);
	}

	render(performanceScore) {
		let voices = performanceScore.get('voices').map(function(voice) {
			return voice.map(function(note) {
				if (note.get('type') == 'NOTE') {
					note = note.set('notes', List([note]));
				}

				return note;
			});
		});

		voices = voices.map(function(voice) {
			return voice.map(function(mark) {
				switch (mark.get('type')) {
					case 'NOTE':
					case 'CHORD':
						break;
					default:
						return mark;
				}

				let notes = mark.get('notes').map(function(n) {
					let p = n.get('performance');

					if (!p) {
						return n;
					}

					if (p.get('extra')) {
						n = n.setIn(['style', 'fill'], 'red');
					} else if (p.get('missing')) {
						n = n.setIn(['style', 'fill'], 'grey');
					} else {
						n = n.setIn(['style', 'fill'], 'green');
					}

					return n;
				});
				
				return mark.set('notes', notes);
			});
		});

		performanceScore = performanceScore.set('voices', voices);
		
		console.log('final perf', performanceScore);

		_renderer.renderLayer(performanceScore);
	}
}

module.exports = PerformanceView;

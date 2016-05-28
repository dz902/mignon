/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var installDevTools = require("immutable-devtools");
installDevTools(Immutable);
var Vex = require('vexflow');
var Flow = require('vexflow').Flow;

// INTERNAL DEPENDECY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');
 
// PRIVATE

let _renderer = null;
let _formatter = null;
let _ctx = null;
let _topStave = null,
    _bottomStave = null;

class ScoreView {
	constructor(canvas) {
		_renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.SVG);
		_ctx = _renderer.getContext();
		_formatter = new Vex.Flow.Formatter();

  	Dispatcher.listen(function(message, data) {
  		if (message == 'P') {
  			this.render();
			}
		});
	}

	render(state, _red) {
		Logic.drawStaves();

		var voices = state.get('voices');
		
		let processedVoices = [];

		for (let voice of voices) {
  		var vexVoice = new Vex.Flow.Voice({});
  		vexVoice.setStrict(false);

			for (let mark of voice) {
				if (mark === null) {
					return;
				}

				let vexTickable = Logic.processMark(mark);

				//
				if (_red) vexTickable.setStyle({strokeStyle: 'red', fillStyle: 'red'});
				//

				vexVoice.addTickable(vexTickable);
			}

			processedVoices.push(vexVoice);
		}

  	_formatter.joinVoices(processedVoices)
  		        .formatToStave(processedVoices, _topStave);
                	
		processedVoices.forEach(v => v.draw(_ctx, _topStave));
	}
}

class _Logic extends BasicLogic {
	drawStaves() {
		_topStave = new Vex.Flow.Stave(30, 10, 800);
		_bottomStave = new Vex.Flow.Stave(30, 150, 800); // x,y,width

		_topStave.addClef('treble');
		_bottomStave.addClef('bass');

		let brace = new Vex.Flow.StaveConnector(_topStave, _bottomStave).setType(3);
		let leftLine = new Vex.Flow.StaveConnector(_topStave, _bottomStave).setType(1);
		let rightLine = new Vex.Flow.StaveConnector(_topStave, _bottomStave).setType(6);

		this.draw(_topStave, _bottomStave, brace, leftLine, rightLine);
	}

	draw(...args) {
		for (let item of args) {
			item.setContext(_ctx)
		    	.draw();
		}
		
		return this;
	}
	
	processMark(mark) {
		switch (mark.get('type')) {
			case 'NOTE':
			case 'CHORD':
				return this.createNote(mark);
			case 'BAR':
				return this.createBar(mark);
			case 'SPACER':
				return this.createSpacer(mark);
			default:
				throw new Error('Unknown mark');
		}
	}

	createSpacer(mark) {
		let vexNote = new Flow.GhostNote({
			keys: ['C/4'],
			duration: '4',//mark.get('duration'),
			auto_stem: true
		});

		return vexNote;
	}

	createBar(mark) {
		return new Flow.BarNote(Flow.Barline.SINGLE);
	}

	createNote(mark) {
		// always treat as chord

		if (mark.get('type') == 'NOTE') {
			mark = mark.set('notes', Immutable.List([mark]));
		}

		// add accidentals

		let notes = mark.get('notes')
		                .map((v) => this.checkStepAndAccidental(v));

		// aggregate keys

		let keys = notes.reduce(function(reduction, value) {
			reduction.push(`${ value.get('pitch') }`);
			return reduction;
		}, []);

		// generate vex note

		let vexNote = new Flow.StaveNote({
			keys: keys,
			duration: mark.get('duration'),
			auto_stem: true
		});
		
		// add accidentals

		notes.forEach(function(note, i) {
			if (notes.get('accidental')) {
				vexNote.addAccidental(i, new Vex.Flow.Accidental(note.get('accidental')));
			}
		}.bind(this));
		
		return vexNote;
	}
	
	checkStepAndAccidental(mark) {
		let [ , step, accidental ] = mark.get('pitch')
		                                 .match(/^([A-Ga-g])(b|bb|#|##|n)?\/(?:[0-9]|10)$/);

		mark = mark.set('step', step)
		           .set('accidental', accidental);

		return mark;
	}
}

var Logic = new _Logic();

module.exports = ScoreView;

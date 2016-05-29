/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Immutable = require('immutable');
var List = Immutable.List;
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

	render(score, _red) {
		Renderer.render(score);
	}
}

class VexRenderer {
	render(score) {
		let self = this;

		this.drawStaves();

		score = this.processScore(score);

		let vexVoices = score.get('voices').reduce(function(reduction, voice) {
			let vexVoice = voice.reduce(function(vv, mark) {
				let vexTickable = self.createTickable(mark);

				vv.addTickable(vexTickable);
				
				return vv;
			}, new Vex.Flow.Voice({}).setStrict(false));
  		
  		reduction.push(vexVoice);

  		return reduction;
		}, []);

  	_formatter.joinVoices(vexVoices)
  		        .formatToStave(vexVoices, _topStave);
                	
		vexVoices.forEach(v => v.draw(_ctx, _topStave));
	}

	// high-level processing

	processScore(score) {
		let self = this;
		let voices = score.get('voices').map(function(voice) {
			return voice.map(mark => self.processMark(mark));
		});

		return score.set('voices', voices);
	}
	
	processMark(mark) {
		switch (mark.get('type')) {
			case 'NOTE':
			case 'CHORD':
				mark = this.addKeys(mark);
				mark = this.addStepAndAccidental(mark);
				break;
			case 'BAR':
			case 'SPACER':
				break;
			default:
				throw new Error('Unknown mark');
		}

		return mark;
	}

	// mark processing


	addKeys(note) {
		let keys = note.get('notes')
		               .reduce(function(reduction, n) {
 			return reduction.push(n.get('pitch'));
		}, List());

		return note.set('keys', keys); 
	}

	addStepAndAccidental(note) {
		let notes = note.get('notes').map(function(n) {
			let [ , step, accidental ] = n.get('pitch').match(/^([A-Ga-g])(b|bb|#|##|n)?\/(?:[0-9]|10)$/);

			return n.set('step', step)
		          .set('accidental', accidental);
		});

		return note.set('notes', notes);
	}

	// vex note creation
	
	createTickable(mark) {
		let tickable = null;

		switch (mark.get('type')) {
			case 'NOTE':
			case 'CHORD':
				tickable = this.createNote(mark);
				break;
			case 'BAR':
				tickable = this.createBar(mark);
				break;
			case 'SPACER':
				tickable = this.createSpacer(mark);
				break;
			default:
				throw new Error('Unknown mark');
		}

		return tickable;
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
		let vexNote = new Flow.StaveNote({
			keys: mark.get('keys').toArray(),
			duration: mark.get('duration'),
			octave_shift: 1,
			auto_stem: true
		});
		
		mark.get('notes').forEach(function(value, index) {
			if (value.get('accidental')) {
	 			vexNote.addAccidental(index, new Flow.Accidental(value.get('accidental')));
			}
		});
		
		return vexNote;
	}

	// drawing

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
}

var Renderer = new VexRenderer();

module.exports = ScoreView;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

var $ = require('npm-zepto');
var List = require('immutable').List;
var Flow = require('vexflow').Flow;

// PRIVATE

let _renderer = null;
let _formatter = null;
let _ctx = null;
let _topStave = null,
    _bottomStave = null;

class VexRenderer {
	constructor(canvas) {
		_renderer = new Flow.Renderer(canvas, Flow.Renderer.Backends.SVG);
		_ctx = _renderer.getContext();
		_formatter = new Flow.Formatter();
	}

	renderLayer(score) {
		this.render(score);

		let $canvas = $(_renderer.element);
		
		/*$canvas.children('svg')
		       .children('rect,path')
		       .hide();*/
	}

	render(score) {
		let self = this;

		_ctx.width = _ctx.svg.clientWidth;
		_ctx.height = _ctx.svg.clientHeight;
		_ctx.clear();

		this.drawStaves();

		score = this.processScore(score);
		console.log('final score', score);

		let vexVoices = score.get('voices').reduce(function(reduction, voice) {
			let vexVoice = voice.reduce(function(vv, mark) {
				let vexTickable = self.createTickable(mark);

				vv.addTickable(vexTickable);
				
				return vv;
			}, new Flow.Voice({}).setStrict(false));
  		
  		reduction.push(vexVoice);

  		return reduction;
		}, []);

  	_formatter.joinVoices(vexVoices)
  		        .formatToStave(vexVoices, _topStave);
                	
		vexVoices.forEach(v => v.draw(_ctx, _topStave));
		
		let $svg = $(_ctx.svg);

		score.get('voices').forEach(function(voice) {
			voice.forEach(function(mark) {
				if (mark.get('type') == 'CHORD') {
					mark.get('notes').forEach(function(n) {
						console.log('1vn', n.get('id'), n.get('style'));
						$svg.find(`#vf-vex-note-id-${n.get('id')} *`).css(n.get('style', List()).toObject());
					});
				} else {
					$svg.find(`#vf-vex-note-id-${mark.get('id')} *`).css(mark.get('style', List()).toObject());
				}
			});
		});

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
				mark = this.sortNotes(mark);
				mark = this.addKeys(mark);
				mark = this.addStepAndAccidental(mark);
				break;
			case 'BAR':
			case 'SPACER':
				break;
			default:
				throw new Error('Unknown mark', mark);
		}

		return mark;
	}

	// mark processing

	sortNotes(note) {
		return note.update('notes', function(n) {
			return n.sort((a, b) => a.get('noteNumber') - b.get('noteNumber'));
		}); 
	}

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
			auto_stem: true,
			__data: mark.get('notes')
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
		_topStave = new Flow.Stave(30, 10, 800);
		_bottomStave = new Flow.Stave(30, 150, 800); // x,y,width

		_topStave.addClef('treble');
		_bottomStave.addClef('bass');

		let brace = new Flow.StaveConnector(_topStave, _bottomStave).setType(3);
		let leftLine = new Flow.StaveConnector(_topStave, _bottomStave).setType(1);
		let rightLine = new Flow.StaveConnector(_topStave, _bottomStave).setType(6);

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

module.exports = VexRenderer;

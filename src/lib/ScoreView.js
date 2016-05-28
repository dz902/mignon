/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDECY

var Vex = require('vexflow');

// INTERNAL DEPENDECY

var Dispatcher = require('./Dispatcher.js');
var BasicLogic = require('./BasicLogic.js');
 
class ScoreView {
	constructor(canvas) {
		this.renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.SVG);
  	this.formatter = new Vex.Flow.Formatter();

  	Dispatcher.listen(function(message, data) {
  		if (message == 'P') {
  			this.render();
			}
		});
	}

	draw(...args) {
		let context = this.renderer.getContext();

		for (let item of args) {
			item.setContext(context)
		    	.draw();
		}
		
		return this;
	}

	render(state, _red) {

		var ctx = this.renderer.getContext();

		// generate staves

		let topStaff = new Vex.Flow.Stave(30, 10, 800);
		let bottomStaff = new Vex.Flow.Stave(30, 150, 800); // x,y,width

		topStaff.addClef('treble');
		bottomStaff.addClef('bass');

		let brace = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(3);
		let leftLine = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(1);
		let rightLine = new Vex.Flow.StaveConnector(topStaff, bottomStaff).setType(6);
		
		this.draw(topStaff, bottomStaff, brace, leftLine, rightLine);

		var stave = new Vex.Flow.Stave(10, 0, 400);
		stave.addClef("treble");
		

		if (!_red) {
		}

		//notes[0].init({keys: [note], duration: "q"});
		//notes[0].setStyle({strokeStyle: 'red', fillStyle: 'red'});

  	// create voice and add beats

  	var vexVoice = new Vex.Flow.Voice({});
  	vexVoice.setStrict(false);

		var voices = state.get('voices');
		for (let voice of voices) {
			for (let mark of voice) {
				if (mark === null) {
					return;
				}

				let vexNote = this.createNote(mark);

				//
				if (_red) vexNote.setStyle({strokeStyle: 'red', fillStyle: 'red'});
				//

				vexVoice.addTickable(vexNote);
  			
			}

  		// Format and justify the notes to 500 pixels

  		this.formatter.joinVoices([vexVoice])
  		              .formatToStave([vexVoice], topStaff);
                		
  		vexVoice.draw(ctx, topStaff);
		}
	}

	createNote(mark) {
		var vexNote;
		var attr = mark;

		switch (mark.get('type')) {
			case 'NOTE':
				let [ , step, accidental ] = attr.get('pitch').match(/^([A-Ga-g](b|bb|#|##|n)?\/(?:[0-9]|10))$/);
				vexNote = new Vex.Flow.StaveNote({ keys: [`${ attr.get('pitch') }`], duration: attr.get('duration'), auto_stem: true });
				
				if (accidental) {
					vexNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
				}

				break;
			case 'CHORD':
				let chordKeys = [];
				let notes = mark.get('notes');
				notes.forEach((v, i) => chordKeys.push(`${ v.get('pitch') }`));
				vexNote = new Vex.Flow.StaveNote({ keys: chordKeys, duration: attr.get('duration'), auto_stem: true });
				
				notes.forEach(function(note, i) {
					let [ , step, accidental ] = note.get('pitch').match(/^([A-Ga-g](b|bb|#|##|n)?\/(?:[0-9]|10))$/);
					
					if (accidental) {
						vexNote.addAccidental(i, new Vex.Flow.Accidental(accidental));
					}
				});

				break;
		}

		return vexNote;
	}
}

class _Logic extends BasicLogic {
	renderWithPerformance(score, performance) {
		
	}
}

var Logic = new _Logic();

module.exports = ScoreView;

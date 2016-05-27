/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Vex = require('vexflow');

class ScoreView {
	constructor(canvas) {
		this.renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.SVG);
  	this.formatter = new Vex.Flow.Formatter();
	}

	render(state, _red) {

		var ctx = this.renderer.getContext();

		// generate staves

		var stave = new Vex.Flow.Stave(10, 0, 400);
		stave.addClef("treble");

		if (!_red) {
			stave.setContext(ctx).draw();
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
  		              .formatToStave([vexVoice], stave);
                		
  		vexVoice.draw(ctx, stave);
		}
	}

	createNote(mark) {
		var vexNote;
		var attr = mark;

		switch (mark.get('type')) {
			case 'NOTE':
				let [ , step, accidental ] = attr.get('pitch').match(/^([A-Ga-g](b|bb|#|##|n)?\/(?:[0-9]|10))$/);
				vexNote = new Vex.Flow.StaveNote({ keys: [`${ attr.get('pitch') }`], duration: attr.get('duration') });
				
				if (accidental) {
					vexNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
				}

				break;
			case 'CHORD':
				let chordKeys = [];
				let notes = mark.get('notes');
				notes.forEach((v, i) => chordKeys.push(`${ v.get('pitch') }`));
				vexNote = new Vex.Flow.StaveNote({ keys: chordKeys, duration: attr.get('duration') });
				
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

module.exports = ScoreView;

/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Vex = require('vexflow');

class MadMIDIScoreRenderer {
	constructor() {
		this.layers = {};
	}

	createLayer(name, score, canvas) {
		this.layers[name] = {
			score: score,
			renderer: new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.SVG),
  		formatter: new Vex.Flow.Formatter()
  	};

		this.resetLayer(name);
	}

	resetLayer(name) {
		this.layers[name].notes = [];

		this.layers[name].renderer.getContext().width = this.layers[name].renderer.getContext().svg.clientWidth;
		this.layers[name].renderer.getContext().height = this.layers[name].renderer.getContext().svg.clientHeight;
		this.layers[name].renderer.getContext().clear();
	}

	render(name, _red) {
		this.resetLayer(name);

		var ctx = this.layers[name].renderer.getContext();

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

		for (let voice of this.layers[name].score.voices) {
			for (let mark of voice.marks) {
				if (mark === null) {
					continue;
				}

				let vexNote = this.createNote(mark);

				//
				if (_red) vexNote.setStyle({strokeStyle: 'red', fillStyle: 'red'});
				//

				vexVoice.addTickable(vexNote);
				
				this.layers[name].notes.push({note: vexNote, voice: vexVoice});
			}
  		
  		// Format and justify the notes to 500 pixels

  		this.layers[name].formatter.joinVoices([vexVoice])
                		             .formatToStave([vexVoice], stave);
                		
  		vexVoice.draw(ctx, stave);
		}
	}

	createNote(mark) {
		var vexNote;

		switch (mark.type) {
			case 'note':
				let [ , step, accidental ] = mark.step.match(/^([A-Ga-g])(b|bb|#|##|n)?$/);
				vexNote = new Vex.Flow.StaveNote({ keys: [`${ mark.step }/${ mark.octave }`], duration: mark.duration });
				
				if (accidental) {
					vexNote.addAccidental(0, new Vex.Flow.Accidental(accidental));
				}

				break;
			case 'chord':
				let chordKeys = [];
				mark.notes.forEach((v, i) => chordKeys.push(`${ v.step }/${ v.octave }`));
				
				mark.notes.forEach(function(note, i) {
					let [ , step, accidental ] = note.step.match(/^([A-Ga-g])(b|bb|#|##|n)?$/);
					vexNote = new Vex.Flow.StaveNote({ keys: chordKeys, duration: note.duration });
					
					if (accidental) {
						vexNote.addAccidental(i, new Vex.Flow.Accidental(accidental));
					}
				});

				break;
		}

		return vexNote;
	}
}

module.exports = MadMIDIScoreRenderer;

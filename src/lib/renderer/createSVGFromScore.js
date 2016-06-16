/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Flow = require('vexflow').Flow;

function createSVGFromScore(scoreMeasures) {
	let div = document.createElement('div');
	let renderer  = new Flow.Renderer(div, Flow.Renderer.Backends.SVG);
	let context   = renderer.getContext();
	let formatter = new Flow.Formatter();

	// draw grand staff

	let topStave    = new Flow.Stave(30, 10, 800);
	let bottomStave = new Flow.Stave(30, 150, 800); // x,y,width

	topStave.addClef('treble');
	bottomStave.addClef('bass');

	let brace = new Flow.StaveConnector(topStave, bottomStave).setType(3);
	let leftLine = new Flow.StaveConnector(topStave, bottomStave).setType(1);
	let rightLine = new Flow.StaveConnector(topStave, bottomStave).setType(6);

	[topStave, bottomStave, brace, leftLine, rightLine].forEach(n => n.setContext(context).draw());

	scoreMeasures.forEach((measure) => {
		let vexParts = [];

		measure.forEach((part) => {
			let vexPart = new Flow.Voice({}).setStrict(false);

			part.forEach((noteGroup) => {
				let vexTickable = new Flow.StaveNote({
					keys: noteGroup.reduce((r,n) => { r.push(n.name); return r; }, []),
					duration: noteGroup[0].duration,
					octave_shift: 1,
					auto_stem: true,
					__data: noteGroup
				});
				
				noteGroup.forEach(function(note, index) {
					if (note.name.length > 1) {
	 					vexTickable.addAccidental(index, new Flow.Accidental(note.name.substr(1)));
					}
				});
				
				vexPart.addTickable(vexTickable);

				// noteGroup ends
			});

			vexParts.push(vexPart);

			// part ends
		});

  	formatter.joinVoices(vexParts)
		         .formatToStave(vexParts, topStave);
                	
		vexParts.forEach(p => p.draw(context, topStave));
		
		// measure ends
	});

	
	return div;
}

module.exports = createSVGFromScore;

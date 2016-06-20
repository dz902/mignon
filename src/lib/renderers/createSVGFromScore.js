/* jslint browser: true, node: true, sub: true, multistr: true, esversion: 6 */
'use strict';

var verovio = require('../vendor/verovio-toolkit.js');
var toolkit = new verovio.toolkit();

function createSVGFromScore(scoreData) {
	let div = document.createElement('div');

	let svg = toolkit.renderData( 
		scoreData, 
		JSON.stringify( {
			font: 'Bravura'
		} ) 
	);

   div.innerHTML = svg;

/*	let renderer  = new Flow.Renderer(div, Flow.Renderer.Backends.SVG);
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

	scoreParts.forEach((parts) => {
		let vexParts = [];

		parts.forEach((part) => {
			let vexPart = new Flow.Voice({}).setStrict(false);

			part.notes.forEach((noteGroup) => {
				let vexTickable = new Flow.StaveNote({
					clef: part.clef.toLowerCase(),
					keys: noteGroup.reduce((r,n) => {
						if (n.name === 'O') {
							r.push('B/4');
						} else {
							r.push(`${n.name}/${n.octave}`);
						}

						return r;
					}, []),
					duration: noteGroup[0].duration.replace(/\./g, 'd') + (noteGroup[0].name === 'O' ? 'r' : ''),
					octave_shift: 1,
					auto_stem: true,
					__data: noteGroup
				});

				noteGroup.forEach((note, index) => {
					if (part.stave === 'BOTTOM') {
						vexTickable.setStave(bottomStave);
					} else {
						vexTickable.setStave(topStave);
					}

					if (note.name.length > 1) {
	 					vexTickable.addAccidental(index, new Flow.Accidental(note.name.substr(1)));
					}

					let dots = optional( note.duration.match(/\./) );

					dots.bind(d => d.forEach(() => {
						vexTickable.addDotToAll();
					}));
				});
				
				vexPart.addTickable(vexTickable);

				// noteGroup ends
			});

			formatter.joinVoices([vexPart]);
			
			vexParts.push(vexPart);

			// part ends
		});

		formatter.format(vexParts, 500);

		vexParts.forEach((p, idx) => {
			p.draw(context);
		});
		
		// parts ends
	});
*/
	
	return div;
}

function optional(obj) {
	function bind(obj, func) {
		if (obj === null || obj === undefined || Number.isNaN(obj)) {
			return optional(obj);
		}

		return optional(func(obj));
	}

	return {
		bind: bind.bind(null, obj)
	};
}

module.exports = createSVGFromScore;

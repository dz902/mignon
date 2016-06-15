{
	const STEP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	var currentOctave = 5;
}

Start =
	Measure+

Measure "measure" =
	measureNumber:NonZeroInt "|" _ notes:Note+ _ "|"? _ {
		return {
			measureNumber: measureNumber,
			notes: notes
		}
	}

Octave "octave" =
	_ octave:("^"+ / "_"+ / "-") _ {
		if (octave === '-') {
			octave = 5;
		} else if (octave.length <= 5) {
			octave = octave.length * (octave[0] === '^' ? -1 : 1) + 5
		} else {
			expected(`octave indicator, got "${octave}"`);
		}
		
		currentOctave = octave;

		return octave;
	}

Note "note" =
	_ octave:Octave? notes:(NoteGroup / NoteName) duration:Duration _ {
			if (Array.isArray(notes)) {
				notes = notes.reduce((r, name) => {
					let stepNumber = STEP_NUMBER[name[0]];
					
					let accidental = name[1];

					if (accidental === 'b') {
						stepNumber -= 1;
					} else if (accidental === '#') {
						stepNumber +=1;
					}

					r.push({
						name: name,
						duration: duration,
						octave: octave !== null ? octave : currentOctave
					});

					return r;
				}, []);
			} else {
				notes = [{
					name: notes,
					duration: duration,
					octave: octave !== null ? octave : currentOctave
				}];
			}
		
			return notes;
		}

NoteGroup "note-group" =
	head:(NoteName "-")+ tail:NoteName {
		var result = [];
	
		for (var i = 0; i < head.length; ++i) {
			result.push(head[i][0]);
		}

		result.push(tail);
		
		return result;
	}

NoteName "note-name" =
	name:[a-gA-G] accidental:[b#]? {
		accidental = accidental ? accidental : '';
		return name.toUpperCase()+accidental;
	}
	/ Rest

Rest "rest" =
	rest:"o" { return rest.toUpperCase(); }

Duration =
	"/" duration:("32" / "16" / "8" / "4" / "2" / "1") { return parseInt(duration, 10); }

NonZeroInt =
	[1-9] Int* { return parseInt(text(), 10); }

Int =
	[0-9]

_ =
	[ \s\t\r\n]*

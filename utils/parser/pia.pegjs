{
	const STEP_NUMBER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	var currentOctave = 5;
	var currentDuration = 4;
	var noteIdCounter = 0;
	
	function createNote(name, octave, duration) {
		let note = {
			noteId: noteIdCounter,
			name: name,
			duration: duration
		};

		if (name !== 'O') {
			note.octave = octave ? octave : 5;
			note.noteNumber = STEP_NUMBER.findIndex(v => v === name);

			let accidental = name[1];

			if (accidental === 'b') {
				note.noteNumber -= 1;
			} else if (accidental === '#') {
				note.noteNumber +=1;
			}
		
			note.noteNumber += note.octave * 12 - 1;
		}
	
		noteIdCounter += 1;
	
		return note;
	}
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
	_ octave:Octave? notes:(NoteGroup / NoteName) duration:Duration? _ {
			if (Array.isArray(notes)) {
				notes = notes.reduce((r, name) => {
					let note = createNote(name, octave, duration);

					r.push(note);

					return r;
				}, []);
			} else {
				notes = [createNote(notes, octave, duration)];
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

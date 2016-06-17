{
	const STEP_NUMBER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	var currentOctave = 5;
	var currentDuration = '4';
	var accidentalRecord = []; // stepNumber: { octave: 4 }
	var noteIdCounter = 0, lastNoteNumber = 0;
	
	function addPartToMeasures(part, measures) {
		measures[part.measureNumber-1] = measures[part.measureNumber-1] || [];
		measures[part.measureNumber-1].push(part.notes);
	}

	function createNote(name, octave, duration, isConsecutive) {
		let note = {
			noteId: noteIdCounter,
			name: name,
			duration: duration !== null ? duration : currentDuration
		};

		if (name !== 'O') {
			octave = octave !== null ? octave : currentOctave;

			let stepName = name[0];
			let accidental = name[1];
			let noteNumber = STEP_NUMBER.findIndex(v => v === stepName);

			if (isConsecutive) {
				if (lastNoteNumber > noteNumber) {
					octave += 1;
				}
					
				lastNoteNumber = noteNumber;
			} else {
				resetLastNote();
			}

			switch (accidental) {
				case 'b':
					accidentalRecord[`${stepName},${octave}`] = -1;
					noteNumber -= 1;
					console.log(note);
					break;
				case '#':
					accidentalRecord[`${stepName},${octave}`] = 1;
					noteNumber +=1;
					break;
				case 'n':
					accidentalRecord[`${stepName},${octave}`] = 0;
					break;
				case undefined:
					noteNumber += accidentalRecord[`${stepName},${octave}`] || 0;
					break;
				default:
					expected('accidental to be b / # / n');
			}
		
			note.octave = octave;
			note.noteNumber = noteNumber + octave * 12;
		}
	
		noteIdCounter += 1;
	
		return note;
	}
	
	function resetLastNote() {
		lastNoteNumber = 0;
	}
}

Start =
	parts: Part+ {
		var measures = [];
		parts.forEach(v => addPartToMeasures(v, measures));

		return measures;
	}

Part "part" =
	measureNumber:NonZeroInt "|" _ notes:Note+ _ "|"? _ {
		return {
			measureNumber: measureNumber,
			notes: notes
		}
	}

Octave "octave" =
	_ octave:("^"+ / "_"+ / "=") _ {

		if (octave === '=') {
			octave = 5;
		} else if (octave.length <= 5) {
			octave = currentOctave + octave.length * (octave[0] === '^' ? 1 : -1);
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
					let note = createNote(name, octave, duration, true);

					r.push(note);

					return r;
				}, []);
			} else {
				notes = [createNote(notes, octave, duration)];
			}

			resetLastNote();

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

Duration "duration" =
	duration:("32" / "16" / "8" / "4" / "2" / "1") dots:"."* { 
		dots = dots === null ? '' : dots;

		if (dots.length > 3) {
			expected('3 dots maximum.');
		}

		return duration + dots;
	}

NonZeroInt =
	[1-9] Int* { return parseInt(text(), 10); }

Int =
	[0-9]

_ =
	[ \s\t\r\n]*

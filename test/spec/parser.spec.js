/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals jasmine, beforeEach, describe, it, expect */
'use strict';

var jsondiffpatch = require('jsondiffpatch');
var formatters = require('jsondiffpatch/src/formatters/console');
var trace = require('pegjs-backtrace');

var parser = require('../../src/lib/parsers/pia.js');

describe('PIA PEG', () => {
	beforeEach(() => {
		jasmine.addMatchers({
			toEqualJSON: function(util, customEqualityTesters) {
				return {
					compare: function(actual, expected) {
						var result = {};
						
						actual = JSON.parse(JSON.stringify(actual));
						expected = JSON.parse(JSON.stringify(expected));
						result.pass = util.equals(actual, expected, customEqualityTesters);
						result.name = 'JSON objects ' + (result.pass ? '' :  'don\'t') + ' match';

						if (result.pass) {
							result.message = 'OMG Big Equal!';
						} else {
							result.message = '' + formatters.format(jsondiffpatch.diff(expected, actual));
						}

						return result;
					},
				};
			}
		});
	});
	
	it('should parse pia scores', () => {
		let result = null;
		let expectedResult = [
			[ // measure 0
				[ // part 0
					[ {
						noteId: 0,
						noteNumber: 72,
						name: 'C',
						octave: 6,
						duration: '4'
					} ],
					[ {
						noteId: 1,
						name: 'O',
						duration: '8'
					} ],
					[ {
						noteId: 2,
						noteNumber: 75,
						name: 'Eb',
						octave: 6,
						duration: '4'
					} ],
					[ {
						noteId: 3,
						noteNumber: 81,
						name: 'A',
						octave: 6,
						duration: '8'
					} ]
				] ,[ // part 1
				[ {
					noteId: 4,
					noteNumber: 69,
					name: 'A',
					octave: 5,
					duration: '4'
				} ],
				[ {
					noteId: 5,
					noteNumber: 64,
					name: 'E',
					octave: 5,
					duration: '4'
				},
				{
					noteId: 6,
					noteNumber: 69,
					name: 'A',
					octave: 5,
					duration: '4'
				},
				{
					noteId: 7,
					noteNumber: 72,
					name: 'C',
					octave: 6,
					duration: '4'
				} ],
				[ {
					noteId: 8,
					noteNumber: 64,
					name: 'E',
					octave: 5,
					duration: '4'
				},
				{
					noteId: 9,
					noteNumber: 69,
					name: 'A',
					octave: 5,
					duration: '4'
				},
				{
					noteId: 10,
					noteNumber: 72,
					name: 'C',
					octave: 6,
					duration: '4'
				} ]
				]
			] , [ // measure 1
				[ // part 0
					[ {
						noteId: 11,
						noteNumber: 57,
						name: 'A',
						octave: 4,
						duration: '4'
					} ],
					[ {
						noteId: 12,
						noteNumber: 48,
						name: 'C',
						octave: 4,
						duration: '4'
					},
					{
						noteId: 13,
						noteNumber: 52,
						name: 'E',
						octave: 4,
						duration: '4'
					} ]
				]
			]
		];

		expect(() => {
			result = parser.parse(`1| ^ c4 o8 eb4 a8 |
			                       1| = a4 e-a-c4 e-a-c4 |
			                       2| _ a c-e`);
		}).not.toThrow();
		
		expect(result).toEqualJSON(expectedResult);
	});
});

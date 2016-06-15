/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals describe, it, expect */
'use strict';

var parser = require('../../utils/parser/pia.js');
var trace = require('pegjs-backtrace');

describe('PIA PEG', () => {
	it('should parse pia scores', () => {
		let text = require('raw!../../utils/scores/test.pia');
		let result = null;
		let expectedResult = [
			{
				measureNumber: 1,
				notes: [
					[ {
						noteId: 0,
						noteNumber: 72,
						name: 'C',
						octave: 6,
						duration: 4
					} ],
					[ {
						noteId: 1,
						name: 'O',
						duration: 8
					} ],
					[ {
						noteId: 2,
						noteNumber: 75,
						name: 'Eb',
						octave: 6,
						duration: 4
					} ],
					[ {
						noteId: 3,
						noteNumber: 81,
						name: 'A',
						octave: 6,
						duration: 8
					} ]
				]
			},
			{
				measureNumber: 1,
				notes: [
					[ {
						noteId: 4,
						noteNumber: 69,
						name: 'A',
						octave: 5,
						duration: 4
					} ],
					[ {
						noteId: 5,
						noteNumber: 64,
						name: 'E',
						octave: 5,
						duration: 4
					},
					{
						noteId: 6,
						noteNumber: 69,
						name: 'A',
						octave: 5,
						duration: 4
					},
					{
						noteId: 7,
						noteNumber: 72,
						name: 'C',
						octave: 6,
						duration: 4
					} ],
					[ {
						noteId: 8,
						noteNumber: 64,
						name: 'E',
						duration: 4
					},
					{
						noteId: 9,
						noteNumber: 69,
						name: 'A',
						duration: 4
					},
					{
						noteId: 10,
						noteNumber: 72,
						name: 'C',
						octave: 6,
						duration: 4
					} ]
				]
			},
			{
				measureNumber: 2,
				notes: [
					[ {
						noteId: 11,
						noteNumber: 57,
						name: 'A',
						octave: 4,
						duration: 4
					} ],
					[ {
						noteId: 12,
						noteNumber: 48,
						name: 'C',
						octave: 4,
						duration: 4
					},
					{
						noteId: 13,
						noteNumber: 52,
						name: 'E',
						octave: 4,
						duration: 4
					}]
				]
			}
		];

		expect(() => {
			result = parser.parse(`1| ^ c/4 o/8 eb/4 a/8 |
			                       1| a/4 e-a-c/4 e-a-c/4 |
			                       2| _ a c-e`);
		}).not.toThrow();
		
		let testResult = expect(result).toEqual(expectedResult);

		console.log(testResult.extra, testResult.missing);
	});
});

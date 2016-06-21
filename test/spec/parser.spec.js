/* jslint browser: true, node: true, sub: true, esversion: 6 */
/* globals jasmine, beforeEach, describe, it, expect, XMLDocument */
'use strict';

const jsondiffpatch = require('jsondiffpatch');
const formatters = require('jsondiffpatch/src/formatters/console');

const API = require('../../src/actions/API.js');
const action = API.LOAD_SCORE(require('raw!../../var/scores/chopin.mei'));
const scoreModel = action.payload ? action.payload.model : null;

describe('LOAD_SCORE', () => {
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
	
	describe('Action', () => {
		it('should deliver score model', () => {
			expect(scoreModel.constructor).toBe(Object);
		});

		it('should give doc, beats and notes', () => {
			expect(scoreModel.doc.constructor).toBe(XMLDocument);
			expect(scoreModel.beats.constructor).toBe(Array);
			expect(scoreModel.notes.constructor).toBe(Array);
		});

		it('should group notes into 852 beats', () => {
			expect(scoreModel.beats.length).toBe(852);
		});

		it('should group notes into 2 staves', () => {
			expect(scoreModel.notes.length).toBe(3); // counting from 1
		});

		it('should group 365 notes into 1st staff', () => {
			expect(scoreModel.notes[1].length).toBe(365);
		});
		
		it('should group 795 notes into 2nd staff', () => {
			expect(scoreModel.notes[2].length).toBe(795);
		});
		
		it('should group A-flat (56) and F (65) into 3rd beat', () => {
			expect(scoreModel.beats[2][1]).toEqual(jasmine.anything());
			expect(scoreModel.beats[2][1][56]).toEqual(jasmine.anything());
			expect(scoreModel.beats[2][1][65]).toEqual(jasmine.anything());
		});
	});
});

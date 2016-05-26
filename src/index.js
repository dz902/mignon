/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

var Zepto = require('npm-zepto');

var Vue = require('vue');
var Score = require('./components/score.vue');


var Dispatcher = require('./lib/Dispatcher.js');
var MMIDIInput = require('./lib/MIDIInput.js');
var ScoreStore = require('./lib/ScoreStore.js');
var ScoreView = require('./lib/ScoreView.js');

// -- CODE --

Vue.config.devtools = true;

Zepto(function($) {
	$('body').prepend('<score></score>');

	var vm = new Vue({
		el: 'body',
		components: {
			score: Score
		},
		data: {}
	});


	var div = $('div.vex-tabdiv');
	/*score.addVoice([
		{type: 'note', step: 'C', octave: '4', duration: '4'}
	]);*/
/*	var score = window.score = MadMIDIScore.parseScore(require('raw!./score.mam'));
	var ticker = new MadMIDIScoreTicker(score);
	ticker.groupNotesByTicks();
	window.ticker = ticker;

	var renderer = window.renderer = new MadMIDIScoreRenderer(score, div[0]);
	renderer.createLayer('default', score, div[0]);
	renderer.render('default');
/*
	var s2 = MadMIDIScore.parseScore(require('raw!./score.mam'));
	renderer.createLayer('performance', s2, div[0]);
	s2.voices[0].setMark(0, {type: 'chord', duration: '4', notes: [{step: 'g#', octave: 5}]});
	renderer.render('performance', true);*/

	var score = window.score = new ScoreStore();
	var view = window.view = new ScoreView(div[0]);
	view.render(score.score);


	// inside dispatcher

	/*
	var score = ScoreStore.load();
	var view = new ScoreView();

	view.render(score);

	constructor() {
		score = Score.load();
	}

	universal registry of message
	model -> raw data -> state -> view
	tick -> message -> received by model -> updater -> state -> view
	*/
	var MIDIInput = new MMIDIInput();

	var TickerStore = require('./lib/TickerStore.js');
	//TickerStore = new TickerStore();

	var NoteSequenceStore = require('./lib/NoteSequenceStore.js');
	NoteSequenceStore = new NoteSequenceStore();
	
	var PerformanceStore = require('./lib/PerformanceStore.js');
	PerformanceStore = new PerformanceStore(score, NoteSequenceStore);
});


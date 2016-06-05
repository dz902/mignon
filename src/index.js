/* jslint browser: true, node: true, sub: true, esversion: 6 */
'use strict';

// EXTERNAL DEPENDENCY

var { createStore, applyMiddleware, compose } = require('redux');
var reduxLoop    = require('redux-loop').install();
var reduxLogger  = require('redux-logger')();
var Vue          = require('vue');
var VueRouter    = require('vue-router');


// INTERNAL DEPENDECY

var routes  = require('./routes.js');
var reducer = require('./reducers/main.js');

// CODE

// create store

const storeEnhancer = compose(reduxLoop, applyMiddleware(reduxLogger));
const store  = createStore(reducer,
                           storeEnhancer);

store.dispatch({type: 'START_APP'});

// equip router

Vue.config.devtools = true;
Vue.use(VueRouter);

// router config

const router = new VueRouter();

router.map(routes);

// start app

const App = Vue.extend(require('./components/app.vue'));

router.start(App, '#app');

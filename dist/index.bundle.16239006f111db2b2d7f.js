/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	// INTERNAL DEPENDECY
	
	var Store = __webpack_require__(75);
	var View = __webpack_require__(116);
	
	
	// CODE
	
	View.render('#app', Store.getState());
	
	Store.subscribe(() => {
		let statePatch = Store.getState().statePatch;
	
		View.patch(statePatch);
	});
	
	Store.dispatch({type: 'START_APP'});


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.effectToPromise = effectToPromise;
	exports.isEffect = isEffect;
	exports.none = none;
	exports.promise = promise;
	exports.call = call;
	exports.batch = batch;
	exports.constant = constant;
	exports.lift = lift;
	
	var _utils = __webpack_require__(8);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var isEffectSymbol = Symbol('isEffect');
	
	var effectTypes = {
	  PROMISE: 'PROMISE',
	  CALL: 'CALL',
	  BATCH: 'BATCH',
	  CONSTANT: 'CONSTANT',
	  NONE: 'NONE',
	  LIFT: 'LIFT'
	};
	
	/**
	* Runs an effect and returns the Promise for its completion.
	* @param {Object} effect The effect to convert to a Promise.
	* @returns {Promise} The converted effect Promise.
	*/
	function effectToPromise(effect) {
	  if (process.env.NODE_ENV === 'development') {
	    (0, _utils.throwInvariant)(isEffect(effect), 'Given effect is not an effect instance.');
	  }
	
	  switch (effect.type) {
	    case effectTypes.PROMISE:
	      return effect.factory.apply(effect, _toConsumableArray(effect.args)).then(function (action) {
	        return [action];
	      });
	    case effectTypes.CALL:
	      return Promise.resolve([effect.factory.apply(effect, _toConsumableArray(effect.args))]);
	    case effectTypes.BATCH:
	      return Promise.all(effect.effects.map(effectToPromise)).then(_utils.flatten);
	    case effectTypes.CONSTANT:
	      return Promise.resolve([effect.action]);
	    case effectTypes.NONE:
	      return Promise.resolve([]);
	    case effectTypes.LIFT:
	      return effectToPromise(effect.effect).then(function (actions) {
	        return actions.map(function (action) {
	          return effect.factory.apply(effect, _toConsumableArray(effect.args).concat([action]));
	        });
	      });
	  }
	}
	
	/**
	 * Determines if the object was created with an effect creator.
	 * @param {Object} object The object to inspect.
	 * @returns {Boolean} Whether the object is an effect.
	 */
	function isEffect(object) {
	  return object ? object[isEffectSymbol] : false;
	}
	
	/**
	 * Creates a noop effect.
	 * @returns {Object} An effect of type NONE, essentially a no-op.
	 */
	function none() {
	  return _defineProperty({
	    type: effectTypes.NONE
	  }, isEffectSymbol, true);
	}
	
	/**
	 * Creates an effect for a function that returns a Promise.
	 * @param {Function} factory The function to invoke with the given args that returns a Promise for an action.
	 * @returns {Object} The wrapped effect of type PROMISE.
	 */
	function promise(factory) {
	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }
	
	  return _defineProperty({
	    factory: factory,
	    args: args,
	    type: effectTypes.PROMISE
	  }, isEffectSymbol, true);
	}
	
	/**
	 * Creates an effect for a function that returns an action.
	 * @param {Function} factory The function to invoke with the given args that returns an action.
	 * @returns {Object} The wrapped effect of type CALL.
	 */
	function call(factory) {
	  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	    args[_key2 - 1] = arguments[_key2];
	  }
	
	  return _defineProperty({
	    factory: factory,
	    args: args,
	    type: effectTypes.CALL
	  }, isEffectSymbol, true);
	}
	
	/**
	 * Composes an array of effects together.
	 */
	function batch(effects) {
	  return _defineProperty({
	    effects: effects,
	    type: effectTypes.BATCH
	  }, isEffectSymbol, true);
	}
	
	/**
	 * Creates an effect for an already-available action.
	 */
	function constant(action) {
	  return _defineProperty({
	    action: action,
	    type: effectTypes.CONSTANT
	  }, isEffectSymbol, true);
	}
	
	/**
	 * Transform the return type of a bunch of `Effects`. This is primarily useful for adding tags to route `Actions` to the right place
	 */
	function lift(effect, factory) {
	  for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
	    args[_key3 - 2] = arguments[_key3];
	  }
	
	  return _defineProperty({
	    effect: effect,
	    factory: factory,
	    args: args,
	    type: effectTypes.LIFT
	  }, isEffectSymbol, true);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getEffect = exports.getModel = exports.liftState = exports.loop = exports.install = exports.Effects = exports.combineReducers = undefined;
	
	var _loop = __webpack_require__(7);
	
	var _effects = __webpack_require__(2);
	
	var _install = __webpack_require__(55);
	
	var _combineReducers = __webpack_require__(53);
	
	var Effects = {
	  constant: _effects.constant,
	  promise: _effects.promise,
	  call: _effects.call,
	  batch: _effects.batch,
	  none: _effects.none,
	  lift: _effects.lift
	};
	
	exports.combineReducers = _combineReducers.combineReducers;
	exports.Effects = Effects;
	exports.install = _install.install;
	exports.loop = _loop.loop;
	exports.liftState = _loop.liftState;
	exports.getModel = _loop.getModel;
	exports.getEffect = _loop.getEffect;

/***/ },
/* 5 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	// EXTERNAL DEPENDENCY
	
	const createAction = __webpack_require__(24).createAction;
	const createModelFromScore = __webpack_require__(58);
	
	
	// CODE
	
	const API = {
		START_APP: null,
		GRANT_MIDI_ACCESS: null,
		POLL_MIDI_INPUT: null,
		UPDATE_MIDI_INPUT: null,
		LIST_MIDI_INPUTS: null,
		RECEIVE_MIDI_NOTE: null,
		TRACK_MIDI_NOTE: null,
		LOAD_SCORE: createAction('LOAD_SCORE', score => ({ data: score, model: createModelFromScore(score) })),
		LOG: null
	};
	
	Object.keys(API).forEach(function(k) {
		if (API[k] === null) {
			API[k] = createAction(k);
		}
	});
	
	module.exports = API;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.liftState = exports.loop = exports.getModel = exports.getEffect = exports.isLoop = undefined;
	
	var _utils = __webpack_require__(8);
	
	var _effects = __webpack_require__(2);
	
	/**
	 * Determines if the object is an array created via `loop()`.
	 */
	var isLoop = exports.isLoop = function isLoop(array) {
	  return Array.isArray(array) && array.length === 2 && (0, _effects.isEffect)(array[1]);
	};
	
	/**
	 * Returns the effect from the loop if it is a loop, otherwise null
	 */
	var getEffect = exports.getEffect = function getEffect(loop) {
	  if (!isLoop(loop)) {
	    return null;
	  }
	
	  return loop[1];
	};
	
	/**
	 * Returns the model from the loop if it is a loop, otherwise identity
	 */
	var getModel = exports.getModel = function getModel(loop) {
	  if (!isLoop(loop)) {
	    return loop;
	  }
	
	  return loop[0];
	};
	
	/**
	 * Attaches an effect to the model.
	 *
	 *   function reducerWithSingleEffect(state, action) {
	 *     // ...
	 *     return loop(
	 *       newState,
	 *       fetchSomeStuff() // returns a promise
	 *     );
	 *   }
	 *
	 *   function reducerWithManyEffectsOneAsyncOneNot(state, action) {
	 *     // ...
	 *     return loop(
	 *       newState,
	 *       Promise.all([
	 *         fetchSomeStuff(),
	 *         Promise.resolve(someActionCreator())
	 *       ])
	 *     );
	 *   }
	 */
	var loop = exports.loop = function loop(model, effect) {
	  if (process.env.NODE_ENV === 'development') {
	    (0, _utils.throwInvariant)((0, _effects.isEffect)(effect), 'Given effect is not an effect instance.');
	  }
	
	  return [model, effect];
	};
	
	/**
	* Lifts a state to a looped state if it is not already.
	*/
	var liftState = exports.liftState = function liftState(state) {
	  return isLoop(state) ? state : loop(state, (0, _effects.none)());
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.flatten = flatten;
	exports.throwInvariant = throwInvariant;
	exports.mapValues = mapValues;
	var concat = Array.prototype.concat;
	
	/**
	 * Flattens an array one level
	 */
	function flatten(array) {
	  return concat.apply([], array);
	}
	
	/**
	 * Throws with message if condition is false.
	 * @param {Boolean} condition The condition to assert.
	 * @param {String} message The message of the error to throw.
	 */
	function throwInvariant(condition, message) {
	  if (!condition) {
	    throw Error(message);
	  }
	}
	
	/**
	 * Maps over each value in an object and creates a new object with the mapped
	 * values assigned to each key.
	 * @param {Object} object The source object.
	 * @param {Function} mapper The mapper function that receives the value and the key.
	 * @returns {Object} A new object that contains the mapped values for the keys.
	 */
	function mapValues(object, mapper) {
	  return Object.keys(object).reduce(function (current, key) {
	    current[key] = mapper(object[key], key);
	    return current;
	  }, {});
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	const getPitchNames = function getPitchNames() {
		return ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
	};
	
	module.exports = getPitchNames;


/***/ },
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/**
	 * @license Fraction.js v3.3.1 09/09/2015
	 * http://www.xarg.org/2014/03/precise-calculations-in-javascript/
	 *
	 * Copyright (c) 2015, Robert Eisele (robert@xarg.org)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 **/
	
	
	/**
	 *
	 * This class offers the possibility to calculate fractions.
	 * You can pass a fraction in different formats. Either as array, as double, as string or as an integer.
	 *
	 * Array/Object form
	 * [ 0 => <nominator>, 1 => <denominator> ]
	 * [ n => <nominator>, d => <denominator> ]
	 *
	 * Integer form
	 * - Single integer value
	 *
	 * Double form
	 * - Single double value
	 *
	 * String form
	 * 123.456 - a simple double
	 * 123/456 - a string fraction
	 * 123.'456' - a double with repeating decimal places
	 * 123.(456) - synonym
	 * 123.45'6' - a double with repeating last place
	 * 123.45(6) - synonym
	 *
	 * Example:
	 *
	 * var f = new Fraction("9.4'31'");
	 * f.mul([-4, 3]).div(4.9);
	 *
	 */
	
	(function(root) {
	
	  "use strict";
	
	  // Maximum search depth for cyclic rational numbers. 2000 should be more than enough. 
	  // Example: 1/7 = 0.(142857) has 6 repeating decimal places.
	  // If MAX_CYCLE_LEN gets reduced, long cycles will not be detected and toString() only gets the first 10 digits
	  var MAX_CYCLE_LEN = 2000;
	
	  // Parsed data to avoid calling "new" all the time
	  var P = {
	    "s": 1,
	    "n": 0,
	    "d": 1
	  };
	
	  function assign(n, s) {
	
	    if (isNaN(n = parseInt(n, 10))) {
	      throwInvalidParam();
	    }
	    return n * s;
	  }
	
	  function throwInvalidParam() {
	    throw "Invalid Param";
	  }
	
	  var parse = function(p1, p2) {
	
	    var n = 0, d = 1, s = 1;
	    var v = 0, w = 0, x = 0, y = 1, z = 1;
	
	    var A = 0, B = 1;
	    var C = 1, D = 1;
	
	    var N = 10000000;
	    var M;
	
	    if (p1 === undefined || p1 === null) {
	      /* void */
	    } else if (p2 !== undefined) {
	      n = p1;
	      d = p2;
	      s = n * d;
	    } else
	      switch (typeof p1) {
	
	        case "object":
	        {
	          if ("d" in p1 && "n" in p1) {
	            n = p1["n"];
	            d = p1["d"];
	            if ("s" in p1)
	              n*= p1["s"];
	          } else if (0 in p1) {
	            n = p1[0];
	            if (1 in p1)
	              d = p1[1];
	          } else {
	            throwInvalidParam();
	          }
	          s = n * d;
	          break;
	        }
	        case "number":
	        {
	          if (p1 < 0) {
	            s = p1;
	            p1 = -p1;
	          }
	
	          if (p1 % 1 === 0) {
	            n = p1;
	          } else if (p1 > 0) { // check for != 0, scale would become NaN (log(0)), which converges really slow
	
	            if (p1 >= 1) {
	              z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
	              p1/= z;
	            }
	
	            // Using Farey Sequences
	            // http://www.johndcook.com/blog/2010/10/20/best-rational-approximation/
	
	            while (B <= N && D <= N) {
	              M = (A + C) / (B + D);
	
	              if (p1 === M) {
	                if (B + D <= N) {
	                  n = A + C;
	                  d = B + D;
	                } else if (D > B) {
	                  n = C;
	                  d = D;
	                } else {
	                  n = A;
	                  d = B;
	                }
	                break;
	
	              } else {
	
	                if (p1 > M) {
	                  A+= C;
	                  B+= D;
	                } else {
	                  C+= A;
	                  D+= B;
	                }
	
	                if (B > N) {
	                  n = C;
	                  d = D;
	                } else {
	                  n = A;
	                  d = B;
	                }
	              }
	            }
	            n*= z;
	          } else if (isNaN(p1) || isNaN(p2)) {
	            d = n = NaN;
	          }
	          break;
	        }
	        case "string":
	        {
	          B = p1.match(/\d+|./g);
	
	          if (B[A] === '-') {// Check for minus sign at the beginning
	            s = -1;
	            A++;
	          } else if (B[A] === '+') {// Check for plus sign at the beginning
	            A++;
	          }
	
	          if (B.length === A + 1) { // Check if it's just a simple number "1234"
	            w = assign(B[A++], s);
	          } else if (B[A + 1] === '.' || B[A] === '.') { // Check if it's a decimal number
	
	            if (B[A] !== '.') { // Handle 0.5 and .5
	              v = assign(B[A++], s);
	            }
	            A++;
	
	            // Check for decimal places
	            if (A + 1 === B.length || B[A + 1] === '(' && B[A + 3] === ')' || B[A + 1] === "'" && B[A + 3] === "'") {
	              w = assign(B[A], s);
	              y = Math.pow(10, B[A].length);
	              A++;
	            }
	
	            // Check for repeating places
	            if (B[A] === '(' && B[A + 2] === ')' || B[A] === "'" && B[A + 2] === "'") {
	              x = assign(B[A + 1], s);
	              z = Math.pow(10, B[A + 1].length) - 1;
	              A+= 3;
	            }
	
	          } else if (B[A + 1] === '/' || B[A + 1] === ':') { // Check for a simple fraction "123/456" or "123:456"
	            w = assign(B[A], s);
	            y = assign(B[A + 2], 1);
	            A+= 3;
	          } else if (B[A + 3] === '/' && B[A + 1] === ' ') { // Check for a complex fraction "123 1/2"
	            v = assign(B[A], s);
	            w = assign(B[A + 2], s);
	            y = assign(B[A + 4], 1);
	            A+= 5;
	          }
	
	          if (B.length <= A) { // Check for more tokens on the stack
	            d = y * z;
	            s = /* void */
	                    n = x + d * v + z * w;
	            break;
	          }
	
	          /* Fall through on error */
	        }
	        default:
	          throwInvalidParam();
	      }
	
	    if (d === 0) {
	      throw "DIV/0";
	    }
	
	    P["s"] = s < 0 ? -1 : 1;
	    P["n"] = Math.abs(n);
	    P["d"] = Math.abs(d);
	  };
	
	  var modpow = function(b, e, m) {
	
	    for (var r = 1; e > 0; b = (b * b) % m, e >>= 1) {
	
	      if (e & 1) {
	        r = (r * b) % m;
	      }
	    }
	    return r;
	  };
	
	  var cycleLen = function(n, d) {
	
	    for (; d % 2 === 0;
	            d/= 2) {}
	
	    for (; d % 5 === 0;
	            d/= 5) {}
	
	    if (d === 1) // Catch non-cyclic numbers
	      return 0;
	
	    // If we would like to compute really large numbers quicker, we could make use of Fermat's little theorem:
	    // 10^(d-1) % d == 1
	    // However, we don't need such large numbers and MAX_CYCLE_LEN should be the capstone, 
	    // as we want to translate the numbers to strings.
	
	    var rem = 10 % d;
	
	    for (var t = 1; rem !== 1; t++) {
	      rem = rem * 10 % d;
	
	      if (t > MAX_CYCLE_LEN)
	        return 0; // Returning 0 here means that we don't print it as a cyclic number. It's likely that the answer is `d-1`
	    }
	    return t;
	  };
	
	  var cycleStart = function(n, d, len) {
	
	    var rem1 = 1;
	    var rem2 = modpow(10, len, d);
	
	    for (var t = 0; t < 300; t++) { // s < ~log10(Number.MAX_VALUE)
	      // Solve 10^s == 10^(s+t) (mod d)
	
	      if (rem1 === rem2)
	        return t;
	
	      rem1 = rem1 * 10 % d;
	      rem2 = rem2 * 10 % d;
	    }
	    return 0;
	  };
	
	  var gcd = function(a, b) {
	
	    if (!a) return b;
	    if (!b) return a;
	
	    while (1) {
	      a%= b;
	      if (!a) return b;
	      b%= a;
	      if (!b) return a;
	    }
	  };
	
	  /**
	   * Module constructor
	   *
	   * @constructor
	   * @param {number|Fraction} a
	   * @param {number=} b
	   */
	  function Fraction(a, b) {
	
	    if (!(this instanceof Fraction)) {
	      return new Fraction(a, b);
	    }
	
	    parse(a, b);
	
	    if (Fraction['REDUCE']) {
	      a = gcd(P["d"], P["n"]); // Abuse a
	    } else {
	      a = 1;
	    }
	
	    this["s"] = P["s"];
	    this["n"] = P["n"] / a;
	    this["d"] = P["d"] / a;
	  }
	
	  /**
	   * Boolean global variable to be able to disable automatic reduction of the fraction
	   *
	   */
	  Fraction['REDUCE'] = 1;
	
	  Fraction.prototype = {
	
	    "s": 1,
	    "n": 0,
	    "d": 1,
	
	    /**
	     * Calculates the absolute value
	     *
	     * Ex: new Fraction(-4).abs() => 4
	     **/
	    "abs": function() {
	
	      return new Fraction(this["n"], this["d"]);
	    },
	
	    /**
	     * Inverts the sign of the current fraction
	     *
	     * Ex: new Fraction(-4).neg() => 4
	     **/
	    "neg": function() {
	
	      return new Fraction(-this["s"] * this["n"], this["d"]);
	    },
	
	    /**
	     * Adds two rational numbers
	     *
	     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => 467 / 30
	     **/
	    "add": function(a, b) {
	
	      parse(a, b);
	      return new Fraction(
	              this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"],
	              this["d"] * P["d"]
	              );
	    },
	
	    /**
	     * Subtracts two rational numbers
	     *
	     * Ex: new Fraction({n: 2, d: 3}).add("14.9") => -427 / 30
	     **/
	    "sub": function(a, b) {
	
	      parse(a, b);
	      return new Fraction(
	              this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"],
	              this["d"] * P["d"]
	              );
	    },
	
	    /**
	     * Multiplies two rational numbers
	     *
	     * Ex: new Fraction("-17.(345)").mul(3) => 5776 / 111
	     **/
	    "mul": function(a, b) {
	
	      parse(a, b);
	      return new Fraction(
	              this["s"] * P["s"] * this["n"] * P["n"],
	              this["d"] * P["d"]
	              );
	    },
	
	    /**
	     * Divides two rational numbers
	     *
	     * Ex: new Fraction("-17.(345)").inverse().div(3)
	     **/
	    "div": function(a, b) {
	
	      parse(a, b);
	      return new Fraction(
	              this["s"] * P["s"] * this["n"] * P["d"],
	              this["d"] * P["n"]
	              );
	    },
	
	    /**
	     * Clones the actual object
	     *
	     * Ex: new Fraction("-17.(345)").clone()
	     **/
	    "clone": function() {
	      return new Fraction(this);
	    },
	
	    /**
	     * Calculates the modulo of two rational numbers - a more precise fmod
	     *
	     * Ex: new Fraction('4.(3)').mod([7, 8]) => (13/3) % (7/8) = (5/6)
	     **/
	    "mod": function(a, b) {
	
	      if (isNaN(this['n']) || isNaN(this['d'])) {
	        return new Fraction(NaN);
	      }
	
	      if (a === undefined) {
	        return new Fraction(this["s"] * this["n"] % this["d"], 1);
	      }
	
	      parse(a, b);
	      if (0 === P["n"] && 0 === this["d"]) {
	        Fraction(0, 0); // Throw div/0
	      }
	
	      /*
	       * First silly attempt, kinda slow
	       *
	       return that["sub"]({
	       "n": num["n"] * Math.floor((this.n / this.d) / (num.n / num.d)),
	       "d": num["d"],
	       "s": this["s"]
	       });*/
	
	      /*
	       * New attempt: a1 / b1 = a2 / b2 * q + r
	       * => b2 * a1 = a2 * b1 * q + b1 * b2 * r
	       * => (b2 * a1 % a2 * b1) / (b1 * b2)
	       */
	      return new Fraction(
	              (this["s"] * P["d"] * this["n"]) % (P["n"] * this["d"]),
	              P["d"] * this["d"]
	              );
	    },
	
	    /**
	     * Calculates the fractional gcd of two rational numbers
	     *
	     * Ex: new Fraction(5,8).gcd(3,7) => 1/56
	     */
	    "gcd": function(a, b) {
	
	      parse(a, b);
	
	      // gcd(a / b, c / d) = gcd(a, c) / lcm(b, d)
	
	      return new Fraction(gcd(P["n"], this["n"]), P["d"] * this["d"] / gcd(P["d"], this["d"]));
	    },
	
	    /**
	     * Calculates the fractional lcm of two rational numbers
	     *
	     * Ex: new Fraction(5,8).lcm(3,7) => 15
	     */
	    "lcm": function(a, b) {
	
	      parse(a, b);
	
	      // lcm(a / b, c / d) = lcm(a, c) / gcd(b, d)
	
	      if (P["n"] === 0 && this["n"] === 0) {
	        return new Fraction;
	      }
	      return new Fraction(P["n"] * this["n"] / gcd(P["n"], this["n"]), gcd(P["d"], this["d"]));
	    },
	
	    /**
	     * Calculates the ceil of a rational number
	     *
	     * Ex: new Fraction('4.(3)').ceil() => (5 / 1)
	     **/
	    "ceil": function(places) {
	
	      places = Math.pow(10, places || 0);
	
	      if (isNaN(this["n"]) || isNaN(this["d"])) {
	        return new Fraction(NaN);
	      }
	      return new Fraction(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
	    },
	
	    /**
	     * Calculates the floor of a rational number
	     *
	     * Ex: new Fraction('4.(3)').floor() => (4 / 1)
	     **/
	    "floor": function(places) {
	
	      places = Math.pow(10, places || 0);
	
	      if (isNaN(this["n"]) || isNaN(this["d"])) {
	        return new Fraction(NaN);
	      }
	      return new Fraction(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
	    },
	
	    /**
	     * Rounds a rational numbers
	     *
	     * Ex: new Fraction('4.(3)').round() => (4 / 1)
	     **/
	    "round": function(places) {
	
	      places = Math.pow(10, places || 0);
	
	      if (isNaN(this["n"]) || isNaN(this["d"])) {
	        return new Fraction(NaN);
	      }
	      return new Fraction(Math.round(places * this["s"] * this["n"] / this["d"]), places);
	    },
	
	    /**
	     * Gets the inverse of the fraction, means numerator and denumerator are exchanged
	     *
	     * Ex: new Fraction([-3, 4]).inverse() => -4 / 3
	     **/
	    "inverse": function() {
	
	      return new Fraction(this["s"] * this["d"], this["n"]);
	    },
	
	    /**
	     * Calculates the fraction to some integer exponent
	     *
	     * Ex: new Fraction(-1,2).pow(-3) => -8
	     */
	    "pow": function(m) {
	
	      if (m < 0) {
	        return new Fraction(Math.pow(this['s'] * this["d"],-m), Math.pow(this["n"],-m));
	      } else {
	        return new Fraction(Math.pow(this['s'] * this["n"], m), Math.pow(this["d"], m));
	      }
	    },
	
	    /**
	     * Check if two rational numbers are the same
	     *
	     * Ex: new Fraction(19.6).equals([98, 5]);
	     **/
	    "equals": function(a, b) {
	
	      parse(a, b);
	      return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"]; // Same as compare() === 0
	    },
	
	    /**
	     * Check if two rational numbers are the same
	     *
	     * Ex: new Fraction(19.6).equals([98, 5]);
	     **/
	    "compare": function(a, b) {
	
	      parse(a, b);
	      var t = (this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"]);
	      return (0 < t) - (t < 0);
	    },
	
	    /**
	     * Check if two rational numbers are divisible
	     *
	     * Ex: new Fraction(19.6).divisible(1.5);
	     */
	    "divisible": function(a, b) {
	
	      parse(a, b);
	      return !(!(P["n"] * this["d"]) || ((this["n"] * P["d"]) % (P["n"] * this["d"])));
	    },
	
	    /**
	     * Returns a decimal representation of the fraction
	     *
	     * Ex: new Fraction("100.'91823'").valueOf() => 100.91823918239183
	     **/
	    'valueOf': function() {
	
	      return this["s"] * this["n"] / this["d"];
	    },
	
	    /**
	     * Returns a string-fraction representation of a Fraction object
	     *
	     * Ex: new Fraction("1.'3'").toFraction() => "4 1/3"
	     **/
	    'toFraction': function(excludeWhole) {
	
	      var whole, str = "";
	      var n = this["n"];
	      var d = this["d"];
	      if (this["s"] < 0) {
	        str+= '-';
	      }
	
	      if (d === 1) {
	        str+= n;
	      } else {
	
	        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
	          str+= whole;
	          str+= " ";
	          n%= d;
	        }
	
	        str+= n;
	        str+= '/';
	        str+= d;
	      }
	      return str;
	    },
	
	    /**
	     * Returns a latex representation of a Fraction object
	     *
	     * Ex: new Fraction("1.'3'").toLatex() => "\frac{4}{3}"
	     **/
	    'toLatex': function(excludeWhole) {
	
	      var whole, str = "";
	      var n = this["n"];
	      var d = this["d"];
	      if (this["s"] < 0) {
	        str+= '-';
	      }
	
	      if (d === 1) {
	        str+= n;
	      } else {
	
	        if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
	          str+= whole;
	          n%= d;
	        }
	
	        str+= "\\frac{";
	        str+= n;
	        str+= '}{';
	        str+= d;
	        str+= '}';
	      }
	      return str;
	    },
	
	    /**
	     * Returns an array of continued fraction elements
	     * 
	     * Ex: new Fraction("7/8").toContinued() => [0,1,7]
	     */
	    'toContinued': function() {
	
	      var t;
	      var a = this['n'];
	      var b = this['d'];
	      var res = [];
	
	      do {
	        res.push(Math.floor(a / b));
	        t = a % b;
	        a = b;
	        b = t;
	      } while (a !== 1);
	
	      return res;
	    },
	
	    /**
	     * Creates a string representation of a fraction with all digits
	     *
	     * Ex: new Fraction("100.'91823'").toString() => "100.(91823)"
	     **/
	    'toString': function() {
	
	      var g;
	      var N = this["n"];
	      var D = this["d"];
	
	      if (isNaN(N) || isNaN(D)) {
	        return "NaN";
	      }
	
	      if (!Fraction['REDUCE']) {
	        g = gcd(N, D);
	        N/= g;
	        D/= g;
	      }
	
	      var p = String(N).split(""); // Numerator chars
	      var t = 0; // Tmp var
	
	      var ret = [~this["s"] ? "" : "-", "", ""]; // Return array, [0] is zero sign, [1] before comma, [2] after
	      var zeros = ""; // Collection variable for zeros
	
	      var cycLen = cycleLen(N, D); // Cycle length
	      var cycOff = cycleStart(N, D, cycLen); // Cycle start
	
	      var j = -1;
	      var n = 1; // str index
	
	      // rough estimate to fill zeros
	      var length = 15 + cycLen + cycOff + p.length; // 15 = decimal places when no repitation
	
	      for (var i = 0; i < length; i++, t*= 10) {
	
	        if (i < p.length) {
	          t+= Number(p[i]);
	        } else {
	          n = 2;
	          j++; // Start now => after comma
	        }
	
	        if (cycLen > 0) { // If we have a repeating part
	          if (j === cycOff) {
	            ret[n]+= zeros + "(";
	            zeros = "";
	          } else if (j === cycLen + cycOff) {
	            ret[n]+= zeros + ")";
	            break;
	          }
	        }
	
	        if (t >= D) {
	          ret[n]+= zeros + ((t / D) | 0); // Flush zeros, Add current digit
	          zeros = "";
	          t = t % D;
	        } else if (n > 1) { // Add zeros to the zero buffer
	          zeros+= "0";
	        } else if (ret[n]) { // If before comma, add zero only if already something was added
	          ret[n]+= "0";
	        }
	      }
	
	      // If it's empty, it's a leading zero only
	      ret[0]+= ret[1] || "0";
	
	      // If there is something after the comma, add the comma sign
	      if (ret[2]) {
	        return ret[0] + "." + ret[2];
	      }
	      return ret[0];
	    }
	  };
	
	  if ("function" === "function" && __webpack_require__(56)["amd"]) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return Fraction;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (true) {
	    module["exports"] = Fraction;
	  } else {
	    root['Fraction'] = Fraction;
	  }
	
	})(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(57)(module)))

/***/ },
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = handleAction;
	
	var _fluxStandardAction = __webpack_require__(47);
	
	function isFunction(val) {
	  return typeof val === 'function';
	}
	
	function handleAction(type, reducers) {
	  return function (state, action) {
	    // If action type does not match, return previous state
	    if (action.type !== type) return state;
	
	    var handlerKey = _fluxStandardAction.isError(action) ? 'throw' : 'next';
	
	    // If function is passed instead of map, use as reducer
	    if (isFunction(reducers)) {
	      reducers.next = reducers['throw'] = reducers;
	    }
	
	    // Otherwise, assume an action map was passed
	    var reducer = reducers[handlerKey];
	
	    return isFunction(reducer) ? reducer(state, action) : state;
	  };
	}
	
	module.exports = exports['default'];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _createAction = __webpack_require__(44);
	
	var _createAction2 = _interopRequireDefault(_createAction);
	
	var _handleAction = __webpack_require__(23);
	
	var _handleAction2 = _interopRequireDefault(_handleAction);
	
	var _handleActions = __webpack_require__(45);
	
	var _handleActions2 = _interopRequireDefault(_handleActions);
	
	exports.createAction = _createAction2['default'];
	exports.handleAction = _handleAction2['default'];
	exports.handleActions = _handleActions2['default'];

/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}
	
	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value)) && !isFunction(value);
	}
	
	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8 which returns 'object' for typed array and weak map constructors,
	  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isArguments;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	var assign = __webpack_require__(60);
	
	function createState(state, statePatch) {
		let newState = assign(state, 
		                      statePatch || {}, 
		                      { statePatch: null }, // delete previous state patch
		                      { statePatch: statePatch });
	
		return newState;
	}
	
	module.exports = createState;


/***/ },
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	// EXTERNAL DEPENDECY
	
	const handleActions = __webpack_require__(24).handleActions;
	const { Effects, loop } = __webpack_require__(4);
	
	
	// INTERNAL DEPENDENCY
	
	const API = __webpack_require__(6);
	const createState = __webpack_require__(26);
	const trackMIDINote = __webpack_require__(65); 
	
	// CODE
	
	const reducerMap = {
		START_APP: startApp,
		GRANT_MIDI_ACCESS: grantMIDIAccess,
		LIST_MIDI_INPUTS: updateMIDIInputs,
		UPDATE_MIDI_INPUT: updateMIDIInputs,
		TRACK_MIDI_NOTE: trackMIDINote,
		LOAD_SCORE: loadScore
	};
	
	const reducer = handleActions(reducerMap);
	
	
	// SUB-REDUCERS
	
	function startApp(state, action) {
		return loop(
			state,
			Effects.constant(API.LOAD_SCORE(__webpack_require__(43)))
		);
	}
	
	function grantMIDIAccess(state, action) {
		let statePatch = {};
	
		if (action.error) {
				return state;
		} else {
			let access = action.payload;
	
			statePatch = {
				MIDI: {
					isRequesting: false,
					access: access,
					inputs: access.inputs
				}
			};
	
			return createState(state, statePatch);
		}
	}
	
	function updateMIDIInputs(state, action) {
		let access = state.MIDI.access;
		let statePatch = {
			MIDI: {
				inputs: access.inputs
			}
		};
	
		return createState(state, statePatch);
	}
	
	function trackTimedNote(state, action) {
	
	}
	
	function loadScore(state, action) {
		let scoreDataAndModel = action.payload;
		let statePatch = {
			score: {
				data: scoreDataAndModel.data,
				model: scoreDataAndModel.model
			}
		};
	
		return createState(state, statePatch);
	}
	
	// HELPERS
	
	module.exports = {
		reducerMap: reducerMap,
		reducer: reducer
	};


/***/ },
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */
/***/ function(module, exports) {

	module.exports = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n<mei xmlns:xlink=\"http://www.w3.org/1999/xlink\"\r\n     xmlns=\"http://www.music-encoding.org/ns/mei\"\r\n     meiversion=\"3.0.0\">\r\n   <meiHead>\r\n      <fileDesc>\r\n         <titleStmt>\r\n            <title>Etude in F Minor</title>\r\n            <title type=\"subordinate\">op. 10, no. 9</title>\r\n            <title type=\"subordinate\">an electronic transcriptions</title>\r\n            <respStmt>\r\n               <persName role=\"creator\">Frédéric Chopin</persName>\r\n               <persName role=\"encoder\">Maja Hartwig</persName>\r\n               <persName role=\"encoder\">Kristina Richts</persName>\r\n            </respStmt>\r\n         </titleStmt>\r\n         <pubStmt>\r\n            <respStmt>\r\n               <corpName role=\"publisher\" codedval=\"5115204-6\" authURI=\"http://d-nb.info/gnd\" authority=\"GND\">Musikwissenschaftliches Seminar, Detmold</corpName>\r\n            </respStmt>\r\n            <address>\r\n               <addrLine>Gartenstrasse 20</addrLine>\r\n               <addrLine>32756 <geogName codedval=\"7004442\"\r\n                            authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                            authority=\"TGN\">Detmold</geogName>\r\n               </addrLine>\r\n               <addrLine>\r\n                  <geogName codedval=\"7000084\"\r\n                            authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                            authority=\"TGN\">Germany</geogName>\r\n               </addrLine>\r\n            </address>\r\n            <date>2011</date>\r\n            <availability>\r\n               <useRestrict>This encoding is in the public domain. However, the sources used to\r\n\t\t\t\t\t\tcreate it may be under copyright. We believe their use by the MEI project for\r\n\t\t\t\t\t\teducational and research purposes is covered by the Fair Use doctrine. However, we\r\n\t\t\t\t\t\twill remove any material from the project archive when requested to do so by the\r\n\t\t\t\t\t\tcopyright owner.</useRestrict>\r\n            </availability>\r\n         </pubStmt>\r\n         <seriesStmt>\r\n            <title>MEI Sample Collection</title>\r\n            <respStmt>\r\n               <corpName role=\"publisher\">MEI Project</corpName>\r\n               <corpName role=\"funder\"\r\n                         codedval=\"2007744-0\"\r\n                         authURI=\"http://d-nb.info/gnd\"\r\n                         authority=\"GND\">German Research\r\n\t\t\t\t\t\tFoundation<address>\r\n                     <addrLine>Kennedyallee 40</addrLine>\r\n                     <addrLine>\r\n                        <geogName codedval=\"7005090\"\r\n                                  authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                                  authority=\"TGN\">Bonn</geogName>\r\n                     </addrLine>\r\n                     <addrLine>\r\n                        <geogName codedval=\"7000084\"\r\n                                  authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                                  authority=\"TGN\">Germany</geogName>\r\n                     </addrLine>\r\n                  </address>\r\n               </corpName>\r\n               <corpName role=\"funder\"\r\n                         codedval=\"18183-3\"\r\n                         authURI=\"http://d-nb.info/gnd/18183-3\"\r\n                         authority=\"Deutsche Nationalbibliothek\">National Endowment for the\r\n\t\t\t\t\t\tHumanities<address>\r\n                     <addrLine>1100 Pennsylvania Avenue N.W.</addrLine>\r\n                     <addrLine>\r\n                        <geogName codedval=\"7013962\"\r\n                                  authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                                  authority=\"TGN\">Washington, DC</geogName> 20004</addrLine>\r\n                     <addrLine>\r\n                        <geogName codedval=\"7012149\"\r\n                                  authURI=\"www.getty.edu/research/tools/vocabularies/tgn\"\r\n                                  authority=\"TGN\">United States</geogName>\r\n                     </addrLine>\r\n                  </address>\r\n               </corpName>\r\n            </respStmt>\r\n            <identifier>\r\n               <ref target=\"http://music-encoding.org/Support/MEI_Sample_Collection\"/>\r\n            </identifier>\r\n         </seriesStmt>\r\n         <sourceDesc>\r\n            <source>\r\n               <identifier type=\"URI\">http://javanese.imslp.info/files/imglnks/usimg/3/30/IMSLP00313-Chopin_-_OP10_9.PDF</identifier>\r\n               <identifier type=\"referenceNumber\">op. 10</identifier>\r\n               <titleStmt>\r\n                  <title>Etude No. 9 in F minor</title>\r\n                  <title type=\"uniform\">Etüden, Kl, op. 10,9</title>\r\n                  <respStmt>\r\n                     <persName role=\"composer\"\r\n                               codedval=\"118520539\"\r\n                               authority=\"GND\"\r\n                               authURI=\"http://d-nb.info/gnd\">Frédéric Chopin</persName>\r\n                     <persName role=\"dedicatee\">Franz Liszt</persName>\r\n                     <persName role=\"editor\">Karl Klindworth</persName>\r\n                  </respStmt>\r\n               </titleStmt>\r\n               <pubStmt>\r\n                  <respStmt>\r\n                     <corpName role=\"publisher\">Bote &amp; Bock</corpName>\r\n                  </respStmt>\r\n                  <pubPlace>Berlin</pubPlace>\r\n               </pubStmt>\r\n               <physDesc>\r\n                  <plateNum>12281(a-l)</plateNum>\r\n               </physDesc>\r\n            </source>\r\n            <source>\r\n               <identifier type=\"UIRI\">http://kern.ccarh.org/cgi-bin/ksdata?l=users/craig/classical/chopin/etude&amp;file=etude10-09.krn&amp;f=xml</identifier>\r\n               <titleStmt>\r\n                  <title>Etude in F Minor</title>\r\n               </titleStmt>\r\n               <pubStmt>\r\n                  <date isodate=\"2011-05-12\"/>\r\n                  <respStmt>\r\n                     <corpName role=\"publisher\">CCARH, Stanford University</corpName>\r\n                  </respStmt>\r\n                  <address>\r\n                     <addrLine>Center for Computer Research in Music and Acoustics</addrLine>\r\n                     <addrLine>Department of Music,</addrLine>\r\n                     <addrLine>Stanford University</addrLine>\r\n                     <addrLine>Stanford, California 94305-8180, USA</addrLine>\r\n                  </address>\r\n               </pubStmt>\r\n            </source>\r\n         </sourceDesc>\r\n      </fileDesc>\r\n      <encodingDesc>\r\n         <appInfo>\r\n            <application xml:id=\"xsl_mxl2mei_2.2.3\" version=\"2.2.3\">\r\n               <name>MusicXML2MEI</name>\r\n            </application>\r\n         </appInfo>\r\n      </encodingDesc>\r\n      <workDesc>\r\n         <work>\r\n            <titleStmt>\r\n               <title>Etude in F Minor</title>\r\n               <title type=\"uniform\">Etüden, Kl, op. 10,9</title>\r\n               <respStmt>\r\n                  <persName role=\"composer\"\r\n                            codedval=\"118520539\"\r\n                            authority=\"GND\"\r\n                            authURI=\"http://d-nb.info/gnd\">Frédéric Chopin</persName>\r\n                  <persName role=\"dedicatee\"\r\n                            authority=\"GND\"\r\n                            authURI=\" http://d-nb.info/gnd/\"\r\n                            codedval=\"118573527\">Franz Liszt</persName>\r\n               </respStmt>\r\n            </titleStmt>\r\n            <key pname=\"f\" mode=\"minor\">F Minor</key>\r\n            <meter count=\"6\" unit=\"8\"/>\r\n            <tempo>Allegro molto agitato</tempo>\r\n            <incip>\r\n               <incipCode form=\"parsons\">*uuuuududddudddd</incipCode>\r\n               <score>\r\n                  <scoreDef meter.count=\"6\" meter.unit=\"8\" key.sig=\"4f\" key.mode=\"minor\">\r\n                     <staffGrp symbol=\"brace\" barthru=\"true\">\r\n                        <staffDef n=\"1\" clef.shape=\"G\" lines=\"5\" clef.line=\"2\"/>\r\n                        <staffDef n=\"2\" clef.line=\"4\" clef.shape=\"F\" lines=\"5\"/>\r\n                     </staffGrp>\r\n                  </scoreDef>\r\n                  <section>\r\n                     <measure n=\"1\">\r\n                        <staff n=\"1\">\r\n                           <layer n=\"1\">\r\n                              <rest dur=\"8\"/>\r\n                              <beam>\r\n                                 <note pname=\"f\" oct=\"4\" dur=\"8\" stem.dir=\"up\">\r\n                                    <artic artic=\"stacc\" place=\"below\"/>\r\n                                 </note>\r\n                                 <note pname=\"g\" oct=\"4\" dur=\"8\" stem.dir=\"up\">\r\n                                    <artic artic=\"stacc\" place=\"below\"/>\r\n                                 </note>\r\n                              </beam>\r\n                              <rest dur=\"8\"/>\r\n                              <beam>\r\n                                 <note pname=\"a\" oct=\"4\" dur=\"8\" stem.dir=\"up\" accid.ges=\"f\">\r\n                                    <artic artic=\"stacc\" place=\"below\"/>\r\n                                 </note>\r\n                                 <note pname=\"b\" oct=\"4\" dur=\"8\" stem.dir=\"up\" accid.ges=\"f\">\r\n                                    <artic artic=\"stacc\" place=\"below\"/>\r\n                                 </note>\r\n                              </beam>\r\n                           </layer>\r\n                        </staff>\r\n                        <staff n=\"2\">\r\n                           <layer n=\"1\">\r\n                              <beam>\r\n                                 <note pname=\"f\" oct=\"2\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"a\" oct=\"3\" dur=\"16\" stem.dir=\"down\" accid.ges=\"f\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"b\" oct=\"3\" dur=\"16\" stem.dir=\"down\" accid.ges=\"f\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                              </beam>\r\n                              <beam>\r\n                                 <note pname=\"f\" oct=\"2\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"c\" oct=\"4\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                                 <note pname=\"d\" oct=\"4\" dur=\"16\" stem.dir=\"down\" accid.ges=\"f\"/>\r\n                                 <note pname=\"c\" oct=\"3\" dur=\"16\" stem.dir=\"down\"/>\r\n                              </beam>\r\n                           </layer>\r\n                        </staff>\r\n                        <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                        <dir staff=\"2\" place=\"below\" tstamp=\"1\">legatissimo</dir>\r\n                        <dir staff=\"1\" place=\"above\" tstamp=\"1\">Allegro molto agitato.</dir>\r\n                        <slur staff=\"1\" curvedir=\"below\" tstamp=\"2\" tstamp2=\"0m+3\"/>\r\n                        <slur staff=\"1\" curvedir=\"below\" tstamp=\"5\" tstamp2=\"0m+6\"/>\r\n                        <slur staff=\"2\" curvedir=\"above\" tstamp=\"0.5\" tstamp2=\"0m+3.5\"/>\r\n                        <slur staff=\"2\" curvedir=\"above\" tstamp=\"4\" tstamp2=\"0m+6.5\"/>\r\n                     </measure>\r\n                  </section>\r\n               </score>\r\n            </incip>\r\n           <creation>\r\n             <date notbefore=\"1829\" notafter=\"1832\"/>\r\n           </creation>\r\n           <history>\r\n               <eventList>\r\n                  <event>\r\n                     <p>First publication<date>1833</date>\r\n                     </p>\r\n                  </event>\r\n               </eventList>\r\n            </history>\r\n            <perfMedium>\r\n               <perfResList>\r\n                  <perfRes n=\"1\" codedval=\"ka\">Piano</perfRes>\r\n               </perfResList>\r\n            </perfMedium>\r\n            <classification>\r\n               <termList>\r\n                  <term classcode=\"#OCLC_DDC\">\r\n                     <identifier>786</identifier>\r\n                     <title>Keyboard &amp; other instruments</title>\r\n                  </term>\r\n                  <term classcode=\"#OSWD\">\r\n                     <identifier>4129951-6</identifier>\r\n                     <title>Instrumentalmusik</title>\r\n                  </term>\r\n                  <term classcode=\"#OSWD\">\r\n                     <identifier>4462339-2</identifier>\r\n                     <title>Tasteninstrumentenmusik</title>\r\n                  </term>\r\n                  <term classcode=\"#OSWD\">\r\n                     <identifier>4030993-9</identifier>\r\n                     <title>Klaviermusik</title>\r\n                  </term>\r\n                  <term classcode=\"#OSWD\">\r\n                     <identifier>4123166-1</identifier>\r\n                     <title>Etüde</title>\r\n                  </term>\r\n               </termList>\r\n               <classCode xml:id=\"OCLC_DDC\"\r\n                          authority=\"OCLC\"\r\n                          authURI=\"http://www.oclc.org/dewey/resources/summaries/default.htm#700\"/>\r\n               <classCode xml:id=\"OSWD\"\r\n                          authURI=\"#BSZ\"\r\n                          authority=\"http://www.bsz-bw.de/cgi-bin/oswd-suche.pl\"/>\r\n            </classification>\r\n         </work>\r\n      </workDesc>\r\n      <revisionDesc>\r\n         <change n=\"1\">\r\n            <respStmt/>\r\n            <changeDesc>\r\n               <p>The original was transcoded from a Humdrum file and validated using Finale 2003\r\n\t\t\t\t\t\tfor Windows.</p>\r\n            </changeDesc>\r\n            <date notbefore=\"2003-12-24\" notafter=\"2004\"/>\r\n         </change>\r\n         <change n=\"2\">\r\n            <respStmt>\r\n               <persName xml:id=\"MH\"> Maja Hartwig </persName>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p>Transcoded from a MusicXML version 0.6a file on 2011-05-12 using the <ref target=\"#xsl_mxl2mei_2.2.3\">musicxml2mei</ref> stylesheet. </p>\r\n            </changeDesc>\r\n            <date isodate=\"2011-05-12\"/>\r\n         </change>\r\n         <change n=\"3\">\r\n            <respStmt>\r\n               <persName xml:id=\"KR\"> Kristina Richts </persName>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p> Cleaned up MEI file automatically using <ref target=\"#xsl_ppq\">ppq.xsl</ref>.\r\n\t\t\t\t\t</p>\r\n            </changeDesc>\r\n            <date isodate=\"2011-10-22\"/>\r\n         </change>\r\n         <change n=\"4\">\r\n            <respStmt>\r\n               <persName resp=\"#MH\"/>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p>Addition of slurs, dynam, hairpins, artic</p>\r\n            </changeDesc>\r\n            <date>2011-11-08</date>\r\n         </change>\r\n         <change n=\"5\">\r\n            <respStmt>\r\n               <persName>Thomas Weber</persName>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p>Corrected @dur of all grace notes</p>\r\n            </changeDesc>\r\n            <date>2011-11-22</date>\r\n         </change>\r\n         <change n=\"6\">\r\n            <respStmt>\r\n               <persName resp=\"#KR\"/>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p> Cleaned up MEI file automatically using <ref target=\"#xsl_header\">Header.xsl</ref>. </p>\r\n            </changeDesc>\r\n            <date isodate=\"2011-12-06\"/>\r\n         </change>\r\n         <change n=\"7\">\r\n            <respStmt>\r\n               <persName>Kristina Richts</persName>\r\n            </respStmt>\r\n            <changeDesc>\r\n               <p>added metadata</p>\r\n            </changeDesc>\r\n            <date isodate=\"2013-01-22\"/>\r\n         </change>\r\n         <change n=\"8\">\r\n            <respStmt/>\r\n            <changeDesc>\r\n               <p>Converted to MEI 2013 using mei2012To2013.xsl, version 1.0 beta</p>\r\n            </changeDesc>\r\n            <date isodate=\"2014-06-02\"/>\r\n         </change>\r\n         <change n=\"9\">\r\n            <respStmt/>\r\n            <changeDesc>\r\n               <p>Converted to version 3.0.0 using mei21To30.xsl, version\r\n                  1.0 beta</p>\r\n            </changeDesc>\r\n            <date isodate=\"2015-10-15\"/>\r\n         </change>\r\n      </revisionDesc>\r\n   </meiHead>\r\n   <music>\r\n      <body>\r\n         <mdiv>\r\n            <score>\r\n               <scoreDef meter.count=\"6\" meter.unit=\"8\" key.sig=\"4f\" key.mode=\"minor\">\r\n                  <staffGrp symbol=\"brace\" barthru=\"true\">\r\n                     <staffDef n=\"1\" clef.shape=\"G\" lines=\"5\" clef.line=\"2\"/>\r\n                     <staffDef n=\"2\" clef.line=\"4\" clef.shape=\"F\" lines=\"5\"/>\r\n                  </staffGrp>\r\n               </scoreDef>\r\n               <section>\r\n                  <measure n=\"1\" xml:id=\"d414233e9\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e30\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e38\" pname=\"f\" oct=\"4\" dur=\"8\" stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"below\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e62\" pname=\"g\" oct=\"4\" dur=\"8\" stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"below\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e81\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e89\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"below\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e110\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"below\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e148\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e166\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e184\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e204\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e222\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e242\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e260\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e279\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e297\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e315\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e333\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e353\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                     <dir staff=\"2\" place=\"below\" tstamp=\"1\">legatissimo</dir>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"1\">Allegro molto agitato.</dir>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"below\"\r\n                           startid=\"#d414233e38\"\r\n                           endid=\"#d414233e62\"\r\n                           tstamp=\"2\"/>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"below\"\r\n                           startid=\"#d414233e89\"\r\n                           endid=\"#d414233e110\"/>\r\n                     <slur staff=\"2\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414233e148\"\r\n                           endid=\"#d414233e242\"/>\r\n                     <slur staff=\"2\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414233e260\"\r\n                           endid=\"#d414233e353\"/>\r\n                  </measure>\r\n                  <measure n=\"2\" xml:id=\"d414233e371\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e373\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e381\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e400\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e421\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e445\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e466\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e486\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"i1\"/>\r\n                              <note xml:id=\"d414233e504\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e522\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e540\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e558\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e578\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"t1\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e596\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"i2\"/>\r\n                              <note xml:id=\"d414233e614\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e632\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e652\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e670\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e691\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    slur=\"t2\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">cresc.</dir>\r\n                     <hairpin form=\"cres\" staff=\"1\" tstamp=\"3\" place=\"below\" tstamp2=\"4\"/>\r\n                     <slur staff=\"1\"\r\n                           startid=\"#d414233e381\"\r\n                           endid=\"#d414233e1055\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"3\" xml:id=\"d414233e709\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e711\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e730\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e749\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e770\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e789\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e810\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e830\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e848\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e866\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e886\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e904\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e924\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e942\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e960\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e978\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e998\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1016\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1035\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">con forza</dir>\r\n                  </measure>\r\n                  <measure n=\"4\" xml:id=\"d414233e1053\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e1055\"\r\n                                 pname=\"c\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"marc\"/>\r\n                           </note>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1071\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1089\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1107\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1125\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1143\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1163\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1181\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1199\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1217\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1237\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1255\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1274\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"5\" xml:id=\"d414233e1292\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e1294\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1302\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1321\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e1340\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1348\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1369\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1391\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1409\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1427\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1447\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1465\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1485\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1503\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1521\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1539\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1557\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1575\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1596\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"below\" tstamp=\"4\">\r\n                        <rend fontstyle=\"italic\">segue</rend>\r\n                     </dir>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                  </measure>\r\n                  <measure n=\"6\" xml:id=\"d414233e1614\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e1616\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1624\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1648\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1669\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1688\"\r\n                                    pname=\"c\"\r\n                                    oct=\"6\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1707\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1729\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1747\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1765\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1783\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1801\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1821\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1839\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1857\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1875\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e1895\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1913\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e1932\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"2\" tstamp2=\"4\"/>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414233e1624\"\r\n                           endid=\"#d414233e2333\"/>\r\n                  </measure>\r\n                  <measure n=\"7\" xml:id=\"d414233e1950\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e1952\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1971\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e1990\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2011\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2030\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2054\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2074\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2092\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2110\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2130\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2148\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2166\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2184\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2202\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2220\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2240\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2258\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2277\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">f</dynam>\r\n                  </measure>\r\n                  <measure n=\"8\" xml:id=\"d414233e2295\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2297\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e2315\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e2333\"\r\n                                 pname=\"a\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <rest xml:id=\"d414233e2352\" dur=\"8\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2361\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2379\"\r\n                                    pname=\"b\"\r\n                                    accid=\"n\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2399\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2419\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2437\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2457\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2475\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2493\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2511\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2531\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2549\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2570\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\"\r\n                              staff=\"1\"\r\n                              place=\"above\"\r\n                              tstamp=\"0.5\"\r\n                              tstamp2=\"3\"/>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"2\" tstamp2=\"5\"/>\r\n                     <dir tstamp=\"5\" staff=\"2\" place=\"above\">cresc.</dir>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"2\">ritard.</dir>\r\n                  </measure>\r\n                  <measure n=\"9\" xml:id=\"d414233e2588\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e2590\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2598\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2617\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e2636\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2644\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2665\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2687\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2705\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2723\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2743\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2761\"\r\n                                    pname=\"b\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e2783\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2801\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2819\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2837\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2855\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e2873\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e2894\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"1\">a tempo</dir>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">sotto voce</dir>\r\n                     <dir staff=\"2\" place=\"below\" tstamp=\"1\">sempre legatissimo</dir>\r\n                  </measure>\r\n                  <measure n=\"10\" xml:id=\"d414233e2912\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e2914\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2922\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2946\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e2967\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e2986\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3007\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3027\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3045\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3063\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3081\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3099\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3119\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3137\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3155\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3173\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3193\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3211\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3232\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"2\" tstamp2=\"5\"/>\r\n                     <slur startid=\"#d414233e2922\"\r\n                           endid=\"#d414233e3597\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"11\" xml:id=\"d414233e3251\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3253\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3272\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3291\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3312\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3331\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3352\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3372\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3390\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3408\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3428\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3446\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3466\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3484\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3502\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3520\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3540\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3558\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3577\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"12\" xml:id=\"d414233e3595\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e3597\"\r\n                                 pname=\"c\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"marc\"/>\r\n                           </note>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3613\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3631\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3649\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3667\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3685\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3705\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3723\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3741\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3759\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3779\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3797\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3816\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">sempre sotto voce</dir>\r\n                  </measure>\r\n                  <measure n=\"13\" xml:id=\"d414233e3834\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e3836\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3844\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3863\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e3882\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3890\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e3911\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e3933\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3951\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e3969\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e3989\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4007\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4027\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4045\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4063\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4081\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4099\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4117\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4138\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"14\" xml:id=\"d414233e4156\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e4158\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4166\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4190\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4211\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4230\"\r\n                                    pname=\"c\"\r\n                                    oct=\"6\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4249\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4271\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4289\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4307\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4325\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4343\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4363\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4381\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4399\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4417\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4437\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4455\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4474\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"2\" tstamp2=\"5\"/>\r\n                     <slur startid=\"#d414233e4166\"\r\n                           endid=\"#d414233e4834\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"15\" xml:id=\"d414233e4492\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4494\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4513\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4532\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4553\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4572\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e4591\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4611\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4629\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4647\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4667\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4685\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4703\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4721\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4739\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4757\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4777\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4795\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4814\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"16\" xml:id=\"d414233e4832\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e4834\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"acc\"/>\r\n                           </note>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4850\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4868\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4886\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e4906\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4924\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4942\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e4960\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4978\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e4996\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5016\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5034\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5053\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"17\" xml:id=\"d414233e5071\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e5073\"\r\n                                 pname=\"a\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\"/>\r\n                           <note xml:id=\"d414233e5095\"\r\n                                 grace=\"unacc\"\r\n                                 pname=\"b\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5110\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5128\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e5145\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5166\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5184\"\r\n                                    pname=\"d\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5204\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5224\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5242\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5262\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5280\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5298\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5318\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5338\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5358\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5379\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\"\r\n                              staff=\"1\"\r\n                              place=\"below\"\r\n                              tstamp=\"1.5\"\r\n                              tstamp2=\"4\"/>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                     <slur startid=\"#d414233e5073\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           endid=\"#d414233e6048\"/>\r\n                  </measure>\r\n                  <measure n=\"18\" xml:id=\"d414233e5399\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e5401\"\r\n                                 pname=\"b\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"\r\n                                 accid.ges=\"f\"/>\r\n                           <note xml:id=\"d414233e5418\"\r\n                                 pname=\"c\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5434\"\r\n                                    pname=\"e\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5454\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5474\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e5496\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5516\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5536\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5556\"\r\n                                    pname=\"e\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5576\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5596\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5616\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5636\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5657\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">piu cresc.</dir>\r\n                  </measure>\r\n                  <measure n=\"19\" xml:id=\"d414233e5677\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5679\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e5705\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e5726\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5747\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e5768\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e5787\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5809\"\r\n                                    pname=\"d\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5829\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5849\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5867\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5887\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5907\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e5927\"\r\n                                    pname=\"d\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5947\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e5967\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e5985\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6005\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6026\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">f</dynam>\r\n                  </measure>\r\n                  <measure n=\"20\" xml:id=\"d414233e6046\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e6048\"\r\n                                 pname=\"a\"\r\n                                 oct=\"3\"\r\n                                 dur=\"4\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <rest xml:id=\"d414233e6067\" dur=\"8\"/>\r\n                           <rest xml:id=\"d414233e6075\" dur=\"4\"/>\r\n                           <note xml:id=\"d414233e6083\"\r\n                                 pname=\"e\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\"\r\n                                 slur=\"i1\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6105\"\r\n                                    pname=\"c\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e6123\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6143\"\r\n                                    pname=\"e\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6163\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6183\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6203\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6223\"\r\n                                    pname=\"c\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e6241\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6261\"\r\n                                    pname=\"e\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6281\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6301\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6322\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"above\" tstamp=\"1\">fz</dynam>\r\n                  </measure>\r\n                  <measure n=\"21\" xml:id=\"d414233e6342\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e6344\"\r\n                                 pname=\"e\"\r\n                                 slur=\"t1\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"\r\n                                 accid.ges=\"f\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6361\"\r\n                                    grace=\"unacc\"\r\n                                    pname=\"e\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6380\"\r\n                                    grace=\"unacc\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6397\"\r\n                                    pname=\"e\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6415\"\r\n                                    pname=\"d\"\r\n                                    accid=\"n\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e6433\"\r\n                                    pname=\"e\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6452\"\r\n                                    pname=\"c\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n\r\n                                    slur=\"i1\"/>\r\n                              <note xml:id=\"d414233e6474\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e6496\"\r\n                                    pname=\"e\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e6516\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e6536\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m1\"/>\r\n                              <note xml:id=\"d414233e6556\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t1\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6576\"\r\n                                    pname=\"c\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i2\"/>\r\n                              <note xml:id=\"d414233e6596\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e6616\"\r\n                                    pname=\"e\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e6636\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e6656\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m2\"/>\r\n                              <note xml:id=\"d414233e6677\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t2\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"1\" tstamp2=\"5\"/>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                  </measure>\r\n                  <measure n=\"22\" xml:id=\"d414233e6698\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e6700\"\r\n                                 pname=\"f\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"/>\r\n                           <note xml:id=\"d414233e6715\"\r\n                                 pname=\"g\"\r\n                                 accid=\"f\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 tie=\"i\"\r\n                                 stem.dir=\"down\"\r\n>\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6741\"\r\n                                    pname=\"c\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e6763\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6783\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6803\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6823\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6843\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6863\"\r\n                                    pname=\"b\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6883\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e6905\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6925\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6945\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e6966\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"4\">cresc.</dir>\r\n                     <tie tstamp=\"2.25\"\r\n                          staff=\"1\"\r\n                          curvedir=\"above\"\r\n                          startid=\"#d414233e6715\"\r\n                          endid=\"#d414233e6988\"/>\r\n                  </measure>\r\n                  <measure n=\"23\" xml:id=\"d414233e6986\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e6988\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    tie=\"t\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e7011\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7032\"\r\n                                    pname=\"e\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7053\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7074\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7095\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7117\"\r\n                                    pname=\"b\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7137\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e7159\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7179\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7199\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7219\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7239\"\r\n                                    pname=\"b\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7259\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7279\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7299\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7319\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7340\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir tstamp=\"4\" staff=\"2\" place=\"above\">sempre</dir>\r\n                     <slur staff=\"1\"\r\n                           startid=\"#d414233e7011\"\r\n                           endid=\"#d414233e7362\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"24\" xml:id=\"d414233e7360\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e7362\"\r\n                                 pname=\"d\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                           </note>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7381\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7402\"\r\n                                    pname=\"e\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7423\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7444\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e7465\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n>\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7489\"\r\n                                    pname=\"a\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7509\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e7527\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7547\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e7565\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e7583\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7601\"\r\n                                    pname=\"a\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7621\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e7643\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7663\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7683\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7704\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"1\">stretto e piu</dir>\r\n                     <slur staff=\"1\"\r\n                           startid=\"#d414233e7381\"\r\n                           endid=\"#d414233e7726\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"25\" xml:id=\"d414233e7724\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e7726\"\r\n                                 pname=\"d\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                           </note>\r\n                           <chord xml:id=\"d414548e1\" dur=\"8\" stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e7750\" pname=\"d\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7769\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414552e1\" dur=\"8\" stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e7789\" pname=\"e\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7808\" pname=\"e\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e7828\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414556e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e7836\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"4\"\r\n/>\r\n                              <note xml:id=\"d414233e7857\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414560e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e7879\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"4\"\r\n/>\r\n                              <note xml:id=\"d414233e7900\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e7923\"\r\n                                    pname=\"a\"\r\n                                    accid=\"n\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e7943\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e7965\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e7985\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8005\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8025\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e8045\"\r\n                                    pname=\"b\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8065\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8083\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8103\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8121\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8140\"\r\n                                    pname=\"a\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">f</dynam>\r\n                  </measure>\r\n                  <measure n=\"26\" xml:id=\"d414233e8158\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e8160\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414577e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e8168\" pname=\"g\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e8187\" pname=\"g\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414581e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e8207\" pname=\"a\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e8226\" pname=\"a\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e8246\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414585e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e8254\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8273\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414589e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e8293\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e8310\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e8329\"\r\n                                    pname=\"b\"\r\n                                    accid=\"n\"\r\n                                    oct=\"1\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8349\"\r\n                                    pname=\"g\"\r\n                                    accid=\"n\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8369\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8389\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8407\"\r\n                                    pname=\"g\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8427\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e8445\"\r\n                                    pname=\"c\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8463\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8481\"\r\n                                    pname=\"e\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8499\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8517\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e8536\"\r\n                                    pname=\"g\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"3\">accelerando e</dir>\r\n                  </measure>\r\n                  <measure n=\"27\" xml:id=\"d414233e8554\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d414606e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8556\" pname=\"d\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8577\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414610e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8594\" pname=\"e\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8610\" pname=\"e\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414614e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8627\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"4\"\r\n/>\r\n                              <note xml:id=\"d414233e8645\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414618e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8664\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"4\"\r\n/>\r\n                              <note xml:id=\"d414233e8682\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414622e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8701\" pname=\"g\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e8717\" pname=\"g\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414626e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e8734\" pname=\"a\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e8751\" pname=\"a\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e8769\"\r\n                                    pname=\"f\"\r\n                                    accid=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e8791\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8811\"\r\n                                    pname=\"b\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e8833\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8853\"\r\n                                    pname=\"g\"\r\n                                    accid=\"n\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e8873\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e8893\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8913\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8933\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8953\"\r\n                                    pname=\"g\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e8973\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e8994\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <octave staff=\"1\"\r\n                             dis=\"8\"\r\n                             tstamp=\"1\"\r\n                             dis.place=\"above\"\r\n                             startid=\"#d414606e1\"\r\n                             endid=\"#d414651e1\"/>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">piu cresc.</dir>\r\n                  </measure>\r\n                  <measure n=\"28\" xml:id=\"d414233e9012\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d414643e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e9014\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9035\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414647e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e9052\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e9066\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414651e1\" dur=\"4\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e9081\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9097\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e9114\" dur=\"4\"/>\r\n                           <rest xml:id=\"d414233e9122\" dur=\"8\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9131\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9151\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9171\"\r\n                                    pname=\"g\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9191\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9211\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9231\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <clef shape=\"G\" line=\"2\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9257\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9277\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9297\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9317\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9338\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9358\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <clef shape=\"F\" line=\"4\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"1\">ff</dynam>\r\n                  </measure>\r\n                  <measure n=\"29\" xml:id=\"d414233e9384\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <chord xml:id=\"d414668e1\" dur=\"8\" stem.dir=\"down\" slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <note xml:id=\"d414233e9386\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                                 <note xml:id=\"d414233e9410\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                              </chord>\r\n                              <chord xml:id=\"d414672e1\" dur=\"8\" stem.dir=\"down\" slur=\"m1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <note xml:id=\"d414233e9430\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                                 <note xml:id=\"d414233e9449\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                              </chord>\r\n                              <chord xml:id=\"d414676e1\" dur=\"8\" stem.dir=\"down\" slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                                 <note xml:id=\"d414233e9469\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                                 <note xml:id=\"d414233e9488\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                              </chord>\r\n                           </beam>\r\n                           <chord xml:id=\"d414680e1\"\r\n                                  dur=\"4\"\r\n                                  stem.dir=\"down\"\r\n                                  slur=\"i2\"\r\n                                  artic=\"acc\">\r\n                              <note xml:id=\"d414233e9508\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9529\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414684e1\" dur=\"8\" stem.dir=\"down\" slur=\"t2\">\r\n                              <note xml:id=\"d414233e9546\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e9560\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9576\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9594\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9614\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9632\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9652\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9672\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9692\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9710\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9728\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9748\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9766\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9785\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">f</dynam>\r\n                     <dir staff=\"2\" place=\"below\" tstamp=\"1\">sempre legato</dir>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414668e1\"\r\n                           endid=\"#d414676e1\"\r\n                           tstamp=\"1\"/>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414680e1\"\r\n                           endid=\"#d414684e1\"\r\n                           tstamp=\"4\"/>\r\n                  </measure>\r\n                  <measure n=\"30\" xml:id=\"d414233e9803\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9805\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e9831\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"m1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e9852\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e9873\"\r\n                                 pname=\"d\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 stem.dir=\"down\"\r\n                                 accid.ges=\"f\"\r\n                                 slur=\"i2\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <note xml:id=\"d414233e9892\"\r\n                                 pname=\"c\"\r\n                                 oct=\"5\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"down\"\r\n                                 slur=\"t2\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e9907\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9925\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9945\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e9963\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e9983\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10003\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10023\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10041\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10059\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10079\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10097\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10116\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">pp</dynam>\r\n                     <slur tstamp=\"1\"\r\n                           staff=\"1\"\r\n                           startid=\"#d414233e9805\"\r\n                           endid=\"#d414233e9852\"\r\n                           curvedir=\"above\"/>\r\n                     <slur startid=\"#d414233e9873\"\r\n                           endid=\"#d414233e9892\"\r\n                           curvedir=\"above\"\r\n                           staff=\"1\"/>\r\n                  </measure>\r\n                  <measure n=\"31\" xml:id=\"d414233e10134\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d414714e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10136\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10160\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414718e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10180\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10199\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414722e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10219\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10238\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414726e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e10258\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e10273\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10290\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10308\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10326\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10346\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10364\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10382\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10400\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10418\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10436\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10456\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10474\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10493\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">f</dynam>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"2\">stretto</dir>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           tstamp=\"1\"\r\n                           startid=\"#d414714e1\"\r\n                           endid=\"#d414726e1\"/>\r\n                  </measure>\r\n                  <measure n=\"32\" xml:id=\"d414233e10511\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10513\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10536\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10554\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e10572\"\r\n                                 pname=\"c\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10588\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10606\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10624\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10644\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10662\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10680\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e10698\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10716\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10734\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10754\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10772\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e10791\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">pp</dynam>\r\n                     <slur startid=\"#d414233e10513\"\r\n                           endid=\"#d414233e10554\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           tstamp=\"1\"/>\r\n                  </measure>\r\n                  <measure n=\"33\" xml:id=\"d414233e10810\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d414756e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10812\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10837\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414760e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10858\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10878\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414764e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10899\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10919\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414768e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10940\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e10960\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414772e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e10981\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11001\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414776e1\" dur=\"4\" stem.dir=\"down\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e11022\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11042\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414780e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11062\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e11076\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11092\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11110\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11130\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11148\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11168\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11188\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11208\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11226\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11244\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11264\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11282\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11301\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <octave staff=\"1\"\r\n                             dis=\"8\"\r\n                             startid=\"#d414756e1\"\r\n                             endid=\"#d414768e1\"\r\n                             dis.place=\"above\"/>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"1\">appassionato</dir>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"1\">f</dynam>\r\n                     <tupletSpan staff=\"1\"\r\n                                 startid=\"#d414756e1\"\r\n                                 endid=\"#d414772e1\"\r\n                                 bracket.visible=\"false\"\r\n                                 num=\"5\"\r\n                                 num.place=\"above\"\r\n                                 num.visible=\"true\"/>\r\n                     <slur startid=\"#d414776e1\"\r\n                           endid=\"#d414780e1\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           tstamp=\"3\"/>\r\n                  </measure>\r\n                  <measure n=\"34\" xml:id=\"d414233e11319\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11321\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e11348\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e11370\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e11392\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e11414\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e11436\"\r\n                                 pname=\"d\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 stem.dir=\"down\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <note xml:id=\"d414233e11455\"\r\n                                 pname=\"c\"\r\n                                 oct=\"5\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"down\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11470\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11488\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11508\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11526\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11546\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11566\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11586\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11604\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11622\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11642\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11660\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11679\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"1\">pp</dynam>\r\n                     <tupletSpan staff=\"1\"\r\n                                 num=\"5\"\r\n                                 startid=\"#d414233e11321\"\r\n                                 endid=\"#d414233e11392\"\r\n                                 num.visible=\"true\"/>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           tstamp=\"3\"\r\n                           startid=\"#d414233e11436\"\r\n                           endid=\"#d414233e11455\"/>\r\n                  </measure>\r\n                  <measure n=\"35\" xml:id=\"d414233e11697\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d414810e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11699\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11721\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414814e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11739\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e11754\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414818e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11770\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11787\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414822e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11805\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11822\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414826e1\" dur=\"32\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11840\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11857\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414830e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e11875\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e11891\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e11908\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11926\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11944\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e11964\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e11982\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12000\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12018\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12036\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12054\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12074\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12092\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12111\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"above\" tstamp=\"1\">f</dynam>\r\n                     <tupletSpan staff=\"1\"\r\n                                 num.visible=\"true\"\r\n                                 num=\"5\"\r\n                                 startid=\"#d414810e1\"\r\n                                 endid=\"#d414830e1\"\r\n                                 bracket.visible=\"false\"/>\r\n                  </measure>\r\n                  <measure n=\"36\" xml:id=\"d414233e12129\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12131\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12155\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12172\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12191\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12210\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"32\"\r\n                                    dots=\"1\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e12229\"\r\n                                 pname=\"c\"\r\n                                 oct=\"5\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"down\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12245\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12263\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12281\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12301\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12319\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12337\"\r\n                                    pname=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12355\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12373\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12391\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12411\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12429\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12448\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"1.5\">poco rallent.</dir>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">pp</dynam>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414233e12131\"\r\n                           endid=\"#d414233e12229\"/>\r\n                     <tupletSpan staff=\"1\"\r\n                                 startid=\"#d414233e12131\"\r\n                                 endid=\"#d414233e12210\"\r\n                                 tstamp=\"1\"\r\n                                 num=\"5\"\r\n                                 num.visible=\"true\"\r\n                                 num.place=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"37\" xml:id=\"d414233e12466\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e12468\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12476\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"i1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e12500\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    slur=\"t1\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e12519\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12527\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"i2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e12548\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\"\r\n                                    slur=\"t2\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12570\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12588\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12606\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12626\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12644\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12664\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12682\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12700\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12718\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12736\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12754\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12775\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"1\">a tempo, sempre agitato</dir>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">p</dynam>\r\n                  </measure>\r\n                  <measure n=\"38\" xml:id=\"d414233e12793\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e12795\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12803\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e12827\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12845\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e12864\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e12885\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e12905\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12923\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12941\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12959\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e12977\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e12997\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13015\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13033\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13051\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13071\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13089\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13110\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" place=\"above\" staff=\"2\" tstamp=\"2\" tstamp2=\"5\"/>\r\n                     <slur staff=\"1\"\r\n                           curvedir=\"above\"\r\n                           startid=\"#d414233e12803\"\r\n                           endid=\"#d414233e13471\"/>\r\n                  </measure>\r\n                  <measure n=\"39\" xml:id=\"d414233e13128\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13130\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13149\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13168\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13186\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13205\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13226\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13246\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13264\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13282\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13302\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13320\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13340\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13358\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13376\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13394\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13414\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13432\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13451\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"40\" xml:id=\"d414233e13469\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e13471\"\r\n                                 pname=\"c\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"marc\" place=\"above\"/>\r\n                           </note>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13487\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13505\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13523\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13541\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13559\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13579\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13597\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13615\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13633\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13653\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13671\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13690\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"41\" xml:id=\"d414233e13708\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e13710\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13718\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13737\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <rest xml:id=\"d414233e13756\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13764\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e13785\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13807\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13825\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13843\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13863\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13881\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e13901\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e13919\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13937\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13955\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13973\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e13991\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14012\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"42\" xml:id=\"d414233e14030\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e14032\" dur=\"8\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14040\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14064\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14085\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14104\"\r\n                                    pname=\"c\"\r\n                                    oct=\"6\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14123\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14145\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14163\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14181\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14199\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14217\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14237\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14255\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14273\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14291\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14311\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14329\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14348\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" place=\"below\" staff=\"1\" tstamp=\"2\" tstamp2=\"5\"/>\r\n                     <slur startid=\"#d414233e14040\"\r\n                           endid=\"#d414233e14427\"\r\n                           curvedir=\"above\"\r\n                           staff=\"1\"/>\r\n                  </measure>\r\n                  <measure n=\"43\" xml:id=\"d414233e14366\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14368\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14387\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14406\"\r\n                                    pname=\"d\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14427\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14446\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e14465\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14485\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14503\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14521\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14541\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14559\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14577\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14595\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14613\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14631\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14651\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14669\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14688\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"above\" tstamp=\"5\" tstamp2=\"2\"/>\r\n                  </measure>\r\n                  <measure n=\"44\" xml:id=\"d414233e14707\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14709\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e14732\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e14750\"\r\n                                 pname=\"a\"\r\n                                 oct=\"4\"\r\n                                 dur=\"2\"\r\n                                 stem.dir=\"up\"\r\n                                 accid.ges=\"f\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <rest xml:id=\"d414233e14766\" dur=\"8\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14775\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14793\"\r\n                                    pname=\"b\"\r\n                                    accid=\"n\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14813\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14833\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14851\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14871\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e14889\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14907\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14925\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14945\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e14963\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e14984\"\r\n                                    pname=\"b\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"2\" place=\"above\" tstamp=\"4\" tstamp2=\"3\"/>\r\n                     <dir place=\"above\" staff=\"2\" tstamp=\"4\">cresc.</dir>\r\n                  </measure>\r\n                  <measure n=\"45\" xml:id=\"d414233e15002\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e15004\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414964e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15012\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e15034\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414968e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15052\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e15069\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e15087\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414972e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15095\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15114\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414976e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15134\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15153\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e15174\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15192\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15210\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15230\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15248\"\r\n                                    pname=\"b\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e15270\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e15288\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15306\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15324\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15342\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15360\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15381\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"above\" tstamp=\"1\">con forza</dir>\r\n                  </measure>\r\n                  <measure n=\"46\" xml:id=\"d414233e15399\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e15401\" dur=\"8\"/>\r\n                           <chord xml:id=\"d414993e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15409\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15431\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d414997e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15449\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15468\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415001e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15488\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15505\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415005e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15523\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15542\" pname=\"a\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415009e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15562\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15579\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e15598\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15616\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15634\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15652\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15670\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15690\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e15708\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15726\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15744\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15764\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e15782\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15803\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"2\" place=\"above\" tstamp=\"2\" tstamp2=\"6\"/>\r\n                     <slur startid=\"#d414993e1\"\r\n                           endid=\"#d415063e1\"\r\n                           staff=\"1\"\r\n                           curvedir=\"above\"/>\r\n                  </measure>\r\n                  <measure n=\"47\" xml:id=\"d414233e15821\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415026e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15823\" pname=\"f\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15840\" pname=\"f\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415030e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15858\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15880\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415034e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15898\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15917\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415038e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15937\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e15954\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415042e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e15972\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e15991\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415046e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16011\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e16029\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16048\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16066\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16084\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16104\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16122\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16142\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16160\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16178\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16196\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16216\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16234\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16253\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"48\" xml:id=\"d414233e16271\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415063e1\" dur=\"2\" dots=\"1\" stem.dir=\"up\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16273\" pname=\"c\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e16288\" pname=\"c\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16305\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16323\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16341\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16359\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16377\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16397\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16415\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16433\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16451\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16471\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16489\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16508\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam place=\"above\" staff=\"1\" tstamp=\"1\">fz</dynam>\r\n                  </measure>\r\n                  <measure n=\"49\" xml:id=\"d414233e16526\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e16528\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415080e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16536\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e16558\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415084e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16576\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e16593\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e16611\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415088e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16619\" pname=\"a\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e16638\" pname=\"a\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415092e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e16658\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16677\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16698\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16716\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16734\"\r\n                                    pname=\"a\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16754\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16772\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16792\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e16810\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16828\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16846\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16864\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e16882\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16903\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\"\r\n                              staff=\"1\"\r\n                              place=\"below\"\r\n                              startid=\"#d415080e1\"\r\n                              endid=\"#d415117e1\"/>\r\n                  </measure>\r\n                  <measure n=\"50\" xml:id=\"d414233e16921\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e16923\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415109e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e16931\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e16950\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415113e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e16965\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e16981\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415117e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e16998\" pname=\"e\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17015\" pname=\"e\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17034\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17052\"\r\n                                    pname=\"g\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e17074\"\r\n                                    pname=\"e\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17094\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17114\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17132\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17152\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17170\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17190\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17210\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17230\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17251\"\r\n                                    pname=\"g\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"51\" xml:id=\"d414233e17271\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e17273\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415134e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e17281\" pname=\"b\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e17305\" pname=\"b\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415138e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e17325\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e17342\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e17360\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415142e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e17368\" pname=\"d\" accid=\"n\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e17387\" pname=\"d\" accid=\"n\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415146e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e17407\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e17426\" pname=\"e\" accid=\"n\" oct=\"6\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17447\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17465\"\r\n                                    pname=\"d\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17485\"\r\n                                    pname=\"g\"\r\n                                    accid=\"s\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e17507\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17525\"\r\n                                    pname=\"a\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17545\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17563\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17581\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17599\"\r\n                                    pname=\"b\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17619\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17637\"\r\n                                    pname=\"c\"\r\n                                    accid=\"s\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e17660\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"2\">cre-scen-do</dir>\r\n                  </measure>\r\n                  <measure n=\"52\" xml:id=\"d414233e17678\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e17680\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415163e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e17688\" pname=\"f\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e17702\" pname=\"f\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415167e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e17717\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e17731\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415171e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e17746\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e17763\" pname=\"a\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17782\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17800\"\r\n                                    pname=\"d\"\r\n                                    accid=\"n\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17820\"\r\n                                    pname=\"d\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17840\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17858\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17878\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e17896\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17914\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17932\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17950\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17968\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e17987\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\"> e stretto</dir>\r\n                  </measure>\r\n                  <measure n=\"53\" xml:id=\"d414233e18005\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <rest xml:id=\"d414233e18007\" dur=\"8\"/>\r\n                           <chord xml:id=\"d415188e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18015\" pname=\"e\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e18036\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415192e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18053\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e18067\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415196e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18082\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18098\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415200e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18115\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e18129\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415204e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18144\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18160\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e18178\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e18196\"\r\n                                    pname=\"d\"\r\n                                    accid=\"f\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n/>\r\n                              <note xml:id=\"d414233e18218\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18238\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18258\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18278\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e18298\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e18316\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18336\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18356\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18376\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18397\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"2.5\">sempre piu cresc.</dir>\r\n                  </measure>\r\n                  <measure n=\"54\" xml:id=\"d414233e18417\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415221e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18419\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e18433\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415225e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18448\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18464\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415229e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18481\" pname=\"c\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e18495\" pname=\"c\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415233e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18510\"\r\n                                    pname=\"e\"\r\n                                    accid=\"f\"\r\n                                    oct=\"5\"\r\n/>\r\n                              <note xml:id=\"d414233e18528\"\r\n                                    pname=\"e\"\r\n                                    accid=\"f\"\r\n                                    oct=\"6\"\r\n/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415237e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18547\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18563\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415241e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18580\" pname=\"e\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18597\" pname=\"e\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e18615\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e18633\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18653\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18673\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18693\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18713\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e18733\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e18751\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18771\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18791\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18811\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18832\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"2\" place=\"above\" tstamp=\"1\">ed accelerando</dir>\r\n                  </measure>\r\n                  <measure n=\"55\" xml:id=\"d414233e18853\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415258e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18855\" pname=\"f\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e18869\" pname=\"f\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415262e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18884\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e18900\" pname=\"e\" accid=\"n\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415266e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18917\" pname=\"f\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e18931\" pname=\"f\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415270e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18946\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e18967\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415274e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e18984\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e18998\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415278e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e19013\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19030\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19048\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19066\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19086\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19106\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19126\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19146\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19166\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19184\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19204\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19224\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19244\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19265\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <octave staff=\"1\"\r\n                             dis=\"8\"\r\n                             dis.place=\"above\"\r\n                             startid=\"#d415270e1\"\r\n                             endid=\"#d415303e1\"/>\r\n                     <hairpin form=\"cres\" staff=\"2\" place=\"above\" tstamp=\"1\" tstamp2=\"4\"/>\r\n                  </measure>\r\n                  <measure n=\"56\" xml:id=\"d414233e19285\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415295e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e19287\" pname=\"a\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19303\" pname=\"a\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415299e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e19320\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19336\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415303e1\" dur=\"2\" stem.dir=\"down\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e19353\" pname=\"d\" oct=\"5\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19372\" pname=\"d\" oct=\"6\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415307e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e19392\" pname=\"e\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19413\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19431\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19449\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19469\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19489\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19509\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19529\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19549\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19567\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19587\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19607\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19627\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19648\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"57\" xml:id=\"d414233e19668\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415324e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e19670\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19687\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415328e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e19705\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19722\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415332e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e19740\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19757\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415336e1\" dur=\"4\" stem.dir=\"down\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e19775\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19792\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415340e1\" dur=\"8\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e19810\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e19824\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19840\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19858\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19878\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19898\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19918\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e19938\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e19958\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19976\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e19994\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20014\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20032\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20051\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"1.5\">fz</dynam>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"4.5\">p</dynam>\r\n                  </measure>\r\n                  <measure n=\"58\" xml:id=\"d414233e20069\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20071\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e20095\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e20114\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e20133\"\r\n                                 pname=\"g\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <note xml:id=\"d414233e20150\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20165\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20183\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20203\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20223\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20243\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20263\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20283\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20301\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20319\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20339\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20357\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20376\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir tstamp=\"1\" staff=\"1\" place=\"below\">sotto voce</dir>\r\n                  </measure>\r\n                  <measure n=\"59\" xml:id=\"d414233e20394\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415370e1\" dur=\"8\" stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e20396\" pname=\"e\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e20420\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415374e1\" dur=\"8\" stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e20440\"\r\n                                    pname=\"d\"\r\n                                    accid=\"s\"\r\n                                    oct=\"4\"\r\n/>\r\n                              <note xml:id=\"d414233e20466\"\r\n                                    pname=\"d\"\r\n                                    accid=\"s\"\r\n                                    oct=\"5\"\r\n/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415378e1\" dur=\"8\" stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e20488\" pname=\"e\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e20505\" pname=\"e\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415382e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e20523\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e20538\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20555\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20573\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20593\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20613\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20633\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20653\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20673\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20691\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20709\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20729\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20747\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20766\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dynam staff=\"1\" place=\"below\" tstamp=\"1\">pp</dynam>\r\n                  </measure>\r\n                  <measure n=\"60\" xml:id=\"d414233e20784\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20786\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"/>\r\n                              <note xml:id=\"d414233e20809\"\r\n                                    pname=\"d\"\r\n                                    accid=\"s\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"\r\n/>\r\n                              <note xml:id=\"d414233e20829\"\r\n                                    pname=\"e\"\r\n                                    oct=\"4\"\r\n                                    dur=\"8\"\r\n                                    stem.dir=\"up\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e20845\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20861\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20879\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20899\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20919\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20939\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e20959\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e20979\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e20997\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21015\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21035\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21053\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21072\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <hairpin form=\"cres\" staff=\"1\" place=\"below\" tstamp=\"2\" tstamp2=\"6\"/>\r\n                  </measure>\r\n                  <measure n=\"61\" xml:id=\"d414233e21090\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415412e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21092\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21114\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415416e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21132\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21149\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415420e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21167\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21184\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415424e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21202\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21219\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415428e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21237\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21254\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415432e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21272\" pname=\"g\" oct=\"5\"/>\r\n                              <note xml:id=\"d414233e21290\" pname=\"g\" oct=\"6\"/>\r\n                           </chord>\r\n                           <rest xml:id=\"d414233e21308\" dur=\"32\"/>\r\n                           <chord xml:id=\"d415436e1\" dur=\"32\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e21316\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e21330\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415440e1\" dur=\"4\" stem.dir=\"down\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e21345\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e21362\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                          <chord xml:id=\"cx\" dur=\"8\" stem.dir=\"down\">\r\n                            <note xml:id=\"nx\" pname=\"f\" oct=\"4\"/>\r\n                            <note xml:id=\"d414233e21380\" pname=\"f\" oct=\"5\"/>\r\n                          </chord>                           \r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21395\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21413\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21433\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21453\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21473\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21493\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21513\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21531\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21549\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21569\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21587\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21606\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1.5\">smorz</dir>\r\n                    <slur staff=\"1\" curvedir=\"above\" startid=\"#d415412e1\" endid=\"#d415432e1\"/>\r\n                    <slur staff=\"1\" curvedir=\"above\" startid=\"#d415440e1\" endid=\"#cx\"/>\r\n                  </measure>\r\n                  <measure n=\"62\" xml:id=\"d414233e21624\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21626\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e21652\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e21673\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e21694\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e21715\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21736\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <rest xml:id=\"d414233e21757\" dur=\"32\"/>\r\n                              <note xml:id=\"d414233e21769\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"32\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e21789\"\r\n                                 pname=\"g\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"acc\" place=\"above\"/>\r\n                           </note>\r\n                           <note xml:id=\"d414233e21806\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21821\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21839\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21859\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21879\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21899\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21919\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e21939\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21957\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e21975\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e21995\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22013\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22032\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"63\" xml:id=\"d414233e22050\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <chord xml:id=\"d415470e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22052\" pname=\"e\" accid=\"n\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e22076\" pname=\"e\" accid=\"n\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415474e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22096\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e22113\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415478e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22131\" pname=\"g\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e22148\" pname=\"g\" oct=\"5\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415482e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22166\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22185\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415486e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22205\" pname=\"b\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22224\" pname=\"b\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415490e1\" dur=\"16\" stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                              <note xml:id=\"d414233e22244\" pname=\"a\" oct=\"4\" accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22264\" pname=\"a\" oct=\"5\" accid.ges=\"f\"/>\r\n                           </chord>\r\n                           <chord xml:id=\"d415494e1\" dur=\"4\" dots=\"1\" stem.dir=\"down\">\r\n                              <note xml:id=\"d414233e22284\" pname=\"f\" oct=\"4\"/>\r\n                              <note xml:id=\"d414233e22299\" pname=\"f\" oct=\"5\"/>\r\n                           </chord>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22316\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22334\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22354\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22374\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22394\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22414\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22434\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22452\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22470\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22490\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22508\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22527\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"64\" xml:id=\"d414233e22545\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22547\"\r\n                                    pname=\"e\"\r\n                                    accid=\"n\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e22575\"\r\n                                    pname=\"f\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e22596\"\r\n                                    pname=\"g\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e22617\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e22640\"\r\n                                    pname=\"b\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                              <note xml:id=\"d414233e22663\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"up\"\r\n                                    accid.ges=\"f\">\r\n                                 <artic artic=\"stacc\" place=\"above\"/>\r\n                              </note>\r\n                           </beam>\r\n                           <note xml:id=\"d414233e22686\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"4\"\r\n                                 dots=\"1\"\r\n                                 stem.dir=\"up\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22702\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22720\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22740\"\r\n                                    pname=\"b\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22760\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22780\"\r\n                                    pname=\"d\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22800\"\r\n                                    pname=\"d\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22820\"\r\n                                    pname=\"f\"\r\n                                    oct=\"2\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22838\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22856\"\r\n                                    pname=\"a\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22876\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22894\"\r\n                                    pname=\"c\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22913\"\r\n                                    pname=\"c\"\r\n                                    oct=\"3\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"65\" xml:id=\"d414233e22931\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e22933\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22953\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e22976\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e22996\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23014\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23034\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23052\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23072\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23090\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23110\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23128\"\r\n                                    pname=\"a\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23149\"\r\n                                    pname=\"c\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e23168\"\r\n                                 pname=\"f\"\r\n                                 oct=\"2\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\"/>\r\n                           <rest xml:id=\"d414233e23182\" dur=\"8\"/>\r\n                           <clef shape=\"G\" line=\"2\"/>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23196\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23216\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23234\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23254\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23272\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23292\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23310\"\r\n                                    pname=\"d\"\r\n                                    oct=\"6\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23330\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <octave staff=\"1\"\r\n                             dis=\"8\"\r\n                             dis.place=\"above\"\r\n                             startid=\"#d414233e22933\"\r\n                             endid=\"#d414233e23812\"/>\r\n                     <dir staff=\"1\" place=\"below\" tstamp=\"1\">legerissimo</dir>\r\n                     <dynam staff=\"2\" place=\"above\" tstamp=\"1\">ppp</dynam>\r\n                  </measure>\r\n                  <measure n=\"66\" xml:id=\"d414233e23349\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23351\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23369\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23389\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23407\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23427\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23445\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23465\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23483\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23503\"\r\n                                    pname=\"g\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23521\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23541\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23560\"\r\n                                    pname=\"a\"\r\n                                    oct=\"4\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23581\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23601\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23619\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23639\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23657\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23677\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                           <beam>\r\n                              <note xml:id=\"d414233e23695\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23715\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23733\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23753\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                              <note xml:id=\"d414233e23771\"\r\n                                    pname=\"b\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"\r\n                                    accid.ges=\"f\"/>\r\n                              <note xml:id=\"d414233e23792\"\r\n                                    pname=\"f\"\r\n                                    oct=\"5\"\r\n                                    dur=\"16\"\r\n                                    stem.dir=\"down\"/>\r\n                           </beam>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n                  <measure n=\"67\" xml:id=\"d414233e23810\" right=\"end\">\r\n                     <staff n=\"1\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e23812\"\r\n                                 pname=\"f\"\r\n                                 oct=\"6\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"down\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                           </note>\r\n                           <rest xml:id=\"d414233e23829\" dur=\"8\"/>\r\n                           <rest xml:id=\"d414233e23837\" dur=\"8\"/>\r\n                           <rest xml:id=\"d414233e23845\" dur=\"4\"/>\r\n                           <rest xml:id=\"d414233e23853\" dur=\"8\"/>\r\n                        </layer>\r\n                     </staff>\r\n                     <staff n=\"2\">\r\n                        <layer n=\"1\">\r\n                           <note xml:id=\"d414233e23865\"\r\n                                 pname=\"f\"\r\n                                 oct=\"4\"\r\n                                 dur=\"8\"\r\n                                 stem.dir=\"up\">\r\n                              <artic artic=\"stacc\" place=\"above\"/>\r\n                           </note>\r\n                           <rest xml:id=\"d414233e23882\" dur=\"8\"/>\r\n                           <rest xml:id=\"d414233e23890\" dur=\"8\"/>\r\n                           <rest xml:id=\"d414233e23898\" dur=\"4\"/>\r\n                           <rest xml:id=\"d414233e23906\" dur=\"8\"/>\r\n                        </layer>\r\n                     </staff>\r\n                  </measure>\r\n               </section>\r\n            </score>\r\n         </mdiv>\r\n      </body>\r\n   </music>\r\n</mei>\r\n"

/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = createAction;
	function identity(t) {
	  return t;
	}
	
	function createAction(type, actionCreator, metaCreator) {
	  var finalActionCreator = typeof actionCreator === 'function' ? actionCreator : identity;
	
	  return function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    var action = {
	      type: type,
	      payload: finalActionCreator.apply(undefined, args)
	    };
	
	    if (args.length === 1 && args[0] instanceof Error) {
	      // Handle FSA errors where the payload is an Error object. Set error.
	      action.error = true;
	    }
	
	    if (typeof metaCreator === 'function') {
	      action.meta = metaCreator.apply(undefined, args);
	    }
	
	    return action;
	  };
	}
	
	module.exports = exports['default'];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = handleActions;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _handleAction = __webpack_require__(23);
	
	var _handleAction2 = _interopRequireDefault(_handleAction);
	
	var _ownKeys = __webpack_require__(46);
	
	var _ownKeys2 = _interopRequireDefault(_ownKeys);
	
	var _reduceReducers = __webpack_require__(52);
	
	var _reduceReducers2 = _interopRequireDefault(_reduceReducers);
	
	function handleActions(handlers, defaultState) {
	  var reducers = _ownKeys2['default'](handlers).map(function (type) {
	    return _handleAction2['default'](type, handlers[type]);
	  });
	
	  return typeof defaultState !== 'undefined' ? function (state, action) {
	    if (state === undefined) state = defaultState;
	    return _reduceReducers2['default'].apply(undefined, reducers)(state, action);
	  } : _reduceReducers2['default'].apply(undefined, reducers);
	}
	
	module.exports = exports['default'];

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = ownKeys;
	
	function ownKeys(object) {
	  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
	    return Reflect.ownKeys(object);
	  }
	
	  var keys = Object.getOwnPropertyNames(object);
	
	  if (typeof Object.getOwnPropertySymbols === 'function') {
	    keys = keys.concat(Object.getOwnPropertySymbols(object));
	  }
	
	  return keys;
	}
	
	module.exports = exports['default'];

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.isFSA = isFSA;
	exports.isError = isError;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _lodashIsplainobject = __webpack_require__(48);
	
	var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);
	
	var validKeys = ['type', 'payload', 'error', 'meta'];
	
	function isValidKey(key) {
	  return validKeys.indexOf(key) > -1;
	}
	
	function isFSA(action) {
	  return _lodashIsplainobject2['default'](action) && typeof action.type !== 'undefined' && Object.keys(action).every(isValidKey);
	}
	
	function isError(action) {
	  return action.error === true;
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var baseFor = __webpack_require__(49),
	    isArguments = __webpack_require__(25),
	    keysIn = __webpack_require__(50);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * The base implementation of `_.forIn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForIn(object, iteratee) {
	  return baseFor(object, iteratee, keysIn);
	}
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * **Note:** This method assumes objects created by the `Object` constructor
	 * have no inherited enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  var Ctor;
	
	  // Exit early for non `Object` objects.
	  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
	      (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
	    return false;
	  }
	  // IE < 9 iterates inherited properties before own properties. If the first
	  // iterated property is an object's own property then there are no inherited
	  // enumerable properties.
	  var result;
	  // In most environments an object's own properties are iterated before
	  // its inherited properties. If the last iterated property is an object's
	  // own property then there are no inherited enumerable properties.
	  baseForIn(value, function(subValue, key) {
	    result = key;
	  });
	  return result === undefined || hasOwnProperty.call(value, result);
	}
	
	module.exports = isPlainObject;


/***/ },
/* 49 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modularize exports="npm" -o ./`
	 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	/**
	 * Creates a base function for methods like `_.forIn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;
	
	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = baseFor;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	var isArguments = __webpack_require__(25),
	    isArray = __webpack_require__(51);
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;
	
	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;


/***/ },
/* 51 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]',
	    funcTag = '[object Function]';
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 equivalents which return 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}
	
	module.exports = isArray;


/***/ },
/* 52 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = reduceReducers;
	
	function reduceReducers() {
	  for (var _len = arguments.length, reducers = Array(_len), _key = 0; _key < _len; _key++) {
	    reducers[_key] = arguments[_key];
	  }
	
	  return function (previous, current) {
	    return reducers.reduce(function (p, r) {
	      return r(p, current);
	    }, previous);
	  };
	}
	
	module.exports = exports["default"];

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports.combineReducers = combineReducers;
	
	var _loop = __webpack_require__(7);
	
	var _effects = __webpack_require__(2);
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function optimizeBatch(effects) {
	  switch (effects.length) {
	    case 0:
	      return (0, _effects.none)();
	    case 1:
	      return effects[0];
	    default:
	      return (0, _effects.batch)(effects);
	  }
	}
	
	var defaultAccessor = function defaultAccessor(state, key) {
	  return state[key];
	};
	
	var defaultMutator = function defaultMutator(state, key, value) {
	  return _extends({}, state, _defineProperty({}, key, value));
	};
	
	function combineReducers(reducerMap) {
	  var rootState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	  var accessor = arguments.length <= 2 || arguments[2] === undefined ? defaultAccessor : arguments[2];
	  var mutator = arguments.length <= 3 || arguments[3] === undefined ? defaultMutator : arguments[3];
	
	  return function finalReducer() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? rootState : arguments[0];
	    var action = arguments[1];
	
	    var hasChanged = false;
	    var effects = [];
	
	    var model = Object.keys(reducerMap).reduce(function (model, key) {
	      var reducer = reducerMap[key];
	      var previousStateForKey = accessor(state, key);
	      var nextStateForKey = reducer(previousStateForKey, action);
	
	      if ((0, _loop.isLoop)(nextStateForKey)) {
	        effects.push((0, _loop.getEffect)(nextStateForKey));
	        nextStateForKey = (0, _loop.getModel)(nextStateForKey);
	      }
	
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	      return mutator(model, key, nextStateForKey);
	    }, rootState);
	
	    return (0, _loop.loop)(hasChanged ? model : state, optimizeBatch(effects));
	  };
	}

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var loopPromiseCaughtError = exports.loopPromiseCaughtError = function loopPromiseCaughtError(originalActionType) {
	  return "\nloop Promise caught when returned from action of type " + originalActionType + ".\nloop Promises must not throw!\n\nDid you forget to do one of the following?\n\n- Call `.catch` on a Promise in a function passed to `Effects.promise`\n\n  const asyncEffect = (val) => {\n    return api.doStuff(val)\n      .then((stuff) => Actions.success(stuff))\n      .catch((error) => Actions.failure(error)); // <-- You have to do this!\n  };\n\n- Return an action from a `.catch` callback\n\n  const asyncEffect = (val) => {\n    return api.doStuff(val)\n      .then((stuff) => {\n        return Actions.success(stuff); // <-- Make sure to return here!\n      })\n      .catch((error) => {\n        return Actions.failure(error): // <-- And return here!\n      });\n  };\n\nDon't see the problem here? Please report the issue at <https://github.com/raisemarketplace/redux-loop/issues/new>\n";
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	exports.install = install;
	
	var _utils = __webpack_require__(8);
	
	var _errors = __webpack_require__(54);
	
	var _loop = __webpack_require__(7);
	
	var _effects = __webpack_require__(2);
	
	/**
	 * Installs a new dispatch function which will attempt to execute any effects
	 * attached to the current model as established by the original dispatch.
	 */
	function install() {
	  return function (next) {
	    return function (reducer, initialState, enhancer) {
	      var currentEffect = (0, _effects.none)();
	
	      var _liftState = (0, _loop.liftState)(initialState);
	
	      var _liftState2 = _slicedToArray(_liftState, 2);
	
	      var initialModel = _liftState2[0];
	      var initialEffect = _liftState2[1];
	
	
	      var liftReducer = function liftReducer(reducer) {
	        return function (state, action) {
	          var result = reducer(state, action);
	
	          var _liftState3 = (0, _loop.liftState)(result);
	
	          var _liftState4 = _slicedToArray(_liftState3, 2);
	
	          var model = _liftState4[0];
	          var effect = _liftState4[1];
	
	          currentEffect = effect;
	          return model;
	        };
	      };
	
	      var store = next(liftReducer(reducer), initialModel, enhancer);
	
	      var runEffect = function runEffect(originalAction, effect) {
	        return (0, _effects.effectToPromise)(effect).then(function (actions) {
	          return Promise.all(actions.map(dispatch));
	        })['catch'](function (error) {
	          console.error((0, _errors.loopPromiseCaughtError)(originalAction.type));
	          throw error;
	        });
	      };
	
	      var dispatch = function dispatch(action) {
	        store.dispatch(action);
	        var effectToRun = currentEffect;
	        currentEffect = (0, _effects.none)();
	        return runEffect(action, effectToRun);
	      };
	
	      var replaceReducer = function replaceReducer(reducer) {
	        return store.replaceReducer(liftReducer(reducer));
	      };
	
	      runEffect({ type: '@@ReduxLoop/INIT' }, initialEffect);
	
	      return _extends({}, store, {
	        dispatch: dispatch,
	        replaceReducer: replaceReducer
	      });
	    };
	  };
	}

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, multistr: true, esversion: 6 */
	'use strict';
	
	const Fraction = __webpack_require__(11);
	const getPitchNames = __webpack_require__(9);
	
	const extractAttr = function extractAttr(mark, attrName) {
		let attr = mark.getAttribute(attrName);
		return attr === null || "" ? null : attr;
	};
	
	const extractDuration = function extractDuration(mark) {
		let duration = extractAttr(mark, 'dur');
	
		return parseInt(duration, 10);
	};
	
	const extractOctave = function extractOctave(mark) {
		let octave = extractAttr(mark, 'oct');
	
		return parseInt(octave, 10) + 1; // MIDI is one octave higher
	};
	
	const extractID = function extractID(mark) {
		return extractAttr(mark, 'xml:id');
	};
	
	const calculateNoteNumber = function calculateNoteNumber(modelNote) {
		const pitchNames = getPitchNames();
	
		if (modelNote.pitchName === null) {
			return -1;
		}
	
		let accidentalModifier;
	
		switch (modelNote.accidental) {
			case 'f':
				accidentalModifier = -1;
				break;
			case 's':
				accidentalModifier = 1;
				break;
			case 'ff':
				accidentalModifier = -2;
				break;
			case 'ss':
				accidentalModifier = 2;
				break;
			default:
				accidentalModifier = 0;
		}
	
		return pitchNames.indexOf(modelNote.pitchName) + modelNote.octave*12 + accidentalModifier;
	};
	
	const processRest = function processRest(mark) {
		let modelRest = processNote(mark);
	
		modelRest.type = 'rest';
	
		delete modelRest.octave;
		delete modelRest.pitchName;
		delete modelRest.accidental;
		delete modelRest.noteNumber;
	
		return modelRest;
	};
	
	const processNote = function processNote(mark) {
		let modelNote = {
			type: 'note',
			id: extractID(mark),
			pitchName: extractAttr(mark, 'pname'),
			accidental: extractAttr(mark, 'accid.ges'),
			duration: extractDuration(mark),
			octave: extractOctave(mark),
			ref: mark
		};
		
		modelNote.noteNumber = calculateNoteNumber(modelNote);
	
		return modelNote;
	};
	
	const processChord = function processChord(mark) {
		let notes = qsa(mark, 'note');
	
		notes = notes.map((note) => {
			return processNote(note);
		});
	
		return {
			type: 'chord',
			id: extractID(mark),
			duration: extractDuration(mark),
			notes: notes
		};
	};
	
	const qsa = function qsa(doc, selector) {
		return Array.from(doc.querySelectorAll(selector));
	};
	
	
	// MAIN
	
	const createModelFromScore = function createModelFromScore(scoreData) {
		let parser = new DOMParser();
	
		let doc = parser.parseFromString(scoreData, 'application/xml');
		let staves = qsa(doc, 'music score staff');
	
		let beatCounters = [];
		let beats = new Map();
		
		let notes = staves.reduce((reduction, staff) => {
			let staffNumber = parseInt(extractAttr(staff, 'n'), 10);
			
			if (!reduction[staffNumber]) {
				reduction[staffNumber] = [];
			}
	
			let marks = qsa(staff, `layer > rest, 
			                        layer > chord, 
			                        layer > note, 
			                        layer > beam > chord, 
			                        layer > beam > note`);
			
			marks.forEach((mark) => {
				let modelMark = {};
	
				switch (mark.tagName) {
					case 'rest':
						modelMark = processRest(mark);
						break;
					case 'chord':
						modelMark = processChord(mark);
						break;
					case 'note':
						modelMark = processNote(mark);
						break;
					default:
						throw new Error(`[createModelFromScore] Unknown element type (element: ${mark}).`);
				}
	
				let currentBeat = beatCounters[staffNumber] || new Fraction(0);
	
				if (modelMark.type !== 'rest') {
					let currentBeatStr = currentBeat.toString();
					let noteGroupOfCurrentBeat = beats.get(currentBeatStr) || [];
					
					noteGroupOfCurrentBeat[modelMark.noteNumber] = modelMark;
					beats.set(currentBeatStr, noteGroupOfCurrentBeat);
				}
	
				beatCounters[staffNumber] = currentBeat.add([1, modelMark.duration]);
	
				reduction[staffNumber].push(modelMark);
			});
	
			return reduction;
		}, []);
	
		beats = Array.from(beats);
		beats.sort((a, b) => {
			return (new Fraction(a[0])).compare(b[0]);
		});
	
		return {
			doc: doc,
			notes: notes,
			beats: beats
		};
	};
	
	module.exports = createModelFromScore;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	const getPitchNames = __webpack_require__(9);
	
	const getPitchNameFromNoteNumber = function getPitchNameFromNoteNumber(noteNumber) {
		if (!Number.isInteger(noteNumber) || noteNumber < 0 || noteNumber > 127) {
			throw new Error(`[getPitchNameFromNoteNumber] Note number is not 0-127 (given: ${noteNumber}).`);
		}
	
		let pitchNames = getPitchNames();
		let noteNumWithinOctave = noteNumber % 12;
	
		// do not return accidentals
	
		return pitchNames[noteNumWithinOctave].replace(/#/, null);
	};
	
	module.exports = getPitchNameFromNoteNumber;


/***/ },
/* 60 */
/***/ function(module, exports) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	
	// check prototype, only merge regular Object
	/* 
	  addition, modify, deletion
	
	  inputs = ['A', 'B', 'C'];
	
	  inputs = ['A', 'B', 'C', 'D']; [undefined, undefined, undefined, 'D']
	
		inputs = ['A', 'B', 'D']; [undefined, undefined, 'D', null]
	
	  inputs = ['A', 'B']; [undefined, undefined, null]
	*/
	function assign(target /*, ...resources*/) {
		let args = Array.from(arguments);
		let initalValue, keysFunc;
	
		if (target === null || target === undefined) {
			throw new Error(`[assign] Target cannot be null or undefined (given: ${String(target)})`);
		} else if (target.constructor === Object) {
			initalValue = {};
			keysFunc = Object.keys;
		} else if (target.constructor === Array) {
			initalValue = [];
			keysFunc = (a) => Array.from(a.keys());
		} else {
			// non-organic data, direct assign
			return args[args.length-1];
		}
	
		let result = args.reduce((reduction, resource) => {
			if (resource === null || resource === undefined || 
			    resource.constructor !== target.constructor) {
				throw new Error(`[assign] Target and resource type do not match.`);
			}
	
			keysFunc(resource).forEach(function(k) {
				let v = resource[k];
				
				if (v === undefined) {
					// do nothing
				} else if (v === null) {
					// deletion
					delete reduction[k];
				} else if (reduction[k]) {
					// modification
					reduction[k] = assign(reduction[k], v);
				} else {
					// insertion
					reduction[k] = v;
				}
			});
			
			return reduction;
		}, initalValue);
	
		return result;
	}
	
	module.exports = assign;


/***/ },
/* 61 */
/***/ function(module, exports) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	function first(arr) {
		if (Array.isArray(arr) && arr.length > 0) {
			let firstItem = arr[0];
			let isSparseArray = (firstItem === undefined);
	
			if (isSparseArray) {
				let onlyValues = arr.filter(v => true);
	
				firstItem = onlyValues[0];
			}
			
			return firstItem;
		} else {
			return undefined;
		}
	}
	
	module.exports = first;


/***/ },
/* 62 */
/***/ function(module, exports) {

	function last(arr) {
		return Array.isArray(arr) && arr.length > 0 ? 
			     arr[arr.length-1] : undefined;
	}
	
	module.exports = last;


/***/ },
/* 63 */
/***/ function(module, exports) {

	/* jslint node: true, esversion: 6 */
	'use strict';
	
	function getAppendPatch(arr, val) {
		let change = [];
	
		if (Array.isArray(arr) && arr.length > 0) {
			change[arr.length] = val;
		} else {
			change.push(val);
		}
	
		return change;
	}
	
	module.exports = getAppendPatch;


/***/ },
/* 64 */
/***/ function(module, exports) {

	/* jslint node: true, esversion: 6 */
	'use strict';
	
	function getBracketPatch(idx, val) {
		if (idx < 0) {
			throw new Error('[getBracketPatch] Index is less than zero.');
		}
	
		let change = [];
		change[idx] = val;
	
		return change;
	}
	
	module.exports = getBracketPatch;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	const { Effects, loop } = __webpack_require__(4);
	const Fraction = __webpack_require__(11);
	
	const API = __webpack_require__(6);
	const last  = __webpack_require__(62),
	      first = __webpack_require__(61);
	const getAppendPatch  = __webpack_require__(63),
	      getBracketPatch = __webpack_require__(64);
	const getPitchNames = __webpack_require__(9),
	      getPitchNameFromNoteNumber = __webpack_require__(59);
	const createState = __webpack_require__(26);
	
	function trackMIDINote(state, action) {
		let MIDINote = action.payload;
		let perf = state.performance, 
		    beats = state.score.model.beats,
		    samplingRate = state.config.samplingRate;
		let noteSeq = perf.noteSeq,
		    currentBeat = perf.currentBeat;
		let lastNoteGroup = last(noteSeq);
		let baseNote = first(lastNoteGroup);
		let noteSeqPatch = [],
		    currentBeatPatch = currentBeat;
	
		// do nothing for note-off
		
		if (MIDINote.type === 'note-off') {
			return createState(state);
		}
	
		// check for chord
	
		let isFirstNote = (baseNote === undefined);
		
		if (isFirstNote) {
			noteSeqPatch = [ [MIDINote] ];
		} else {
			let baseNoteInterval = MIDINote.receivedTime - baseNote.receivedTime;
			let isChordNote = (baseNoteInterval <= samplingRate);
	
			if (isChordNote) {
				noteSeqPatch[noteSeq.length-1] = getAppendPatch(lastNoteGroup, MIDINote); // TODO: refactor patcher
			} else {
				noteSeqPatch[noteSeq.length] = [MIDINote];
				currentBeatPatch = currentBeat + 1;
			}
		}
	
		// compare notes
	
		let targetNotes = beats[currentBeatPatch][1]; // 0 = beat value, 1 = notes
		let trackedNote = {
			info: null,
			note: null
		};
		
		let correctNote = targetNotes[MIDINote.noteNumber];
		let correctNoteNotFound = (correctNote === undefined);
		
		if (correctNoteNotFound) {
			// create extra note
	
			let pitchName = getPitchNameFromNoteNumber(MIDINote.noteNumber);
			let octave    = Math.floor(MIDINote.noteNumber / 12);
	
			let extraNote = first(targetNotes).ref.cloneNode();
	
			extraNote.setAttribute('pname', pitchName);
			extraNote.setAttribute('oct', octave);
			extraNote.setAttribute('xml:id', 'dextra'+performance.now().toString().replace(/\./, ''));
			extraNote.setAttribute('perf_extra', 'true');
			
			// find a slot to insert extra note
			
			let nearestDistance = Infinity, 
			    nearestNote;
			let pitchNames = getPitchNames();
	
			targetNotes.filter(note => note.type === 'note').forEach((note) => {
				let targetNoteNumber = note.noteNumber;
				let distance = Math.abs(targetNoteNumber - MIDINote.noteNumber);
	
				if (distance < nearestDistance) {
					nearestNote = note;
					nearestDistance = distance;
				}
			});
	
			// check for unreasonable distance, allowing only half octave away
			
			let notTooFar = (nearestDistance <= 6);
	
			if (notTooFar) {
				let nearestNoteRef = nearestNote.ref;
				let nearestNoteIsChordNote = (nearestNoteRef.parentElement.tagName === 'chord');
	
				if (nearestNoteIsChordNote) {
					nearestNoteRef.parentElement.appendChild(extraNote);
				} else {
					let noteParent = nearestNoteRef.parentElement; // could be staff layer or beam
					let chordNote = document.createElement('chord');
					
					chordNote.setAttribute('dur', nearestNoteRef.getAttribute('dur'));
					chordNote.setAttribute('stem.dir', nearestNoteRef.getAttribute('stem.dir'));
					chordNote.appendChild(extraNote);
	
					noteParent.replaceChild(chordNote, nearestNoteRef);
					
					chordNote.appendChild(nearestNoteRef); // append after replace, preventing auto-remove
				}
			}
			
			trackedNote = {
				extra: true,
				note: extraNote
			};
		} else {
			trackedNote = {
				pressed: true,
				note: correctNote
			};
		}
	
		let trackedNotesPatch = getAppendPatch(perf.trackedNotes, trackedNote);
		let statePatch = {
			performance: {
				currentBeat: currentBeatPatch,
				noteSeq: noteSeqPatch,
				trackedNotes: trackedNotesPatch
			}
		};
	
		let xmlSerializer = new XMLSerializer();
		let xmlString = xmlSerializer.serializeToString(state.score.model.doc);
		document.getElementById('test').textContent = xmlString;
		document.getElementById('xml').innerHTML = xmlString;
		
		return loop(createState(state, statePatch),
		            Effects.constant(API.LOAD_SCORE(xmlString)));
	}
	
	module.exports = trackMIDINote;


/***/ },
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(89),
	    isHostObject = __webpack_require__(90),
	    isObjectLike = __webpack_require__(91);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object,
	 *  else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) ||
	      objectToString.call(value) != objectTag || isHostObject(value)) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}
	
	module.exports = isPlainObject;


/***/ },
/* 70 */,
/* 71 */,
/* 72 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */
	
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }
	
	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  } else {
	    var _ret = function () {
	      var last = funcs[funcs.length - 1];
	      var rest = funcs.slice(0, -1);
	      return {
	        v: function v() {
	          return rest.reduceRight(function (composed, f) {
	            return f(composed);
	          }, last.apply(undefined, arguments));
	        }
	      };
	    }();
	
	    if (typeof _ret === "object") return _ret.v;
	  }
	}

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports["default"] = createStore;
	
	var _isPlainObject = __webpack_require__(69);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _symbolObservable = __webpack_require__(112);
	
	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};
	
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [initialState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, initialState, enhancer) {
	  var _ref2;
	
	  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = initialState;
	    initialState = undefined;
	  }
	
	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }
	
	    return enhancer(createStore)(reducer, initialState);
	  }
	
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }
	
	  var currentReducer = reducer;
	  var currentState = initialState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	
	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }
	
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }
	
	    var isSubscribed = true;
	
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }
	
	      isSubscribed = false;
	
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }
	
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2["default"])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }
	
	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }
	
	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }
	
	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }
	
	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }
	
	    return action;
	  }
	
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }
	
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }
	
	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;
	
	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	
	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }
	
	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }
	
	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2["default"]] = function () {
	      return this;
	    }, _ref;
	  }
	
	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });
	
	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2["default"]] = observable, _ref2;
	}

/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports["default"] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	// EXTERNAL DEPENDECY
	
	var { createStore, applyMiddleware, compose } = __webpack_require__(111);
	var reduxLoop    = __webpack_require__(4).install();
	var reduxLogger  = __webpack_require__(107)();
	
	
	// INTERNAL DEPENDENCY
	
	var { reducer } = __webpack_require__(32);
	
	// CODE
	
	let initialState = {
		statePatch: {},
		config: {
			samplingRate: 100, // The Science and Psychology of Music Performance: Creative Strategy for Teaching and Learning pp.295
		},
		MIDI: {
			access: undefined,
			selectedInput: undefined,
		},
		score: {
			data: undefined,
			model: {
				doc: undefined,
				beats: [],
				notes: []
			}
		},
		performance: {
			currentBeat: 0, // for each staff
			noteSeq: [],
			trackedNotes: []
		}
	};
	
	let storeEnhancer = compose(reduxLoop, applyMiddleware(reduxLogger));
	let Store = createStore(reducer,
		                      initialState,
		                      storeEnhancer);
	
	module.exports = Store;


/***/ },
/* 76 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(78);
	
	module.exports = function template(locals) {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	
	buf.push("<div id=\"app\"><b>Reading MIDI Status...</b><div id=\"score\"></div><div id=\"xml\"></div><pre id=\"test\"></pre></div>");;return buf.join("");
	}

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */
	
	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];
	
	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }
	
	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }
	
	  return a;
	};
	
	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */
	
	function nulls(val) {
	  return val != null && val !== '';
	}
	
	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) :
	    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
	    [val]).filter(nulls).join(' ');
	}
	
	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};
	
	
	exports.style = function (val) {
	  if (val && typeof val === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
	                   'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' +
	                   'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};
	
	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse){
	  var buf = [];
	
	  var keys = Object.keys(obj);
	
	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i]
	        , val = obj[key];
	
	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }
	
	  return buf.join('');
	};
	
	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */
	
	var jade_encode_html_rules = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};
	var jade_match_html = /[&<>"]/g;
	
	function jade_encode_char(c) {
	  return jade_encode_html_rules[c] || c;
	}
	
	exports.escape = jade_escape;
	function jade_escape(html){
	  var result = String(html).replace(jade_match_html, jade_encode_char);
	  if (result === '' + html) return html;
	  else return result;
	};
	
	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */
	
	exports.rethrow = function rethrow(err, filename, lineno, str){
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || __webpack_require__(121).readFileSync(filename, 'utf8')
	  } catch (ex) {
	    rethrow(err, null, lineno)
	  }
	  var context = 3
	    , lines = str.split('\n')
	    , start = Math.max(lineno - context, 0)
	    , end = Math.min(lines.length, lineno + context);
	
	  // Error context
	  var context = lines.slice(start, end).map(function(line, i){
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ')
	      + curr
	      + '| '
	      + line;
	  }).join('\n');
	
	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno
	    + '\n' + context + '\n\n' + err.message;
	  throw err;
	};
	
	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	}


/***/ },
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */
/***/ function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetPrototype = Object.getPrototypeOf;
	
	/**
	 * Gets the `[[Prototype]]` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {null|Object} Returns the `[[Prototype]]`.
	 */
	function getPrototype(value) {
	  return nativeGetPrototype(Object(value));
	}
	
	module.exports = getPrototype;


/***/ },
/* 90 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}
	
	module.exports = isHostObject;


/***/ },
/* 91 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 92 */
/***/ function(module, exports) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	const createView = function(template, initializer, patcher) {
		// variable declaration
	
		var viewObj, renderFunc, patchFunc;
	
		// basic validations
		
		if (patcher.length !== 2) {
			throw new Error(`[createView] Patcher does not take 2 arguments (now: ${patcher.length}).`);
		}
	
		// render view at mounting point with initial state, also curries patch function
	
		renderFunc = function render(mountingPointSelector, initialState) {
			let mountingPoint = document.querySelector(mountingPointSelector); // could throw SYNTAX_ERROR
	
			if (mountingPoint === null) {
				throw new Error(`[render] Selector (${mountingPointSelector}) does not match any element.`);
			}
	
			// template must have single root element
	
			if (mountingPoint.children.length > 1) {
				throw new Error('[render] Template is not wrapped into single element.');
			}
	
			// TODO: scripts should be stripped
			
			// mount template
	
			let elemContainer = document.createElement('div');
			elemContainer.innerHTML = template;
			
			let rootElem = elemContainer.firstElementChild;
			
			mountingPoint.parentNode.replaceChild(rootElem, mountingPoint);
	
			// initialize the view with event handlers, etc.
	
			initializer.call(undefined, mountingPoint);
	
			// curry the patch function
	
			let patchRootElemFunc = patchFunc.bind(undefined, rootElem);
	
			// render the initial state
	
			patchRootElemFunc.call(undefined, initialState);
			
			// update view object
			
			viewObj.patch = patchRootElemFunc;
		};
		
		// internal patch function, must be curried
	
		patchFunc = function patch(rootElem, stateChanges) {
			patcher(rootElem, stateChanges);
		};
	
		// intermediate object for currying patch function
	
		viewObj = {
			patch: () => { throw new Error('[patch] View is not rendered thus patching is unavailable.'); },
			render: renderFunc
		};
	
		return viewObj;
	};
	
	module.exports = createView;


/***/ },
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */
/***/ function(module, exports) {

	"use strict";
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	var repeat = function repeat(str, times) {
	  return new Array(times + 1).join(str);
	};
	var pad = function pad(num, maxLength) {
	  return repeat("0", maxLength - num.toString().length) + num;
	};
	var formatTime = function formatTime(time) {
	  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
	};
	
	// Use the new performance api to get better precision if available
	var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;
	
	/**
	 * parse the level option of createLogger
	 *
	 * @property {string | function | object} level - console[level]
	 * @property {object} action
	 * @property {array} payload
	 * @property {string} type
	 */
	
	function getLogLevel(level, action, payload, type) {
	  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
	    case "object":
	      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
	    case "function":
	      return level(action);
	    default:
	      return level;
	  }
	}
	
	/**
	 * Creates logger with followed options
	 *
	 * @namespace
	 * @property {object} options - options for logger
	 * @property {string | function | object} options.level - console[level]
	 * @property {boolean} options.duration - print duration of each action?
	 * @property {boolean} options.timestamp - print timestamp with each action?
	 * @property {object} options.colors - custom colors
	 * @property {object} options.logger - implementation of the `console` API
	 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
	 * @property {boolean} options.collapsed - is group collapsed?
	 * @property {boolean} options.predicate - condition which resolves logger behavior
	 * @property {function} options.stateTransformer - transform state before print
	 * @property {function} options.actionTransformer - transform action before print
	 * @property {function} options.errorTransformer - transform error before print
	 */
	
	function createLogger() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	  var _options$level = options.level;
	  var level = _options$level === undefined ? "log" : _options$level;
	  var _options$logger = options.logger;
	  var logger = _options$logger === undefined ? console : _options$logger;
	  var _options$logErrors = options.logErrors;
	  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
	  var collapsed = options.collapsed;
	  var predicate = options.predicate;
	  var _options$duration = options.duration;
	  var duration = _options$duration === undefined ? false : _options$duration;
	  var _options$timestamp = options.timestamp;
	  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
	  var transformer = options.transformer;
	  var _options$stateTransfo = options.stateTransformer;
	  var // deprecated
	  stateTransformer = _options$stateTransfo === undefined ? function (state) {
	    return state;
	  } : _options$stateTransfo;
	  var _options$actionTransf = options.actionTransformer;
	  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
	    return actn;
	  } : _options$actionTransf;
	  var _options$errorTransfo = options.errorTransformer;
	  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
	    return error;
	  } : _options$errorTransfo;
	  var _options$colors = options.colors;
	  var colors = _options$colors === undefined ? {
	    title: function title() {
	      return "#000000";
	    },
	    prevState: function prevState() {
	      return "#9E9E9E";
	    },
	    action: function action() {
	      return "#03A9F4";
	    },
	    nextState: function nextState() {
	      return "#4CAF50";
	    },
	    error: function error() {
	      return "#F20404";
	    }
	  } : _options$colors;
	
	  // exit if console undefined
	
	  if (typeof logger === "undefined") {
	    return function () {
	      return function (next) {
	        return function (action) {
	          return next(action);
	        };
	      };
	    };
	  }
	
	  if (transformer) {
	    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
	  }
	
	  var logBuffer = [];
	  function printBuffer() {
	    logBuffer.forEach(function (logEntry, key) {
	      var started = logEntry.started;
	      var startedTime = logEntry.startedTime;
	      var action = logEntry.action;
	      var prevState = logEntry.prevState;
	      var error = logEntry.error;
	      var took = logEntry.took;
	      var nextState = logEntry.nextState;
	
	      var nextEntry = logBuffer[key + 1];
	      if (nextEntry) {
	        nextState = nextEntry.prevState;
	        took = nextEntry.started - started;
	      }
	      // message
	      var formattedAction = actionTransformer(action);
	      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
	        return nextState;
	      }, action) : collapsed;
	
	      var formattedTime = formatTime(startedTime);
	      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
	      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");
	
	      // render
	      try {
	        if (isCollapsed) {
	          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
	        } else {
	          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
	        }
	      } catch (e) {
	        logger.log(title);
	      }
	
	      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
	      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
	      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
	      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");
	
	      if (prevStateLevel) {
	        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
	      }
	
	      if (actionLevel) {
	        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
	      }
	
	      if (error && errorLevel) {
	        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
	      }
	
	      if (nextStateLevel) {
	        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
	      }
	
	      try {
	        logger.groupEnd();
	      } catch (e) {
	        logger.log("—— log end ——");
	      }
	    });
	    logBuffer.length = 0;
	  }
	
	  return function (_ref) {
	    var getState = _ref.getState;
	    return function (next) {
	      return function (action) {
	        // exit early if predicate function returns false
	        if (typeof predicate === "function" && !predicate(getState, action)) {
	          return next(action);
	        }
	
	        var logEntry = {};
	        logBuffer.push(logEntry);
	
	        logEntry.started = timer.now();
	        logEntry.startedTime = new Date();
	        logEntry.prevState = stateTransformer(getState());
	        logEntry.action = action;
	
	        var returnedValue = undefined;
	        if (logErrors) {
	          try {
	            returnedValue = next(action);
	          } catch (e) {
	            logEntry.error = errorTransformer(e);
	          }
	        } else {
	          returnedValue = next(action);
	        }
	
	        logEntry.took = timer.now() - logEntry.started;
	        logEntry.nextState = stateTransformer(getState());
	
	        printBuffer();
	
	        if (logEntry.error) throw logEntry.error;
	        return returnedValue;
	      };
	    };
	  };
	}
	
	module.exports = createLogger;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports["default"] = applyMiddleware;
	
	var _compose = __webpack_require__(72);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }
	
	  return function (createStore) {
	    return function (reducer, initialState, enhancer) {
	      var store = createStore(reducer, initialState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];
	
	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2["default"].apply(undefined, chain)(store.dispatch);
	
	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 109 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports["default"] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}
	
	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }
	
	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }
	
	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports["default"] = combineReducers;
	
	var _createStore = __webpack_require__(73);
	
	var _isPlainObject = __webpack_require__(69);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _warning = __webpack_require__(74);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
	
	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}
	
	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';
	
	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }
	
	  if (!(0, _isPlainObject2["default"])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }
	
	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key);
	  });
	
	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}
	
	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });
	
	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }
	
	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}
	
	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);
	
	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }
	
	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];
	
	    if (sanityError) {
	      throw sanityError;
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action);
	      if (warningMessage) {
	        (0, _warning2["default"])(warningMessage);
	      }
	    }
	
	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;
	
	var _createStore = __webpack_require__(73);
	
	var _createStore2 = _interopRequireDefault(_createStore);
	
	var _combineReducers = __webpack_require__(110);
	
	var _combineReducers2 = _interopRequireDefault(_combineReducers);
	
	var _bindActionCreators = __webpack_require__(109);
	
	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);
	
	var _applyMiddleware = __webpack_require__(108);
	
	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);
	
	var _compose = __webpack_require__(72);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	var _warning = __webpack_require__(74);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}
	
	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2["default"])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}
	
	exports.createStore = _createStore2["default"];
	exports.combineReducers = _combineReducers2["default"];
	exports.bindActionCreators = _bindActionCreators2["default"];
	exports.applyMiddleware = _applyMiddleware2["default"];
	exports.compose = _compose2["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global window */
	'use strict';
	
	module.exports = __webpack_require__(113)(global || window || this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 113 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function symbolObservablePonyfill(root) {
		var result;
		var Symbol = root.Symbol;
	
		if (typeof Symbol === 'function') {
			if (Symbol.observable) {
				result = Symbol.observable;
			} else {
				result = Symbol('observable');
				Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};


/***/ },
/* 114 */,
/* 115 */
/***/ function(module, exports) {

	/* jslint browser: true, node: true, sub: true, multistr: true, esversion: 6 */
	'use strict';
	
	//var verovio = require('../vendor/verovio-toolkit.js');
	//var toolkit = new verovio.toolkit();
	
	function createSVGFromScore(scoreData) {
		let div = document.createElement('div');
	return div;
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


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	// EXTERNAL DEPENDECY
	
	var createView = __webpack_require__(92);
	
	
	// INTERNAL DEPENDECY
	
	var styles = __webpack_require__(76);
	var Store  = __webpack_require__(75);
	var API    = __webpack_require__(6);
	var createSVGFromScore = __webpack_require__(115);
	
	
	// CODE
	
	var initializer, patcher, updateMIDI, updateScore;
	var handleMIDIStateChange, handleMIDIMessage;
	var convertMIDIMessageToNote;
	
	// INIT & PATCHER
	
	initializer = function initializer(rootElem) {
		navigator.requestMIDIAccess()
		         .then( access => Store.dispatch(API.GRANT_MIDI_ACCESS(access)) )
		         .catch( error => Store.dispatch(API.GRANT_MIDI_ACCESS(error)) );
	};
	
	patcher = function patcher(rootElem, state) {
		if (!state) return;
		if (state.MIDI) updateMIDI(rootElem, state.MIDI);
		if (state.score) updateScore(rootElem, state.score);
	};
	
	// SUB-PATCHERS
	
	updateMIDI = function updateMIDI(rootElem, stateMIDI) {
		if (stateMIDI.access) {
			stateMIDI.access.onstatechange = handleMIDIStateChange;
		}
	
		if (stateMIDI.inputs) {
			if (stateMIDI.inputs.size > 0) {
				rootElem.querySelector('b').textContent = `LISTENING TO (${Array.from(stateMIDI.inputs)[0][1]['name']})`;
	
				stateMIDI.inputs.forEach(inp => inp.onmidimessage = handleMIDIMessage);
			} else {
				rootElem.querySelector('b').textContent = 'NO MIDI FOUND';
			}
		}
	};
	
	updateScore = function updateScore(rootElem, stateScore) {
		let newScoreElem = createSVGFromScore(stateScore.data);
		let scoreElem = rootElem.querySelector('div#score');
	
		newScoreElem.setAttribute('id', 'score');
		rootElem.replaceChild(newScoreElem, scoreElem);
	};
	
	// EVENT HANDLERS
	
	handleMIDIStateChange = function handleMIDIStateChange(connEvt) {
		let device = connEvt.port;
	
		if (device.type !== 'input') {
			Store.dispatch(API.LOG(device));
		} else {
			Store.dispatch(API.UPDATE_MIDI_INPUT(device));
		}
	};
	
	handleMIDIMessage = function handleMIDIMessage(msgEvt) {
		let note = convertMIDIMessageToNote(msgEvt);
	
		if (note.type === undefined) {
			return;
		}
		
		Store.dispatch(API.TRACK_MIDI_NOTE(note));
	};
	
	// HELPERS
	
	convertMIDIMessageToNote = function convertMIDIMessageToNote(msgEvt) {
		let msgData = msgEvt.data;
		let typeId        = msgData[0] >> 4,
		    channelNumber = msgData[0] & 0b00001111,
		    noteNumber    = msgData[1],
		    velocity      = msgData[2];
		let noteMsg = {
			type: undefined,
			receivedTime: msgEvt.receivedTime,
			rawData: msgData
		};
	
		if (typeId === 0b1000) {
			noteMsg.type = 'note-off';
		} else if (typeId == 0b1001) {
			noteMsg.type = (velocity === 0 ? 'note-off' : 'note-on');
		}
	
		if (noteMsg.type === 'note-on' || noteMsg.type === 'note-off') {
			noteMsg.channelNumber = channelNumber;
			noteMsg.noteNumber    = noteNumber;
			noteMsg.velocity      = velocity;
		}
	
		return noteMsg;
	};
	
	const View = createView(__webpack_require__(77)(), initializer, patcher);
	
	module.exports = View;


/***/ },
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ }
/******/ ]);
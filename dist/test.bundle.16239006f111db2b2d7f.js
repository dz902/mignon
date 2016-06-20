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

	/* jslint node: true, esversion: 6 */
	
	const requireAll = (requireContext) => { requireContext.keys().map(requireContext); };
	
	requireAll(__webpack_require__(117));


/***/ },
/* 1 */
/***/ function(module, exports) {

	var isArray = (typeof Array.isArray === 'function') ?
	  // use native function
	  Array.isArray :
	  // use instanceof operator
	  function(a) {
	    return a instanceof Array;
	  };
	
	var getObjectKeys = typeof Object.keys === 'function' ?
	  function(obj) {
	    return Object.keys(obj);
	  } : function(obj) {
	    var names = [];
	    for (var property in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, property)) {
	        names.push(property);
	      }
	    }
	    return names;
	  };
	
	var trimUnderscore = function(str) {
	  if (str.substr(0, 1) === '_') {
	    return str.slice(1);
	  }
	  return str;
	};
	
	var arrayKeyToSortNumber = function(key) {
	  if (key === '_t') {
	    return -1;
	  } else {
	    if (key.substr(0, 1) === '_') {
	      return parseInt(key.slice(1), 10);
	    } else {
	      return parseInt(key, 10) + 0.1;
	    }
	  }
	};
	
	var arrayKeyComparer = function(key1, key2) {
	  return arrayKeyToSortNumber(key1) - arrayKeyToSortNumber(key2);
	};
	
	var BaseFormatter = function BaseFormatter() {};
	
	BaseFormatter.prototype.format = function(delta, left) {
	  var context = {};
	  this.prepareContext(context);
	  this.recurse(context, delta, left);
	  return this.finalize(context);
	};
	
	BaseFormatter.prototype.prepareContext = function(context) {
	  context.buffer = [];
	  context.out = function() {
	    this.buffer.push.apply(this.buffer, arguments);
	  };
	};
	
	BaseFormatter.prototype.typeFormattterNotFound = function(context, deltaType) {
	  throw new Error('cannot format delta type: ' + deltaType);
	};
	
	BaseFormatter.prototype.typeFormattterErrorFormatter = function(context, err) {
	  return err.toString();
	};
	
	BaseFormatter.prototype.finalize = function(context) {
	  if (isArray(context.buffer)) {
	    return context.buffer.join('');
	  }
	};
	
	BaseFormatter.prototype.recurse = function(context, delta, left, key, leftKey, movedFrom, isLast) {
	
	  var useMoveOriginHere = delta && movedFrom;
	  var leftValue = useMoveOriginHere ? movedFrom.value : left;
	
	  if (typeof delta === 'undefined' && typeof key === 'undefined') {
	    return undefined;
	  }
	
	  var type = this.getDeltaType(delta, movedFrom);
	  var nodeType = type === 'node' ? (delta._t === 'a' ? 'array' : 'object') : '';
	
	  if (typeof key !== 'undefined') {
	    this.nodeBegin(context, key, leftKey, type, nodeType, isLast);
	  } else {
	    this.rootBegin(context, type, nodeType);
	  }
	
	  var typeFormattter;
	  try {
	    typeFormattter = this['format_' + type] || this.typeFormattterNotFound(context, type);
	    typeFormattter.call(this, context, delta, leftValue, key, leftKey, movedFrom);
	  } catch (err) {
	    this.typeFormattterErrorFormatter(context, err, delta, leftValue, key, leftKey, movedFrom);
	    if (typeof console !== 'undefined' && console.error) {
	      console.error(err.stack);
	    }
	  }
	
	  if (typeof key !== 'undefined') {
	    this.nodeEnd(context, key, leftKey, type, nodeType, isLast);
	  } else {
	    this.rootEnd(context, type, nodeType);
	  }
	};
	
	BaseFormatter.prototype.formatDeltaChildren = function(context, delta, left) {
	  var self = this;
	  this.forEachDeltaKey(delta, left, function(key, leftKey, movedFrom, isLast) {
	    self.recurse(context, delta[key], left ? left[leftKey] : undefined,
	      key, leftKey, movedFrom, isLast);
	  });
	};
	
	BaseFormatter.prototype.forEachDeltaKey = function(delta, left, fn) {
	  var keys = getObjectKeys(delta);
	  var arrayKeys = delta._t === 'a';
	  var moveDestinations = {};
	  var name;
	  if (typeof left !== 'undefined') {
	    for (name in left) {
	      if (typeof delta[name] === 'undefined' &&
	        ((!arrayKeys) || typeof delta['_' + name] === 'undefined')) {
	        keys.push(name);
	      }
	    }
	  }
	  // look for move destinations
	  for (name in delta) {
	    var value = delta[name];
	    if (isArray(value) && value[2] === 3) {
	      moveDestinations[value[1].toString()] = {
	        key: name,
	        value: left && left[parseInt(name.substr(1))]
	      };
	      if (this.includeMoveDestinations !== false) {
	        if ((typeof left === 'undefined') &&
	          (typeof delta[value[1]] === 'undefined')) {
	          keys.push(value[1].toString());
	        }
	      }
	    }
	  }
	  if (arrayKeys) {
	    keys.sort(arrayKeyComparer);
	  } else {
	    keys.sort();
	  }
	  for (var index = 0, length = keys.length; index < length; index++) {
	    var key = keys[index];
	    if (arrayKeys && key === '_t') {
	      continue;
	    }
	    var leftKey = arrayKeys ?
	      (typeof key === 'number' ? key : parseInt(trimUnderscore(key), 10)) :
	      key;
	    var isLast = (index === length - 1);
	    fn(key, leftKey, moveDestinations[leftKey], isLast);
	  }
	};
	
	BaseFormatter.prototype.getDeltaType = function(delta, movedFrom) {
	  if (typeof delta === 'undefined') {
	    if (typeof movedFrom !== 'undefined') {
	      return 'movedestination';
	    }
	    return 'unchanged';
	  }
	  if (isArray(delta)) {
	    if (delta.length === 1) {
	      return 'added';
	    }
	    if (delta.length === 2) {
	      return 'modified';
	    }
	    if (delta.length === 3 && delta[2] === 0) {
	      return 'deleted';
	    }
	    if (delta.length === 3 && delta[2] === 2) {
	      return 'textdiff';
	    }
	    if (delta.length === 3 && delta[2] === 3) {
	      return 'moved';
	    }
	  } else if (typeof delta === 'object') {
	    return 'node';
	  }
	  return 'unknown';
	};
	
	BaseFormatter.prototype.parseTextDiff = function(value) {
	  var output = [];
	  var lines = value.split('\n@@ ');
	  for (var i = 0, l = lines.length; i < l; i++) {
	    var line = lines[i];
	    var lineOutput = {
	      pieces: []
	    };
	    var location = /^(?:@@ )?[-+]?(\d+),(\d+)/.exec(line).slice(1);
	    lineOutput.location = {
	      line: location[0],
	      chr: location[1]
	    };
	    var pieces = line.split('\n').slice(1);
	    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
	      var piece = pieces[pieceIndex];
	      if (!piece.length) {
	        continue;
	      }
	      var pieceOutput = {
	        type: 'context'
	      };
	      if (piece.substr(0, 1) === '+') {
	        pieceOutput.type = 'added';
	      } else if (piece.substr(0, 1) === '-') {
	        pieceOutput.type = 'deleted';
	      }
	      pieceOutput.text = piece.slice(1);
	      lineOutput.pieces.push(pieceOutput);
	    }
	    output.push(lineOutput);
	  }
	  return output;
	};
	
	exports.BaseFormatter = BaseFormatter;


/***/ },
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
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	/* Array utilities. */
	var arrays = {
	  range: function(start, stop) {
	    var length = stop - start,
	        result = new Array(length),
	        i, j;
	
	    for (i = 0, j = start; i < length; i++, j++) {
	      result[i] = j;
	    }
	
	    return result;
	  },
	
	  find: function(array, valueOrPredicate) {
	    var length = array.length, i;
	
	    if (typeof valueOrPredicate === "function") {
	      for (i = 0; i < length; i++) {
	        if (valueOrPredicate(array[i])) {
	          return array[i];
	        }
	      }
	    } else {
	      for (i = 0; i < length; i++) {
	        if (array[i] === valueOrPredicate) {
	          return array[i];
	        }
	      }
	    }
	  },
	
	  indexOf: function(array, valueOrPredicate) {
	    var length = array.length, i;
	
	    if (typeof valueOrPredicate === "function") {
	      for (i = 0; i < length; i++) {
	        if (valueOrPredicate(array[i])) {
	          return i;
	        }
	      }
	    } else {
	      for (i = 0; i < length; i++) {
	        if (array[i] === valueOrPredicate) {
	          return i;
	        }
	      }
	    }
	
	    return -1;
	  },
	
	  contains: function(array, valueOrPredicate) {
	    return arrays.indexOf(array, valueOrPredicate) !== -1;
	  },
	
	  each: function(array, iterator) {
	    var length = array.length, i;
	
	    for (i = 0; i < length; i++) {
	      iterator(array[i], i);
	    }
	  },
	
	  map: function(array, iterator) {
	    var length = array.length,
	        result = new Array(length),
	        i;
	
	    for (i = 0; i < length; i++) {
	      result[i] = iterator(array[i], i);
	    }
	
	    return result;
	  },
	
	  pluck: function(array, key) {
	    return arrays.map(array, function (e) { return e[key]; });
	  },
	
	  every: function(array, predicate) {
	    var length = array.length, i;
	
	    for (i = 0; i < length; i++) {
	      if (!predicate(array[i])) {
	        return false;
	      }
	    }
	
	    return true;
	  },
	
	  some: function(array, predicate) {
	    var length = array.length, i;
	
	    for (i = 0; i < length; i++) {
	      if (predicate(array[i])) {
	        return true;
	      }
	    }
	
	    return false;
	  }
	};
	
	module.exports = arrays;


/***/ },
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var objects = __webpack_require__(31),
	    arrays  = __webpack_require__(3);
	
	/* Simple AST node visitor builder. */
	var visitor = {
	  build: function(functions) {
	    function visit(node) {
	      return functions[node.type].apply(null, arguments);
	    }
	
	    function visitNop() { }
	
	    function visitExpression(node) {
	      var extraArgs = Array.prototype.slice.call(arguments, 1);
	
	      visit.apply(null, [node.expression].concat(extraArgs));
	    }
	
	    function visitChildren(property) {
	      return function(node) {
	        var extraArgs = Array.prototype.slice.call(arguments, 1);
	
	        arrays.each(node[property], function(child) {
	          visit.apply(null, [child].concat(extraArgs));
	        });
	      };
	    }
	
	    var DEFAULT_FUNCTIONS = {
	          grammar: function(node) {
	            var extraArgs = Array.prototype.slice.call(arguments, 1);
	
	            if (node.initializer) {
	              visit.apply(null, [node.initializer].concat(extraArgs));
	            }
	
	            arrays.each(node.rules, function(rule) {
	              visit.apply(null, [rule].concat(extraArgs));
	            });
	          },
	
	          initializer:  visitNop,
	          rule:         visitExpression,
	          named:        visitExpression,
	          choice:       visitChildren("alternatives"),
	          action:       visitExpression,
	          sequence:     visitChildren("elements"),
	          labeled:      visitExpression,
	          text:         visitExpression,
	          simple_and:   visitExpression,
	          simple_not:   visitExpression,
	          optional:     visitExpression,
	          zero_or_more: visitExpression,
	          one_or_more:  visitExpression,
	          semantic_and: visitNop,
	          semantic_not: visitNop,
	          rule_ref:     visitNop,
	          literal:      visitNop,
	          "class":      visitNop,
	          any:          visitNop
	        };
	
	    objects.defaults(functions, DEFAULT_FUNCTIONS);
	
	    return visit;
	  }
	};
	
	module.exports = visitor;


/***/ },
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	var Pipe = __webpack_require__(29).Pipe;
	
	var Context = function Context(){
	};
	
	Context.prototype.setResult = function(result) {
		this.result = result;
		this.hasResult = true;
		return this;
	};
	
	Context.prototype.exit = function() {
		this.exiting = true;
		return this;
	};
	
	Context.prototype.switchTo = function(next, pipe) {
		if (typeof next === 'string' || next instanceof Pipe) {
			this.nextPipe = next;
		} else {
			this.next = next;
			if (pipe) {
				this.nextPipe = pipe;
			}
		}
		return this;
	};
	
	Context.prototype.push = function(child, name) {
		child.parent = this;
		if (typeof name !== 'undefined') {
			child.childName = name;
		}
		child.root = this.root || this;
		child.options = child.options || this.options;
		if (!this.children) {
			this.children = [child];
			this.nextAfterChildren = this.next || null;
			this.next = child;
		} else {
			this.children[this.children.length - 1].next = child;
			this.children.push(child);
		}
		child.next = this;
		return this;
	};
	
	exports.Context = Context;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(12).Context;
	var dateReviver = __webpack_require__(27);
	
	var DiffContext = function DiffContext(left, right) {
	  this.left = left;
	  this.right = right;
	  this.pipe = 'diff';
	};
	
	DiffContext.prototype = new Context();
	
	DiffContext.prototype.setResult = function(result) {
	  if (this.options.cloneDiffValues) {
	    var clone = typeof this.options.cloneDiffValues === 'function' ?
	      this.options.cloneDiffValues : function(value) {
	        return JSON.parse(JSON.stringify(value), dateReviver);
	      };
	    if (typeof result[0] === 'object') {
	      result[0] = clone(result[0]);
	    }
	    if (typeof result[1] === 'object') {
	      result[1] = clone(result[1]);
	    }
	  }
	  return Context.prototype.setResult.apply(this, arguments);
	};
	
	exports.DiffContext = DiffContext;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(12).Context;
	
	var PatchContext = function PatchContext(left, delta) {
	  this.left = left;
	  this.delta = delta;
	  this.pipe = 'patch';
	};
	
	PatchContext.prototype = new Context();
	
	exports.PatchContext = PatchContext;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(12).Context;
	
	var ReverseContext = function ReverseContext(delta) {
	  this.delta = delta;
	  this.pipe = 'reverse';
	};
	
	ReverseContext.prototype = new Context();
	
	exports.ReverseContext = ReverseContext;


/***/ },
/* 16 */
/***/ function(module, exports) {

	
	exports.isBrowser = typeof window !== 'undefined';


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var base = __webpack_require__(1);
	var BaseFormatter = base.BaseFormatter;
	
	var AnnotatedFormatter = function AnnotatedFormatter() {
	  this.includeMoveDestinations = false;
	};
	
	AnnotatedFormatter.prototype = new BaseFormatter();
	
	AnnotatedFormatter.prototype.prepareContext = function(context) {
	  BaseFormatter.prototype.prepareContext.call(this, context);
	  context.indent = function(levels) {
	    this.indentLevel = (this.indentLevel || 0) +
	      (typeof levels === 'undefined' ? 1 : levels);
	    this.indentPad = new Array(this.indentLevel + 1).join('&nbsp;&nbsp;');
	  };
	  context.row = function(json, htmlNote) {
	    context.out('<tr><td style="white-space: nowrap;">' +
	      '<pre class="jsondiffpatch-annotated-indent" style="display: inline-block">');
	    context.out(context.indentPad);
	    context.out('</pre><pre style="display: inline-block">');
	    context.out(json);
	    context.out('</pre></td><td class="jsondiffpatch-delta-note"><div>');
	    context.out(htmlNote);
	    context.out('</div></td></tr>');
	  };
	};
	
	AnnotatedFormatter.prototype.typeFormattterErrorFormatter = function(context, err) {
	  context.row('', '<pre class="jsondiffpatch-error">' + err + '</pre>');
	};
	
	AnnotatedFormatter.prototype.formatTextDiffString = function(context, value) {
	  var lines = this.parseTextDiff(value);
	  context.out('<ul class="jsondiffpatch-textdiff">');
	  for (var i = 0, l = lines.length; i < l; i++) {
	    var line = lines[i];
	    context.out('<li>' +
	      '<div class="jsondiffpatch-textdiff-location">' +
	      '<span class="jsondiffpatch-textdiff-line-number">' +
	      line.location.line +
	      '</span>' +
	      '<span class="jsondiffpatch-textdiff-char">' +
	      line.location.chr +
	      '</span>' +
	      '</div>' +
	      '<div class="jsondiffpatch-textdiff-line">');
	    var pieces = line.pieces;
	    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
	      var piece = pieces[pieceIndex];
	      context.out('<span class="jsondiffpatch-textdiff-' + piece.type + '">' +
	        piece.text + '</span>');
	    }
	    context.out('</div></li>');
	  }
	  context.out('</ul>');
	};
	
	AnnotatedFormatter.prototype.rootBegin = function(context, type, nodeType) {
	  context.out('<table class="jsondiffpatch-annotated-delta">');
	  if (type === 'node') {
	    context.row('{');
	    context.indent();
	  }
	  if (nodeType === 'array') {
	    context.row('"_t": "a",', 'Array delta (member names indicate array indices)');
	  }
	};
	
	AnnotatedFormatter.prototype.rootEnd = function(context, type) {
	  if (type === 'node') {
	    context.indent(-1);
	    context.row('}');
	  }
	  context.out('</table>');
	};
	
	AnnotatedFormatter.prototype.nodeBegin = function(context, key, leftKey, type, nodeType) {
	  context.row('&quot;' + key + '&quot;: {');
	  if (type === 'node') {
	    context.indent();
	  }
	  if (nodeType === 'array') {
	    context.row('"_t": "a",', 'Array delta (member names indicate array indices)');
	  }
	};
	
	AnnotatedFormatter.prototype.nodeEnd = function(context, key, leftKey, type, nodeType, isLast) {
	  if (type === 'node') {
	    context.indent(-1);
	  }
	  context.row('}' + (isLast ? '' : ','));
	};
	
	/* jshint camelcase: false */
	
	AnnotatedFormatter.prototype.format_unchanged = function() {
	  return;
	};
	
	AnnotatedFormatter.prototype.format_movedestination = function() {
	  return;
	};
	
	
	AnnotatedFormatter.prototype.format_node = function(context, delta, left) {
	  // recurse
	  this.formatDeltaChildren(context, delta, left);
	};
	
	var wrapPropertyName = function(name) {
	  return '<pre style="display:inline-block">&quot;' + name + '&quot;</pre>';
	};
	
	var deltaAnnotations = {
	  added: function(delta, left, key, leftKey) {
	    var formatLegend = ' <pre>([newValue])</pre>';
	    if (typeof leftKey === 'undefined') {
	      return 'new value' + formatLegend;
	    }
	    if (typeof leftKey === 'number') {
	      return 'insert at index ' + leftKey + formatLegend;
	    }
	    return 'add property ' + wrapPropertyName(leftKey) + formatLegend;
	  },
	  modified: function(delta, left, key, leftKey) {
	    var formatLegend = ' <pre>([previousValue, newValue])</pre>';
	    if (typeof leftKey === 'undefined') {
	      return 'modify value' + formatLegend;
	    }
	    if (typeof leftKey === 'number') {
	      return 'modify at index ' + leftKey + formatLegend;
	    }
	    return 'modify property ' + wrapPropertyName(leftKey) + formatLegend;
	  },
	  deleted: function(delta, left, key, leftKey) {
	    var formatLegend = ' <pre>([previousValue, 0, 0])</pre>';
	    if (typeof leftKey === 'undefined') {
	      return 'delete value' + formatLegend;
	    }
	    if (typeof leftKey === 'number') {
	      return 'remove index ' + leftKey + formatLegend;
	    }
	    return 'delete property ' + wrapPropertyName(leftKey) + formatLegend;
	  },
	  moved: function(delta, left, key, leftKey) {
	    return 'move from <span title="(position to remove at original state)">index ' +
	      leftKey + '</span> to ' +
	      '<span title="(position to insert at final state)">index ' +
	      delta[1] + '</span>';
	  },
	  textdiff: function(delta, left, key, leftKey) {
	    var location = (typeof leftKey === 'undefined') ?
	      '' : (
	        (typeof leftKey === 'number') ?
	        ' at index ' + leftKey :
	        ' at property ' + wrapPropertyName(leftKey)
	      );
	    return 'text diff' + location + ', format is ' +
	      '<a href="https://code.google.com/p/google-diff-match-patch/wiki/Unidiff">' +
	      'a variation of Unidiff</a>';
	  }
	};
	
	var formatAnyChange = function(context, delta) {
	  var deltaType = this.getDeltaType(delta);
	  var annotator = deltaAnnotations[deltaType];
	  var htmlNote = annotator && annotator.apply(annotator,
	    Array.prototype.slice.call(arguments, 1));
	  var json = JSON.stringify(delta, null, 2);
	  if (deltaType === 'textdiff') {
	    // split text diffs lines
	    json = json.split('\\n').join('\\n"+\n   "');
	  }
	  context.indent();
	  context.row(json, htmlNote);
	  context.indent(-1);
	};
	
	AnnotatedFormatter.prototype.format_added = formatAnyChange;
	AnnotatedFormatter.prototype.format_modified = formatAnyChange;
	AnnotatedFormatter.prototype.format_deleted = formatAnyChange;
	AnnotatedFormatter.prototype.format_moved = formatAnyChange;
	AnnotatedFormatter.prototype.format_textdiff = formatAnyChange;
	
	/* jshint camelcase: true */
	
	exports.AnnotatedFormatter = AnnotatedFormatter;
	
	var defaultInstance;
	
	exports.format = function(delta, left) {
	  if (!defaultInstance) {
	    defaultInstance = new AnnotatedFormatter();
	  }
	  return defaultInstance.format(delta, left);
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var chalk = __webpack_require__(79);
	var base = __webpack_require__(1);
	var BaseFormatter = base.BaseFormatter;
	
	var colors = {
	  added: chalk.green,
	  deleted: chalk.red,
	  movedestination: chalk.gray,
	  moved: chalk.yellow,
	  unchanged: chalk.gray,
	  error: chalk.white.bgRed,
	  textDiffLine: chalk.gray
	};
	
	var ConsoleFormatter = function ConsoleFormatter() {
	  this.includeMoveDestinations = false;
	};
	
	ConsoleFormatter.prototype = new BaseFormatter();
	
	ConsoleFormatter.prototype.prepareContext = function(context) {
	  BaseFormatter.prototype.prepareContext.call(this, context);
	  context.indent = function(levels) {
	    this.indentLevel = (this.indentLevel || 0) +
	      (typeof levels === 'undefined' ? 1 : levels);
	    this.indentPad = new Array(this.indentLevel + 1).join('  ');
	    this.outLine();
	  };
	  context.outLine = function() {
	    this.buffer.push('\n' + (this.indentPad || ''));
	  };
	  context.out = function() {
	    for (var i = 0, l = arguments.length; i < l; i++) {
	      var lines = arguments[i].split('\n');
	      var text = lines.join('\n' + (this.indentPad || ''));
	      if (this.color && this.color[0]) {
	        text = this.color[0](text);
	      }
	      this.buffer.push(text);
	    }
	  };
	  context.pushColor = function(color) {
	    this.color = this.color || [];
	    this.color.unshift(color);
	  };
	  context.popColor = function() {
	    this.color = this.color || [];
	    this.color.shift();
	  };
	};
	
	ConsoleFormatter.prototype.typeFormattterErrorFormatter = function(context, err) {
	  context.pushColor(colors.error);
	  context.out('[ERROR]' + err);
	  context.popColor();
	};
	
	ConsoleFormatter.prototype.formatValue = function(context, value) {
	  context.out(JSON.stringify(value, null, 2));
	};
	
	ConsoleFormatter.prototype.formatTextDiffString = function(context, value) {
	  var lines = this.parseTextDiff(value);
	  context.indent();
	  for (var i = 0, l = lines.length; i < l; i++) {
	    var line = lines[i];
	    context.pushColor(colors.textDiffLine);
	    context.out(line.location.line + ',' + line.location.chr + ' ');
	    context.popColor();
	    var pieces = line.pieces;
	    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
	      var piece = pieces[pieceIndex];
	      context.pushColor(colors[piece.type]);
	      context.out(piece.text);
	      context.popColor();
	    }
	    if (i < l - 1) {
	      context.outLine();
	    }
	  }
	  context.indent(-1);
	};
	
	ConsoleFormatter.prototype.rootBegin = function(context, type, nodeType) {
	  context.pushColor(colors[type]);
	  if (type === 'node') {
	    context.out(nodeType === 'array' ? '[' : '{');
	    context.indent();
	  }
	};
	
	ConsoleFormatter.prototype.rootEnd = function(context, type, nodeType) {
	  if (type === 'node') {
	    context.indent(-1);
	    context.out(nodeType === 'array' ? ']' : '}');
	  }
	  context.popColor();
	};
	
	ConsoleFormatter.prototype.nodeBegin = function(context, key, leftKey, type, nodeType) {
	  context.pushColor(colors[type]);
	  context.out(leftKey + ': ');
	  if (type === 'node') {
	    context.out(nodeType === 'array' ? '[' : '{');
	    context.indent();
	  }
	};
	
	ConsoleFormatter.prototype.nodeEnd = function(context, key, leftKey, type, nodeType, isLast) {
	  if (type === 'node') {
	    context.indent(-1);
	    context.out(nodeType === 'array' ? ']' : '}' +
	      (isLast ? '' : ','));
	  }
	  if (!isLast) {
	    context.outLine();
	  }
	  context.popColor();
	};
	
	/* jshint camelcase: false */
	
	ConsoleFormatter.prototype.format_unchanged = function(context, delta, left) {
	  if (typeof left === 'undefined') {
	    return;
	  }
	  this.formatValue(context, left);
	};
	
	ConsoleFormatter.prototype.format_movedestination = function(context, delta, left) {
	  if (typeof left === 'undefined') {
	    return;
	  }
	  this.formatValue(context, left);
	};
	
	ConsoleFormatter.prototype.format_node = function(context, delta, left) {
	  // recurse
	  this.formatDeltaChildren(context, delta, left);
	};
	
	ConsoleFormatter.prototype.format_added = function(context, delta) {
	  this.formatValue(context, delta[0]);
	};
	
	ConsoleFormatter.prototype.format_modified = function(context, delta) {
	  context.pushColor(colors.deleted);
	  this.formatValue(context, delta[0]);
	  context.popColor();
	  context.out(' => ');
	  context.pushColor(colors.added);
	  this.formatValue(context, delta[1]);
	  context.popColor();
	};
	
	ConsoleFormatter.prototype.format_deleted = function(context, delta) {
	  this.formatValue(context, delta[0]);
	};
	
	ConsoleFormatter.prototype.format_moved = function(context, delta) {
	  context.out('==> ' + delta[1]);
	};
	
	ConsoleFormatter.prototype.format_textdiff = function(context, delta) {
	  this.formatTextDiffString(context, delta[0]);
	};
	
	/* jshint camelcase: true */
	
	exports.ConsoleFormatter = ConsoleFormatter;
	
	var defaultInstance;
	
	var format = function(delta, left) {
	  if (!defaultInstance) {
	    defaultInstance = new ConsoleFormatter();
	  }
	  return defaultInstance.format(delta, left);
	};
	
	exports.log = function(delta, left) {
	  console.log(format(delta, left));
	};
	
	exports.format = format;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var base = __webpack_require__(1);
	var BaseFormatter = base.BaseFormatter;
	
	var HtmlFormatter = function HtmlFormatter() {};
	
	HtmlFormatter.prototype = new BaseFormatter();
	
	function htmlEscape(text) {
	  var html = text;
	  var replacements = [
	    [/&/g, '&amp;'],
	    [/</g, '&lt;'],
	    [/>/g, '&gt;'],
	    [/'/g, '&apos;'],
	    [/"/g, '&quot;']
	  ];
	  for (var i = 0; i < replacements.length; i++) {
	    html = html.replace(replacements[i][0], replacements[i][1]);
	  }
	  return html;
	}
	
	HtmlFormatter.prototype.typeFormattterErrorFormatter = function(context, err) {
	  context.out('<pre class="jsondiffpatch-error">' + err + '</pre>');
	};
	
	HtmlFormatter.prototype.formatValue = function(context, value) {
	  context.out('<pre>' + htmlEscape(JSON.stringify(value, null, 2)) + '</pre>');
	};
	
	HtmlFormatter.prototype.formatTextDiffString = function(context, value) {
	  var lines = this.parseTextDiff(value);
	  context.out('<ul class="jsondiffpatch-textdiff">');
	  for (var i = 0, l = lines.length; i < l; i++) {
	    var line = lines[i];
	    context.out('<li>' +
	      '<div class="jsondiffpatch-textdiff-location">' +
	      '<span class="jsondiffpatch-textdiff-line-number">' +
	      line.location.line +
	      '</span>' +
	      '<span class="jsondiffpatch-textdiff-char">' +
	      line.location.chr +
	      '</span>' +
	      '</div>' +
	      '<div class="jsondiffpatch-textdiff-line">');
	    var pieces = line.pieces;
	    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
	      /* global unescape */
	      var piece = pieces[pieceIndex];
	      context.out('<span class="jsondiffpatch-textdiff-' + piece.type + '">' +
	        htmlEscape(unescape(piece.text)) + '</span>');
	    }
	    context.out('</div></li>');
	  }
	  context.out('</ul>');
	};
	
	var adjustArrows = function jsondiffpatchHtmlFormatterAdjustArrows(node) {
	  node = node || document;
	  var getElementText = function(el) {
	    return el.textContent || el.innerText;
	  };
	  var eachByQuery = function(el, query, fn) {
	    var elems = el.querySelectorAll(query);
	    for (var i = 0, l = elems.length; i < l; i++) {
	      fn(elems[i]);
	    }
	  };
	  var eachChildren = function(el, fn) {
	    for (var i = 0, l = el.children.length; i < l; i++) {
	      fn(el.children[i], i);
	    }
	  };
	  eachByQuery(node, '.jsondiffpatch-arrow', function(arrow) {
	    var arrowParent = arrow.parentNode;
	    var svg = arrow.children[0],
	      path = svg.children[1];
	    svg.style.display = 'none';
	    var destination = getElementText(arrowParent.querySelector('.jsondiffpatch-moved-destination'));
	    var container = arrowParent.parentNode;
	    var destinationElem;
	    eachChildren(container, function(child) {
	      if (child.getAttribute('data-key') === destination) {
	        destinationElem = child;
	      }
	    });
	    if (!destinationElem) {
	      return;
	    }
	    try {
	      var distance = destinationElem.offsetTop - arrowParent.offsetTop;
	      svg.setAttribute('height', Math.abs(distance) + 6);
	      arrow.style.top = (-8 + (distance > 0 ? 0 : distance)) + 'px';
	      var curve = distance > 0 ?
	        'M30,0 Q-10,' + Math.round(distance / 2) + ' 26,' + (distance - 4) :
	        'M30,' + (-distance) + ' Q-10,' + Math.round(-distance / 2) + ' 26,4';
	      path.setAttribute('d', curve);
	      svg.style.display = '';
	    } catch (err) {
	      return;
	    }
	  });
	};
	
	HtmlFormatter.prototype.rootBegin = function(context, type, nodeType) {
	  var nodeClass = 'jsondiffpatch-' + type +
	    (nodeType ? ' jsondiffpatch-child-node-type-' + nodeType : '');
	  context.out('<div class="jsondiffpatch-delta ' + nodeClass + '">');
	};
	
	HtmlFormatter.prototype.rootEnd = function(context) {
	  context.out('</div>' + (context.hasArrows ?
	    ('<script type="text/javascript">setTimeout(' +
	      adjustArrows.toString() +
	      ',10);</script>') : ''));
	};
	
	HtmlFormatter.prototype.nodeBegin = function(context, key, leftKey, type, nodeType) {
	  var nodeClass = 'jsondiffpatch-' + type +
	    (nodeType ? ' jsondiffpatch-child-node-type-' + nodeType : '');
	  context.out('<li class="' + nodeClass + '" data-key="' + leftKey + '">' +
	    '<div class="jsondiffpatch-property-name">' + leftKey + '</div>');
	};
	
	
	HtmlFormatter.prototype.nodeEnd = function(context) {
	  context.out('</li>');
	};
	
	/* jshint camelcase: false */
	
	HtmlFormatter.prototype.format_unchanged = function(context, delta, left) {
	  if (typeof left === 'undefined') {
	    return;
	  }
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatValue(context, left);
	  context.out('</div>');
	};
	
	HtmlFormatter.prototype.format_movedestination = function(context, delta, left) {
	  if (typeof left === 'undefined') {
	    return;
	  }
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatValue(context, left);
	  context.out('</div>');
	};
	
	HtmlFormatter.prototype.format_node = function(context, delta, left) {
	  // recurse
	  var nodeType = (delta._t === 'a') ? 'array' : 'object';
	  context.out('<ul class="jsondiffpatch-node jsondiffpatch-node-type-' + nodeType + '">');
	  this.formatDeltaChildren(context, delta, left);
	  context.out('</ul>');
	};
	
	HtmlFormatter.prototype.format_added = function(context, delta) {
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatValue(context, delta[0]);
	  context.out('</div>');
	};
	
	HtmlFormatter.prototype.format_modified = function(context, delta) {
	  context.out('<div class="jsondiffpatch-value jsondiffpatch-left-value">');
	  this.formatValue(context, delta[0]);
	  context.out('</div>' +
	    '<div class="jsondiffpatch-value jsondiffpatch-right-value">');
	  this.formatValue(context, delta[1]);
	  context.out('</div>');
	};
	
	HtmlFormatter.prototype.format_deleted = function(context, delta) {
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatValue(context, delta[0]);
	  context.out('</div>');
	};
	
	HtmlFormatter.prototype.format_moved = function(context, delta) {
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatValue(context, delta[0]);
	  context.out('</div><div class="jsondiffpatch-moved-destination">' + delta[1] + '</div>');
	
	  // draw an SVG arrow from here to move destination
	  context.out(
	    /*jshint multistr: true */
	    '<div class="jsondiffpatch-arrow" style="position: relative; left: -34px;">\
	        <svg width="30" height="60" style="position: absolute; display: none;">\
	        <defs>\
	            <marker id="markerArrow" markerWidth="8" markerHeight="8" refx="2" refy="4"\
	                   orient="auto" markerUnits="userSpaceOnUse">\
	                <path d="M1,1 L1,7 L7,4 L1,1" style="fill: #339;" />\
	            </marker>\
	        </defs>\
	        <path d="M30,0 Q-10,25 26,50" style="stroke: #88f; stroke-width: 2px; fill: none;\
	        stroke-opacity: 0.5; marker-end: url(#markerArrow);"></path>\
	        </svg>\
	        </div>');
	  context.hasArrows = true;
	};
	
	HtmlFormatter.prototype.format_textdiff = function(context, delta) {
	  context.out('<div class="jsondiffpatch-value">');
	  this.formatTextDiffString(context, delta[0]);
	  context.out('</div>');
	};
	
	/* jshint camelcase: true */
	
	var showUnchanged = function(show, node, delay) {
	  var el = node || document.body;
	  var prefix = 'jsondiffpatch-unchanged-';
	  var classes = {
	    showing: prefix + 'showing',
	    hiding: prefix + 'hiding',
	    visible: prefix + 'visible',
	    hidden: prefix + 'hidden',
	  };
	  var list = el.classList;
	  if (!list) {
	    return;
	  }
	  if (!delay) {
	    list.remove(classes.showing);
	    list.remove(classes.hiding);
	    list.remove(classes.visible);
	    list.remove(classes.hidden);
	    if (show === false) {
	      list.add(classes.hidden);
	    }
	    return;
	  }
	  if (show === false) {
	    list.remove(classes.showing);
	    list.add(classes.visible);
	    setTimeout(function() {
	      list.add(classes.hiding);
	    }, 10);
	  } else {
	    list.remove(classes.hiding);
	    list.add(classes.showing);
	    list.remove(classes.hidden);
	  }
	  var intervalId = setInterval(function() {
	    adjustArrows(el);
	  }, 100);
	  setTimeout(function() {
	    list.remove(classes.showing);
	    list.remove(classes.hiding);
	    if (show === false) {
	      list.add(classes.hidden);
	      list.remove(classes.visible);
	    } else {
	      list.add(classes.visible);
	      list.remove(classes.hidden);
	    }
	    setTimeout(function() {
	      list.remove(classes.visible);
	      clearInterval(intervalId);
	    }, delay + 400);
	  }, delay);
	};
	
	var hideUnchanged = function(node, delay) {
	  return showUnchanged(false, node, delay);
	};
	
	exports.HtmlFormatter = HtmlFormatter;
	
	exports.showUnchanged = showUnchanged;
	
	exports.hideUnchanged = hideUnchanged;
	
	var defaultInstance;
	
	exports.format = function(delta, left) {
	  if (!defaultInstance) {
	    defaultInstance = new HtmlFormatter();
	  }
	  return defaultInstance.format(delta, left);
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var environment = __webpack_require__(16);
	
	exports.base = __webpack_require__(1);
	exports.html = __webpack_require__(19);
	exports.annotated = __webpack_require__(17);
	exports.jsonpatch = __webpack_require__(21);
	
	if (!environment.isBrowser) {
	  var consoleModuleName = './console';
	  exports.console = __webpack_require__(88)(consoleModuleName);
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	(function () {
	  var base = __webpack_require__(1);
	  var BaseFormatter = base.BaseFormatter;
	
	  var named = {
	    added: 'add',
	    deleted: 'remove',
	    modified: 'replace',
	    moved: 'moved',
	    movedestination: 'movedestination',
	    unchanged: 'unchanged',
	    error: 'error',
	    textDiffLine: 'textDiffLine'
	  };
	
	  function JSONFormatter() {
	    this.includeMoveDestinations = false;
	  }
	
	  JSONFormatter.prototype = new BaseFormatter();
	
	  JSONFormatter.prototype.prepareContext = function (context) {
	    BaseFormatter.prototype.prepareContext.call(this, context);
	    context.result = [];
	    context.path = [];
	    context.pushCurrentOp = function (op, value) {
	      var val = {
	        op: op,
	        path: this.currentPath()
	      };
	      if (typeof value !== 'undefined') {
	        val.value = value;
	      }
	      this.result.push(val);
	    };
	
	    context.currentPath = function () {
	      return '/' + this.path.join('/');
	    };
	  };
	
	  JSONFormatter.prototype.typeFormattterErrorFormatter = function (context, err) {
	    context.out('[ERROR]' + err);
	  };
	
	  JSONFormatter.prototype.rootBegin = function () {
	  };
	
	  JSONFormatter.prototype.rootEnd = function () {
	  };
	
	  JSONFormatter.prototype.nodeBegin = function (context, key, leftKey) {
	    context.path.push(leftKey);
	  };
	
	  JSONFormatter.prototype.nodeEnd = function (context) {
	    context.path.pop();
	  };
	
	  /* jshint camelcase: false */
	
	  JSONFormatter.prototype.format_unchanged = function (context, delta, left) {
	    if (typeof left === 'undefined') {
	      return;
	    }
	    context.pushCurrentOp(named.unchanged, left);
	  };
	
	  JSONFormatter.prototype.format_movedestination = function (context, delta, left) {
	    if (typeof left === 'undefined') {
	      return;
	    }
	    context.pushCurrentOp(named.movedestination, left);
	  };
	
	  JSONFormatter.prototype.format_node = function (context, delta, left) {
	    this.formatDeltaChildren(context, delta, left);
	  };
	
	  JSONFormatter.prototype.format_added = function (context, delta) {
	    context.pushCurrentOp(named.added, delta[0]);
	  };
	
	  JSONFormatter.prototype.format_modified = function (context, delta) {
	    context.pushCurrentOp(named.modified, delta[1]);
	  };
	
	  JSONFormatter.prototype.format_deleted = function (context) {
	    context.pushCurrentOp(named.deleted);
	  };
	
	  JSONFormatter.prototype.format_moved = function (context, delta) {
	    context.pushCurrentOp(named.moved, delta[1]);
	  };
	
	  JSONFormatter.prototype.format_textdiff = function () {
	    throw 'not implimented';
	  };
	
	  JSONFormatter.prototype.format = function (delta, left) {
	    var context = {};
	    this.prepareContext(context);
	    this.recurse(context, delta, left);
	    return context.result;
	  };
	  /* jshint camelcase: true */
	
	  exports.JSONFormatter = JSONFormatter;
	
	  var defaultInstance;
	
	  function last(arr) {
	    return arr[arr.length - 1];
	  }
	
	  function sortBy(arr, pred) {
	    arr.sort(pred);
	    return arr;
	  }
	
	  var compareByIndexDesc = function (indexA, indexB) {
	    var lastA = parseInt(indexA, 10);
	    var lastB = parseInt(indexB, 10);
	    if (!(isNaN(lastA) || isNaN(lastB))) {
	      return lastB - lastA;
	    } else {
	      return 0;
	    }
	  };
	
	  function opsByDescendingOrder(removeOps) {
	    return sortBy(removeOps, function (a, b) {
	      var splitA = a.path.split('/');
	      var splitB = b.path.split('/');
	      if (splitA.length !== splitB.length) {
	        return splitA.length - splitB.length;
	      } else {
	        return compareByIndexDesc(last(splitA), last(splitB));
	      }
	    });
	  }
	
	  function partition(arr, pred) {
	    var left = [];
	    var right = [];
	
	    arr.forEach(function (el) {
	      var coll = pred(el) ? left : right;
	      coll.push(el);
	    });
	    return [left, right];
	  }
	
	  function reorderOps(jsonFormattedDiff) {
	    var removeOpsOtherOps = partition(jsonFormattedDiff, function (operation) {
	      return operation.op === 'remove';
	    });
	    var removeOps = removeOpsOtherOps[0];
	    var otherOps = removeOpsOtherOps[1];
	
	    var removeOpsReverse = opsByDescendingOrder(removeOps);
	    return removeOpsReverse.concat(otherOps);
	  }
	
	
	  var format = function (delta, left) {
	    if (!defaultInstance) {
	      defaultInstance = new JSONFormatter();
	    }
	    return reorderOps(defaultInstance.format(delta, left));
	  };
	
	  exports.log = function (delta, left) {
	    console.log(format(delta, left));
	  };
	
	  exports.format = format;
	})();


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays  = __webpack_require__(3),
	    visitor = __webpack_require__(10);
	
	/* AST utilities. */
	var asts = {
	  findRule: function(ast, name) {
	    return arrays.find(ast.rules, function(r) { return r.name === name; });
	  },
	
	  indexOfRule: function(ast, name) {
	    return arrays.indexOf(ast.rules, function(r) { return r.name === name; });
	  },
	
	  alwaysAdvancesOnSuccess: function(ast, node) {
	    function advancesTrue()  { return true;  }
	    function advancesFalse() { return false; }
	
	    function advancesExpression(node) {
	      return advances(node.expression);
	    }
	
	    var advances = visitor.build({
	      rule:  advancesExpression,
	      named: advancesExpression,
	
	      choice: function(node) {
	        return arrays.every(node.alternatives, advances);
	      },
	
	      action: advancesExpression,
	
	      sequence: function(node) {
	        return arrays.some(node.elements, advances);
	      },
	
	      labeled:      advancesExpression,
	      text:         advancesExpression,
	      simple_and:   advancesFalse,
	      simple_not:   advancesFalse,
	      optional:     advancesFalse,
	      zero_or_more: advancesFalse,
	      one_or_more:  advancesExpression,
	      semantic_and: advancesFalse,
	      semantic_not: advancesFalse,
	
	      rule_ref: function(node) {
	        return advances(asts.findRule(ast, node.name));
	      },
	
	      literal: function(node) {
	        return node.value !== "";
	      },
	
	      "class": advancesTrue,
	      any:     advancesTrue
	    });
	
	    return advances(node);
	  }
	};
	
	module.exports = asts;


/***/ },
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
/* 27 */
/***/ function(module, exports) {

	// use as 2nd parameter for JSON.parse to revive Date instances
	module.exports = function dateReviver(key, value) {
	  var parts;
	  if (typeof value === 'string') {
	    parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|([+\-])(\d{2}):(\d{2}))$/.exec(value);
	    if (parts) {
	      return new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], +parts[4], +parts[5], +parts[6], +(parts[7] || 0)));
	    }
	  }
	  return value;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	
	var environment = __webpack_require__(16);
	
	var DiffPatcher = __webpack_require__(34).DiffPatcher;
	exports.DiffPatcher = DiffPatcher;
	
	exports.create = function(options){
	  return new DiffPatcher(options);
	};
	
	exports.dateReviver = __webpack_require__(27);
	
	var defaultInstance;
	
	exports.diff = function() {
	  if (!defaultInstance) {
	    defaultInstance = new DiffPatcher();
	  }
	  return defaultInstance.diff.apply(defaultInstance, arguments);
	};
	
	exports.patch = function() {
	  if (!defaultInstance) {
	    defaultInstance = new DiffPatcher();
	  }
	  return defaultInstance.patch.apply(defaultInstance, arguments);
	};
	
	exports.unpatch = function() {
	  if (!defaultInstance) {
	    defaultInstance = new DiffPatcher();
	  }
	  return defaultInstance.unpatch.apply(defaultInstance, arguments);
	};
	
	exports.reverse = function() {
	  if (!defaultInstance) {
	    defaultInstance = new DiffPatcher();
	  }
	  return defaultInstance.reverse.apply(defaultInstance, arguments);
	};
	
	if (environment.isBrowser) {
	  exports.homepage = '{{package-homepage}}';
	  exports.version = '{{package-version}}';
	} else {
	  var packageInfoModuleName = '../package.json';
	  var packageInfo = __webpack_require__(66)(packageInfoModuleName);
	  exports.homepage = packageInfo.homepage;
	  exports.version = packageInfo.version;
	
	  var formatterModuleName = './formatters';
	  var formatters = __webpack_require__(66)(formatterModuleName);
	  exports.formatters = formatters;
	  // shortcut for console
	  exports.console = formatters.console;
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	var Pipe = function Pipe(name) {
	  this.name = name;
	  this.filters = [];
	};
	
	Pipe.prototype.process = function(input) {
	  if (!this.processor) {
	    throw new Error('add this pipe to a processor before using it');
	  }
	  var debug = this.debug;
	  var length = this.filters.length;
	  var context = input;
	  for (var index = 0; index < length; index++) {
	    var filter = this.filters[index];
	    if (debug) {
	      this.log('filter: ' + filter.filterName);
	    }
	    filter(context);
	    if (typeof context === 'object' && context.exiting) {
	      context.exiting = false;
	      break;
	    }
	  }
	  if (!context.next && this.resultCheck) {
	    this.resultCheck(context);
	  }
	};
	
	Pipe.prototype.log = function(msg) {
	  console.log('[jsondiffpatch] ' + this.name + ' pipe, ' + msg);
	};
	
	Pipe.prototype.append = function() {
	  this.filters.push.apply(this.filters, arguments);
	  return this;
	};
	
	Pipe.prototype.prepend = function() {
	  this.filters.unshift.apply(this.filters, arguments);
	  return this;
	};
	
	Pipe.prototype.indexOf = function(filterName) {
	  if (!filterName) {
	    throw new Error('a filter name is required');
	  }
	  for (var index = 0; index < this.filters.length; index++) {
	    var filter = this.filters[index];
	    if (filter.filterName === filterName) {
	      return index;
	    }
	  }
	  throw new Error('filter not found: ' + filterName);
	};
	
	Pipe.prototype.list = function() {
	  var names = [];
	  for (var index = 0; index < this.filters.length; index++) {
	    var filter = this.filters[index];
	    names.push(filter.filterName);
	  }
	  return names;
	};
	
	Pipe.prototype.after = function(filterName) {
	  var index = this.indexOf(filterName);
	  var params = Array.prototype.slice.call(arguments, 1);
	  if (!params.length) {
	    throw new Error('a filter is required');
	  }
	  params.unshift(index + 1, 0);
	  Array.prototype.splice.apply(this.filters, params);
	  return this;
	};
	
	Pipe.prototype.before = function(filterName) {
	  var index = this.indexOf(filterName);
	  var params = Array.prototype.slice.call(arguments, 1);
	  if (!params.length) {
	    throw new Error('a filter is required');
	  }
	  params.unshift(index, 0);
	  Array.prototype.splice.apply(this.filters, params);
	  return this;
	};
	
	Pipe.prototype.clear = function() {
	  this.filters.length = 0;
	  return this;
	};
	
	Pipe.prototype.shouldHaveResult = function(should) {
	  if (should === false) {
	    this.resultCheck = null;
	    return;
	  }
	  if (this.resultCheck) {
	    return;
	  }
	  var pipe = this;
	  this.resultCheck = function(context) {
	    if (!context.hasResult) {
	      console.log(context);
	      var error = new Error(pipe.name + ' failed');
	      error.noResult = true;
	      throw error;
	    }
	  };
	  return this;
	};
	
	exports.Pipe = Pipe;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var classes = __webpack_require__(105);
	
	/* Thrown when the grammar contains an error. */
	function GrammarError(message, location) {
	  this.name = "GrammarError";
	  this.message = message;
	  this.location = location;
	
	  if (typeof Error.captureStackTrace === "function") {
	    Error.captureStackTrace(this, GrammarError);
	  }
	}
	
	classes.subclass(GrammarError, Error);
	
	module.exports = GrammarError;


/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	
	/* Object utilities. */
	var objects = {
	  keys: function(object) {
	    var result = [], key;
	
	    for (key in object) {
	      if (object.hasOwnProperty(key)) {
	        result.push(key);
	      }
	    }
	
	    return result;
	  },
	
	  values: function(object) {
	    var result = [], key;
	
	    for (key in object) {
	      if (object.hasOwnProperty(key)) {
	        result.push(object[key]);
	      }
	    }
	
	    return result;
	  },
	
	  clone: function(object) {
	    var result = {}, key;
	
	    for (key in object) {
	      if (object.hasOwnProperty(key)) {
	        result[key] = object[key];
	      }
	    }
	
	    return result;
	  },
	
	  defaults: function(object, defaults) {
	    var key;
	
	    for (key in defaults) {
	      if (defaults.hasOwnProperty(key)) {
	        if (!(key in object)) {
	          object[key] = defaults[key];
	        }
	      }
	    }
	  }
	};
	
	module.exports = objects;


/***/ },
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
/* 33 */
/***/ function(module, exports) {

	/**
	 * Diff Match and Patch
	 *
	 * Copyright 2006 Google Inc.
	 * http://code.google.com/p/google-diff-match-patch/
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *   http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	/**
	 * @fileoverview Computes the difference between two texts to create a patch.
	 * Applies the patch onto another text, allowing for errors.
	 * @author fraser@google.com (Neil Fraser)
	 */
	
	/**
	 * Class containing the diff, match and patch methods.
	 * @constructor
	 */
	function diff_match_patch() {
	
	  // Defaults.
	  // Redefine these in your program to override the defaults.
	
	  // Number of seconds to map a diff before giving up (0 for infinity).
	  this.Diff_Timeout = 1.0;
	  // Cost of an empty edit operation in terms of edit characters.
	  this.Diff_EditCost = 4;
	  // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
	  this.Match_Threshold = 0.5;
	  // How far to search for a match (0 = exact location, 1000+ = broad match).
	  // A match this many characters away from the expected location will add
	  // 1.0 to the score (0.0 is a perfect match).
	  this.Match_Distance = 1000;
	  // When deleting a large block of text (over ~64 characters), how close does
	  // the contents have to match the expected contents. (0.0 = perfection,
	  // 1.0 = very loose).  Note that Match_Threshold controls how closely the
	  // end points of a delete need to match.
	  this.Patch_DeleteThreshold = 0.5;
	  // Chunk size for context length.
	  this.Patch_Margin = 4;
	
	  // The number of bits in an int.
	  this.Match_MaxBits = 32;
	}
	
	
	//  DIFF FUNCTIONS
	
	
	/**
	 * The data structure representing a diff is an array of tuples:
	 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
	 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
	 */
	var DIFF_DELETE = -1;
	var DIFF_INSERT = 1;
	var DIFF_EQUAL = 0;
	
	/** @typedef {!Array.<number|string>} */
	diff_match_patch.Diff;
	
	
	/**
	 * Find the differences between two texts.  Simplifies the problem by stripping
	 * any common prefix or suffix off the texts before diffing.
	 * @param {string} text1 Old string to be diffed.
	 * @param {string} text2 New string to be diffed.
	 * @param {boolean=} opt_checklines Optional speedup flag. If present and false,
	 *     then don't run a line-level diff first to identify the changed areas.
	 *     Defaults to true, which does a faster, slightly less optimal diff.
	 * @param {number} opt_deadline Optional time when the diff should be complete
	 *     by.  Used internally for recursive calls.  Users should set DiffTimeout
	 *     instead.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 */
	diff_match_patch.prototype.diff_main = function(text1, text2, opt_checklines,
	    opt_deadline) {
	  // Set a deadline by which time the diff must be complete.
	  if (typeof opt_deadline == 'undefined') {
	    if (this.Diff_Timeout <= 0) {
	      opt_deadline = Number.MAX_VALUE;
	    } else {
	      opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
	    }
	  }
	  var deadline = opt_deadline;
	
	  // Check for null inputs.
	  if (text1 == null || text2 == null) {
	    throw new Error('Null input. (diff_main)');
	  }
	
	  // Check for equality (speedup).
	  if (text1 == text2) {
	    if (text1) {
	      return [[DIFF_EQUAL, text1]];
	    }
	    return [];
	  }
	
	  if (typeof opt_checklines == 'undefined') {
	    opt_checklines = true;
	  }
	  var checklines = opt_checklines;
	
	  // Trim off common prefix (speedup).
	  var commonlength = this.diff_commonPrefix(text1, text2);
	  var commonprefix = text1.substring(0, commonlength);
	  text1 = text1.substring(commonlength);
	  text2 = text2.substring(commonlength);
	
	  // Trim off common suffix (speedup).
	  commonlength = this.diff_commonSuffix(text1, text2);
	  var commonsuffix = text1.substring(text1.length - commonlength);
	  text1 = text1.substring(0, text1.length - commonlength);
	  text2 = text2.substring(0, text2.length - commonlength);
	
	  // Compute the diff on the middle block.
	  var diffs = this.diff_compute_(text1, text2, checklines, deadline);
	
	  // Restore the prefix and suffix.
	  if (commonprefix) {
	    diffs.unshift([DIFF_EQUAL, commonprefix]);
	  }
	  if (commonsuffix) {
	    diffs.push([DIFF_EQUAL, commonsuffix]);
	  }
	  this.diff_cleanupMerge(diffs);
	  return diffs;
	};
	
	
	/**
	 * Find the differences between two texts.  Assumes that the texts do not
	 * have any common prefix or suffix.
	 * @param {string} text1 Old string to be diffed.
	 * @param {string} text2 New string to be diffed.
	 * @param {boolean} checklines Speedup flag.  If false, then don't run a
	 *     line-level diff first to identify the changed areas.
	 *     If true, then run a faster, slightly less optimal diff.
	 * @param {number} deadline Time when the diff should be complete by.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 * @private
	 */
	diff_match_patch.prototype.diff_compute_ = function(text1, text2, checklines,
	    deadline) {
	  var diffs;
	
	  if (!text1) {
	    // Just add some text (speedup).
	    return [[DIFF_INSERT, text2]];
	  }
	
	  if (!text2) {
	    // Just delete some text (speedup).
	    return [[DIFF_DELETE, text1]];
	  }
	
	  var longtext = text1.length > text2.length ? text1 : text2;
	  var shorttext = text1.length > text2.length ? text2 : text1;
	  var i = longtext.indexOf(shorttext);
	  if (i != -1) {
	    // Shorter text is inside the longer text (speedup).
	    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
	             [DIFF_EQUAL, shorttext],
	             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
	    // Swap insertions for deletions if diff is reversed.
	    if (text1.length > text2.length) {
	      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
	    }
	    return diffs;
	  }
	
	  if (shorttext.length == 1) {
	    // Single character string.
	    // After the previous speedup, the character can't be an equality.
	    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
	  }
	  longtext = shorttext = null;  // Garbage collect.
	
	  // Check to see if the problem can be split in two.
	  var hm = this.diff_halfMatch_(text1, text2);
	  if (hm) {
	    // A half-match was found, sort out the return data.
	    var text1_a = hm[0];
	    var text1_b = hm[1];
	    var text2_a = hm[2];
	    var text2_b = hm[3];
	    var mid_common = hm[4];
	    // Send both pairs off for separate processing.
	    var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
	    var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
	    // Merge the results.
	    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
	  }
	
	  if (checklines && text1.length > 100 && text2.length > 100) {
	    return this.diff_lineMode_(text1, text2, deadline);
	  }
	
	  return this.diff_bisect_(text1, text2, deadline);
	};
	
	
	/**
	 * Do a quick line-level diff on both strings, then rediff the parts for
	 * greater accuracy.
	 * This speedup can produce non-minimal diffs.
	 * @param {string} text1 Old string to be diffed.
	 * @param {string} text2 New string to be diffed.
	 * @param {number} deadline Time when the diff should be complete by.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 * @private
	 */
	diff_match_patch.prototype.diff_lineMode_ = function(text1, text2, deadline) {
	  // Scan the text on a line-by-line basis first.
	  var a = this.diff_linesToChars_(text1, text2);
	  text1 = /** @type {string} */(a[0]);
	  text2 = /** @type {string} */(a[1]);
	  var linearray = /** @type {!Array.<string>} */(a[2]);
	
	  var diffs = this.diff_bisect_(text1, text2, deadline);
	
	  // Convert the diff back to original text.
	  this.diff_charsToLines_(diffs, linearray);
	  // Eliminate freak matches (e.g. blank lines)
	  this.diff_cleanupSemantic(diffs);
	
	  // Rediff any replacement blocks, this time character-by-character.
	  // Add a dummy entry at the end.
	  diffs.push([DIFF_EQUAL, '']);
	  var pointer = 0;
	  var count_delete = 0;
	  var count_insert = 0;
	  var text_delete = '';
	  var text_insert = '';
	  while (pointer < diffs.length) {
	    switch (diffs[pointer][0]) {
	      case DIFF_INSERT:
	        count_insert++;
	        text_insert += diffs[pointer][1];
	        break;
	      case DIFF_DELETE:
	        count_delete++;
	        text_delete += diffs[pointer][1];
	        break;
	      case DIFF_EQUAL:
	        // Upon reaching an equality, check for prior redundancies.
	        if (count_delete >= 1 && count_insert >= 1) {
	          // Delete the offending records and add the merged ones.
	          var a = this.diff_main(text_delete, text_insert, false, deadline);
	          diffs.splice(pointer - count_delete - count_insert,
	                       count_delete + count_insert);
	          pointer = pointer - count_delete - count_insert;
	          for (var j = a.length - 1; j >= 0; j--) {
	            diffs.splice(pointer, 0, a[j]);
	          }
	          pointer = pointer + a.length;
	        }
	        count_insert = 0;
	        count_delete = 0;
	        text_delete = '';
	        text_insert = '';
	        break;
	    }
	    pointer++;
	  }
	  diffs.pop();  // Remove the dummy entry at the end.
	
	  return diffs;
	};
	
	
	/**
	 * Find the 'middle snake' of a diff, split the problem in two
	 * and return the recursively constructed diff.
	 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
	 * @param {string} text1 Old string to be diffed.
	 * @param {string} text2 New string to be diffed.
	 * @param {number} deadline Time at which to bail if not yet complete.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 * @private
	 */
	diff_match_patch.prototype.diff_bisect_ = function(text1, text2, deadline) {
	  // Cache the text lengths to prevent multiple calls.
	  var text1_length = text1.length;
	  var text2_length = text2.length;
	  var max_d = Math.ceil((text1_length + text2_length) / 2);
	  var v_offset = max_d;
	  var v_length = 2 * max_d;
	  var v1 = new Array(v_length);
	  var v2 = new Array(v_length);
	  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
	  // integers and undefined.
	  for (var x = 0; x < v_length; x++) {
	    v1[x] = -1;
	    v2[x] = -1;
	  }
	  v1[v_offset + 1] = 0;
	  v2[v_offset + 1] = 0;
	  var delta = text1_length - text2_length;
	  // If the total number of characters is odd, then the front path will collide
	  // with the reverse path.
	  var front = (delta % 2 != 0);
	  // Offsets for start and end of k loop.
	  // Prevents mapping of space beyond the grid.
	  var k1start = 0;
	  var k1end = 0;
	  var k2start = 0;
	  var k2end = 0;
	  for (var d = 0; d < max_d; d++) {
	    // Bail out if deadline is reached.
	    if ((new Date()).getTime() > deadline) {
	      break;
	    }
	
	    // Walk the front path one step.
	    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
	      var k1_offset = v_offset + k1;
	      var x1;
	      if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
	        x1 = v1[k1_offset + 1];
	      } else {
	        x1 = v1[k1_offset - 1] + 1;
	      }
	      var y1 = x1 - k1;
	      while (x1 < text1_length && y1 < text2_length &&
	             text1.charAt(x1) == text2.charAt(y1)) {
	        x1++;
	        y1++;
	      }
	      v1[k1_offset] = x1;
	      if (x1 > text1_length) {
	        // Ran off the right of the graph.
	        k1end += 2;
	      } else if (y1 > text2_length) {
	        // Ran off the bottom of the graph.
	        k1start += 2;
	      } else if (front) {
	        var k2_offset = v_offset + delta - k1;
	        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
	          // Mirror x2 onto top-left coordinate system.
	          var x2 = text1_length - v2[k2_offset];
	          if (x1 >= x2) {
	            // Overlap detected.
	            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
	          }
	        }
	      }
	    }
	
	    // Walk the reverse path one step.
	    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
	      var k2_offset = v_offset + k2;
	      var x2;
	      if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
	        x2 = v2[k2_offset + 1];
	      } else {
	        x2 = v2[k2_offset - 1] + 1;
	      }
	      var y2 = x2 - k2;
	      while (x2 < text1_length && y2 < text2_length &&
	             text1.charAt(text1_length - x2 - 1) ==
	             text2.charAt(text2_length - y2 - 1)) {
	        x2++;
	        y2++;
	      }
	      v2[k2_offset] = x2;
	      if (x2 > text1_length) {
	        // Ran off the left of the graph.
	        k2end += 2;
	      } else if (y2 > text2_length) {
	        // Ran off the top of the graph.
	        k2start += 2;
	      } else if (!front) {
	        var k1_offset = v_offset + delta - k2;
	        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
	          var x1 = v1[k1_offset];
	          var y1 = v_offset + x1 - k1_offset;
	          // Mirror x2 onto top-left coordinate system.
	          x2 = text1_length - x2;
	          if (x1 >= x2) {
	            // Overlap detected.
	            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
	          }
	        }
	      }
	    }
	  }
	  // Diff took too long and hit the deadline or
	  // number of diffs equals number of characters, no commonality at all.
	  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
	};
	
	
	/**
	 * Given the location of the 'middle snake', split the diff in two parts
	 * and recurse.
	 * @param {string} text1 Old string to be diffed.
	 * @param {string} text2 New string to be diffed.
	 * @param {number} x Index of split point in text1.
	 * @param {number} y Index of split point in text2.
	 * @param {number} deadline Time at which to bail if not yet complete.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 * @private
	 */
	diff_match_patch.prototype.diff_bisectSplit_ = function(text1, text2, x, y,
	    deadline) {
	  var text1a = text1.substring(0, x);
	  var text2a = text2.substring(0, y);
	  var text1b = text1.substring(x);
	  var text2b = text2.substring(y);
	
	  // Compute both diffs serially.
	  var diffs = this.diff_main(text1a, text2a, false, deadline);
	  var diffsb = this.diff_main(text1b, text2b, false, deadline);
	
	  return diffs.concat(diffsb);
	};
	
	
	/**
	 * Split two texts into an array of strings.  Reduce the texts to a string of
	 * hashes where each Unicode character represents one line.
	 * @param {string} text1 First string.
	 * @param {string} text2 Second string.
	 * @return {!Array.<string|!Array.<string>>} Three element Array, containing the
	 *     encoded text1, the encoded text2 and the array of unique strings.  The
	 *     zeroth element of the array of unique strings is intentionally blank.
	 * @private
	 */
	diff_match_patch.prototype.diff_linesToChars_ = function(text1, text2) {
	  var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
	  var lineHash = {};   // e.g. lineHash['Hello\n'] == 4
	
	  // '\x00' is a valid character, but various debuggers don't like it.
	  // So we'll insert a junk entry to avoid generating a null character.
	  lineArray[0] = '';
	
	  /**
	   * Split a text into an array of strings.  Reduce the texts to a string of
	   * hashes where each Unicode character represents one line.
	   * Modifies linearray and linehash through being a closure.
	   * @param {string} text String to encode.
	   * @return {string} Encoded string.
	   * @private
	   */
	  function diff_linesToCharsMunge_(text) {
	    var chars = '';
	    // Walk the text, pulling out a substring for each line.
	    // text.split('\n') would would temporarily double our memory footprint.
	    // Modifying text would create many large strings to garbage collect.
	    var lineStart = 0;
	    var lineEnd = -1;
	    // Keeping our own length variable is faster than looking it up.
	    var lineArrayLength = lineArray.length;
	    while (lineEnd < text.length - 1) {
	      lineEnd = text.indexOf('\n', lineStart);
	      if (lineEnd == -1) {
	        lineEnd = text.length - 1;
	      }
	      var line = text.substring(lineStart, lineEnd + 1);
	      lineStart = lineEnd + 1;
	
	      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
	          (lineHash[line] !== undefined)) {
	        chars += String.fromCharCode(lineHash[line]);
	      } else {
	        chars += String.fromCharCode(lineArrayLength);
	        lineHash[line] = lineArrayLength;
	        lineArray[lineArrayLength++] = line;
	      }
	    }
	    return chars;
	  }
	
	  var chars1 = diff_linesToCharsMunge_(text1);
	  var chars2 = diff_linesToCharsMunge_(text2);
	  return [chars1, chars2, lineArray];
	};
	
	
	/**
	 * Rehydrate the text in a diff from a string of line hashes to real lines of
	 * text.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @param {!Array.<string>} lineArray Array of unique strings.
	 * @private
	 */
	diff_match_patch.prototype.diff_charsToLines_ = function(diffs, lineArray) {
	  for (var x = 0; x < diffs.length; x++) {
	    var chars = diffs[x][1];
	    var text = [];
	    for (var y = 0; y < chars.length; y++) {
	      text[y] = lineArray[chars.charCodeAt(y)];
	    }
	    diffs[x][1] = text.join('');
	  }
	};
	
	
	/**
	 * Determine the common prefix of two strings.
	 * @param {string} text1 First string.
	 * @param {string} text2 Second string.
	 * @return {number} The number of characters common to the start of each
	 *     string.
	 */
	diff_match_patch.prototype.diff_commonPrefix = function(text1, text2) {
	  // Quick check for common null cases.
	  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
	    return 0;
	  }
	  // Binary search.
	  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
	  var pointermin = 0;
	  var pointermax = Math.min(text1.length, text2.length);
	  var pointermid = pointermax;
	  var pointerstart = 0;
	  while (pointermin < pointermid) {
	    if (text1.substring(pointerstart, pointermid) ==
	        text2.substring(pointerstart, pointermid)) {
	      pointermin = pointermid;
	      pointerstart = pointermin;
	    } else {
	      pointermax = pointermid;
	    }
	    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
	  }
	  return pointermid;
	};
	
	
	/**
	 * Determine the common suffix of two strings.
	 * @param {string} text1 First string.
	 * @param {string} text2 Second string.
	 * @return {number} The number of characters common to the end of each string.
	 */
	diff_match_patch.prototype.diff_commonSuffix = function(text1, text2) {
	  // Quick check for common null cases.
	  if (!text1 || !text2 ||
	      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
	    return 0;
	  }
	  // Binary search.
	  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
	  var pointermin = 0;
	  var pointermax = Math.min(text1.length, text2.length);
	  var pointermid = pointermax;
	  var pointerend = 0;
	  while (pointermin < pointermid) {
	    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
	        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
	      pointermin = pointermid;
	      pointerend = pointermin;
	    } else {
	      pointermax = pointermid;
	    }
	    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
	  }
	  return pointermid;
	};
	
	
	/**
	 * Determine if the suffix of one string is the prefix of another.
	 * @param {string} text1 First string.
	 * @param {string} text2 Second string.
	 * @return {number} The number of characters common to the end of the first
	 *     string and the start of the second string.
	 * @private
	 */
	diff_match_patch.prototype.diff_commonOverlap_ = function(text1, text2) {
	  // Cache the text lengths to prevent multiple calls.
	  var text1_length = text1.length;
	  var text2_length = text2.length;
	  // Eliminate the null case.
	  if (text1_length == 0 || text2_length == 0) {
	    return 0;
	  }
	  // Truncate the longer string.
	  if (text1_length > text2_length) {
	    text1 = text1.substring(text1_length - text2_length);
	  } else if (text1_length < text2_length) {
	    text2 = text2.substring(0, text1_length);
	  }
	  var text_length = Math.min(text1_length, text2_length);
	  // Quick check for the worst case.
	  if (text1 == text2) {
	    return text_length;
	  }
	
	  // Start by looking for a single character match
	  // and increase length until no match is found.
	  // Performance analysis: http://neil.fraser.name/news/2010/11/04/
	  var best = 0;
	  var length = 1;
	  while (true) {
	    var pattern = text1.substring(text_length - length);
	    var found = text2.indexOf(pattern);
	    if (found == -1) {
	      return best;
	    }
	    length += found;
	    if (found == 0 || text1.substring(text_length - length) ==
	        text2.substring(0, length)) {
	      best = length;
	      length++;
	    }
	  }
	};
	
	
	/**
	 * Do the two texts share a substring which is at least half the length of the
	 * longer text?
	 * This speedup can produce non-minimal diffs.
	 * @param {string} text1 First string.
	 * @param {string} text2 Second string.
	 * @return {Array.<string>} Five element Array, containing the prefix of
	 *     text1, the suffix of text1, the prefix of text2, the suffix of
	 *     text2 and the common middle.  Or null if there was no match.
	 * @private
	 */
	diff_match_patch.prototype.diff_halfMatch_ = function(text1, text2) {
	  if (this.Diff_Timeout <= 0) {
	    // Don't risk returning a non-optimal diff if we have unlimited time.
	    return null;
	  }
	  var longtext = text1.length > text2.length ? text1 : text2;
	  var shorttext = text1.length > text2.length ? text2 : text1;
	  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
	    return null;  // Pointless.
	  }
	  var dmp = this;  // 'this' becomes 'window' in a closure.
	
	  /**
	   * Does a substring of shorttext exist within longtext such that the substring
	   * is at least half the length of longtext?
	   * Closure, but does not reference any external variables.
	   * @param {string} longtext Longer string.
	   * @param {string} shorttext Shorter string.
	   * @param {number} i Start index of quarter length substring within longtext.
	   * @return {Array.<string>} Five element Array, containing the prefix of
	   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
	   *     of shorttext and the common middle.  Or null if there was no match.
	   * @private
	   */
	  function diff_halfMatchI_(longtext, shorttext, i) {
	    // Start with a 1/4 length substring at position i as a seed.
	    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
	    var j = -1;
	    var best_common = '';
	    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
	    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
	      var prefixLength = dmp.diff_commonPrefix(longtext.substring(i),
	                                               shorttext.substring(j));
	      var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i),
	                                               shorttext.substring(0, j));
	      if (best_common.length < suffixLength + prefixLength) {
	        best_common = shorttext.substring(j - suffixLength, j) +
	            shorttext.substring(j, j + prefixLength);
	        best_longtext_a = longtext.substring(0, i - suffixLength);
	        best_longtext_b = longtext.substring(i + prefixLength);
	        best_shorttext_a = shorttext.substring(0, j - suffixLength);
	        best_shorttext_b = shorttext.substring(j + prefixLength);
	      }
	    }
	    if (best_common.length * 2 >= longtext.length) {
	      return [best_longtext_a, best_longtext_b,
	              best_shorttext_a, best_shorttext_b, best_common];
	    } else {
	      return null;
	    }
	  }
	
	  // First check if the second quarter is the seed for a half-match.
	  var hm1 = diff_halfMatchI_(longtext, shorttext,
	                             Math.ceil(longtext.length / 4));
	  // Check again based on the third quarter.
	  var hm2 = diff_halfMatchI_(longtext, shorttext,
	                             Math.ceil(longtext.length / 2));
	  var hm;
	  if (!hm1 && !hm2) {
	    return null;
	  } else if (!hm2) {
	    hm = hm1;
	  } else if (!hm1) {
	    hm = hm2;
	  } else {
	    // Both matched.  Select the longest.
	    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
	  }
	
	  // A half-match was found, sort out the return data.
	  var text1_a, text1_b, text2_a, text2_b;
	  if (text1.length > text2.length) {
	    text1_a = hm[0];
	    text1_b = hm[1];
	    text2_a = hm[2];
	    text2_b = hm[3];
	  } else {
	    text2_a = hm[0];
	    text2_b = hm[1];
	    text1_a = hm[2];
	    text1_b = hm[3];
	  }
	  var mid_common = hm[4];
	  return [text1_a, text1_b, text2_a, text2_b, mid_common];
	};
	
	
	/**
	 * Reduce the number of edits by eliminating semantically trivial equalities.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 */
	diff_match_patch.prototype.diff_cleanupSemantic = function(diffs) {
	  var changes = false;
	  var equalities = [];  // Stack of indices where equalities are found.
	  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
	  /** @type {?string} */
	  var lastequality = null;  // Always equal to equalities[equalitiesLength-1][1]
	  var pointer = 0;  // Index of current position.
	  // Number of characters that changed prior to the equality.
	  var length_insertions1 = 0;
	  var length_deletions1 = 0;
	  // Number of characters that changed after the equality.
	  var length_insertions2 = 0;
	  var length_deletions2 = 0;
	  while (pointer < diffs.length) {
	    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
	      equalities[equalitiesLength++] = pointer;
	      length_insertions1 = length_insertions2;
	      length_deletions1 = length_deletions2;
	      length_insertions2 = 0;
	      length_deletions2 = 0;
	      lastequality = /** @type {string} */(diffs[pointer][1]);
	    } else {  // An insertion or deletion.
	      if (diffs[pointer][0] == DIFF_INSERT) {
	        length_insertions2 += diffs[pointer][1].length;
	      } else {
	        length_deletions2 += diffs[pointer][1].length;
	      }
	      // Eliminate an equality that is smaller or equal to the edits on both
	      // sides of it.
	      if (lastequality !== null && (lastequality.length <=
	          Math.max(length_insertions1, length_deletions1)) &&
	          (lastequality.length <= Math.max(length_insertions2,
	                                           length_deletions2))) {
	        // Duplicate record.
	        diffs.splice(equalities[equalitiesLength - 1], 0,
	                     [DIFF_DELETE, lastequality]);
	        // Change second copy to insert.
	        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
	        // Throw away the equality we just deleted.
	        equalitiesLength--;
	        // Throw away the previous equality (it needs to be reevaluated).
	        equalitiesLength--;
	        pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
	        length_insertions1 = 0;  // Reset the counters.
	        length_deletions1 = 0;
	        length_insertions2 = 0;
	        length_deletions2 = 0;
	        lastequality = null;
	        changes = true;
	      }
	    }
	    pointer++;
	  }
	
	  // Normalize the diff.
	  if (changes) {
	    this.diff_cleanupMerge(diffs);
	  }
	  this.diff_cleanupSemanticLossless(diffs);
	
	  // Find any overlaps between deletions and insertions.
	  // e.g: <del>abcxxx</del><ins>xxxdef</ins>
	  //   -> <del>abc</del>xxx<ins>def</ins>
	  // Only extract an overlap if it is as big as the edit ahead or behind it.
	  pointer = 1;
	  while (pointer < diffs.length) {
	    if (diffs[pointer - 1][0] == DIFF_DELETE &&
	        diffs[pointer][0] == DIFF_INSERT) {
	      var deletion = /** @type {string} */(diffs[pointer - 1][1]);
	      var insertion = /** @type {string} */(diffs[pointer][1]);
	      var overlap_length = this.diff_commonOverlap_(deletion, insertion);
	      if (overlap_length >= deletion.length / 2 ||
	          overlap_length >= insertion.length / 2) {
	        // Overlap found.  Insert an equality and trim the surrounding edits.
	        diffs.splice(pointer, 0,
	            [DIFF_EQUAL, insertion.substring(0, overlap_length)]);
	        diffs[pointer - 1][1] =
	            deletion.substring(0, deletion.length - overlap_length);
	        diffs[pointer + 1][1] = insertion.substring(overlap_length);
	        pointer++;
	      }
	      pointer++;
	    }
	    pointer++;
	  }
	};
	
	
	/**
	 * Look for single edits surrounded on both sides by equalities
	 * which can be shifted sideways to align the edit to a word boundary.
	 * e.g: The c<ins>at c</ins>ame. -> The <ins>cat </ins>came.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 */
	diff_match_patch.prototype.diff_cleanupSemanticLossless = function(diffs) {
	  // Define some regex patterns for matching boundaries.
	  var punctuation = /[^a-zA-Z0-9]/;
	  var whitespace = /\s/;
	  var linebreak = /[\r\n]/;
	  var blanklineEnd = /\n\r?\n$/;
	  var blanklineStart = /^\r?\n\r?\n/;
	
	  /**
	   * Given two strings, compute a score representing whether the internal
	   * boundary falls on logical boundaries.
	   * Scores range from 5 (best) to 0 (worst).
	   * Closure, makes reference to regex patterns defined above.
	   * @param {string} one First string.
	   * @param {string} two Second string.
	   * @return {number} The score.
	   * @private
	   */
	  function diff_cleanupSemanticScore_(one, two) {
	    if (!one || !two) {
	      // Edges are the best.
	      return 5;
	    }
	
	    // Each port of this function behaves slightly differently due to
	    // subtle differences in each language's definition of things like
	    // 'whitespace'.  Since this function's purpose is largely cosmetic,
	    // the choice has been made to use each language's native features
	    // rather than force total conformity.
	    var score = 0;
	    // One point for non-alphanumeric.
	    if (one.charAt(one.length - 1).match(punctuation) ||
	        two.charAt(0).match(punctuation)) {
	      score++;
	      // Two points for whitespace.
	      if (one.charAt(one.length - 1).match(whitespace) ||
	          two.charAt(0).match(whitespace)) {
	        score++;
	        // Three points for line breaks.
	        if (one.charAt(one.length - 1).match(linebreak) ||
	            two.charAt(0).match(linebreak)) {
	          score++;
	          // Four points for blank lines.
	          if (one.match(blanklineEnd) || two.match(blanklineStart)) {
	            score++;
	          }
	        }
	      }
	    }
	    return score;
	  }
	
	  var pointer = 1;
	  // Intentionally ignore the first and last element (don't need checking).
	  while (pointer < diffs.length - 1) {
	    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
	        diffs[pointer + 1][0] == DIFF_EQUAL) {
	      // This is a single edit surrounded by equalities.
	      var equality1 = /** @type {string} */(diffs[pointer - 1][1]);
	      var edit = /** @type {string} */(diffs[pointer][1]);
	      var equality2 = /** @type {string} */(diffs[pointer + 1][1]);
	
	      // First, shift the edit as far left as possible.
	      var commonOffset = this.diff_commonSuffix(equality1, edit);
	      if (commonOffset) {
	        var commonString = edit.substring(edit.length - commonOffset);
	        equality1 = equality1.substring(0, equality1.length - commonOffset);
	        edit = commonString + edit.substring(0, edit.length - commonOffset);
	        equality2 = commonString + equality2;
	      }
	
	      // Second, step character by character right, looking for the best fit.
	      var bestEquality1 = equality1;
	      var bestEdit = edit;
	      var bestEquality2 = equality2;
	      var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
	          diff_cleanupSemanticScore_(edit, equality2);
	      while (edit.charAt(0) === equality2.charAt(0)) {
	        equality1 += edit.charAt(0);
	        edit = edit.substring(1) + equality2.charAt(0);
	        equality2 = equality2.substring(1);
	        var score = diff_cleanupSemanticScore_(equality1, edit) +
	            diff_cleanupSemanticScore_(edit, equality2);
	        // The >= encourages trailing rather than leading whitespace on edits.
	        if (score >= bestScore) {
	          bestScore = score;
	          bestEquality1 = equality1;
	          bestEdit = edit;
	          bestEquality2 = equality2;
	        }
	      }
	
	      if (diffs[pointer - 1][1] != bestEquality1) {
	        // We have an improvement, save it back to the diff.
	        if (bestEquality1) {
	          diffs[pointer - 1][1] = bestEquality1;
	        } else {
	          diffs.splice(pointer - 1, 1);
	          pointer--;
	        }
	        diffs[pointer][1] = bestEdit;
	        if (bestEquality2) {
	          diffs[pointer + 1][1] = bestEquality2;
	        } else {
	          diffs.splice(pointer + 1, 1);
	          pointer--;
	        }
	      }
	    }
	    pointer++;
	  }
	};
	
	
	/**
	 * Reduce the number of edits by eliminating operationally trivial equalities.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 */
	diff_match_patch.prototype.diff_cleanupEfficiency = function(diffs) {
	  var changes = false;
	  var equalities = [];  // Stack of indices where equalities are found.
	  var equalitiesLength = 0;  // Keeping our own length var is faster in JS.
	  var lastequality = '';  // Always equal to equalities[equalitiesLength-1][1]
	  var pointer = 0;  // Index of current position.
	  // Is there an insertion operation before the last equality.
	  var pre_ins = false;
	  // Is there a deletion operation before the last equality.
	  var pre_del = false;
	  // Is there an insertion operation after the last equality.
	  var post_ins = false;
	  // Is there a deletion operation after the last equality.
	  var post_del = false;
	  while (pointer < diffs.length) {
	    if (diffs[pointer][0] == DIFF_EQUAL) {  // Equality found.
	      if (diffs[pointer][1].length < this.Diff_EditCost &&
	          (post_ins || post_del)) {
	        // Candidate found.
	        equalities[equalitiesLength++] = pointer;
	        pre_ins = post_ins;
	        pre_del = post_del;
	        lastequality = diffs[pointer][1];
	      } else {
	        // Not a candidate, and can never become one.
	        equalitiesLength = 0;
	        lastequality = '';
	      }
	      post_ins = post_del = false;
	    } else {  // An insertion or deletion.
	      if (diffs[pointer][0] == DIFF_DELETE) {
	        post_del = true;
	      } else {
	        post_ins = true;
	      }
	      /*
	       * Five types to be split:
	       * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
	       * <ins>A</ins>X<ins>C</ins><del>D</del>
	       * <ins>A</ins><del>B</del>X<ins>C</ins>
	       * <ins>A</del>X<ins>C</ins><del>D</del>
	       * <ins>A</ins><del>B</del>X<del>C</del>
	       */
	      if (lastequality && ((pre_ins && pre_del && post_ins && post_del) ||
	                           ((lastequality.length < this.Diff_EditCost / 2) &&
	                            (pre_ins + pre_del + post_ins + post_del) == 3))) {
	        // Duplicate record.
	        diffs.splice(equalities[equalitiesLength - 1], 0,
	                     [DIFF_DELETE, lastequality]);
	        // Change second copy to insert.
	        diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
	        equalitiesLength--;  // Throw away the equality we just deleted;
	        lastequality = '';
	        if (pre_ins && pre_del) {
	          // No changes made which could affect previous entry, keep going.
	          post_ins = post_del = true;
	          equalitiesLength = 0;
	        } else {
	          equalitiesLength--;  // Throw away the previous equality.
	          pointer = equalitiesLength > 0 ?
	              equalities[equalitiesLength - 1] : -1;
	          post_ins = post_del = false;
	        }
	        changes = true;
	      }
	    }
	    pointer++;
	  }
	
	  if (changes) {
	    this.diff_cleanupMerge(diffs);
	  }
	};
	
	
	/**
	 * Reorder and merge like edit sections.  Merge equalities.
	 * Any edit section can move as long as it doesn't cross an equality.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 */
	diff_match_patch.prototype.diff_cleanupMerge = function(diffs) {
	  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
	  var pointer = 0;
	  var count_delete = 0;
	  var count_insert = 0;
	  var text_delete = '';
	  var text_insert = '';
	  var commonlength;
	  while (pointer < diffs.length) {
	    switch (diffs[pointer][0]) {
	      case DIFF_INSERT:
	        count_insert++;
	        text_insert += diffs[pointer][1];
	        pointer++;
	        break;
	      case DIFF_DELETE:
	        count_delete++;
	        text_delete += diffs[pointer][1];
	        pointer++;
	        break;
	      case DIFF_EQUAL:
	        // Upon reaching an equality, check for prior redundancies.
	        if (count_delete + count_insert > 1) {
	          if (count_delete !== 0 && count_insert !== 0) {
	            // Factor out any common prefixies.
	            commonlength = this.diff_commonPrefix(text_insert, text_delete);
	            if (commonlength !== 0) {
	              if ((pointer - count_delete - count_insert) > 0 &&
	                  diffs[pointer - count_delete - count_insert - 1][0] ==
	                  DIFF_EQUAL) {
	                diffs[pointer - count_delete - count_insert - 1][1] +=
	                    text_insert.substring(0, commonlength);
	              } else {
	                diffs.splice(0, 0, [DIFF_EQUAL,
	                                    text_insert.substring(0, commonlength)]);
	                pointer++;
	              }
	              text_insert = text_insert.substring(commonlength);
	              text_delete = text_delete.substring(commonlength);
	            }
	            // Factor out any common suffixies.
	            commonlength = this.diff_commonSuffix(text_insert, text_delete);
	            if (commonlength !== 0) {
	              diffs[pointer][1] = text_insert.substring(text_insert.length -
	                  commonlength) + diffs[pointer][1];
	              text_insert = text_insert.substring(0, text_insert.length -
	                  commonlength);
	              text_delete = text_delete.substring(0, text_delete.length -
	                  commonlength);
	            }
	          }
	          // Delete the offending records and add the merged ones.
	          if (count_delete === 0) {
	            diffs.splice(pointer - count_delete - count_insert,
	                count_delete + count_insert, [DIFF_INSERT, text_insert]);
	          } else if (count_insert === 0) {
	            diffs.splice(pointer - count_delete - count_insert,
	                count_delete + count_insert, [DIFF_DELETE, text_delete]);
	          } else {
	            diffs.splice(pointer - count_delete - count_insert,
	                count_delete + count_insert, [DIFF_DELETE, text_delete],
	                [DIFF_INSERT, text_insert]);
	          }
	          pointer = pointer - count_delete - count_insert +
	                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
	        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
	          // Merge this equality with the previous one.
	          diffs[pointer - 1][1] += diffs[pointer][1];
	          diffs.splice(pointer, 1);
	        } else {
	          pointer++;
	        }
	        count_insert = 0;
	        count_delete = 0;
	        text_delete = '';
	        text_insert = '';
	        break;
	    }
	  }
	  if (diffs[diffs.length - 1][1] === '') {
	    diffs.pop();  // Remove the dummy entry at the end.
	  }
	
	  // Second pass: look for single edits surrounded on both sides by equalities
	  // which can be shifted sideways to eliminate an equality.
	  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
	  var changes = false;
	  pointer = 1;
	  // Intentionally ignore the first and last element (don't need checking).
	  while (pointer < diffs.length - 1) {
	    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
	        diffs[pointer + 1][0] == DIFF_EQUAL) {
	      // This is a single edit surrounded by equalities.
	      if (diffs[pointer][1].substring(diffs[pointer][1].length -
	          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
	        // Shift the edit over the previous equality.
	        diffs[pointer][1] = diffs[pointer - 1][1] +
	            diffs[pointer][1].substring(0, diffs[pointer][1].length -
	                                        diffs[pointer - 1][1].length);
	        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
	        diffs.splice(pointer - 1, 1);
	        changes = true;
	      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
	          diffs[pointer + 1][1]) {
	        // Shift the edit over the next equality.
	        diffs[pointer - 1][1] += diffs[pointer + 1][1];
	        diffs[pointer][1] =
	            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
	            diffs[pointer + 1][1];
	        diffs.splice(pointer + 1, 1);
	        changes = true;
	      }
	    }
	    pointer++;
	  }
	  // If shifts were made, the diff needs reordering and another shift sweep.
	  if (changes) {
	    this.diff_cleanupMerge(diffs);
	  }
	};
	
	
	/**
	 * loc is a location in text1, compute and return the equivalent location in
	 * text2.
	 * e.g. 'The cat' vs 'The big cat', 1->1, 5->8
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @param {number} loc Location within text1.
	 * @return {number} Location within text2.
	 */
	diff_match_patch.prototype.diff_xIndex = function(diffs, loc) {
	  var chars1 = 0;
	  var chars2 = 0;
	  var last_chars1 = 0;
	  var last_chars2 = 0;
	  var x;
	  for (x = 0; x < diffs.length; x++) {
	    if (diffs[x][0] !== DIFF_INSERT) {  // Equality or deletion.
	      chars1 += diffs[x][1].length;
	    }
	    if (diffs[x][0] !== DIFF_DELETE) {  // Equality or insertion.
	      chars2 += diffs[x][1].length;
	    }
	    if (chars1 > loc) {  // Overshot the location.
	      break;
	    }
	    last_chars1 = chars1;
	    last_chars2 = chars2;
	  }
	  // Was the location was deleted?
	  if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
	    return last_chars2;
	  }
	  // Add the remaining character length.
	  return last_chars2 + (loc - last_chars1);
	};
	
	
	/**
	 * Convert a diff array into a pretty HTML report.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @return {string} HTML representation.
	 */
	diff_match_patch.prototype.diff_prettyHtml = function(diffs) {
	  var html = [];
	  var i = 0;
	  var pattern_amp = /&/g;
	  var pattern_lt = /</g;
	  var pattern_gt = />/g;
	  var pattern_para = /\n/g;
	  for (var x = 0; x < diffs.length; x++) {
	    var op = diffs[x][0];    // Operation (insert, delete, equal)
	    var data = diffs[x][1];  // Text of change.
	    var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
	        .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
	    switch (op) {
	      case DIFF_INSERT:
	        html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
	        break;
	      case DIFF_DELETE:
	        html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
	        break;
	      case DIFF_EQUAL:
	        html[x] = '<span>' + text + '</span>';
	        break;
	    }
	    if (op !== DIFF_DELETE) {
	      i += data.length;
	    }
	  }
	  return html.join('');
	};
	
	
	/**
	 * Compute and return the source text (all equalities and deletions).
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @return {string} Source text.
	 */
	diff_match_patch.prototype.diff_text1 = function(diffs) {
	  var text = [];
	  for (var x = 0; x < diffs.length; x++) {
	    if (diffs[x][0] !== DIFF_INSERT) {
	      text[x] = diffs[x][1];
	    }
	  }
	  return text.join('');
	};
	
	
	/**
	 * Compute and return the destination text (all equalities and insertions).
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @return {string} Destination text.
	 */
	diff_match_patch.prototype.diff_text2 = function(diffs) {
	  var text = [];
	  for (var x = 0; x < diffs.length; x++) {
	    if (diffs[x][0] !== DIFF_DELETE) {
	      text[x] = diffs[x][1];
	    }
	  }
	  return text.join('');
	};
	
	
	/**
	 * Compute the Levenshtein distance; the number of inserted, deleted or
	 * substituted characters.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @return {number} Number of changes.
	 */
	diff_match_patch.prototype.diff_levenshtein = function(diffs) {
	  var levenshtein = 0;
	  var insertions = 0;
	  var deletions = 0;
	  for (var x = 0; x < diffs.length; x++) {
	    var op = diffs[x][0];
	    var data = diffs[x][1];
	    switch (op) {
	      case DIFF_INSERT:
	        insertions += data.length;
	        break;
	      case DIFF_DELETE:
	        deletions += data.length;
	        break;
	      case DIFF_EQUAL:
	        // A deletion and an insertion is one substitution.
	        levenshtein += Math.max(insertions, deletions);
	        insertions = 0;
	        deletions = 0;
	        break;
	    }
	  }
	  levenshtein += Math.max(insertions, deletions);
	  return levenshtein;
	};
	
	
	/**
	 * Crush the diff into an encoded string which describes the operations
	 * required to transform text1 into text2.
	 * E.g. =3\t-2\t+ing  -> Keep 3 chars, delete 2 chars, insert 'ing'.
	 * Operations are tab-separated.  Inserted text is escaped using %xx notation.
	 * @param {!Array.<!diff_match_patch.Diff>} diffs Array of diff tuples.
	 * @return {string} Delta text.
	 */
	diff_match_patch.prototype.diff_toDelta = function(diffs) {
	  var text = [];
	  for (var x = 0; x < diffs.length; x++) {
	    switch (diffs[x][0]) {
	      case DIFF_INSERT:
	        text[x] = '+' + encodeURI(diffs[x][1]);
	        break;
	      case DIFF_DELETE:
	        text[x] = '-' + diffs[x][1].length;
	        break;
	      case DIFF_EQUAL:
	        text[x] = '=' + diffs[x][1].length;
	        break;
	    }
	  }
	  return text.join('\t').replace(/%20/g, ' ');
	};
	
	
	/**
	 * Given the original text1, and an encoded string which describes the
	 * operations required to transform text1 into text2, compute the full diff.
	 * @param {string} text1 Source string for the diff.
	 * @param {string} delta Delta text.
	 * @return {!Array.<!diff_match_patch.Diff>} Array of diff tuples.
	 * @throws {!Error} If invalid input.
	 */
	diff_match_patch.prototype.diff_fromDelta = function(text1, delta) {
	  var diffs = [];
	  var diffsLength = 0;  // Keeping our own length var is faster in JS.
	  var pointer = 0;  // Cursor in text1
	  var tokens = delta.split(/\t/g);
	  for (var x = 0; x < tokens.length; x++) {
	    // Each token begins with a one character parameter which specifies the
	    // operation of this token (delete, insert, equality).
	    var param = tokens[x].substring(1);
	    switch (tokens[x].charAt(0)) {
	      case '+':
	        try {
	          diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
	        } catch (ex) {
	          // Malformed URI sequence.
	          throw new Error('Illegal escape in diff_fromDelta: ' + param);
	        }
	        break;
	      case '-':
	        // Fall through.
	      case '=':
	        var n = parseInt(param, 10);
	        if (isNaN(n) || n < 0) {
	          throw new Error('Invalid number in diff_fromDelta: ' + param);
	        }
	        var text = text1.substring(pointer, pointer += n);
	        if (tokens[x].charAt(0) == '=') {
	          diffs[diffsLength++] = [DIFF_EQUAL, text];
	        } else {
	          diffs[diffsLength++] = [DIFF_DELETE, text];
	        }
	        break;
	      default:
	        // Blank tokens are ok (from a trailing \t).
	        // Anything else is an error.
	        if (tokens[x]) {
	          throw new Error('Invalid diff operation in diff_fromDelta: ' +
	                          tokens[x]);
	        }
	    }
	  }
	  if (pointer != text1.length) {
	    throw new Error('Delta length (' + pointer +
	        ') does not equal source text length (' + text1.length + ').');
	  }
	  return diffs;
	};
	
	
	//  MATCH FUNCTIONS
	
	
	/**
	 * Locate the best instance of 'pattern' in 'text' near 'loc'.
	 * @param {string} text The text to search.
	 * @param {string} pattern The pattern to search for.
	 * @param {number} loc The location to search around.
	 * @return {number} Best match index or -1.
	 */
	diff_match_patch.prototype.match_main = function(text, pattern, loc) {
	  // Check for null inputs.
	  if (text == null || pattern == null || loc == null) {
	    throw new Error('Null input. (match_main)');
	  }
	
	  loc = Math.max(0, Math.min(loc, text.length));
	  if (text == pattern) {
	    // Shortcut (potentially not guaranteed by the algorithm)
	    return 0;
	  } else if (!text.length) {
	    // Nothing to match.
	    return -1;
	  } else if (text.substring(loc, loc + pattern.length) == pattern) {
	    // Perfect match at the perfect spot!  (Includes case of null pattern)
	    return loc;
	  } else {
	    // Do a fuzzy compare.
	    return this.match_bitap_(text, pattern, loc);
	  }
	};
	
	
	/**
	 * Locate the best instance of 'pattern' in 'text' near 'loc' using the
	 * Bitap algorithm.
	 * @param {string} text The text to search.
	 * @param {string} pattern The pattern to search for.
	 * @param {number} loc The location to search around.
	 * @return {number} Best match index or -1.
	 * @private
	 */
	diff_match_patch.prototype.match_bitap_ = function(text, pattern, loc) {
	  if (pattern.length > this.Match_MaxBits) {
	    throw new Error('Pattern too long for this browser.');
	  }
	
	  // Initialise the alphabet.
	  var s = this.match_alphabet_(pattern);
	
	  var dmp = this;  // 'this' becomes 'window' in a closure.
	
	  /**
	   * Compute and return the score for a match with e errors and x location.
	   * Accesses loc and pattern through being a closure.
	   * @param {number} e Number of errors in match.
	   * @param {number} x Location of match.
	   * @return {number} Overall score for match (0.0 = good, 1.0 = bad).
	   * @private
	   */
	  function match_bitapScore_(e, x) {
	    var accuracy = e / pattern.length;
	    var proximity = Math.abs(loc - x);
	    if (!dmp.Match_Distance) {
	      // Dodge divide by zero error.
	      return proximity ? 1.0 : accuracy;
	    }
	    return accuracy + (proximity / dmp.Match_Distance);
	  }
	
	  // Highest score beyond which we give up.
	  var score_threshold = this.Match_Threshold;
	  // Is there a nearby exact match? (speedup)
	  var best_loc = text.indexOf(pattern, loc);
	  if (best_loc != -1) {
	    score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
	    // What about in the other direction? (speedup)
	    best_loc = text.lastIndexOf(pattern, loc + pattern.length);
	    if (best_loc != -1) {
	      score_threshold =
	          Math.min(match_bitapScore_(0, best_loc), score_threshold);
	    }
	  }
	
	  // Initialise the bit arrays.
	  var matchmask = 1 << (pattern.length - 1);
	  best_loc = -1;
	
	  var bin_min, bin_mid;
	  var bin_max = pattern.length + text.length;
	  var last_rd;
	  for (var d = 0; d < pattern.length; d++) {
	    // Scan for the best match; each iteration allows for one more error.
	    // Run a binary search to determine how far from 'loc' we can stray at this
	    // error level.
	    bin_min = 0;
	    bin_mid = bin_max;
	    while (bin_min < bin_mid) {
	      if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
	        bin_min = bin_mid;
	      } else {
	        bin_max = bin_mid;
	      }
	      bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
	    }
	    // Use the result from this iteration as the maximum for the next.
	    bin_max = bin_mid;
	    var start = Math.max(1, loc - bin_mid + 1);
	    var finish = Math.min(loc + bin_mid, text.length) + pattern.length;
	
	    var rd = Array(finish + 2);
	    rd[finish + 1] = (1 << d) - 1;
	    for (var j = finish; j >= start; j--) {
	      // The alphabet (s) is a sparse hash, so the following line generates
	      // warnings.
	      var charMatch = s[text.charAt(j - 1)];
	      if (d === 0) {  // First pass: exact match.
	        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
	      } else {  // Subsequent passes: fuzzy match.
	        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch |
	                (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
	                last_rd[j + 1];
	      }
	      if (rd[j] & matchmask) {
	        var score = match_bitapScore_(d, j - 1);
	        // This match will almost certainly be better than any existing match.
	        // But check anyway.
	        if (score <= score_threshold) {
	          // Told you so.
	          score_threshold = score;
	          best_loc = j - 1;
	          if (best_loc > loc) {
	            // When passing loc, don't exceed our current distance from loc.
	            start = Math.max(1, 2 * loc - best_loc);
	          } else {
	            // Already passed loc, downhill from here on in.
	            break;
	          }
	        }
	      }
	    }
	    // No hope for a (better) match at greater error levels.
	    if (match_bitapScore_(d + 1, loc) > score_threshold) {
	      break;
	    }
	    last_rd = rd;
	  }
	  return best_loc;
	};
	
	
	/**
	 * Initialise the alphabet for the Bitap algorithm.
	 * @param {string} pattern The text to encode.
	 * @return {!Object} Hash of character locations.
	 * @private
	 */
	diff_match_patch.prototype.match_alphabet_ = function(pattern) {
	  var s = {};
	  for (var i = 0; i < pattern.length; i++) {
	    s[pattern.charAt(i)] = 0;
	  }
	  for (var i = 0; i < pattern.length; i++) {
	    s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
	  }
	  return s;
	};
	
	
	//  PATCH FUNCTIONS
	
	
	/**
	 * Increase the context until it is unique,
	 * but don't let the pattern expand beyond Match_MaxBits.
	 * @param {!diff_match_patch.patch_obj} patch The patch to grow.
	 * @param {string} text Source text.
	 * @private
	 */
	diff_match_patch.prototype.patch_addContext_ = function(patch, text) {
	  if (text.length == 0) {
	    return;
	  }
	  var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
	  var padding = 0;
	
	  // Look for the first and last matches of pattern in text.  If two different
	  // matches are found, increase the pattern length.
	  while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
	         pattern.length < this.Match_MaxBits - this.Patch_Margin -
	         this.Patch_Margin) {
	    padding += this.Patch_Margin;
	    pattern = text.substring(patch.start2 - padding,
	                             patch.start2 + patch.length1 + padding);
	  }
	  // Add one chunk for good luck.
	  padding += this.Patch_Margin;
	
	  // Add the prefix.
	  var prefix = text.substring(patch.start2 - padding, patch.start2);
	  if (prefix) {
	    patch.diffs.unshift([DIFF_EQUAL, prefix]);
	  }
	  // Add the suffix.
	  var suffix = text.substring(patch.start2 + patch.length1,
	                              patch.start2 + patch.length1 + padding);
	  if (suffix) {
	    patch.diffs.push([DIFF_EQUAL, suffix]);
	  }
	
	  // Roll back the start points.
	  patch.start1 -= prefix.length;
	  patch.start2 -= prefix.length;
	  // Extend the lengths.
	  patch.length1 += prefix.length + suffix.length;
	  patch.length2 += prefix.length + suffix.length;
	};
	
	
	/**
	 * Compute a list of patches to turn text1 into text2.
	 * Use diffs if provided, otherwise compute it ourselves.
	 * There are four ways to call this function, depending on what data is
	 * available to the caller:
	 * Method 1:
	 * a = text1, b = text2
	 * Method 2:
	 * a = diffs
	 * Method 3 (optimal):
	 * a = text1, b = diffs
	 * Method 4 (deprecated, use method 3):
	 * a = text1, b = text2, c = diffs
	 *
	 * @param {string|!Array.<!diff_match_patch.Diff>} a text1 (methods 1,3,4) or
	 * Array of diff tuples for text1 to text2 (method 2).
	 * @param {string|!Array.<!diff_match_patch.Diff>} opt_b text2 (methods 1,4) or
	 * Array of diff tuples for text1 to text2 (method 3) or undefined (method 2).
	 * @param {string|!Array.<!diff_match_patch.Diff>} opt_c Array of diff tuples
	 * for text1 to text2 (method 4) or undefined (methods 1,2,3).
	 * @return {!Array.<!diff_match_patch.patch_obj>} Array of patch objects.
	 */
	diff_match_patch.prototype.patch_make = function(a, opt_b, opt_c) {
	  var text1, diffs;
	  if (typeof a == 'string' && typeof opt_b == 'string' &&
	      typeof opt_c == 'undefined') {
	    // Method 1: text1, text2
	    // Compute diffs from text1 and text2.
	    text1 = /** @type {string} */(a);
	    diffs = this.diff_main(text1, /** @type {string} */(opt_b), true);
	    if (diffs.length > 2) {
	      this.diff_cleanupSemantic(diffs);
	      this.diff_cleanupEfficiency(diffs);
	    }
	  } else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
	      typeof opt_c == 'undefined') {
	    // Method 2: diffs
	    // Compute text1 from diffs.
	    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(a);
	    text1 = this.diff_text1(diffs);
	  } else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
	      typeof opt_c == 'undefined') {
	    // Method 3: text1, diffs
	    text1 = /** @type {string} */(a);
	    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_b);
	  } else if (typeof a == 'string' && typeof opt_b == 'string' &&
	      opt_c && typeof opt_c == 'object') {
	    // Method 4: text1, text2, diffs
	    // text2 is not used.
	    text1 = /** @type {string} */(a);
	    diffs = /** @type {!Array.<!diff_match_patch.Diff>} */(opt_c);
	  } else {
	    throw new Error('Unknown call format to patch_make.');
	  }
	
	  if (diffs.length === 0) {
	    return [];  // Get rid of the null case.
	  }
	  var patches = [];
	  var patch = new diff_match_patch.patch_obj();
	  var patchDiffLength = 0;  // Keeping our own length var is faster in JS.
	  var char_count1 = 0;  // Number of characters into the text1 string.
	  var char_count2 = 0;  // Number of characters into the text2 string.
	  // Start with text1 (prepatch_text) and apply the diffs until we arrive at
	  // text2 (postpatch_text).  We recreate the patches one by one to determine
	  // context info.
	  var prepatch_text = text1;
	  var postpatch_text = text1;
	  for (var x = 0; x < diffs.length; x++) {
	    var diff_type = diffs[x][0];
	    var diff_text = diffs[x][1];
	
	    if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
	      // A new patch starts here.
	      patch.start1 = char_count1;
	      patch.start2 = char_count2;
	    }
	
	    switch (diff_type) {
	      case DIFF_INSERT:
	        patch.diffs[patchDiffLength++] = diffs[x];
	        patch.length2 += diff_text.length;
	        postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
	                         postpatch_text.substring(char_count2);
	        break;
	      case DIFF_DELETE:
	        patch.length1 += diff_text.length;
	        patch.diffs[patchDiffLength++] = diffs[x];
	        postpatch_text = postpatch_text.substring(0, char_count2) +
	                         postpatch_text.substring(char_count2 +
	                             diff_text.length);
	        break;
	      case DIFF_EQUAL:
	        if (diff_text.length <= 2 * this.Patch_Margin &&
	            patchDiffLength && diffs.length != x + 1) {
	          // Small equality inside a patch.
	          patch.diffs[patchDiffLength++] = diffs[x];
	          patch.length1 += diff_text.length;
	          patch.length2 += diff_text.length;
	        } else if (diff_text.length >= 2 * this.Patch_Margin) {
	          // Time for a new patch.
	          if (patchDiffLength) {
	            this.patch_addContext_(patch, prepatch_text);
	            patches.push(patch);
	            patch = new diff_match_patch.patch_obj();
	            patchDiffLength = 0;
	            // Unlike Unidiff, our patch lists have a rolling context.
	            // http://code.google.com/p/google-diff-match-patch/wiki/Unidiff
	            // Update prepatch text & pos to reflect the application of the
	            // just completed patch.
	            prepatch_text = postpatch_text;
	            char_count1 = char_count2;
	          }
	        }
	        break;
	    }
	
	    // Update the current character count.
	    if (diff_type !== DIFF_INSERT) {
	      char_count1 += diff_text.length;
	    }
	    if (diff_type !== DIFF_DELETE) {
	      char_count2 += diff_text.length;
	    }
	  }
	  // Pick up the leftover patch if not empty.
	  if (patchDiffLength) {
	    this.patch_addContext_(patch, prepatch_text);
	    patches.push(patch);
	  }
	
	  return patches;
	};
	
	
	/**
	 * Given an array of patches, return another array that is identical.
	 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of patch objects.
	 * @return {!Array.<!diff_match_patch.patch_obj>} Array of patch objects.
	 */
	diff_match_patch.prototype.patch_deepCopy = function(patches) {
	  // Making deep copies is hard in JavaScript.
	  var patchesCopy = [];
	  for (var x = 0; x < patches.length; x++) {
	    var patch = patches[x];
	    var patchCopy = new diff_match_patch.patch_obj();
	    patchCopy.diffs = [];
	    for (var y = 0; y < patch.diffs.length; y++) {
	      patchCopy.diffs[y] = patch.diffs[y].slice();
	    }
	    patchCopy.start1 = patch.start1;
	    patchCopy.start2 = patch.start2;
	    patchCopy.length1 = patch.length1;
	    patchCopy.length2 = patch.length2;
	    patchesCopy[x] = patchCopy;
	  }
	  return patchesCopy;
	};
	
	
	/**
	 * Merge a set of patches onto the text.  Return a patched text, as well
	 * as a list of true/false values indicating which patches were applied.
	 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of patch objects.
	 * @param {string} text Old text.
	 * @return {!Array.<string|!Array.<boolean>>} Two element Array, containing the
	 *      new text and an array of boolean values.
	 */
	diff_match_patch.prototype.patch_apply = function(patches, text) {
	  if (patches.length == 0) {
	    return [text, []];
	  }
	
	  // Deep copy the patches so that no changes are made to originals.
	  patches = this.patch_deepCopy(patches);
	
	  var nullPadding = this.patch_addPadding(patches);
	  text = nullPadding + text + nullPadding;
	
	  this.patch_splitMax(patches);
	  // delta keeps track of the offset between the expected and actual location
	  // of the previous patch.  If there are patches expected at positions 10 and
	  // 20, but the first patch was found at 12, delta is 2 and the second patch
	  // has an effective expected position of 22.
	  var delta = 0;
	  var results = [];
	  for (var x = 0; x < patches.length; x++) {
	    var expected_loc = patches[x].start2 + delta;
	    var text1 = this.diff_text1(patches[x].diffs);
	    var start_loc;
	    var end_loc = -1;
	    if (text1.length > this.Match_MaxBits) {
	      // patch_splitMax will only provide an oversized pattern in the case of
	      // a monster delete.
	      start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits),
	                                  expected_loc);
	      if (start_loc != -1) {
	        end_loc = this.match_main(text,
	            text1.substring(text1.length - this.Match_MaxBits),
	            expected_loc + text1.length - this.Match_MaxBits);
	        if (end_loc == -1 || start_loc >= end_loc) {
	          // Can't find valid trailing context.  Drop this patch.
	          start_loc = -1;
	        }
	      }
	    } else {
	      start_loc = this.match_main(text, text1, expected_loc);
	    }
	    if (start_loc == -1) {
	      // No match found.  :(
	      results[x] = false;
	      // Subtract the delta for this failed patch from subsequent patches.
	      delta -= patches[x].length2 - patches[x].length1;
	    } else {
	      // Found a match.  :)
	      results[x] = true;
	      delta = start_loc - expected_loc;
	      var text2;
	      if (end_loc == -1) {
	        text2 = text.substring(start_loc, start_loc + text1.length);
	      } else {
	        text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
	      }
	      if (text1 == text2) {
	        // Perfect match, just shove the replacement text in.
	        text = text.substring(0, start_loc) +
	               this.diff_text2(patches[x].diffs) +
	               text.substring(start_loc + text1.length);
	      } else {
	        // Imperfect match.  Run a diff to get a framework of equivalent
	        // indices.
	        var diffs = this.diff_main(text1, text2, false);
	        if (text1.length > this.Match_MaxBits &&
	            this.diff_levenshtein(diffs) / text1.length >
	            this.Patch_DeleteThreshold) {
	          // The end points match, but the content is unacceptably bad.
	          results[x] = false;
	        } else {
	          this.diff_cleanupSemanticLossless(diffs);
	          var index1 = 0;
	          var index2;
	          for (var y = 0; y < patches[x].diffs.length; y++) {
	            var mod = patches[x].diffs[y];
	            if (mod[0] !== DIFF_EQUAL) {
	              index2 = this.diff_xIndex(diffs, index1);
	            }
	            if (mod[0] === DIFF_INSERT) {  // Insertion
	              text = text.substring(0, start_loc + index2) + mod[1] +
	                     text.substring(start_loc + index2);
	            } else if (mod[0] === DIFF_DELETE) {  // Deletion
	              text = text.substring(0, start_loc + index2) +
	                     text.substring(start_loc + this.diff_xIndex(diffs,
	                         index1 + mod[1].length));
	            }
	            if (mod[0] !== DIFF_DELETE) {
	              index1 += mod[1].length;
	            }
	          }
	        }
	      }
	    }
	  }
	  // Strip the padding off.
	  text = text.substring(nullPadding.length, text.length - nullPadding.length);
	  return [text, results];
	};
	
	
	/**
	 * Add some padding on text start and end so that edges can match something.
	 * Intended to be called only from within patch_apply.
	 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of patch objects.
	 * @return {string} The padding string added to each side.
	 */
	diff_match_patch.prototype.patch_addPadding = function(patches) {
	  var paddingLength = this.Patch_Margin;
	  var nullPadding = '';
	  for (var x = 1; x <= paddingLength; x++) {
	    nullPadding += String.fromCharCode(x);
	  }
	
	  // Bump all the patches forward.
	  for (var x = 0; x < patches.length; x++) {
	    patches[x].start1 += paddingLength;
	    patches[x].start2 += paddingLength;
	  }
	
	  // Add some padding on start of first diff.
	  var patch = patches[0];
	  var diffs = patch.diffs;
	  if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
	    // Add nullPadding equality.
	    diffs.unshift([DIFF_EQUAL, nullPadding]);
	    patch.start1 -= paddingLength;  // Should be 0.
	    patch.start2 -= paddingLength;  // Should be 0.
	    patch.length1 += paddingLength;
	    patch.length2 += paddingLength;
	  } else if (paddingLength > diffs[0][1].length) {
	    // Grow first equality.
	    var extraLength = paddingLength - diffs[0][1].length;
	    diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
	    patch.start1 -= extraLength;
	    patch.start2 -= extraLength;
	    patch.length1 += extraLength;
	    patch.length2 += extraLength;
	  }
	
	  // Add some padding on end of last diff.
	  patch = patches[patches.length - 1];
	  diffs = patch.diffs;
	  if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
	    // Add nullPadding equality.
	    diffs.push([DIFF_EQUAL, nullPadding]);
	    patch.length1 += paddingLength;
	    patch.length2 += paddingLength;
	  } else if (paddingLength > diffs[diffs.length - 1][1].length) {
	    // Grow last equality.
	    var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
	    diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
	    patch.length1 += extraLength;
	    patch.length2 += extraLength;
	  }
	
	  return nullPadding;
	};
	
	
	/**
	 * Look through the patches and break up any which are longer than the maximum
	 * limit of the match algorithm.
	 * Intended to be called only from within patch_apply.
	 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of patch objects.
	 */
	diff_match_patch.prototype.patch_splitMax = function(patches) {
	  var patch_size = this.Match_MaxBits;
	  for (var x = 0; x < patches.length; x++) {
	    if (patches[x].length1 > patch_size) {
	      var bigpatch = patches[x];
	      // Remove the big old patch.
	      patches.splice(x--, 1);
	      var start1 = bigpatch.start1;
	      var start2 = bigpatch.start2;
	      var precontext = '';
	      while (bigpatch.diffs.length !== 0) {
	        // Create one of several smaller patches.
	        var patch = new diff_match_patch.patch_obj();
	        var empty = true;
	        patch.start1 = start1 - precontext.length;
	        patch.start2 = start2 - precontext.length;
	        if (precontext !== '') {
	          patch.length1 = patch.length2 = precontext.length;
	          patch.diffs.push([DIFF_EQUAL, precontext]);
	        }
	        while (bigpatch.diffs.length !== 0 &&
	               patch.length1 < patch_size - this.Patch_Margin) {
	          var diff_type = bigpatch.diffs[0][0];
	          var diff_text = bigpatch.diffs[0][1];
	          if (diff_type === DIFF_INSERT) {
	            // Insertions are harmless.
	            patch.length2 += diff_text.length;
	            start2 += diff_text.length;
	            patch.diffs.push(bigpatch.diffs.shift());
	            empty = false;
	          } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
	                     patch.diffs[0][0] == DIFF_EQUAL &&
	                     diff_text.length > 2 * patch_size) {
	            // This is a large deletion.  Let it pass in one chunk.
	            patch.length1 += diff_text.length;
	            start1 += diff_text.length;
	            empty = false;
	            patch.diffs.push([diff_type, diff_text]);
	            bigpatch.diffs.shift();
	          } else {
	            // Deletion or equality.  Only take as much as we can stomach.
	            diff_text = diff_text.substring(0,
	                patch_size - patch.length1 - this.Patch_Margin);
	            patch.length1 += diff_text.length;
	            start1 += diff_text.length;
	            if (diff_type === DIFF_EQUAL) {
	              patch.length2 += diff_text.length;
	              start2 += diff_text.length;
	            } else {
	              empty = false;
	            }
	            patch.diffs.push([diff_type, diff_text]);
	            if (diff_text == bigpatch.diffs[0][1]) {
	              bigpatch.diffs.shift();
	            } else {
	              bigpatch.diffs[0][1] =
	                  bigpatch.diffs[0][1].substring(diff_text.length);
	            }
	          }
	        }
	        // Compute the head context for the next patch.
	        precontext = this.diff_text2(patch.diffs);
	        precontext =
	            precontext.substring(precontext.length - this.Patch_Margin);
	        // Append the end context for this patch.
	        var postcontext = this.diff_text1(bigpatch.diffs)
	                              .substring(0, this.Patch_Margin);
	        if (postcontext !== '') {
	          patch.length1 += postcontext.length;
	          patch.length2 += postcontext.length;
	          if (patch.diffs.length !== 0 &&
	              patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
	            patch.diffs[patch.diffs.length - 1][1] += postcontext;
	          } else {
	            patch.diffs.push([DIFF_EQUAL, postcontext]);
	          }
	        }
	        if (!empty) {
	          patches.splice(++x, 0, patch);
	        }
	      }
	    }
	  }
	};
	
	
	/**
	 * Take a list of patches and return a textual representation.
	 * @param {!Array.<!diff_match_patch.patch_obj>} patches Array of patch objects.
	 * @return {string} Text representation of patches.
	 */
	diff_match_patch.prototype.patch_toText = function(patches) {
	  var text = [];
	  for (var x = 0; x < patches.length; x++) {
	    text[x] = patches[x];
	  }
	  return text.join('');
	};
	
	
	/**
	 * Parse a textual representation of patches and return a list of patch objects.
	 * @param {string} textline Text representation of patches.
	 * @return {!Array.<!diff_match_patch.patch_obj>} Array of patch objects.
	 * @throws {!Error} If invalid input.
	 */
	diff_match_patch.prototype.patch_fromText = function(textline) {
	  var patches = [];
	  if (!textline) {
	    return patches;
	  }
	  var text = textline.split('\n');
	  var textPointer = 0;
	  var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
	  while (textPointer < text.length) {
	    var m = text[textPointer].match(patchHeader);
	    if (!m) {
	      throw new Error('Invalid patch string: ' + text[textPointer]);
	    }
	    var patch = new diff_match_patch.patch_obj();
	    patches.push(patch);
	    patch.start1 = parseInt(m[1], 10);
	    if (m[2] === '') {
	      patch.start1--;
	      patch.length1 = 1;
	    } else if (m[2] == '0') {
	      patch.length1 = 0;
	    } else {
	      patch.start1--;
	      patch.length1 = parseInt(m[2], 10);
	    }
	
	    patch.start2 = parseInt(m[3], 10);
	    if (m[4] === '') {
	      patch.start2--;
	      patch.length2 = 1;
	    } else if (m[4] == '0') {
	      patch.length2 = 0;
	    } else {
	      patch.start2--;
	      patch.length2 = parseInt(m[4], 10);
	    }
	    textPointer++;
	
	    while (textPointer < text.length) {
	      var sign = text[textPointer].charAt(0);
	      try {
	        var line = decodeURI(text[textPointer].substring(1));
	      } catch (ex) {
	        // Malformed URI sequence.
	        throw new Error('Illegal escape in patch_fromText: ' + line);
	      }
	      if (sign == '-') {
	        // Deletion.
	        patch.diffs.push([DIFF_DELETE, line]);
	      } else if (sign == '+') {
	        // Insertion.
	        patch.diffs.push([DIFF_INSERT, line]);
	      } else if (sign == ' ') {
	        // Minor equality.
	        patch.diffs.push([DIFF_EQUAL, line]);
	      } else if (sign == '@') {
	        // Start of next patch.
	        break;
	      } else if (sign === '') {
	        // Blank line?  Whatever.
	      } else {
	        // WTF?
	        throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
	      }
	      textPointer++;
	    }
	  }
	  return patches;
	};
	
	
	/**
	 * Class representing one patch operation.
	 * @constructor
	 */
	diff_match_patch.patch_obj = function() {
	  /** @type {!Array.<!diff_match_patch.Diff>} */
	  this.diffs = [];
	  /** @type {?number} */
	  this.start1 = null;
	  /** @type {?number} */
	  this.start2 = null;
	  /** @type {number} */
	  this.length1 = 0;
	  /** @type {number} */
	  this.length2 = 0;
	};
	
	
	/**
	 * Emmulate GNU diff's format.
	 * Header: @@ -382,8 +481,9 @@
	 * Indicies are printed as 1-based, not 0-based.
	 * @return {string} The GNU diff string.
	 */
	diff_match_patch.patch_obj.prototype.toString = function() {
	  var coords1, coords2;
	  if (this.length1 === 0) {
	    coords1 = this.start1 + ',0';
	  } else if (this.length1 == 1) {
	    coords1 = this.start1 + 1;
	  } else {
	    coords1 = (this.start1 + 1) + ',' + this.length1;
	  }
	  if (this.length2 === 0) {
	    coords2 = this.start2 + ',0';
	  } else if (this.length2 == 1) {
	    coords2 = this.start2 + 1;
	  } else {
	    coords2 = (this.start2 + 1) + ',' + this.length2;
	  }
	  var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
	  var op;
	  // Escape the body of the patch with %xx notation.
	  for (var x = 0; x < this.diffs.length; x++) {
	    switch (this.diffs[x][0]) {
	      case DIFF_INSERT:
	        op = '+';
	        break;
	      case DIFF_DELETE:
	        op = '-';
	        break;
	      case DIFF_EQUAL:
	        op = ' ';
	        break;
	    }
	    text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
	  }
	  return text.join('').replace(/%20/g, ' ');
	};
	
	
	// Export these global variables so that they survive Google's JS compiler.
	// In a browser, 'this' will be 'window'.
	// In node.js 'this' will be a global object.
	this['diff_match_patch'] = diff_match_patch;
	this['DIFF_DELETE'] = DIFF_DELETE;
	this['DIFF_INSERT'] = DIFF_INSERT;
	this['DIFF_EQUAL'] = DIFF_EQUAL;
	


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var Processor = __webpack_require__(41).Processor;
	var Pipe = __webpack_require__(29).Pipe;
	var DiffContext = __webpack_require__(13).DiffContext;
	var PatchContext = __webpack_require__(14).PatchContext;
	var ReverseContext = __webpack_require__(15).ReverseContext;
	
	var trivial = __webpack_require__(40);
	var nested = __webpack_require__(38);
	var arrays = __webpack_require__(35);
	var dates = __webpack_require__(36);
	var texts = __webpack_require__(39);
	
	var DiffPatcher = function DiffPatcher(options) {
	  this.processor = new Processor(options);
	  this.processor.pipe(new Pipe('diff').append(
	    nested.collectChildrenDiffFilter,
	    trivial.diffFilter,
	    dates.diffFilter,
	    texts.diffFilter,
	    nested.objectsDiffFilter,
	    arrays.diffFilter
	  ).shouldHaveResult());
	  this.processor.pipe(new Pipe('patch').append(
	    nested.collectChildrenPatchFilter,
	    arrays.collectChildrenPatchFilter,
	    trivial.patchFilter,
	    texts.patchFilter,
	    nested.patchFilter,
	    arrays.patchFilter
	  ).shouldHaveResult());
	  this.processor.pipe(new Pipe('reverse').append(
	    nested.collectChildrenReverseFilter,
	    arrays.collectChildrenReverseFilter,
	    trivial.reverseFilter,
	    texts.reverseFilter,
	    nested.reverseFilter,
	    arrays.reverseFilter
	  ).shouldHaveResult());
	};
	
	DiffPatcher.prototype.options = function() {
	  return this.processor.options.apply(this.processor, arguments);
	};
	
	DiffPatcher.prototype.diff = function(left, right) {
	  return this.processor.process(new DiffContext(left, right));
	};
	
	DiffPatcher.prototype.patch = function(left, delta) {
	  return this.processor.process(new PatchContext(left, delta));
	};
	
	DiffPatcher.prototype.reverse = function(delta) {
	  return this.processor.process(new ReverseContext(delta));
	};
	
	DiffPatcher.prototype.unpatch = function(right, delta) {
	  return this.patch(right, this.reverse(delta));
	};
	
	exports.DiffPatcher = DiffPatcher;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var DiffContext = __webpack_require__(13).DiffContext;
	var PatchContext = __webpack_require__(14).PatchContext;
	var ReverseContext = __webpack_require__(15).ReverseContext;
	
	var lcs = __webpack_require__(37);
	
	var ARRAY_MOVE = 3;
	
	var isArray = (typeof Array.isArray === 'function') ?
	  // use native function
	  Array.isArray :
	  // use instanceof operator
	  function(a) {
	    return a instanceof Array;
	  };
	
	var arrayIndexOf = typeof Array.prototype.indexOf === 'function' ?
	  function(array, item) {
	    return array.indexOf(item);
	  } : function(array, item) {
	    var length = array.length;
	    for (var i = 0; i < length; i++) {
	      if (array[i] === item) {
	        return i;
	      }
	    }
	    return -1;
	  };
	
	function arraysHaveMatchByRef(array1, array2, len1, len2) {
	  for (var index1 = 0; index1 < len1; index1++) {
	    var val1 = array1[index1];
	    for (var index2 = 0; index2 < len2; index2++) {
	      var val2 = array2[index2];
	      if (val1 === val2) {
	        return true;
	      }
	    }
	  }
	}
	
	function matchItems(array1, array2, index1, index2, context) {
	  var value1 = array1[index1];
	  var value2 = array2[index2];
	  if (value1 === value2) {
	    return true;
	  }
	  if (typeof value1 !== 'object' || typeof value2 !== 'object') {
	    return false;
	  }
	  var objectHash = context.objectHash;
	  if (!objectHash) {
	    // no way to match objects was provided, try match by position
	    return context.matchByPosition && index1 === index2;
	  }
	  var hash1;
	  var hash2;
	  if (typeof index1 === 'number') {
	    context.hashCache1 = context.hashCache1 || [];
	    hash1 = context.hashCache1[index1];
	    if (typeof hash1 === 'undefined') {
	      context.hashCache1[index1] = hash1 = objectHash(value1, index1);
	    }
	  } else {
	    hash1 = objectHash(value1);
	  }
	  if (typeof hash1 === 'undefined') {
	    return false;
	  }
	  if (typeof index2 === 'number') {
	    context.hashCache2 = context.hashCache2 || [];
	    hash2 = context.hashCache2[index2];
	    if (typeof hash2 === 'undefined') {
	      context.hashCache2[index2] = hash2 = objectHash(value2, index2);
	    }
	  } else {
	    hash2 = objectHash(value2);
	  }
	  if (typeof hash2 === 'undefined') {
	    return false;
	  }
	  return hash1 === hash2;
	}
	
	var diffFilter = function arraysDiffFilter(context) {
	  if (!context.leftIsArray) {
	    return;
	  }
	
	  var matchContext = {
	    objectHash: context.options && context.options.objectHash,
	    matchByPosition: context.options && context.options.matchByPosition
	  };
	  var commonHead = 0;
	  var commonTail = 0;
	  var index;
	  var index1;
	  var index2;
	  var array1 = context.left;
	  var array2 = context.right;
	  var len1 = array1.length;
	  var len2 = array2.length;
	
	  var child;
	
	  if (len1 > 0 && len2 > 0 && !matchContext.objectHash &&
	    typeof matchContext.matchByPosition !== 'boolean') {
	    matchContext.matchByPosition = !arraysHaveMatchByRef(array1, array2, len1, len2);
	  }
	
	  // separate common head
	  while (commonHead < len1 && commonHead < len2 &&
	    matchItems(array1, array2, commonHead, commonHead, matchContext)) {
	    index = commonHead;
	    child = new DiffContext(context.left[index], context.right[index]);
	    context.push(child, index);
	    commonHead++;
	  }
	  // separate common tail
	  while (commonTail + commonHead < len1 && commonTail + commonHead < len2 &&
	    matchItems(array1, array2, len1 - 1 - commonTail, len2 - 1 - commonTail, matchContext)) {
	    index1 = len1 - 1 - commonTail;
	    index2 = len2 - 1 - commonTail;
	    child = new DiffContext(context.left[index1], context.right[index2]);
	    context.push(child, index2);
	    commonTail++;
	  }
	  var result;
	  if (commonHead + commonTail === len1) {
	    if (len1 === len2) {
	      // arrays are identical
	      context.setResult(undefined).exit();
	      return;
	    }
	    // trivial case, a block (1 or more consecutive items) was added
	    result = result || {
	      _t: 'a'
	    };
	    for (index = commonHead; index < len2 - commonTail; index++) {
	      result[index] = [array2[index]];
	    }
	    context.setResult(result).exit();
	    return;
	  }
	  if (commonHead + commonTail === len2) {
	    // trivial case, a block (1 or more consecutive items) was removed
	    result = result || {
	      _t: 'a'
	    };
	    for (index = commonHead; index < len1 - commonTail; index++) {
	      result['_' + index] = [array1[index], 0, 0];
	    }
	    context.setResult(result).exit();
	    return;
	  }
	  // reset hash cache
	  delete matchContext.hashCache1;
	  delete matchContext.hashCache2;
	
	  // diff is not trivial, find the LCS (Longest Common Subsequence)
	  var trimmed1 = array1.slice(commonHead, len1 - commonTail);
	  var trimmed2 = array2.slice(commonHead, len2 - commonTail);
	  var seq = lcs.get(
	    trimmed1, trimmed2,
	    matchItems,
	    matchContext
	  );
	  var removedItems = [];
	  result = result || {
	    _t: 'a'
	  };
	  for (index = commonHead; index < len1 - commonTail; index++) {
	    if (arrayIndexOf(seq.indices1, index - commonHead) < 0) {
	      // removed
	      result['_' + index] = [array1[index], 0, 0];
	      removedItems.push(index);
	    }
	  }
	
	  var detectMove = true;
	  if (context.options && context.options.arrays && context.options.arrays.detectMove === false) {
	    detectMove = false;
	  }
	  var includeValueOnMove = false;
	  if (context.options && context.options.arrays && context.options.arrays.includeValueOnMove) {
	    includeValueOnMove = true;
	  }
	
	  var removedItemsLength = removedItems.length;
	  for (index = commonHead; index < len2 - commonTail; index++) {
	    var indexOnArray2 = arrayIndexOf(seq.indices2, index - commonHead);
	    if (indexOnArray2 < 0) {
	      // added, try to match with a removed item and register as position move
	      var isMove = false;
	      if (detectMove && removedItemsLength > 0) {
	        for (var removeItemIndex1 = 0; removeItemIndex1 < removedItemsLength; removeItemIndex1++) {
	          index1 = removedItems[removeItemIndex1];
	          if (matchItems(trimmed1, trimmed2, index1 - commonHead,
	            index - commonHead, matchContext)) {
	            // store position move as: [originalValue, newPosition, ARRAY_MOVE]
	            result['_' + index1].splice(1, 2, index, ARRAY_MOVE);
	            if (!includeValueOnMove) {
	              // don't include moved value on diff, to save bytes
	              result['_' + index1][0] = '';
	            }
	
	            index2 = index;
	            child = new DiffContext(context.left[index1], context.right[index2]);
	            context.push(child, index2);
	            removedItems.splice(removeItemIndex1, 1);
	            isMove = true;
	            break;
	          }
	        }
	      }
	      if (!isMove) {
	        // added
	        result[index] = [array2[index]];
	      }
	    } else {
	      // match, do inner diff
	      index1 = seq.indices1[indexOnArray2] + commonHead;
	      index2 = seq.indices2[indexOnArray2] + commonHead;
	      child = new DiffContext(context.left[index1], context.right[index2]);
	      context.push(child, index2);
	    }
	  }
	
	  context.setResult(result).exit();
	
	};
	diffFilter.filterName = 'arrays';
	
	var compare = {
	  numerically: function(a, b) {
	    return a - b;
	  },
	  numericallyBy: function(name) {
	    return function(a, b) {
	      return a[name] - b[name];
	    };
	  }
	};
	
	var patchFilter = function nestedPatchFilter(context) {
	  if (!context.nested) {
	    return;
	  }
	  if (context.delta._t !== 'a') {
	    return;
	  }
	  var index, index1;
	
	  var delta = context.delta;
	  var array = context.left;
	
	  // first, separate removals, insertions and modifications
	  var toRemove = [];
	  var toInsert = [];
	  var toModify = [];
	  for (index in delta) {
	    if (index !== '_t') {
	      if (index[0] === '_') {
	        // removed item from original array
	        if (delta[index][2] === 0 || delta[index][2] === ARRAY_MOVE) {
	          toRemove.push(parseInt(index.slice(1), 10));
	        } else {
	          throw new Error('only removal or move can be applied at original array indices' +
	            ', invalid diff type: ' + delta[index][2]);
	        }
	      } else {
	        if (delta[index].length === 1) {
	          // added item at new array
	          toInsert.push({
	            index: parseInt(index, 10),
	            value: delta[index][0]
	          });
	        } else {
	          // modified item at new array
	          toModify.push({
	            index: parseInt(index, 10),
	            delta: delta[index]
	          });
	        }
	      }
	    }
	  }
	
	  // remove items, in reverse order to avoid sawing our own floor
	  toRemove = toRemove.sort(compare.numerically);
	  for (index = toRemove.length - 1; index >= 0; index--) {
	    index1 = toRemove[index];
	    var indexDiff = delta['_' + index1];
	    var removedValue = array.splice(index1, 1)[0];
	    if (indexDiff[2] === ARRAY_MOVE) {
	      // reinsert later
	      toInsert.push({
	        index: indexDiff[1],
	        value: removedValue
	      });
	    }
	  }
	
	  // insert items, in reverse order to avoid moving our own floor
	  toInsert = toInsert.sort(compare.numericallyBy('index'));
	  var toInsertLength = toInsert.length;
	  for (index = 0; index < toInsertLength; index++) {
	    var insertion = toInsert[index];
	    array.splice(insertion.index, 0, insertion.value);
	  }
	
	  // apply modifications
	  var toModifyLength = toModify.length;
	  var child;
	  if (toModifyLength > 0) {
	    for (index = 0; index < toModifyLength; index++) {
	      var modification = toModify[index];
	      child = new PatchContext(context.left[modification.index], modification.delta);
	      context.push(child, modification.index);
	    }
	  }
	
	  if (!context.children) {
	    context.setResult(context.left).exit();
	    return;
	  }
	  context.exit();
	};
	patchFilter.filterName = 'arrays';
	
	var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
	  if (!context || !context.children) {
	    return;
	  }
	  if (context.delta._t !== 'a') {
	    return;
	  }
	  var length = context.children.length;
	  var child;
	  for (var index = 0; index < length; index++) {
	    child = context.children[index];
	    context.left[child.childName] = child.result;
	  }
	  context.setResult(context.left).exit();
	};
	collectChildrenPatchFilter.filterName = 'arraysCollectChildren';
	
	var reverseFilter = function arraysReverseFilter(context) {
	  if (!context.nested) {
	    if (context.delta[2] === ARRAY_MOVE) {
	      context.newName = '_' + context.delta[1];
	      context.setResult([context.delta[0], parseInt(context.childName.substr(1), 10), ARRAY_MOVE]).exit();
	    }
	    return;
	  }
	  if (context.delta._t !== 'a') {
	    return;
	  }
	  var name, child;
	  for (name in context.delta) {
	    if (name === '_t') {
	      continue;
	    }
	    child = new ReverseContext(context.delta[name]);
	    context.push(child, name);
	  }
	  context.exit();
	};
	reverseFilter.filterName = 'arrays';
	
	var reverseArrayDeltaIndex = function(delta, index, itemDelta) {
	  if (typeof index === 'string' && index[0] === '_') {
	    return parseInt(index.substr(1), 10);
	  } else if (isArray(itemDelta) && itemDelta[2] === 0) {
	    return '_' + index;
	  }
	
	  var reverseIndex = +index;
	  for (var deltaIndex in delta) {
	    var deltaItem = delta[deltaIndex];
	    if (isArray(deltaItem)) {
	      if (deltaItem[2] === ARRAY_MOVE) {
	        var moveFromIndex = parseInt(deltaIndex.substr(1), 10);
	        var moveToIndex = deltaItem[1];
	        if (moveToIndex === +index) {
	          return moveFromIndex;
	        }
	        if (moveFromIndex <= reverseIndex && moveToIndex > reverseIndex) {
	          reverseIndex++;
	        } else if (moveFromIndex >= reverseIndex && moveToIndex < reverseIndex) {
	          reverseIndex--;
	        }
	      } else if (deltaItem[2] === 0) {
	        var deleteIndex = parseInt(deltaIndex.substr(1), 10);
	        if (deleteIndex <= reverseIndex) {
	          reverseIndex++;
	        }
	      } else if (deltaItem.length === 1 && deltaIndex <= reverseIndex) {
	        reverseIndex--;
	      }
	    }
	  }
	
	  return reverseIndex;
	};
	
	var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
	  if (!context || !context.children) {
	    return;
	  }
	  if (context.delta._t !== 'a') {
	    return;
	  }
	  var length = context.children.length;
	  var child;
	  var delta = {
	    _t: 'a'
	  };
	
	  for (var index = 0; index < length; index++) {
	    child = context.children[index];
	    var name = child.newName;
	    if (typeof name === 'undefined') {
	      name = reverseArrayDeltaIndex(context.delta, child.childName, child.result);
	    }
	    if (delta[name] !== child.result) {
	      delta[name] = child.result;
	    }
	  }
	  context.setResult(delta).exit();
	};
	collectChildrenReverseFilter.filterName = 'arraysCollectChildren';
	
	exports.diffFilter = diffFilter;
	exports.patchFilter = patchFilter;
	exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
	exports.reverseFilter = reverseFilter;
	exports.collectChildrenReverseFilter = collectChildrenReverseFilter;


/***/ },
/* 36 */
/***/ function(module, exports) {

	var diffFilter = function datesDiffFilter(context) {
	  if (context.left instanceof Date) {
	    if (context.right instanceof Date) {
	      if (context.left.getTime() !== context.right.getTime()) {
	        context.setResult([context.left, context.right]);
	      } else {
	        context.setResult(undefined);
	      }
	    } else {
	      context.setResult([context.left, context.right]);
	    }
	    context.exit();
	  } else if (context.right instanceof Date) {
	    context.setResult([context.left, context.right]).exit();
	  }
	};
	diffFilter.filterName = 'dates';
	
	exports.diffFilter = diffFilter;


/***/ },
/* 37 */
/***/ function(module, exports) {

	/*
	
	LCS implementation that supports arrays or strings
	
	reference: http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
	
	*/
	
	var defaultMatch = function(array1, array2, index1, index2) {
	  return array1[index1] === array2[index2];
	};
	
	var lengthMatrix = function(array1, array2, match, context) {
	  var len1 = array1.length;
	  var len2 = array2.length;
	  var x, y;
	
	  // initialize empty matrix of len1+1 x len2+1
	  var matrix = [len1 + 1];
	  for (x = 0; x < len1 + 1; x++) {
	    matrix[x] = [len2 + 1];
	    for (y = 0; y < len2 + 1; y++) {
	      matrix[x][y] = 0;
	    }
	  }
	  matrix.match = match;
	  // save sequence lengths for each coordinate
	  for (x = 1; x < len1 + 1; x++) {
	    for (y = 1; y < len2 + 1; y++) {
	      if (match(array1, array2, x - 1, y - 1, context)) {
	        matrix[x][y] = matrix[x - 1][y - 1] + 1;
	      } else {
	        matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
	      }
	    }
	  }
	  return matrix;
	};
	
	var backtrack = function(matrix, array1, array2, index1, index2, context) {
	  if (index1 === 0 || index2 === 0) {
	    return {
	      sequence: [],
	      indices1: [],
	      indices2: []
	    };
	  }
	
	  if (matrix.match(array1, array2, index1 - 1, index2 - 1, context)) {
	    var subsequence = backtrack(matrix, array1, array2, index1 - 1, index2 - 1, context);
	    subsequence.sequence.push(array1[index1 - 1]);
	    subsequence.indices1.push(index1 - 1);
	    subsequence.indices2.push(index2 - 1);
	    return subsequence;
	  }
	
	  if (matrix[index1][index2 - 1] > matrix[index1 - 1][index2]) {
	    return backtrack(matrix, array1, array2, index1, index2 - 1, context);
	  } else {
	    return backtrack(matrix, array1, array2, index1 - 1, index2, context);
	  }
	};
	
	var get = function(array1, array2, match, context) {
	  context = context || {};
	  var matrix = lengthMatrix(array1, array2, match || defaultMatch, context);
	  var result = backtrack(matrix, array1, array2, array1.length, array2.length, context);
	  if (typeof array1 === 'string' && typeof array2 === 'string') {
	    result.sequence = result.sequence.join('');
	  }
	  return result;
	};
	
	exports.get = get;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var DiffContext = __webpack_require__(13).DiffContext;
	var PatchContext = __webpack_require__(14).PatchContext;
	var ReverseContext = __webpack_require__(15).ReverseContext;
	
	var collectChildrenDiffFilter = function collectChildrenDiffFilter(context) {
	  if (!context || !context.children) {
	    return;
	  }
	  var length = context.children.length;
	  var child;
	  var result = context.result;
	  for (var index = 0; index < length; index++) {
	    child = context.children[index];
	    if (typeof child.result === 'undefined') {
	      continue;
	    }
	    result = result || {};
	    result[child.childName] = child.result;
	  }
	  if (result && context.leftIsArray) {
	    result._t = 'a';
	  }
	  context.setResult(result).exit();
	};
	collectChildrenDiffFilter.filterName = 'collectChildren';
	
	var objectsDiffFilter = function objectsDiffFilter(context) {
	  if (context.leftIsArray || context.leftType !== 'object') {
	    return;
	  }
	
	  var name, child, propertyFilter = context.options.propertyFilter;
	  for (name in context.left) {
	    if (!Object.prototype.hasOwnProperty.call(context.left, name)) {
	      continue;
	    }
	    if (propertyFilter && !propertyFilter(name, context)) {
	      continue;
	    }
	    child = new DiffContext(context.left[name], context.right[name]);
	    context.push(child, name);
	  }
	  for (name in context.right) {
	    if (!Object.prototype.hasOwnProperty.call(context.right, name)) {
	      continue;
	    }
	    if (propertyFilter && !propertyFilter(name, context)) {
	      continue;
	    }
	    if (typeof context.left[name] === 'undefined') {
	      child = new DiffContext(undefined, context.right[name]);
	      context.push(child, name);
	    }
	  }
	
	  if (!context.children || context.children.length === 0) {
	    context.setResult(undefined).exit();
	    return;
	  }
	  context.exit();
	};
	objectsDiffFilter.filterName = 'objects';
	
	var patchFilter = function nestedPatchFilter(context) {
	  if (!context.nested) {
	    return;
	  }
	  if (context.delta._t) {
	    return;
	  }
	  var name, child;
	  for (name in context.delta) {
	    child = new PatchContext(context.left[name], context.delta[name]);
	    context.push(child, name);
	  }
	  context.exit();
	};
	patchFilter.filterName = 'objects';
	
	var collectChildrenPatchFilter = function collectChildrenPatchFilter(context) {
	  if (!context || !context.children) {
	    return;
	  }
	  if (context.delta._t) {
	    return;
	  }
	  var length = context.children.length;
	  var child;
	  for (var index = 0; index < length; index++) {
	    child = context.children[index];
	    if (Object.prototype.hasOwnProperty.call(context.left, child.childName) && child.result === undefined) {
	      delete context.left[child.childName];
	    } else if (context.left[child.childName] !== child.result) {
	      context.left[child.childName] = child.result;
	    }
	  }
	  context.setResult(context.left).exit();
	};
	collectChildrenPatchFilter.filterName = 'collectChildren';
	
	var reverseFilter = function nestedReverseFilter(context) {
	  if (!context.nested) {
	    return;
	  }
	  if (context.delta._t) {
	    return;
	  }
	  var name, child;
	  for (name in context.delta) {
	    child = new ReverseContext(context.delta[name]);
	    context.push(child, name);
	  }
	  context.exit();
	};
	reverseFilter.filterName = 'objects';
	
	var collectChildrenReverseFilter = function collectChildrenReverseFilter(context) {
	  if (!context || !context.children) {
	    return;
	  }
	  if (context.delta._t) {
	    return;
	  }
	  var length = context.children.length;
	  var child;
	  var delta = {};
	  for (var index = 0; index < length; index++) {
	    child = context.children[index];
	    if (delta[child.childName] !== child.result) {
	      delta[child.childName] = child.result;
	    }
	  }
	  context.setResult(delta).exit();
	};
	collectChildrenReverseFilter.filterName = 'collectChildren';
	
	exports.collectChildrenDiffFilter = collectChildrenDiffFilter;
	exports.objectsDiffFilter = objectsDiffFilter;
	exports.patchFilter = patchFilter;
	exports.collectChildrenPatchFilter = collectChildrenPatchFilter;
	exports.reverseFilter = reverseFilter;
	exports.collectChildrenReverseFilter = collectChildrenReverseFilter;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/* global diff_match_patch */
	var TEXT_DIFF = 2;
	var DEFAULT_MIN_LENGTH = 60;
	var cachedDiffPatch = null;
	
	var getDiffMatchPatch = function(required) {
	  /*jshint camelcase: false */
	
	  if (!cachedDiffPatch) {
	    var instance;
	    if (typeof diff_match_patch !== 'undefined') {
	      // already loaded, probably a browser
	      instance = typeof diff_match_patch === 'function' ?
	        new diff_match_patch() : new diff_match_patch.diff_match_patch();
	    } else if (true) {
	      try {
	        var dmpModuleName = 'diff_match_patch_uncompressed';
	        var dmp = __webpack_require__(87)("./" + dmpModuleName);
	        instance = new dmp.diff_match_patch();
	      } catch (err) {
	        instance = null;
	      }
	    }
	    if (!instance) {
	      if (!required) {
	        return null;
	      }
	      var error = new Error('text diff_match_patch library not found');
	      error.diff_match_patch_not_found = true;
	      throw error;
	    }
	    cachedDiffPatch = {
	      diff: function(txt1, txt2) {
	        return instance.patch_toText(instance.patch_make(txt1, txt2));
	      },
	      patch: function(txt1, patch) {
	        var results = instance.patch_apply(instance.patch_fromText(patch), txt1);
	        for (var i = 0; i < results[1].length; i++) {
	          if (!results[1][i]) {
	            var error = new Error('text patch failed');
	            error.textPatchFailed = true;
	          }
	        }
	        return results[0];
	      }
	    };
	  }
	  return cachedDiffPatch;
	};
	
	var diffFilter = function textsDiffFilter(context) {
	  if (context.leftType !== 'string') {
	    return;
	  }
	  var minLength = (context.options && context.options.textDiff &&
	    context.options.textDiff.minLength) || DEFAULT_MIN_LENGTH;
	  if (context.left.length < minLength ||
	    context.right.length < minLength) {
	    context.setResult([context.left, context.right]).exit();
	    return;
	  }
	  // large text, try to use a text-diff algorithm
	  var diffMatchPatch = getDiffMatchPatch();
	  if (!diffMatchPatch) {
	    // diff-match-patch library not available, fallback to regular string replace
	    context.setResult([context.left, context.right]).exit();
	    return;
	  }
	  var diff = diffMatchPatch.diff;
	  context.setResult([diff(context.left, context.right), 0, TEXT_DIFF]).exit();
	};
	diffFilter.filterName = 'texts';
	
	var patchFilter = function textsPatchFilter(context) {
	  if (context.nested) {
	    return;
	  }
	  if (context.delta[2] !== TEXT_DIFF) {
	    return;
	  }
	
	  // text-diff, use a text-patch algorithm
	  var patch = getDiffMatchPatch(true).patch;
	  context.setResult(patch(context.left, context.delta[0])).exit();
	};
	patchFilter.filterName = 'texts';
	
	var textDeltaReverse = function(delta) {
	  var i, l, lines, line, lineTmp, header = null,
	    headerRegex = /^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/,
	    lineHeader, lineAdd, lineRemove;
	  lines = delta.split('\n');
	  for (i = 0, l = lines.length; i < l; i++) {
	    line = lines[i];
	    var lineStart = line.slice(0, 1);
	    if (lineStart === '@') {
	      header = headerRegex.exec(line);
	      lineHeader = i;
	      lineAdd = null;
	      lineRemove = null;
	
	      // fix header
	      lines[lineHeader] = '@@ -' + header[3] + ',' + header[4] + ' +' + header[1] + ',' + header[2] + ' @@';
	    } else if (lineStart === '+') {
	      lineAdd = i;
	      lines[i] = '-' + lines[i].slice(1);
	      if (lines[i - 1].slice(0, 1) === '+') {
	        // swap lines to keep default order (-+)
	        lineTmp = lines[i];
	        lines[i] = lines[i - 1];
	        lines[i - 1] = lineTmp;
	      }
	    } else if (lineStart === '-') {
	      lineRemove = i;
	      lines[i] = '+' + lines[i].slice(1);
	    }
	  }
	  return lines.join('\n');
	};
	
	var reverseFilter = function textsReverseFilter(context) {
	  if (context.nested) {
	    return;
	  }
	  if (context.delta[2] !== TEXT_DIFF) {
	    return;
	  }
	
	  // text-diff, use a text-diff algorithm
	  context.setResult([textDeltaReverse(context.delta[0]), 0, TEXT_DIFF]).exit();
	};
	reverseFilter.filterName = 'texts';
	
	exports.diffFilter = diffFilter;
	exports.patchFilter = patchFilter;
	exports.reverseFilter = reverseFilter;


/***/ },
/* 40 */
/***/ function(module, exports) {

	var isArray = (typeof Array.isArray === 'function') ?
	  // use native function
	  Array.isArray :
	  // use instanceof operator
	  function(a) {
	    return a instanceof Array;
	  };
	
	var diffFilter = function trivialMatchesDiffFilter(context) {
	  if (context.left === context.right) {
	    context.setResult(undefined).exit();
	    return;
	  }
	  if (typeof context.left === 'undefined') {
	    if (typeof context.right === 'function') {
	      throw new Error('functions are not supported');
	    }
	    context.setResult([context.right]).exit();
	    return;
	  }
	  if (typeof context.right === 'undefined') {
	    context.setResult([context.left, 0, 0]).exit();
	    return;
	  }
	  if (typeof context.left === 'function' || typeof context.right === 'function') {
	    throw new Error('functions are not supported');
	  }
	  context.leftType = context.left === null ? 'null' : typeof context.left;
	  context.rightType = context.right === null ? 'null' : typeof context.right;
	  if (context.leftType !== context.rightType) {
	    context.setResult([context.left, context.right]).exit();
	    return;
	  }
	  if (context.leftType === 'boolean' || context.leftType === 'number') {
	    context.setResult([context.left, context.right]).exit();
	    return;
	  }
	  if (context.leftType === 'object') {
	    context.leftIsArray = isArray(context.left);
	  }
	  if (context.rightType === 'object') {
	    context.rightIsArray = isArray(context.right);
	  }
	  if (context.leftIsArray !== context.rightIsArray) {
	    context.setResult([context.left, context.right]).exit();
	    return;
	  }
	};
	diffFilter.filterName = 'trivial';
	
	var patchFilter = function trivialMatchesPatchFilter(context) {
	  if (typeof context.delta === 'undefined') {
	    context.setResult(context.left).exit();
	    return;
	  }
	  context.nested = !isArray(context.delta);
	  if (context.nested) {
	    return;
	  }
	  if (context.delta.length === 1) {
	    context.setResult(context.delta[0]).exit();
	    return;
	  }
	  if (context.delta.length === 2) {
	    context.setResult(context.delta[1]).exit();
	    return;
	  }
	  if (context.delta.length === 3 && context.delta[2] === 0) {
	    context.setResult(undefined).exit();
	    return;
	  }
	};
	patchFilter.filterName = 'trivial';
	
	var reverseFilter = function trivialReferseFilter(context) {
	  if (typeof context.delta === 'undefined') {
	    context.setResult(context.delta).exit();
	    return;
	  }
	  context.nested = !isArray(context.delta);
	  if (context.nested) {
	    return;
	  }
	  if (context.delta.length === 1) {
	    context.setResult([context.delta[0], 0, 0]).exit();
	    return;
	  }
	  if (context.delta.length === 2) {
	    context.setResult([context.delta[1], context.delta[0]]).exit();
	    return;
	  }
	  if (context.delta.length === 3 && context.delta[2] === 0) {
	    context.setResult([context.delta[0]]).exit();
	    return;
	  }
	};
	reverseFilter.filterName = 'trivial';
	
	exports.diffFilter = diffFilter;
	exports.patchFilter = patchFilter;
	exports.reverseFilter = reverseFilter;


/***/ },
/* 41 */
/***/ function(module, exports) {

	
	var Processor = function Processor(options){
	  this.selfOptions = options || {};
	  this.pipes = {};
	};
	
	Processor.prototype.options = function(options) {
	  if (options) {
	    this.selfOptions = options;
	  }
	  return this.selfOptions;
	};
	
	Processor.prototype.pipe = function(name, pipe) {
	  if (typeof name === 'string') {
	    if (typeof pipe === 'undefined') {
	      return this.pipes[name];
	    } else {
	      this.pipes[name] = pipe;
	    }
	  }
	  if (name && name.name) {
	    pipe = name;
	    if (pipe.processor === this) { return pipe; }
	    this.pipes[pipe.name] = pipe;
	  }
	  pipe.processor = this;
	  return pipe;
	};
	
	Processor.prototype.process = function(input, pipe) {
	  var context = input;
	  context.options = this.options();
	  var nextPipe = pipe || input.pipe || 'default';
	  var lastPipe, lastContext;
	  while (nextPipe) {
	    if (typeof context.nextAfterChildren !== 'undefined') {
	      // children processed and coming back to parent
	      context.next = context.nextAfterChildren;
	      context.nextAfterChildren = null;
	    }
	
	    if (typeof nextPipe === 'string') {
	      nextPipe = this.pipe(nextPipe);
	    }
	    nextPipe.process(context);
	    lastContext = context;
	    lastPipe = nextPipe;
	    nextPipe = null;
	    if (context) {
	      if (context.next) {
	        context = context.next;
	        nextPipe = lastContext.nextPipe || context.pipe || lastPipe;
	      }
	    }
	  }
	  return context.hasResult ? context.result : undefined;
	};
	
	exports.Processor = Processor;


/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict"
	
	var COLOR_MAP = { 
		black:'30', 
		red:'31', 
		green:'32', 
		yellow:'33', 
		blue:'34', 
		magenta:'35', 
		cyan:'36', 
		white:'37' 
	};
	
	var BG_COLOR_MAP = {
		black:'40', 
		red:'41', 
		green:'42', 
		yellow:'43', 
		blue:'44', 
		magenta:'45', 
		cyan:'46', 
		white:'47' 
	};
	
	var ATTR_MAP = { 
		bold:'1', 
		thin:'2', 
		underline:'4', 
		blink:'5', 
		reverse:'7', 
		invisible:'8' 
	};
	
	var TextUtil = function() {};
	
	TextUtil.truncate = function(str, maxlen) {
		if(0 < maxlen && maxlen < str.length) {
			var trlen = str.length - maxlen + 3;
			return "..." + str.slice(trlen);
		}
		return str;
	};
	
	TextUtil.setTextStyle = function(str,style,start,end) {
	
		if(style) {
			var buf = [];
			if(style.color!=null) { 
				buf.push(COLOR_MAP[style.color]||'37'); 
			}
			if(style.background!=null) { 
				buf.push(BG_COLOR_MAP[style.background]||'40'); 
			}
			if(style.attribute!=null) {	
				buf.push(''+(ATTR_MAP[style.attribute]||'')); 
			}
			if(0<buf.length) {
				if(start===undefined) {
					str = "\x1b[" + buf.join(';') + "m" + str + "\x1b[0m";
				} else {
					end = end?end:str.length;
					str = str.slice(0,start) + "\x1b[" + buf.join(';') + "m" + str.slice(start,end) + "\x1b[0m" + str.slice(end);
				}
			}
		}
		return str;
	
	};
	
	var __SPACE__ = "                                                                       ";
	
	TextUtil.makeIndent = function(indent) {
		var ret = '';
		while(__SPACE__.length < indent) {
			ret += __SPACE__;
			indent -= __SPACE__.length;
		}
		return ret + __SPACE__.slice(0,indent);
	};
	
	TextUtil.concatTextBlock = function(a,b) {
		var result = [],i;
		for(i=0;i<Math.math(a.length,b.length);i++) {
			result.push((a[i]||'')+(b[i]||''));
		}
		return result;
	};
	
	TextUtil.makeLine = function(indent,length,ch) {
		return TextUtil.makeIndent(indent) + TextUtil.makeIndent(length).replace(/ /g,ch);
	};
	
	module.exports = TextUtil;

/***/ },
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
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./contexts/context": 12,
		"./contexts/context.js": 12,
		"./contexts/diff": 13,
		"./contexts/diff.js": 13,
		"./contexts/patch": 14,
		"./contexts/patch.js": 14,
		"./contexts/reverse": 15,
		"./contexts/reverse.js": 15,
		"./date-reviver": 27,
		"./date-reviver.js": 27,
		"./diffpatcher": 34,
		"./diffpatcher.js": 34,
		"./environment": 16,
		"./environment.js": 16,
		"./filters/arrays": 35,
		"./filters/arrays.js": 35,
		"./filters/dates": 36,
		"./filters/dates.js": 36,
		"./filters/lcs": 37,
		"./filters/lcs.js": 37,
		"./filters/nested": 38,
		"./filters/nested.js": 38,
		"./filters/texts": 39,
		"./filters/texts.js": 39,
		"./filters/trivial": 40,
		"./filters/trivial.js": 40,
		"./formatters/annotated": 17,
		"./formatters/annotated.js": 17,
		"./formatters/base": 1,
		"./formatters/base.js": 1,
		"./formatters/console": 18,
		"./formatters/console.js": 18,
		"./formatters/html": 19,
		"./formatters/html.js": 19,
		"./formatters/index": 20,
		"./formatters/index.js": 20,
		"./formatters/jsonpatch": 21,
		"./formatters/jsonpatch.js": 21,
		"./main": 28,
		"./main-formatters": 67,
		"./main-formatters.js": 67,
		"./main-full": 68,
		"./main-full.js": 68,
		"./main.js": 28,
		"./pipe": 29,
		"./pipe.js": 29,
		"./processor": 41,
		"./processor.js": 41
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 66;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(20);


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var environment = __webpack_require__(16);
	
	if (environment.isBrowser) {
	  /* global window */
	  /* jshint camelcase: false */
	  window.diff_match_patch = __webpack_require__(33);
	  /* jshint camelcase: true */
	}
	
	module.exports = __webpack_require__(28);


/***/ },
/* 69 */,
/* 70 */
/***/ function(module, exports) {

	"use strict";
	
	function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }
	
	/* JavaScript code generation helpers. */
	var javascript = {
	  stringEscape: function(s) {
	    /*
	     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
	     * literal except for the closing quote character, backslash, carriage
	     * return, line separator, paragraph separator, and line feed. Any character
	     * may appear in the form of an escape sequence.
	     *
	     * For portability, we also escape all control and non-ASCII characters.
	     * Note that "\0" and "\v" escape sequences are not used because JSHint does
	     * not like the first and IE the second.
	     */
	    return s
	      .replace(/\\/g,   '\\\\')   // backslash
	      .replace(/"/g,    '\\"')    // closing double quote
	      .replace(/\x08/g, '\\b')    // backspace
	      .replace(/\t/g,   '\\t')    // horizontal tab
	      .replace(/\n/g,   '\\n')    // line feed
	      .replace(/\f/g,   '\\f')    // form feed
	      .replace(/\r/g,   '\\r')    // carriage return
	      .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
	      .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
	      .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
	      .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
	  },
	
	  regexpClassEscape: function(s) {
	    /*
	     * Based on ECMA-262, 5th ed., 7.8.5 & 15.10.1.
	     *
	     * For portability, we also escape all control and non-ASCII characters.
	     */
	    return s
	      .replace(/\\/g, '\\\\')    // backslash
	      .replace(/\//g, '\\/')     // closing slash
	      .replace(/\]/g, '\\]')     // closing bracket
	      .replace(/\^/g, '\\^')     // caret
	      .replace(/-/g,  '\\-')     // dash
	      .replace(/\0/g, '\\0')     // null
	      .replace(/\t/g, '\\t')     // horizontal tab
	      .replace(/\n/g, '\\n')     // line feed
	      .replace(/\v/g, '\\x0B')   // vertical tab
	      .replace(/\f/g, '\\f')     // form feed
	      .replace(/\r/g, '\\r')     // carriage return
	      .replace(/[\x00-\x08\x0E\x0F]/g,  function(ch) { return '\\x0' + hex(ch); })
	      .replace(/[\x10-\x1F\x80-\xFF]/g, function(ch) { return '\\x'  + hex(ch); })
	      .replace(/[\u0100-\u0FFF]/g,      function(ch) { return '\\u0' + hex(ch); })
	      .replace(/[\u1000-\uFFFF]/g,      function(ch) { return '\\u'  + hex(ch); });
	  }
	};
	
	module.exports = javascript;


/***/ },
/* 71 */
/***/ function(module, exports) {

	"use strict";
	
	/* Bytecode instruction opcodes. */
	var opcodes = {
	  /* Stack Manipulation */
	
	  PUSH:             0,    // PUSH c
	  PUSH_UNDEFINED:   1,    // PUSH_UNDEFINED
	  PUSH_NULL:        2,    // PUSH_NULL
	  PUSH_FAILED:      3,    // PUSH_FAILED
	  PUSH_EMPTY_ARRAY: 4,    // PUSH_EMPTY_ARRAY
	  PUSH_CURR_POS:    5,    // PUSH_CURR_POS
	  POP:              6,    // POP
	  POP_CURR_POS:     7,    // POP_CURR_POS
	  POP_N:            8,    // POP_N n
	  NIP:              9,    // NIP
	  APPEND:           10,   // APPEND
	  WRAP:             11,   // WRAP n
	  TEXT:             12,   // TEXT
	
	  /* Conditions and Loops */
	
	  IF:               13,   // IF t, f
	  IF_ERROR:         14,   // IF_ERROR t, f
	  IF_NOT_ERROR:     15,   // IF_NOT_ERROR t, f
	  WHILE_NOT_ERROR:  16,   // WHILE_NOT_ERROR b
	
	  /* Matching */
	
	  MATCH_ANY:        17,   // MATCH_ANY a, f, ...
	  MATCH_STRING:     18,   // MATCH_STRING s, a, f, ...
	  MATCH_STRING_IC:  19,   // MATCH_STRING_IC s, a, f, ...
	  MATCH_REGEXP:     20,   // MATCH_REGEXP r, a, f, ...
	  ACCEPT_N:         21,   // ACCEPT_N n
	  ACCEPT_STRING:    22,   // ACCEPT_STRING s
	  FAIL:             23,   // FAIL e
	
	  /* Calls */
	
	  LOAD_SAVED_POS:   24,   // LOAD_SAVED_POS p
	  UPDATE_SAVED_POS: 25,   // UPDATE_SAVED_POS
	  CALL:             26,   // CALL f, n, pc, p1, p2, ..., pN
	
	  /* Rules */
	
	  RULE:             27,   // RULE r
	
	  /* Failure Reporting */
	
	  SILENT_FAILS_ON:  28,   // SILENT_FAILS_ON
	  SILENT_FAILS_OFF: 29    // SILENT_FAILS_OFF
	};
	
	module.exports = opcodes;


/***/ },
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var escapeStringRegexp = __webpack_require__(81);
	var ansiStyles = __webpack_require__(80);
	var stripAnsi = __webpack_require__(84);
	var hasAnsi = __webpack_require__(82);
	var supportsColor = __webpack_require__(86);
	var defineProps = Object.defineProperties;
	var chalk = module.exports;
	
	function build(_styles) {
		var builder = function builder() {
			return applyStyle.apply(builder, arguments);
		};
		builder._styles = _styles;
		// __proto__ is used because we must return a function, but there is
		// no way to create a function with a different prototype.
		builder.__proto__ = proto;
		return builder;
	}
	
	var styles = (function () {
		var ret = {};
	
		ansiStyles.grey = ansiStyles.gray;
	
		Object.keys(ansiStyles).forEach(function (key) {
			ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
	
			ret[key] = {
				get: function () {
					return build(this._styles.concat(key));
				}
			};
		});
	
		return ret;
	})();
	
	var proto = defineProps(function chalk() {}, styles);
	
	function applyStyle() {
		// support varags, but simply cast to string in case there's only one arg
		var args = arguments;
		var argsLen = args.length;
		var str = argsLen !== 0 && String(arguments[0]);
		if (argsLen > 1) {
			// don't slice `arguments`, it prevents v8 optimizations
			for (var a = 1; a < argsLen; a++) {
				str += ' ' + args[a];
			}
		}
	
		if (!chalk.enabled || !str) {
			return str;
		}
	
		/*jshint validthis: true*/
		var nestedStyles = this._styles;
	
		for (var i = 0; i < nestedStyles.length; i++) {
			var code = ansiStyles[nestedStyles[i]];
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			str = code.open + str.replace(code.closeRe, code.open) + code.close;
		}
	
		return str;
	}
	
	function init() {
		var ret = {};
	
		Object.keys(styles).forEach(function (name) {
			ret[name] = {
				get: function () {
					return build([name]);
				}
			};
		});
	
		return ret;
	}
	
	defineProps(chalk, init());
	
	chalk.styles = ansiStyles;
	chalk.hasColor = hasAnsi;
	chalk.stripColor = stripAnsi;
	chalk.supportsColor = supportsColor;
	
	// detect mode if not set manually
	if (chalk.enabled === undefined) {
		chalk.enabled = chalk.supportsColor;
	}


/***/ },
/* 80 */
/***/ function(module, exports) {

	'use strict';
	var styles = module.exports;
	
	var codes = {
		reset: [0, 0],
	
		bold: [1, 22], // 21 isn't widely supported and 22 does the same thing
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],
		gray: [90, 39],
	
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49]
	};
	
	Object.keys(codes).forEach(function (key) {
		var val = codes[key];
		var style = styles[key] = {};
		style.open = '\u001b[' + val[0] + 'm';
		style.close = '\u001b[' + val[1] + 'm';
	});


/***/ },
/* 81 */
/***/ function(module, exports) {

	'use strict';
	
	var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
	
	module.exports = function (str) {
		if (typeof str !== 'string') {
			throw new TypeError('Expected a string');
		}
	
		return str.replace(matchOperatorsRe, '\\$&');
	};


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(83);
	var re = new RegExp(ansiRegex().source); // remove the `g` flag
	module.exports = re.test.bind(re);


/***/ },
/* 83 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function () {
		return /\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]/g;
	};


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ansiRegex = __webpack_require__(85)();
	
	module.exports = function (str) {
		return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
	};


/***/ },
/* 85 */
/***/ function(module, exports) {

	'use strict';
	module.exports = function () {
		return /\u001b\[(?:[0-9]{1,3}(?:;[0-9]{1,3})*)?[m|K]/g;
	};


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	module.exports = (function () {
		if (process.argv.indexOf('--no-color') !== -1) {
			return false;
		}
	
		if (process.argv.indexOf('--color') !== -1) {
			return true;
		}
	
		if (process.stdout && !process.stdout.isTTY) {
			return false;
		}
	
		if (process.platform === 'win32') {
			return true;
		}
	
		if ('COLORTERM' in process.env) {
			return true;
		}
	
		if (process.env.TERM === 'dumb') {
			return false;
		}
	
		if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
			return true;
		}
	
		return false;
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./diff_match_patch_uncompressed": 33,
		"./diff_match_patch_uncompressed.js": 33
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 87;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./annotated": 17,
		"./annotated.js": 17,
		"./base": 1,
		"./base.js": 1,
		"./console": 18,
		"./console.js": 18,
		"./html": 19,
		"./html.js": 19,
		"./index": 20,
		"./index.js": 20,
		"./jsonpatch": 21,
		"./jsonpatch.js": 21
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 88;


/***/ },
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict"
	
	var TextUtil = __webpack_require__(42);
	
	var defaultOptions = {
		useColor:true,
	};
	
	var _applyDefault = function(opt,def) {
		var ret = {};
		for(var key in def) {
			ret[key] = (opt&&opt[key]!==undefined)?opt[key]:def[key];
		}
		return ret;
	};
	
	var TextGraph = function(opt){
		this.options = _applyDefault(opt,defaultOptions);
	};
	
	TextGraph.prototype.setTextStyle = function(str,style,start,end) {
		if(this.options.useColor) {
			return TextUtil.setTextStyle(str,style,start,end);
		} else {
			return str;
		}
	};
	
	TextGraph.prototype.drawState = function(nodes,column,contents,isLastState) {
		var buf = [];
		contents = contents || [];
		if(0<contents.length) {
			buf.push(this.drawStateLine(nodes,column,isLastState) + contents.shift());
			while(0<contents.length) {
				buf.push(this.drawStateLine(nodes,undefined,isLastState) + contents.shift());
			}
		} else {
			buf.push(this.drawStateLine(nodes,column,isLastState));
		}
		return buf;
	};
	
	TextGraph.prototype.drawStateLine = function(nodes,column,isLastState) {
		var line = '', i, quote = isLastState?"  ":"| ";
		for(i=0;i<nodes.length;i++) {
			if(column===i) {
				if(nodes[i].type=="rule.fail") {
					line += this.setTextStyle("x ",{color:'red'});
				} else if(nodes[i].type=="rule.match") {
					line += this.setTextStyle("o ",{color:'green'});
				} else {
					line += this.setTextStyle("? ",{color:'yellow'});
				}
			} else {
				line += this.setTextStyle(quote,nodes[i].style);
			}
		}
		return line;
	};
	
	TextGraph.prototype.drawMergeEdge = function(fromIndex,toIndex,nodes) {
	
		var lines = ['',''], i;	
		for(i=0;i<nodes.length;i++) {
			if(i<=toIndex) {
				lines[0] += this.setTextStyle("| ",nodes[i].style);
			} else if(i<fromIndex-1) {
				lines[0] += this.setTextStyle("|", nodes[i].style) + this.setTextStyle('_',nodes[fromIndex].style);
			} else if(i==fromIndex-1) {
				lines[0] += this.setTextStyle("|", nodes[i].style) + this.setTextStyle('/',nodes[fromIndex].style);
			} else if(fromIndex<i || (i==fromIndex && toIndex+1==fromIndex)) {
				lines[0] += this.setTextStyle('| ',nodes[i].style);
			} else {
				lines[0] += '  ';
			}
		}
	
		for(i=0;i<nodes.length;i++) {
			if(i<toIndex) {
				lines[1] += this.setTextStyle("| ",nodes[i].style);
			} else if(i==toIndex) {
				lines[1] += this.setTextStyle("|",nodes[i].style) + this.setTextStyle('/',nodes[fromIndex].style);
			} else if(i<fromIndex) {
				lines[1] += this.setTextStyle("| ",nodes[i].style);
			} else if(i<nodes.length-1) {
				lines[1] += this.setTextStyle(" /",nodes[i+1].style);
			} else {
				lines[1] += '  ';
			}
		}
		return lines;
	};
	
	TextGraph.prototype.drawMergeEdges = function(fromIndexes,toIndex,nodes) {
		nodes = nodes.slice(0);
		fromIndexes = fromIndexes.slice(0);
		fromIndexes.sort(function(a,b){return a-b;});
		var lines=[],i;
		while(0<fromIndexes.length) {
			var fromIndex = fromIndexes.shift();
			lines = lines.concat(this.drawMergeEdge(fromIndex,toIndex,nodes));
			nodes.splice(fromIndex,1);
			for(var i=0;i<fromIndexes.length;i++) {
				if(fromIndex<fromIndexes[i]) fromIndexes[i]--;
			}
		}
		return lines;
	};
	
	module.exports = TextGraph;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var TextQuoter = __webpack_require__(95);
	var TextUtil = __webpack_require__(42);
	var TextGraph = __webpack_require__(93);
	
	var defaultOptions = {
		hiddenPaths:[],
		useColor:true,
		maxSourceLines:6,
		parent:null,
		showSource:true,
		showTrace:false,
		showFullPath:false,
		maxPathLength:64,
	};
	
	var VLINE_STYLES = [
		{color:'yellow'},
		{color:'magenta'},
		{color:'blue'},
		{color:'white'},
		{color:'green'},
	];
	
	var Tracer = function(source, opt) {
	
		this.options = {};
		for(var key in defaultOptions) {
			this.options[key] = (opt&&opt[key]!==undefined)?opt[key]:defaultOptions[key];
		}
	
		this.parent = this.options.parent;
		this.quoter = new TextQuoter(source,{useColor:this.options.useColor});
		this.hiddenPatterns = [];
		for(var i=0;i<this.options.hiddenPaths.length;i++) {
			var pattern = this.options.hiddenPaths[i];
			if(pattern instanceof RegExp) {
				this.hiddenPatterns[i] = pattern;
			} else {
				this.hiddenPatterns[i] = new RegExp("(^|/)" + pattern + "(/|$)");
			}
		}
	
		this.headStringMap = {
			"rule.enter":this.setTextStyle("+ ",{color:'cyan'}),
			"rule.match":this.setTextStyle("o ",{color:'green'}),
			"rule.fail":this.setTextStyle("x ",{color:'red'}),
			"error":this.setTextStyle("! ",{color:'red'})
		};
	
		this.typeStringMap = {
			"rule.enter":this.setTextStyle("ENTER",{color:'cyan'}),
			"rule.match":this.setTextStyle("MATCH",{color:'green'}),
			"rule.fail":this.setTextStyle("FAIL ",{color:'red'}),
			"error":this.setTextStyle("ERROR",{color:'red'})
		};
	
		this.init();
	
	};
	
	Tracer.prototype.init = function() {
		this.root = {
			type:'root',
			path:'',
			parent:null,
			matches:[],
			fails:[],
			rule:'',
			location:{
				start:{offset:0,line:0,column:0},
				end:{offset:0,line:0,column:0}
			}
		};
		this.currentNode = this.root;
		this.maxFailPos = 0;
		this.maxFails = [];
		this.currentLevel = 0;
		this.numNodes = 0;
	};
	
	Tracer.prototype.setTextStyle = function(str,style) {
		return this.quoter.setTextStyle(str,style);
	};
	
	var _convertToZeroBasedLocation = function(location) {
		return {
			start:{
				offset:location.start.offset,
				line:location.start.line-1,
				column:location.start.column-1
			},
			end:{
				offset:location.end.offset,
				line:location.end.line-1,
				column:location.end.column-1
			},
		};
	};
	
	Tracer.prototype.getSourceLines = function(quoteString,location,maxLines) {
		var location = _convertToZeroBasedLocation(location);
		return this.quoter.getQuotedLines(quoteString,
			location.start.line,location.start.column,
			location.end.line,location.end.column,
			maxLines);
	};
	
	Tracer.prototype.isHidden = function(node) {
		var path = node.path + node.rule;
		for(var i=0;i<this.hiddenPatterns.length;i++) {
			var pattern = this.hiddenPatterns[i];
			if(pattern.test(path)) {
				return true;
			}
		}
		return false;
	};
	
	Tracer.prototype.trace = function(evt) {
		if(this.parent&&this.parent.trace) {
			this.parent.trace(evt);
		}
		switch(evt.type){
			case "rule.enter":
			this.onEnter(evt);
			break;
			case "rule.match":
			this.onMatch(evt);
			break;
			default:
			this.onFail(evt);
			break;
		}
	};
	
	Tracer.prototype.printNode = function(level,node) {
	
		if(this.isHidden(node)) return;
	
		var lines = this.buildNodeText(node,this.options.showSource," ");
		var style = VLINE_STYLES[level%VLINE_STYLES.length];
		var tailIndent = TextUtil.makeIndent(level+1);
		var headIndent = TextUtil.makeIndent(level) + this.typeStringMap[node.type] + " " ;
	
		lines = lines.map(function(e,i){
			if(i==0) {
				return headIndent + e;
			} else {
				return tailIndent + e;
			}
		});
		
		console.log(lines.join('\n'));
	
	};
	
	Tracer.prototype.onEnter = function(evt) {
	
		var node = {
			path:this.currentNode.path + this.currentNode.rule + '/',
			parent:this.currentNode,
			matches:[],
			fails:[],
			type:evt.type,
			rule:evt.rule,
			location:evt.location,
			lastChildType: null,
			number:++this.numNodes,
		};
	
		this.currentNode = node;
	
		if(this.options.showTrace) {
			this.printNode(this.currentLevel,this.currentNode);		
		}
	
		this.currentLevel++;
	};
	
	var _isParentRule = function(parent,child) {
		return parent.path + parent.rule + "/" == child.path;
	};
	
	var _isSameRule = function(n1,n2) {
		return (n1.path == n2.path) && (n1.rule == n2.rule);
	};
	
	Tracer.prototype.onFail = function(evt) {
	
		if( this.maxFailPos < evt.location.start.offset ) {
			this.maxFailPos = evt.location.start.offset;
			this.maxFails = [this.currentNode];
		} else if( this.maxFailPos == evt.location.start.offset ) {
			var found = false;
			for(var i=this.maxFails.length-1;0<=i;i--) {
				var f=this.maxFails[i];
				if(_isParentRule(this.currentNode,f) || _isSameRule(this.currentNode,f)) {
					found = true;
					break;
				}
			}
			if(!found) {
				this.maxFails.push(this.currentNode);
			}
		}
	
		this.currentNode.type = evt.type;
		this.currentNode.location = evt.location;
		this.currentNode.parent.fails.push(this.currentNode);
		this.currentNode.parent.lastChildType = "fail";
	
		this.currentLevel--;
	
		if(this.options.showTrace) {
			this.printNode(this.currentLevel,this.currentNode);
		}
	
		this.currentNode = this.currentNode.parent;
	
	};
	
	Tracer.prototype.onMatch = function(evt) {
	
		this.currentNode.type = evt.type;
		this.currentNode.location = evt.location;
		this.currentNode.parent.matches.push(this.currentNode);
		this.currentNode.parent.lastChildType = "match";
	
		this.currentLevel--;
	
		if(this.options.showTrace) {
			this.printNode(this.currentLevel,this.currentNode);
		}
	
		this.currentNode = this.currentNode.parent;
	};
	
	Tracer.prototype.buildNodeText = function(node,withSource,quoteString) {
		var buf = [];
		var location = [ 
			node.location.start.line, ":", node.location.start.column, 
			"-", 
			node.location.end.line, ":", node.location.end.column, 
			].join('');
	
		var title = [];
		if(this.options.showTrace) {
			title.push(this.setTextStyle("#" + node.number,{attribute:'thin'}));
		}	
		title.push(this.setTextStyle(location,{attribute:'thin'}));
	
		if(this.options.showFullPath) {
			title.push(this.setTextStyle(TextUtil.truncate(node.path,this.options.maxPathLength) + node.rule,{color:"yellow",attribute:'bold'}));
		} else {
			title.push(this.setTextStyle(node.rule,{color:"yellow",attribute:'bold'}));
		}
	
		buf.push(title.join(' '));
	
		if(withSource) {
			var lines = this.getSourceLines(quoteString||'',node.location,this.options.maxSourceLines);
			for(var i=0;i<lines.length;i++) {
				buf.push(lines[i]);
			}
		}
		return buf;
	};
	
	Tracer.prototype.getParseTree = function(type,node) {
	
		node = node || this.root;
		var children = [];
		var self = this;
	
		var ret = {
			parent:null,
			type:node.type,
			path:node.path,
			rule:node.rule,
			children:children,
			location:node.location,
			number:node.number,
		};
	
		function buildChilden(nodes) {
			var c,e,i;
			for(i=0;i<nodes.length;i++) {
				e = nodes[i];
				if(type != "fail" && self.isHidden(e)) continue;
				c = self.getParseTree(type,e);
				if(c) {
					c.parent = ret;
					children.push(c);
				}
			}
		}
	
		buildChilden(node.matches);
		buildChilden(node.fails);
	
		if(children.length == 0 && type == "fail" && this.maxFails.indexOf(node)<0) {
			return null;
		}
	
		return ret;
	
	};
	
	Tracer.prototype.buildNodeGraph = function(list) {
	
		var nodes = [];
		var lines = [];
		var g = new TextGraph({useColor:this.options.useColor});
	
		while(0<list.length) {
	
			var node = list.pop();
			var parentIndexes = [];
	
			for(var i=0;i<nodes.length;i++) {
				if(nodes[i].parent == node) {
					parentIndexes.push(i);
				}
			}
	
			var column;
	
			if(parentIndexes.length==0) {
				column = nodes.length;
				node.style = VLINE_STYLES[column%VLINE_STYLES.length];
				nodes.push(node);
				lines = lines.concat( g.drawState(nodes,column,this.buildNodeText(node,this.options.showSource)) );
			} else {
				column = parentIndexes.shift();
				lines = lines.concat(g.drawMergeEdges(parentIndexes,column,nodes));
				node.style = nodes[column].style;
				nodes[column] = node;
				nodes = nodes.filter(function(e,i) {return (parentIndexes.indexOf(i)<0);});
				lines = lines.concat( g.drawState(nodes,column,this.buildNodeText(node,this.options.showSource),list.length==0) );			
			}
	
			if(!this.options.showSource&&0<list.length) {
				lines = lines.concat( g.drawState(nodes) );
			}
		}
	
		return lines;
	
	};
	
	var _treeToList = function(tree) {
		var buf = [];
		var i,j;
		if(tree) {
			buf.push(tree);
			for(i=0;i<tree.children.length;i++) {
				var subs = _treeToList(tree.children[i]);
				for(j=0;j<subs.length;j++) {
					buf.push(subs[j]);
				}
			}	
		}
		return buf;
	};
	
	Tracer.prototype.getParseTreeString = function() {
		var lines = [];
		var tree = this.getParseTree();
		var list = _treeToList(tree);
		if(list.length==0) {
			return "No trace found. Make sure you use `pegjs --trace` to build your parser javascript.";
		}
		list.shift();
		lines = this.buildNodeGraph(list);
		return lines.join('\n');
	};
	
	Tracer.prototype.getBacktraceString = function() {
		var lines = [];
		var tree = this.getParseTree("fail");
		var list = _treeToList(tree);
		if(list.length==0) {
			return "No backtrace found. Make sure you use `pegjs --trace` to build your parser javascript.\n" +
			"Or, the failure might occur in the start node.";
		}
		list.shift();
		lines = this.buildNodeGraph(list);
		return lines.join('\n');
	};
	
	module.exports = Tracer;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var TextUtil = __webpack_require__(42);
	
	var defaultOptions = {
		useColor:true,
		highlightStyle:{color:'cyan'},
	};
	
	var _applyDefault = function(opt,def) {
		var ret = {};
		for(var key in def) {
			ret[key] = (opt&&opt[key]!==undefined)?opt[key]:def[key];
		}
		return ret;
	};
	
	var TextQuoter = function(source,opt) {
		this.options = _applyDefault(opt,defaultOptions);
		if(source==null) {
			throw new Error("Missing source argument.");
		}
		if(/[\r\v\f]/.test(source)) {
			throw new Error("Found an unsupported new line code. The new line code must be '\n'.");
		}
		this.sourceLines = source.replace(/\t/g,' ').split('\n');
	};
	
	TextQuoter.prototype.setTextStyle = function(str,style,start,end) {
		if(this.options.useColor) {
			return TextUtil.setTextStyle(str,style,start,end);
		} else {
			return str;
		}
	};
	
	TextQuoter.prototype.drawHLine = function(start,length,ch) {
		return this.setTextStyle(TextUtil.makeLine(start,length,ch),this.options.highlightStyle);q
	};
	
	TextQuoter.prototype.getQuotedLines = function(quoteString,startLine,startColumn,endLine,endColumn,maxLines) {
	
		maxLines = (!maxLines||maxLines<3)?3:maxLines;
	
		var numLines = (endLine - startLine) + 1;
		var numSkipLines = numLines - maxLines;
		var numHeadLines = Math.ceil((numLines - numSkipLines)/2); 
		var numTailLines = Math.floor((numLines - numSkipLines)/2);
	
		var i;
		var lines = [];
		for(i=startLine;i<=endLine;i++) {
			lines.push(this.sourceLines[i]);
		}
	
		var style = this.options.highlightStyle;
		if(startLine == endLine) {
			if(startColumn<endColumn) {
				lines[0] = this.setTextStyle(lines[0],style,startColumn,endColumn);
			}
		} else {
			lines[0] = this.setTextStyle(lines[0],style,startColumn);
			for(i=1;i<lines.length-1;i++) {
				lines[i] = this.setTextStyle(lines[i],style);
			}
			lines[lines.length-1] = this.setTextStyle(lines[lines.length-1],style,0,endColumn+1);
		}
	
		if(0 < numSkipLines) {
			lines = lines.slice(0,numHeadLines).concat(['...']).concat(lines.slice(lines.length-numTailLines));
		}
	
		if(startLine==endLine&&startColumn<=endColumn) {
			lines.push(this.drawHLine(startColumn, (endColumn-startColumn)||1, '^'));
		} else if(startLine<endLine) {
			lines.unshift(this.drawHLine(startColumn,(lines[0].length-startColumn),'_'));
			lines.push(this.drawHLine(0,endColumn,'^'));
		}
		var self = this;
		lines = lines.map(function(e){return quoteString + e;});
		return lines;
	};
	
	TextQuoter.prototype.getQuotedText = function(quoteString,startLine,startColumn,endLine,endColumn,maxLines) {
		return this.getQuotedLines(quoteString,startLine,startColumn,endLine,endColumn,maxLines).join('\n');
	};
	
	module.exports = TextQuoter;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays  = __webpack_require__(3),
	    objects = __webpack_require__(31);
	
	var compiler = {
	  /*
	   * Compiler passes.
	   *
	   * Each pass is a function that is passed the AST. It can perform checks on it
	   * or modify it as needed. If the pass encounters a semantic error, it throws
	   * |PEG.GrammarError|.
	   */
	  passes: {
	    check: {
	      reportMissingRules:  __webpack_require__(102),
	      reportLeftRecursion: __webpack_require__(101),
	      reportInfiniteLoops: __webpack_require__(100)
	    },
	    transform: {
	      removeProxyRules:    __webpack_require__(99)
	    },
	    generate: {
	      generateBytecode:    __webpack_require__(97),
	      generateJavascript:  __webpack_require__(98)
	    }
	  },
	
	  /*
	   * Generates a parser from a specified grammar AST. Throws |PEG.GrammarError|
	   * if the AST contains a semantic error. Note that not all errors are detected
	   * during the generation and some may protrude to the generated parser and
	   * cause its malfunction.
	   */
	  compile: function(ast, passes) {
	    var options = arguments.length > 2 ? objects.clone(arguments[2]) : {},
	        stage;
	
	    objects.defaults(options, {
	      allowedStartRules:  [ast.rules[0].name],
	      cache:              false,
	      trace:              false,
	      optimize:           "speed",
	      output:             "parser"
	    });
	
	    for (stage in passes) {
	      if (passes.hasOwnProperty(stage)) {
	        arrays.each(passes[stage], function(p) { p(ast, options); });
	      }
	    }
	
	    switch (options.output) {
	      case "parser": return eval(ast.code);
	      case "source": return ast.code;
	    }
	  }
	};
	
	module.exports = compiler;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays  = __webpack_require__(3),
	    objects = __webpack_require__(31),
	    asts    = __webpack_require__(22),
	    visitor = __webpack_require__(10),
	    op      = __webpack_require__(71),
	    js      = __webpack_require__(70);
	
	/* Generates bytecode.
	 *
	 * Instructions
	 * ============
	 *
	 * Stack Manipulation
	 * ------------------
	 *
	 *  [0] PUSH c
	 *
	 *        stack.push(consts[c]);
	 *
	 *  [1] PUSH_UNDEFINED
	 *
	 *        stack.push(undefined);
	 *
	 *  [2] PUSH_NULL
	 *
	 *        stack.push(null);
	 *
	 *  [3] PUSH_FAILED
	 *
	 *        stack.push(FAILED);
	 *
	 *  [4] PUSH_EMPTY_ARRAY
	 *
	 *        stack.push([]);
	 *
	 *  [5] PUSH_CURR_POS
	 *
	 *        stack.push(currPos);
	 *
	 *  [6] POP
	 *
	 *        stack.pop();
	 *
	 *  [7] POP_CURR_POS
	 *
	 *        currPos = stack.pop();
	 *
	 *  [8] POP_N n
	 *
	 *        stack.pop(n);
	 *
	 *  [9] NIP
	 *
	 *        value = stack.pop();
	 *        stack.pop();
	 *        stack.push(value);
	 *
	 * [10] APPEND
	 *
	 *        value = stack.pop();
	 *        array = stack.pop();
	 *        array.push(value);
	 *        stack.push(array);
	 *
	 * [11] WRAP n
	 *
	 *        stack.push(stack.pop(n));
	 *
	 * [12] TEXT
	 *
	 *        stack.push(input.substring(stack.pop(), currPos));
	 *
	 * Conditions and Loops
	 * --------------------
	 *
	 * [13] IF t, f
	 *
	 *        if (stack.top()) {
	 *          interpret(ip + 3, ip + 3 + t);
	 *        } else {
	 *          interpret(ip + 3 + t, ip + 3 + t + f);
	 *        }
	 *
	 * [14] IF_ERROR t, f
	 *
	 *        if (stack.top() === FAILED) {
	 *          interpret(ip + 3, ip + 3 + t);
	 *        } else {
	 *          interpret(ip + 3 + t, ip + 3 + t + f);
	 *        }
	 *
	 * [15] IF_NOT_ERROR t, f
	 *
	 *        if (stack.top() !== FAILED) {
	 *          interpret(ip + 3, ip + 3 + t);
	 *        } else {
	 *          interpret(ip + 3 + t, ip + 3 + t + f);
	 *        }
	 *
	 * [16] WHILE_NOT_ERROR b
	 *
	 *        while(stack.top() !== FAILED) {
	 *          interpret(ip + 2, ip + 2 + b);
	 *        }
	 *
	 * Matching
	 * --------
	 *
	 * [17] MATCH_ANY a, f, ...
	 *
	 *        if (input.length > currPos) {
	 *          interpret(ip + 3, ip + 3 + a);
	 *        } else {
	 *          interpret(ip + 3 + a, ip + 3 + a + f);
	 *        }
	 *
	 * [18] MATCH_STRING s, a, f, ...
	 *
	 *        if (input.substr(currPos, consts[s].length) === consts[s]) {
	 *          interpret(ip + 4, ip + 4 + a);
	 *        } else {
	 *          interpret(ip + 4 + a, ip + 4 + a + f);
	 *        }
	 *
	 * [19] MATCH_STRING_IC s, a, f, ...
	 *
	 *        if (input.substr(currPos, consts[s].length).toLowerCase() === consts[s]) {
	 *          interpret(ip + 4, ip + 4 + a);
	 *        } else {
	 *          interpret(ip + 4 + a, ip + 4 + a + f);
	 *        }
	 *
	 * [20] MATCH_REGEXP r, a, f, ...
	 *
	 *        if (consts[r].test(input.charAt(currPos))) {
	 *          interpret(ip + 4, ip + 4 + a);
	 *        } else {
	 *          interpret(ip + 4 + a, ip + 4 + a + f);
	 *        }
	 *
	 * [21] ACCEPT_N n
	 *
	 *        stack.push(input.substring(currPos, n));
	 *        currPos += n;
	 *
	 * [22] ACCEPT_STRING s
	 *
	 *        stack.push(consts[s]);
	 *        currPos += consts[s].length;
	 *
	 * [23] FAIL e
	 *
	 *        stack.push(FAILED);
	 *        fail(consts[e]);
	 *
	 * Calls
	 * -----
	 *
	 * [24] LOAD_SAVED_POS p
	 *
	 *        savedPos = stack[p];
	 *
	 * [25] UPDATE_SAVED_POS
	 *
	 *        savedPos = currPos;
	 *
	 * [26] CALL f, n, pc, p1, p2, ..., pN
	 *
	 *        value = consts[f](stack[p1], ..., stack[pN]);
	 *        stack.pop(n);
	 *        stack.push(value);
	 *
	 * Rules
	 * -----
	 *
	 * [27] RULE r
	 *
	 *        stack.push(parseRule(r));
	 *
	 * Failure Reporting
	 * -----------------
	 *
	 * [28] SILENT_FAILS_ON
	 *
	 *        silentFails++;
	 *
	 * [29] SILENT_FAILS_OFF
	 *
	 *        silentFails--;
	 */
	function generateBytecode(ast) {
	  var consts = [];
	
	  function addConst(value) {
	    var index = arrays.indexOf(consts, value);
	
	    return index === -1 ? consts.push(value) - 1 : index;
	  }
	
	  function addFunctionConst(params, code) {
	    return addConst(
	      "function(" + params.join(", ") + ") {" + code + "}"
	    );
	  }
	
	  function buildSequence() {
	    return Array.prototype.concat.apply([], arguments);
	  }
	
	  function buildCondition(condCode, thenCode, elseCode) {
	    return condCode.concat(
	      [thenCode.length, elseCode.length],
	      thenCode,
	      elseCode
	    );
	  }
	
	  function buildLoop(condCode, bodyCode) {
	    return condCode.concat([bodyCode.length], bodyCode);
	  }
	
	  function buildCall(functionIndex, delta, env, sp) {
	    var params = arrays.map(objects.values(env), function(p) { return sp - p; });
	
	    return [op.CALL, functionIndex, delta, params.length].concat(params);
	  }
	
	  function buildSimplePredicate(expression, negative, context) {
	    return buildSequence(
	      [op.PUSH_CURR_POS],
	      [op.SILENT_FAILS_ON],
	      generate(expression, {
	        sp:     context.sp + 1,
	        env:    objects.clone(context.env),
	        action: null
	      }),
	      [op.SILENT_FAILS_OFF],
	      buildCondition(
	        [negative ? op.IF_ERROR : op.IF_NOT_ERROR],
	        buildSequence(
	          [op.POP],
	          [negative ? op.POP : op.POP_CURR_POS],
	          [op.PUSH_UNDEFINED]
	        ),
	        buildSequence(
	          [op.POP],
	          [negative ? op.POP_CURR_POS : op.POP],
	          [op.PUSH_FAILED]
	        )
	      )
	    );
	  }
	
	  function buildSemanticPredicate(code, negative, context) {
	    var functionIndex = addFunctionConst(objects.keys(context.env), code);
	
	    return buildSequence(
	      [op.UPDATE_SAVED_POS],
	      buildCall(functionIndex, 0, context.env, context.sp),
	      buildCondition(
	        [op.IF],
	        buildSequence(
	          [op.POP],
	          negative ? [op.PUSH_FAILED] : [op.PUSH_UNDEFINED]
	        ),
	        buildSequence(
	          [op.POP],
	          negative ? [op.PUSH_UNDEFINED] : [op.PUSH_FAILED]
	        )
	      )
	    );
	  }
	
	  function buildAppendLoop(expressionCode) {
	    return buildLoop(
	      [op.WHILE_NOT_ERROR],
	      buildSequence([op.APPEND], expressionCode)
	    );
	  }
	
	  var generate = visitor.build({
	    grammar: function(node) {
	      arrays.each(node.rules, generate);
	
	      node.consts = consts;
	    },
	
	    rule: function(node) {
	      node.bytecode = generate(node.expression, {
	        sp:     -1,    // stack pointer
	        env:    { },   // mapping of label names to stack positions
	        action: null   // action nodes pass themselves to children here
	      });
	    },
	
	    named: function(node, context) {
	      var nameIndex = addConst(
	        '{ type: "other", description: "' + js.stringEscape(node.name) + '" }'
	      );
	
	      /*
	       * The code generated below is slightly suboptimal because |FAIL| pushes
	       * to the stack, so we need to stick a |POP| in front of it. We lack a
	       * dedicated instruction that would just report the failure and not touch
	       * the stack.
	       */
	      return buildSequence(
	        [op.SILENT_FAILS_ON],
	        generate(node.expression, context),
	        [op.SILENT_FAILS_OFF],
	        buildCondition([op.IF_ERROR], [op.FAIL, nameIndex], [])
	      );
	    },
	
	    choice: function(node, context) {
	      function buildAlternativesCode(alternatives, context) {
	        return buildSequence(
	          generate(alternatives[0], {
	            sp:     context.sp,
	            env:    objects.clone(context.env),
	            action: null
	          }),
	          alternatives.length > 1
	            ? buildCondition(
	                [op.IF_ERROR],
	                buildSequence(
	                  [op.POP],
	                  buildAlternativesCode(alternatives.slice(1), context)
	                ),
	                []
	              )
	            : []
	        );
	      }
	
	      return buildAlternativesCode(node.alternatives, context);
	    },
	
	    action: function(node, context) {
	      var env            = objects.clone(context.env),
	          emitCall       = node.expression.type !== "sequence"
	                        || node.expression.elements.length === 0,
	          expressionCode = generate(node.expression, {
	            sp:     context.sp + (emitCall ? 1 : 0),
	            env:    env,
	            action: node
	          }),
	          functionIndex  = addFunctionConst(objects.keys(env), node.code);
	
	      return emitCall
	        ? buildSequence(
	            [op.PUSH_CURR_POS],
	            expressionCode,
	            buildCondition(
	              [op.IF_NOT_ERROR],
	              buildSequence(
	                [op.LOAD_SAVED_POS, 1],
	                buildCall(functionIndex, 1, env, context.sp + 2)
	              ),
	              []
	            ),
	            [op.NIP]
	          )
	        : expressionCode;
	    },
	
	    sequence: function(node, context) {
	      function buildElementsCode(elements, context) {
	        var processedCount, functionIndex;
	
	        if (elements.length > 0) {
	          processedCount = node.elements.length - elements.slice(1).length;
	
	          return buildSequence(
	            generate(elements[0], {
	              sp:     context.sp,
	              env:    context.env,
	              action: null
	            }),
	            buildCondition(
	              [op.IF_NOT_ERROR],
	              buildElementsCode(elements.slice(1), {
	                sp:     context.sp + 1,
	                env:    context.env,
	                action: context.action
	              }),
	              buildSequence(
	                processedCount > 1 ? [op.POP_N, processedCount] : [op.POP],
	                [op.POP_CURR_POS],
	                [op.PUSH_FAILED]
	              )
	            )
	          );
	        } else {
	          if (context.action) {
	            functionIndex = addFunctionConst(
	              objects.keys(context.env),
	              context.action.code
	            );
	
	            return buildSequence(
	              [op.LOAD_SAVED_POS, node.elements.length],
	              buildCall(
	                functionIndex,
	                node.elements.length,
	                context.env,
	                context.sp
	              ),
	              [op.NIP]
	            );
	          } else {
	            return buildSequence([op.WRAP, node.elements.length], [op.NIP]);
	          }
	        }
	      }
	
	      return buildSequence(
	        [op.PUSH_CURR_POS],
	        buildElementsCode(node.elements, {
	          sp:     context.sp + 1,
	          env:    context.env,
	          action: context.action
	        })
	      );
	    },
	
	    labeled: function(node, context) {
	      var env = objects.clone(context.env);
	
	      context.env[node.label] = context.sp + 1;
	
	      return generate(node.expression, {
	        sp:     context.sp,
	        env:    env,
	        action: null
	      });
	    },
	
	    text: function(node, context) {
	      return buildSequence(
	        [op.PUSH_CURR_POS],
	        generate(node.expression, {
	          sp:     context.sp + 1,
	          env:    objects.clone(context.env),
	          action: null
	        }),
	        buildCondition(
	          [op.IF_NOT_ERROR],
	          buildSequence([op.POP], [op.TEXT]),
	          [op.NIP]
	        )
	      );
	    },
	
	    simple_and: function(node, context) {
	      return buildSimplePredicate(node.expression, false, context);
	    },
	
	    simple_not: function(node, context) {
	      return buildSimplePredicate(node.expression, true, context);
	    },
	
	    optional: function(node, context) {
	      return buildSequence(
	        generate(node.expression, {
	          sp:     context.sp,
	          env:    objects.clone(context.env),
	          action: null
	        }),
	        buildCondition(
	          [op.IF_ERROR],
	          buildSequence([op.POP], [op.PUSH_NULL]),
	          []
	        )
	      );
	    },
	
	    zero_or_more: function(node, context) {
	      var expressionCode = generate(node.expression, {
	            sp:     context.sp + 1,
	            env:    objects.clone(context.env),
	            action: null
	          });
	
	      return buildSequence(
	        [op.PUSH_EMPTY_ARRAY],
	        expressionCode,
	        buildAppendLoop(expressionCode),
	        [op.POP]
	      );
	    },
	
	    one_or_more: function(node, context) {
	      var expressionCode = generate(node.expression, {
	            sp:     context.sp + 1,
	            env:    objects.clone(context.env),
	            action: null
	          });
	
	      return buildSequence(
	        [op.PUSH_EMPTY_ARRAY],
	        expressionCode,
	        buildCondition(
	          [op.IF_NOT_ERROR],
	          buildSequence(buildAppendLoop(expressionCode), [op.POP]),
	          buildSequence([op.POP], [op.POP], [op.PUSH_FAILED])
	        )
	      );
	    },
	
	    semantic_and: function(node, context) {
	      return buildSemanticPredicate(node.code, false, context);
	    },
	
	    semantic_not: function(node, context) {
	      return buildSemanticPredicate(node.code, true, context);
	    },
	
	    rule_ref: function(node) {
	      return [op.RULE, asts.indexOfRule(ast, node.name)];
	    },
	
	    literal: function(node) {
	      var stringIndex, expectedIndex;
	
	      if (node.value.length > 0) {
	        stringIndex = addConst('"'
	          + js.stringEscape(
	              node.ignoreCase ? node.value.toLowerCase() : node.value
	            )
	          + '"'
	        );
	        expectedIndex = addConst([
	          '{',
	          'type: "literal",',
	          'value: "' + js.stringEscape(node.value) + '",',
	          'description: "'
	             + js.stringEscape('"' + js.stringEscape(node.value) + '"')
	             + '"',
	          '}'
	        ].join(' '));
	
	        /*
	         * For case-sensitive strings the value must match the beginning of the
	         * remaining input exactly. As a result, we can use |ACCEPT_STRING| and
	         * save one |substr| call that would be needed if we used |ACCEPT_N|.
	         */
	        return buildCondition(
	          node.ignoreCase
	            ? [op.MATCH_STRING_IC, stringIndex]
	            : [op.MATCH_STRING, stringIndex],
	          node.ignoreCase
	            ? [op.ACCEPT_N, node.value.length]
	            : [op.ACCEPT_STRING, stringIndex],
	          [op.FAIL, expectedIndex]
	        );
	      } else {
	        stringIndex = addConst('""');
	
	        return [op.PUSH, stringIndex];
	      }
	    },
	
	    "class": function(node) {
	      var regexp, regexpIndex, expectedIndex;
	
	      if (node.parts.length > 0) {
	        regexp = '/^['
	          + (node.inverted ? '^' : '')
	          + arrays.map(node.parts, function(part) {
	              return part instanceof Array
	                ? js.regexpClassEscape(part[0])
	                  + '-'
	                  + js.regexpClassEscape(part[1])
	                : js.regexpClassEscape(part);
	            }).join('')
	          + ']/' + (node.ignoreCase ? 'i' : '');
	      } else {
	        /*
	         * IE considers regexps /[]/ and /[^]/ as syntactically invalid, so we
	         * translate them into euqivalents it can handle.
	         */
	        regexp = node.inverted ? '/^[\\S\\s]/' : '/^(?!)/';
	      }
	
	      regexpIndex   = addConst(regexp);
	      expectedIndex = addConst([
	        '{',
	        'type: "class",',
	        'value: "' + js.stringEscape(node.rawText) + '",',
	        'description: "' + js.stringEscape(node.rawText) + '"',
	        '}'
	      ].join(' '));
	
	      return buildCondition(
	        [op.MATCH_REGEXP, regexpIndex],
	        [op.ACCEPT_N, 1],
	        [op.FAIL, expectedIndex]
	      );
	    },
	
	    any: function() {
	      var expectedIndex = addConst('{ type: "any", description: "any character" }');
	
	      return buildCondition(
	        [op.MATCH_ANY],
	        [op.ACCEPT_N, 1],
	        [op.FAIL, expectedIndex]
	      );
	    }
	  });
	
	  generate(ast);
	}
	
	module.exports = generateBytecode;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays = __webpack_require__(3),
	    asts   = __webpack_require__(22),
	    op     = __webpack_require__(71),
	    js     = __webpack_require__(70);
	
	/* Generates parser JavaScript code. */
	function generateJavascript(ast, options) {
	  /* These only indent non-empty lines to avoid trailing whitespace. */
	  function indent2(code)  { return code.replace(/^(.+)$/gm, '  $1');         }
	  function indent4(code)  { return code.replace(/^(.+)$/gm, '    $1');       }
	  function indent8(code)  { return code.replace(/^(.+)$/gm, '        $1');   }
	  function indent10(code) { return code.replace(/^(.+)$/gm, '          $1'); }
	
	  function generateTables() {
	    if (options.optimize === "size") {
	      return [
	        'peg$consts = [',
	           indent2(ast.consts.join(',\n')),
	        '],',
	        '',
	        'peg$bytecode = [',
	           indent2(arrays.map(ast.rules, function(rule) {
	             return 'peg$decode("'
	                   + js.stringEscape(arrays.map(
	                       rule.bytecode,
	                       function(b) { return String.fromCharCode(b + 32); }
	                     ).join(''))
	                   + '")';
	           }).join(',\n')),
	        '],'
	      ].join('\n');
	    } else {
	      return arrays.map(
	        ast.consts,
	        function(c, i) { return 'peg$c' + i + ' = ' + c + ','; }
	      ).join('\n');
	    }
	  }
	
	  function generateRuleHeader(ruleNameCode, ruleIndexCode) {
	    var parts = [];
	
	    parts.push('');
	
	    if (options.trace) {
	      parts.push([
	        'peg$tracer.trace({',
	        '  type:     "rule.enter",',
	        '  rule:     ' + ruleNameCode + ',',
	        '  location: peg$computeLocation(startPos, startPos)',
	        '});',
	        ''
	      ].join('\n'));
	    }
	
	    if (options.cache) {
	      parts.push([
	        'var key    = peg$currPos * ' + ast.rules.length + ' + ' + ruleIndexCode + ',',
	        '    cached = peg$resultsCache[key];',
	        '',
	        'if (cached) {',
	        '  peg$currPos = cached.nextPos;',
	        '',
	      ].join('\n'));
	
	      if (options.trace) {
	        parts.push([
	          'if (cached.result !== peg$FAILED) {',
	          '  peg$tracer.trace({',
	          '    type:   "rule.match",',
	          '    rule:   ' + ruleNameCode + ',',
	          '    result: cached.result,',
	          '    location: peg$computeLocation(startPos, peg$currPos)',
	          '  });',
	          '} else {',
	          '  peg$tracer.trace({',
	          '    type: "rule.fail",',
	          '    rule: ' + ruleNameCode + ',',
	          '    location: peg$computeLocation(startPos, startPos)',
	          '  });',
	          '}',
	          ''
	        ].join('\n'));
	      }
	
	      parts.push([
	        '  return cached.result;',
	        '}',
	        ''
	      ].join('\n'));
	    }
	
	    return parts.join('\n');
	  }
	
	  function generateRuleFooter(ruleNameCode, resultCode) {
	    var parts = [];
	
	    if (options.cache) {
	      parts.push([
	        '',
	        'peg$resultsCache[key] = { nextPos: peg$currPos, result: ' + resultCode + ' };'
	      ].join('\n'));
	    }
	
	    if (options.trace) {
	      parts.push([
	          '',
	          'if (' + resultCode + ' !== peg$FAILED) {',
	          '  peg$tracer.trace({',
	          '    type:   "rule.match",',
	          '    rule:   ' + ruleNameCode + ',',
	          '    result: ' + resultCode + ',',
	          '    location: peg$computeLocation(startPos, peg$currPos)',
	          '  });',
	          '} else {',
	          '  peg$tracer.trace({',
	          '    type: "rule.fail",',
	          '    rule: ' + ruleNameCode + ',',
	          '    location: peg$computeLocation(startPos, startPos)',
	          '  });',
	          '}'
	      ].join('\n'));
	    }
	
	    parts.push([
	      '',
	      'return ' + resultCode + ';'
	    ].join('\n'));
	
	    return parts.join('\n');
	  }
	
	  function generateInterpreter() {
	    var parts = [];
	
	    function generateCondition(cond, argsLength) {
	      var baseLength      = argsLength + 3,
	          thenLengthCode = 'bc[ip + ' + (baseLength - 2) + ']',
	          elseLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';
	
	      return [
	        'ends.push(end);',
	        'ips.push(ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ');',
	        '',
	        'if (' + cond + ') {',
	        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ';',
	        '  ip += ' + baseLength + ';',
	        '} else {',
	        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ';',
	        '  ip += ' + baseLength + ' + ' + thenLengthCode + ';',
	        '}',
	        '',
	        'break;'
	      ].join('\n');
	    }
	
	    function generateLoop(cond) {
	      var baseLength     = 2,
	          bodyLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';
	
	      return [
	        'if (' + cond + ') {',
	        '  ends.push(end);',
	        '  ips.push(ip);',
	        '',
	        '  end = ip + ' + baseLength + ' + ' + bodyLengthCode + ';',
	        '  ip += ' + baseLength + ';',
	        '} else {',
	        '  ip += ' + baseLength + ' + ' + bodyLengthCode + ';',
	        '}',
	        '',
	        'break;'
	      ].join('\n');
	    }
	
	    function generateCall() {
	      var baseLength       = 4,
	          paramsLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';
	
	      return [
	        'params = bc.slice(ip + ' + baseLength + ', ip + ' + baseLength + ' + ' + paramsLengthCode + ');',
	        'for (i = 0; i < ' + paramsLengthCode + '; i++) {',
	        '  params[i] = stack[stack.length - 1 - params[i]];',
	        '}',
	        '',
	        'stack.splice(',
	        '  stack.length - bc[ip + 2],',
	        '  bc[ip + 2],',
	        '  peg$consts[bc[ip + 1]].apply(null, params)',
	        ');',
	        '',
	        'ip += ' + baseLength + ' + ' + paramsLengthCode + ';',
	        'break;'
	      ].join('\n');
	    }
	
	    parts.push([
	      'function peg$decode(s) {',
	      '  var bc = new Array(s.length), i;',
	      '',
	      '  for (i = 0; i < s.length; i++) {',
	      '    bc[i] = s.charCodeAt(i) - 32;',
	      '  }',
	      '',
	      '  return bc;',
	      '}',
	      '',
	      'function peg$parseRule(index) {',
	    ].join('\n'));
	
	    if (options.trace) {
	      parts.push([
	        '  var bc       = peg$bytecode[index],',
	        '      ip       = 0,',
	        '      ips      = [],',
	        '      end      = bc.length,',
	        '      ends     = [],',
	        '      stack    = [],',
	        '      startPos = peg$currPos,',
	        '      params, i;',
	      ].join('\n'));
	    } else {
	      parts.push([
	        '  var bc    = peg$bytecode[index],',
	        '      ip    = 0,',
	        '      ips   = [],',
	        '      end   = bc.length,',
	        '      ends  = [],',
	        '      stack = [],',
	        '      params, i;',
	      ].join('\n'));
	    }
	
	    parts.push(indent2(generateRuleHeader('peg$ruleNames[index]', 'index')));
	
	    parts.push([
	      /*
	       * The point of the outer loop and the |ips| & |ends| stacks is to avoid
	       * recursive calls for interpreting parts of bytecode. In other words, we
	       * implement the |interpret| operation of the abstract machine without
	       * function calls. Such calls would likely slow the parser down and more
	       * importantly cause stack overflows for complex grammars.
	       */
	      '  while (true) {',
	      '    while (ip < end) {',
	      '      switch (bc[ip]) {',
	      '        case ' + op.PUSH + ':',               // PUSH c
	      '          stack.push(peg$consts[bc[ip + 1]]);',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.PUSH_UNDEFINED + ':',     // PUSH_UNDEFINED
	      '          stack.push(void 0);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.PUSH_NULL + ':',          // PUSH_NULL
	      '          stack.push(null);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.PUSH_FAILED + ':',        // PUSH_FAILED
	      '          stack.push(peg$FAILED);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.PUSH_EMPTY_ARRAY + ':',   // PUSH_EMPTY_ARRAY
	      '          stack.push([]);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.PUSH_CURR_POS + ':',      // PUSH_CURR_POS
	      '          stack.push(peg$currPos);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.POP + ':',                // POP
	      '          stack.pop();',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.POP_CURR_POS + ':',       // POP_CURR_POS
	      '          peg$currPos = stack.pop();',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.POP_N + ':',              // POP_N n
	      '          stack.length -= bc[ip + 1];',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.NIP + ':',                // NIP
	      '          stack.splice(-2, 1);',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.APPEND + ':',             // APPEND
	      '          stack[stack.length - 2].push(stack.pop());',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.WRAP + ':',               // WRAP n
	      '          stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.TEXT + ':',               // TEXT
	      '          stack.push(input.substring(stack.pop(), peg$currPos));',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.IF + ':',                 // IF t, f
	                 indent10(generateCondition('stack[stack.length - 1]', 0)),
	      '',
	      '        case ' + op.IF_ERROR + ':',           // IF_ERROR t, f
	                 indent10(generateCondition(
	                   'stack[stack.length - 1] === peg$FAILED',
	                   0
	                 )),
	      '',
	      '        case ' + op.IF_NOT_ERROR + ':',       // IF_NOT_ERROR t, f
	                 indent10(
	                   generateCondition('stack[stack.length - 1] !== peg$FAILED',
	                   0
	                 )),
	      '',
	      '        case ' + op.WHILE_NOT_ERROR + ':',    // WHILE_NOT_ERROR b
	                 indent10(generateLoop('stack[stack.length - 1] !== peg$FAILED')),
	      '',
	      '        case ' + op.MATCH_ANY + ':',          // MATCH_ANY a, f, ...
	                 indent10(generateCondition('input.length > peg$currPos', 0)),
	      '',
	      '        case ' + op.MATCH_STRING + ':',       // MATCH_STRING s, a, f, ...
	                 indent10(generateCondition(
	                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]',
	                   1
	                 )),
	      '',
	      '        case ' + op.MATCH_STRING_IC + ':',    // MATCH_STRING_IC s, a, f, ...
	                 indent10(generateCondition(
	                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]',
	                   1
	                 )),
	      '',
	      '        case ' + op.MATCH_REGEXP + ':',       // MATCH_REGEXP r, a, f, ...
	                 indent10(generateCondition(
	                   'peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))',
	                   1
	                 )),
	      '',
	      '        case ' + op.ACCEPT_N + ':',           // ACCEPT_N n
	      '          stack.push(input.substr(peg$currPos, bc[ip + 1]));',
	      '          peg$currPos += bc[ip + 1];',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.ACCEPT_STRING + ':',      // ACCEPT_STRING s
	      '          stack.push(peg$consts[bc[ip + 1]]);',
	      '          peg$currPos += peg$consts[bc[ip + 1]].length;',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.FAIL + ':',               // FAIL e
	      '          stack.push(peg$FAILED);',
	      '          if (peg$silentFails === 0) {',
	      '            peg$fail(peg$consts[bc[ip + 1]]);',
	      '          }',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.LOAD_SAVED_POS + ':',     // LOAD_SAVED_POS p
	      '          peg$savedPos = stack[stack.length - 1 - bc[ip + 1]];',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.UPDATE_SAVED_POS + ':',   // UPDATE_SAVED_POS
	      '          peg$savedPos = peg$currPos;',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.CALL + ':',               // CALL f, n, pc, p1, p2, ..., pN
	                 indent10(generateCall()),
	      '',
	      '        case ' + op.RULE + ':',               // RULE r
	      '          stack.push(peg$parseRule(bc[ip + 1]));',
	      '          ip += 2;',
	      '          break;',
	      '',
	      '        case ' + op.SILENT_FAILS_ON + ':',    // SILENT_FAILS_ON
	      '          peg$silentFails++;',
	      '          ip++;',
	      '          break;',
	      '',
	      '        case ' + op.SILENT_FAILS_OFF + ':',   // SILENT_FAILS_OFF
	      '          peg$silentFails--;',
	      '          ip++;',
	      '          break;',
	      '',
	      '        default:',
	      '          throw new Error("Invalid opcode: " + bc[ip] + ".");',
	      '      }',
	      '    }',
	      '',
	      '    if (ends.length > 0) {',
	      '      end = ends.pop();',
	      '      ip = ips.pop();',
	      '    } else {',
	      '      break;',
	      '    }',
	      '  }'
	    ].join('\n'));
	
	    parts.push(indent2(generateRuleFooter('peg$ruleNames[index]', 'stack[0]')));
	    parts.push('}');
	
	    return parts.join('\n');
	  }
	
	  function generateRuleFunction(rule) {
	    var parts = [], code;
	
	    function c(i) { return "peg$c" + i; } // |consts[i]| of the abstract machine
	    function s(i) { return "s"     + i; } // |stack[i]| of the abstract machine
	
	    var stack = {
	          sp:    -1,
	          maxSp: -1,
	
	          push: function(exprCode) {
	            var code = s(++this.sp) + ' = ' + exprCode + ';';
	
	            if (this.sp > this.maxSp) { this.maxSp = this.sp; }
	
	            return code;
	          },
	
	          pop: function() {
	            var n, values;
	
	            if (arguments.length === 0) {
	              return s(this.sp--);
	            } else {
	              n = arguments[0];
	              values = arrays.map(arrays.range(this.sp - n + 1, this.sp + 1), s);
	              this.sp -= n;
	
	              return values;
	            }
	          },
	
	          top: function() {
	            return s(this.sp);
	          },
	
	          index: function(i) {
	            return s(this.sp - i);
	          }
	        };
	
	    function compile(bc) {
	      var ip    = 0,
	          end   = bc.length,
	          parts = [],
	          value;
	
	      function compileCondition(cond, argCount) {
	        var baseLength = argCount + 3,
	            thenLength = bc[ip + baseLength - 2],
	            elseLength = bc[ip + baseLength - 1],
	            baseSp     = stack.sp,
	            thenCode, elseCode, thenSp, elseSp;
	
	        ip += baseLength;
	        thenCode = compile(bc.slice(ip, ip + thenLength));
	        thenSp = stack.sp;
	        ip += thenLength;
	
	        if (elseLength > 0) {
	          stack.sp = baseSp;
	          elseCode = compile(bc.slice(ip, ip + elseLength));
	          elseSp = stack.sp;
	          ip += elseLength;
	
	          if (thenSp !== elseSp) {
	            throw new Error(
	              "Branches of a condition must move the stack pointer in the same way."
	            );
	          }
	        }
	
	        parts.push('if (' + cond + ') {');
	        parts.push(indent2(thenCode));
	        if (elseLength > 0) {
	          parts.push('} else {');
	          parts.push(indent2(elseCode));
	        }
	        parts.push('}');
	      }
	
	      function compileLoop(cond) {
	        var baseLength = 2,
	            bodyLength = bc[ip + baseLength - 1],
	            baseSp     = stack.sp,
	            bodyCode, bodySp;
	
	        ip += baseLength;
	        bodyCode = compile(bc.slice(ip, ip + bodyLength));
	        bodySp = stack.sp;
	        ip += bodyLength;
	
	        if (bodySp !== baseSp) {
	          throw new Error("Body of a loop can't move the stack pointer.");
	        }
	
	        parts.push('while (' + cond + ') {');
	        parts.push(indent2(bodyCode));
	        parts.push('}');
	      }
	
	      function compileCall() {
	        var baseLength   = 4,
	            paramsLength = bc[ip + baseLength - 1];
	
	        var value = c(bc[ip + 1]) + '('
	              + arrays.map(
	                  bc.slice(ip + baseLength, ip + baseLength + paramsLength),
	                  function(p) { return stack.index(p); }
	                ).join(', ')
	              + ')';
	        stack.pop(bc[ip + 2]);
	        parts.push(stack.push(value));
	        ip += baseLength + paramsLength;
	      }
	
	      while (ip < end) {
	        switch (bc[ip]) {
	          case op.PUSH:               // PUSH c
	            parts.push(stack.push(c(bc[ip + 1])));
	            ip += 2;
	            break;
	
	          case op.PUSH_CURR_POS:      // PUSH_CURR_POS
	            parts.push(stack.push('peg$currPos'));
	            ip++;
	            break;
	
	          case op.PUSH_UNDEFINED:      // PUSH_UNDEFINED
	            parts.push(stack.push('void 0'));
	            ip++;
	            break;
	
	          case op.PUSH_NULL:          // PUSH_NULL
	            parts.push(stack.push('null'));
	            ip++;
	            break;
	
	          case op.PUSH_FAILED:        // PUSH_FAILED
	            parts.push(stack.push('peg$FAILED'));
	            ip++;
	            break;
	
	          case op.PUSH_EMPTY_ARRAY:   // PUSH_EMPTY_ARRAY
	            parts.push(stack.push('[]'));
	            ip++;
	            break;
	
	          case op.POP:                // POP
	            stack.pop();
	            ip++;
	            break;
	
	          case op.POP_CURR_POS:       // POP_CURR_POS
	            parts.push('peg$currPos = ' + stack.pop() + ';');
	            ip++;
	            break;
	
	          case op.POP_N:              // POP_N n
	            stack.pop(bc[ip + 1]);
	            ip += 2;
	            break;
	
	          case op.NIP:                // NIP
	            value = stack.pop();
	            stack.pop();
	            parts.push(stack.push(value));
	            ip++;
	            break;
	
	          case op.APPEND:             // APPEND
	            value = stack.pop();
	            parts.push(stack.top() + '.push(' + value + ');');
	            ip++;
	            break;
	
	          case op.WRAP:               // WRAP n
	            parts.push(
	              stack.push('[' + stack.pop(bc[ip + 1]).join(', ') + ']')
	            );
	            ip += 2;
	            break;
	
	          case op.TEXT:               // TEXT
	            parts.push(
	              stack.push('input.substring(' + stack.pop() + ', peg$currPos)')
	            );
	            ip++;
	            break;
	
	          case op.IF:                 // IF t, f
	            compileCondition(stack.top(), 0);
	            break;
	
	          case op.IF_ERROR:           // IF_ERROR t, f
	            compileCondition(stack.top() + ' === peg$FAILED', 0);
	            break;
	
	          case op.IF_NOT_ERROR:       // IF_NOT_ERROR t, f
	            compileCondition(stack.top() + ' !== peg$FAILED', 0);
	            break;
	
	          case op.WHILE_NOT_ERROR:    // WHILE_NOT_ERROR b
	            compileLoop(stack.top() + ' !== peg$FAILED', 0);
	            break;
	
	          case op.MATCH_ANY:          // MATCH_ANY a, f, ...
	            compileCondition('input.length > peg$currPos', 0);
	            break;
	
	          case op.MATCH_STRING:       // MATCH_STRING s, a, f, ...
	            compileCondition(
	              eval(ast.consts[bc[ip + 1]]).length > 1
	                ? 'input.substr(peg$currPos, '
	                    + eval(ast.consts[bc[ip + 1]]).length
	                    + ') === '
	                    + c(bc[ip + 1])
	                : 'input.charCodeAt(peg$currPos) === '
	                    + eval(ast.consts[bc[ip + 1]]).charCodeAt(0),
	              1
	            );
	            break;
	
	          case op.MATCH_STRING_IC:    // MATCH_STRING_IC s, a, f, ...
	            compileCondition(
	              'input.substr(peg$currPos, '
	                + eval(ast.consts[bc[ip + 1]]).length
	                + ').toLowerCase() === '
	                + c(bc[ip + 1]),
	              1
	            );
	            break;
	
	          case op.MATCH_REGEXP:       // MATCH_REGEXP r, a, f, ...
	            compileCondition(
	              c(bc[ip + 1]) + '.test(input.charAt(peg$currPos))',
	              1
	            );
	            break;
	
	          case op.ACCEPT_N:           // ACCEPT_N n
	            parts.push(stack.push(
	              bc[ip + 1] > 1
	                ? 'input.substr(peg$currPos, ' + bc[ip + 1] + ')'
	                : 'input.charAt(peg$currPos)'
	            ));
	            parts.push(
	              bc[ip + 1] > 1
	                ? 'peg$currPos += ' + bc[ip + 1] + ';'
	                : 'peg$currPos++;'
	            );
	            ip += 2;
	            break;
	
	          case op.ACCEPT_STRING:      // ACCEPT_STRING s
	            parts.push(stack.push(c(bc[ip + 1])));
	            parts.push(
	              eval(ast.consts[bc[ip + 1]]).length > 1
	                ? 'peg$currPos += ' + eval(ast.consts[bc[ip + 1]]).length + ';'
	                : 'peg$currPos++;'
	            );
	            ip += 2;
	            break;
	
	          case op.FAIL:               // FAIL e
	            parts.push(stack.push('peg$FAILED'));
	            parts.push('if (peg$silentFails === 0) { peg$fail(' + c(bc[ip + 1]) + '); }');
	            ip += 2;
	            break;
	
	          case op.LOAD_SAVED_POS:     // LOAD_SAVED_POS p
	            parts.push('peg$savedPos = ' + stack.index(bc[ip + 1]) + ';');
	            ip += 2;
	            break;
	
	          case op.UPDATE_SAVED_POS:   // UPDATE_SAVED_POS
	            parts.push('peg$savedPos = peg$currPos;');
	            ip++;
	            break;
	
	          case op.CALL:               // CALL f, n, pc, p1, p2, ..., pN
	            compileCall();
	            break;
	
	          case op.RULE:               // RULE r
	            parts.push(stack.push("peg$parse" + ast.rules[bc[ip + 1]].name + "()"));
	            ip += 2;
	            break;
	
	          case op.SILENT_FAILS_ON:    // SILENT_FAILS_ON
	            parts.push('peg$silentFails++;');
	            ip++;
	            break;
	
	          case op.SILENT_FAILS_OFF:   // SILENT_FAILS_OFF
	            parts.push('peg$silentFails--;');
	            ip++;
	            break;
	
	          default:
	            throw new Error("Invalid opcode: " + bc[ip] + ".");
	        }
	      }
	
	      return parts.join('\n');
	    }
	
	    code = compile(rule.bytecode);
	
	    parts.push('function peg$parse' + rule.name + '() {');
	
	    if (options.trace) {
	      parts.push([
	        '  var ' + arrays.map(arrays.range(0, stack.maxSp + 1), s).join(', ') + ',',
	        '      startPos = peg$currPos;'
	      ].join('\n'));
	    } else {
	      parts.push(
	        '  var ' + arrays.map(arrays.range(0, stack.maxSp + 1), s).join(', ') + ';'
	      );
	    }
	
	    parts.push(indent2(generateRuleHeader(
	      '"' + js.stringEscape(rule.name) + '"',
	      asts.indexOfRule(ast, rule.name)
	    )));
	    parts.push(indent2(code));
	    parts.push(indent2(generateRuleFooter(
	      '"' + js.stringEscape(rule.name) + '"',
	      s(0)
	    )));
	
	    parts.push('}');
	
	    return parts.join('\n');
	  }
	
	  var parts = [],
	      startRuleIndices,   startRuleIndex,
	      startRuleFunctions, startRuleFunction,
	      ruleNames;
	
	  parts.push([
	    '(function() {',
	    '  "use strict";',
	    '',
	    '  /*',
	    '   * Generated by PEG.js 0.9.0.',
	    '   *',
	    '   * http://pegjs.org/',
	    '   */',
	    '',
	    '  function peg$subclass(child, parent) {',
	    '    function ctor() { this.constructor = child; }',
	    '    ctor.prototype = parent.prototype;',
	    '    child.prototype = new ctor();',
	    '  }',
	    '',
	    '  function peg$SyntaxError(message, expected, found, location) {',
	    '    this.message  = message;',
	    '    this.expected = expected;',
	    '    this.found    = found;',
	    '    this.location = location;',
	    '    this.name     = "SyntaxError";',
	    '',
	    '    if (typeof Error.captureStackTrace === "function") {',
	    '      Error.captureStackTrace(this, peg$SyntaxError);',
	    '    }',
	    '  }',
	    '',
	    '  peg$subclass(peg$SyntaxError, Error);',
	    ''
	  ].join('\n'));
	
	  if (options.trace) {
	    parts.push([
	      '  function peg$DefaultTracer() {',
	      '    this.indentLevel = 0;',
	      '  }',
	      '',
	      '  peg$DefaultTracer.prototype.trace = function(event) {',
	      '    var that = this;',
	      '',
	      '    function log(event) {',
	      '      function repeat(string, n) {',
	      '         var result = "", i;',
	      '',
	      '         for (i = 0; i < n; i++) {',
	      '           result += string;',
	      '         }',
	      '',
	      '         return result;',
	      '      }',
	      '',
	      '      function pad(string, length) {',
	      '        return string + repeat(" ", length - string.length);',
	      '      }',
	      '',
	      '      if (typeof console === "object") {',   // IE 8-10
	      '        console.log(',
	      '          event.location.start.line + ":" + event.location.start.column + "-"',
	      '            + event.location.end.line + ":" + event.location.end.column + " "',
	      '            + pad(event.type, 10) + " "',
	      '            + repeat("  ", that.indentLevel) + event.rule',
	      '        );',
	      '      }',
	      '    }',
	      '',
	      '    switch (event.type) {',
	      '      case "rule.enter":',
	      '        log(event);',
	      '        this.indentLevel++;',
	      '        break;',
	      '',
	      '      case "rule.match":',
	      '        this.indentLevel--;',
	      '        log(event);',
	      '        break;',
	      '',
	      '      case "rule.fail":',
	      '        this.indentLevel--;',
	      '        log(event);',
	      '        break;',
	      '',
	      '      default:',
	      '        throw new Error("Invalid event type: " + event.type + ".");',
	      '    }',
	      '  };',
	      ''
	    ].join('\n'));
	  }
	
	  parts.push([
	    '  function peg$parse(input) {',
	    '    var options = arguments.length > 1 ? arguments[1] : {},',
	    '        parser  = this,',
	    '',
	    '        peg$FAILED = {},',
	    ''
	  ].join('\n'));
	
	  if (options.optimize === "size") {
	    startRuleIndices = '{ '
	                     + arrays.map(
	                         options.allowedStartRules,
	                         function(r) { return r + ': ' + asts.indexOfRule(ast, r); }
	                       ).join(', ')
	                     + ' }';
	    startRuleIndex = asts.indexOfRule(ast, options.allowedStartRules[0]);
	
	    parts.push([
	      '        peg$startRuleIndices = ' + startRuleIndices + ',',
	      '        peg$startRuleIndex   = ' + startRuleIndex + ','
	    ].join('\n'));
	  } else {
	    startRuleFunctions = '{ '
	                     + arrays.map(
	                         options.allowedStartRules,
	                         function(r) { return r + ': peg$parse' + r; }
	                       ).join(', ')
	                     + ' }';
	    startRuleFunction = 'peg$parse' + options.allowedStartRules[0];
	
	    parts.push([
	      '        peg$startRuleFunctions = ' + startRuleFunctions + ',',
	      '        peg$startRuleFunction  = ' + startRuleFunction + ','
	    ].join('\n'));
	  }
	
	  parts.push('');
	
	  parts.push(indent8(generateTables()));
	
	  parts.push([
	    '',
	    '        peg$currPos          = 0,',
	    '        peg$savedPos         = 0,',
	    '        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],',
	    '        peg$maxFailPos       = 0,',
	    '        peg$maxFailExpected  = [],',
	    '        peg$silentFails      = 0,',   // 0 = report failures, > 0 = silence failures
	    ''
	  ].join('\n'));
	
	  if (options.cache) {
	    parts.push([
	      '        peg$resultsCache = {},',
	      ''
	    ].join('\n'));
	  }
	
	  if (options.trace) {
	    if (options.optimize === "size") {
	      ruleNames = '['
	                + arrays.map(
	                    ast.rules,
	                    function(r) { return '"' + js.stringEscape(r.name) + '"'; }
	                  ).join(', ')
	                + ']';
	
	      parts.push([
	        '        peg$ruleNames = ' + ruleNames + ',',
	        ''
	      ].join('\n'));
	    }
	
	    parts.push([
	      '        peg$tracer = "tracer" in options ? options.tracer : new peg$DefaultTracer(),',
	      ''
	    ].join('\n'));
	  }
	
	  parts.push([
	    '        peg$result;',
	    ''
	  ].join('\n'));
	
	  if (options.optimize === "size") {
	    parts.push([
	      '    if ("startRule" in options) {',
	      '      if (!(options.startRule in peg$startRuleIndices)) {',
	      '        throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
	      '      }',
	      '',
	      '      peg$startRuleIndex = peg$startRuleIndices[options.startRule];',
	      '    }'
	    ].join('\n'));
	  } else {
	    parts.push([
	      '    if ("startRule" in options) {',
	      '      if (!(options.startRule in peg$startRuleFunctions)) {',
	      '        throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
	      '      }',
	      '',
	      '      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];',
	      '    }'
	    ].join('\n'));
	  }
	
	  parts.push([
	    '',
	    '    function text() {',
	    '      return input.substring(peg$savedPos, peg$currPos);',
	    '    }',
	    '',
	    '    function location() {',
	    '      return peg$computeLocation(peg$savedPos, peg$currPos);',
	    '    }',
	    '',
	    '    function expected(description) {',
	    '      throw peg$buildException(',
	    '        null,',
	    '        [{ type: "other", description: description }],',
	    '        input.substring(peg$savedPos, peg$currPos),',
	    '        peg$computeLocation(peg$savedPos, peg$currPos)',
	    '      );',
	    '    }',
	    '',
	    '    function error(message) {',
	    '      throw peg$buildException(',
	    '        message,',
	    '        null,',
	    '        input.substring(peg$savedPos, peg$currPos),',
	    '        peg$computeLocation(peg$savedPos, peg$currPos)',
	    '      );',
	    '    }',
	    '',
	    '    function peg$computePosDetails(pos) {',
	    '      var details = peg$posDetailsCache[pos],',
	    '          p, ch;',
	    '',
	    '      if (details) {',
	    '        return details;',
	    '      } else {',
	    '        p = pos - 1;',
	    '        while (!peg$posDetailsCache[p]) {',
	    '          p--;',
	    '        }',
	    '',
	    '        details = peg$posDetailsCache[p];',
	    '        details = {',
	    '          line:   details.line,',
	    '          column: details.column,',
	    '          seenCR: details.seenCR',
	    '        };',
	    '',
	    '        while (p < pos) {',
	    '          ch = input.charAt(p);',
	    '          if (ch === "\\n") {',
	    '            if (!details.seenCR) { details.line++; }',
	    '            details.column = 1;',
	    '            details.seenCR = false;',
	    '          } else if (ch === "\\r" || ch === "\\u2028" || ch === "\\u2029") {',
	    '            details.line++;',
	    '            details.column = 1;',
	    '            details.seenCR = true;',
	    '          } else {',
	    '            details.column++;',
	    '            details.seenCR = false;',
	    '          }',
	    '',
	    '          p++;',
	    '        }',
	    '',
	    '        peg$posDetailsCache[pos] = details;',
	    '        return details;',
	    '      }',
	    '    }',
	    '',
	    '    function peg$computeLocation(startPos, endPos) {',
	    '      var startPosDetails = peg$computePosDetails(startPos),',
	    '          endPosDetails   = peg$computePosDetails(endPos);',
	    '',
	    '      return {',
	    '        start: {',
	    '          offset: startPos,',
	    '          line:   startPosDetails.line,',
	    '          column: startPosDetails.column',
	    '        },',
	    '        end: {',
	    '          offset: endPos,',
	    '          line:   endPosDetails.line,',
	    '          column: endPosDetails.column',
	    '        }',
	    '      };',
	    '    }',
	    '',
	    '    function peg$fail(expected) {',
	    '      if (peg$currPos < peg$maxFailPos) { return; }',
	    '',
	    '      if (peg$currPos > peg$maxFailPos) {',
	    '        peg$maxFailPos = peg$currPos;',
	    '        peg$maxFailExpected = [];',
	    '      }',
	    '',
	    '      peg$maxFailExpected.push(expected);',
	    '    }',
	    '',
	    '    function peg$buildException(message, expected, found, location) {',
	    '      function cleanupExpected(expected) {',
	    '        var i = 1;',
	    '',
	    '        expected.sort(function(a, b) {',
	    '          if (a.description < b.description) {',
	    '            return -1;',
	    '          } else if (a.description > b.description) {',
	    '            return 1;',
	    '          } else {',
	    '            return 0;',
	    '          }',
	    '        });',
	    '',
	    /*
	     * This works because the bytecode generator guarantees that every
	     * expectation object exists only once, so it's enough to use |===| instead
	     * of deeper structural comparison.
	     */
	    '        while (i < expected.length) {',
	    '          if (expected[i - 1] === expected[i]) {',
	    '            expected.splice(i, 1);',
	    '          } else {',
	    '            i++;',
	    '          }',
	    '        }',
	    '      }',
	    '',
	    '      function buildMessage(expected, found) {',
	    '        function stringEscape(s) {',
	    '          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }',
	    '',
	    /*
	     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
	     * literal except for the closing quote character, backslash, carriage
	     * return, line separator, paragraph separator, and line feed. Any character
	     * may appear in the form of an escape sequence.
	     *
	     * For portability, we also escape all control and non-ASCII characters.
	     * Note that "\0" and "\v" escape sequences are not used because JSHint does
	     * not like the first and IE the second.
	     */
	    '          return s',
	    '            .replace(/\\\\/g,   \'\\\\\\\\\')',   // backslash
	    '            .replace(/"/g,    \'\\\\"\')',        // closing double quote
	    '            .replace(/\\x08/g, \'\\\\b\')',       // backspace
	    '            .replace(/\\t/g,   \'\\\\t\')',       // horizontal tab
	    '            .replace(/\\n/g,   \'\\\\n\')',       // line feed
	    '            .replace(/\\f/g,   \'\\\\f\')',       // form feed
	    '            .replace(/\\r/g,   \'\\\\r\')',       // carriage return
	    '            .replace(/[\\x00-\\x07\\x0B\\x0E\\x0F]/g, function(ch) { return \'\\\\x0\' + hex(ch); })',
	    '            .replace(/[\\x10-\\x1F\\x80-\\xFF]/g,    function(ch) { return \'\\\\x\'  + hex(ch); })',
	    '            .replace(/[\\u0100-\\u0FFF]/g,         function(ch) { return \'\\\\u0\' + hex(ch); })',
	    '            .replace(/[\\u1000-\\uFFFF]/g,         function(ch) { return \'\\\\u\'  + hex(ch); });',
	    '        }',
	    '',
	    '        var expectedDescs = new Array(expected.length),',
	    '            expectedDesc, foundDesc, i;',
	    '',
	    '        for (i = 0; i < expected.length; i++) {',
	    '          expectedDescs[i] = expected[i].description;',
	    '        }',
	    '',
	    '        expectedDesc = expected.length > 1',
	    '          ? expectedDescs.slice(0, -1).join(", ")',
	    '              + " or "',
	    '              + expectedDescs[expected.length - 1]',
	    '          : expectedDescs[0];',
	    '',
	    '        foundDesc = found ? "\\"" + stringEscape(found) + "\\"" : "end of input";',
	    '',
	    '        return "Expected " + expectedDesc + " but " + foundDesc + " found.";',
	    '      }',
	    '',
	    '      if (expected !== null) {',
	    '        cleanupExpected(expected);',
	    '      }',
	    '',
	    '      return new peg$SyntaxError(',
	    '        message !== null ? message : buildMessage(expected, found),',
	    '        expected,',
	    '        found,',
	    '        location',
	    '      );',
	    '    }',
	    ''
	  ].join('\n'));
	
	  if (options.optimize === "size") {
	    parts.push(indent4(generateInterpreter()));
	    parts.push('');
	  } else {
	    arrays.each(ast.rules, function(rule) {
	      parts.push(indent4(generateRuleFunction(rule)));
	      parts.push('');
	    });
	  }
	
	  if (ast.initializer) {
	    parts.push(indent4(ast.initializer.code));
	    parts.push('');
	  }
	
	  if (options.optimize === "size") {
	    parts.push('    peg$result = peg$parseRule(peg$startRuleIndex);');
	  } else {
	    parts.push('    peg$result = peg$startRuleFunction();');
	  }
	
	  parts.push([
	    '',
	    '    if (peg$result !== peg$FAILED && peg$currPos === input.length) {',
	    '      return peg$result;',
	    '    } else {',
	    '      if (peg$result !== peg$FAILED && peg$currPos < input.length) {',
	    '        peg$fail({ type: "end", description: "end of input" });',
	    '      }',
	    '',
	    '      throw peg$buildException(',
	    '        null,',
	    '        peg$maxFailExpected,',
	    '        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,',
	    '        peg$maxFailPos < input.length',
	    '          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)',
	    '          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)',
	    '      );',
	    '    }',
	    '  }',
	    '',
	    '  return {'
	  ].join('\n'));
	
	  if (options.trace) {
	    parts.push([
	      '    SyntaxError:   peg$SyntaxError,',
	      '    DefaultTracer: peg$DefaultTracer,',
	      '    parse:         peg$parse'
	    ].join('\n'));
	  } else {
	    parts.push([
	      '    SyntaxError: peg$SyntaxError,',
	      '    parse:       peg$parse'
	    ].join('\n'));
	  }
	
	  parts.push([
	    '  };',
	    '})()'
	  ].join('\n'));
	
	  ast.code = parts.join('\n');
	}
	
	module.exports = generateJavascript;


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays  = __webpack_require__(3),
	    visitor = __webpack_require__(10);
	
	/*
	 * Removes proxy rules -- that is, rules that only delegate to other rule.
	 */
	function removeProxyRules(ast, options) {
	  function isProxyRule(node) {
	    return node.type === "rule" && node.expression.type === "rule_ref";
	  }
	
	  function replaceRuleRefs(ast, from, to) {
	    var replace = visitor.build({
	      rule_ref: function(node) {
	        if (node.name === from) {
	          node.name = to;
	        }
	      }
	    });
	
	    replace(ast);
	  }
	
	  var indices = [];
	
	  arrays.each(ast.rules, function(rule, i) {
	    if (isProxyRule(rule)) {
	      replaceRuleRefs(ast, rule.name, rule.expression.name);
	      if (!arrays.contains(options.allowedStartRules, rule.name)) {
	        indices.push(i);
	      }
	    }
	  });
	
	  indices.reverse();
	
	  arrays.each(indices, function(i) { ast.rules.splice(i, 1); });
	}
	
	module.exports = removeProxyRules;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var GrammarError = __webpack_require__(30),
	    asts         = __webpack_require__(22),
	    visitor      = __webpack_require__(10);
	
	/*
	 * Reports expressions that don't consume any input inside |*| or |+| in the
	 * grammar, which prevents infinite loops in the generated parser.
	 */
	function reportInfiniteLoops(ast) {
	  var check = visitor.build({
	    zero_or_more: function(node) {
	      if (!asts.alwaysAdvancesOnSuccess(ast, node.expression)) {
	        throw new GrammarError("Infinite loop detected.", node.location);
	      }
	    },
	
	    one_or_more: function(node) {
	      if (!asts.alwaysAdvancesOnSuccess(ast, node.expression)) {
	        throw new GrammarError("Infinite loop detected.", node.location);
	      }
	    }
	  });
	
	  check(ast);
	}
	
	module.exports = reportInfiniteLoops;


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays       = __webpack_require__(3),
	    GrammarError = __webpack_require__(30),
	    asts         = __webpack_require__(22),
	    visitor      = __webpack_require__(10);
	
	/*
	 * Reports left recursion in the grammar, which prevents infinite recursion in
	 * the generated parser.
	 *
	 * Both direct and indirect recursion is detected. The pass also correctly
	 * reports cases like this:
	 *
	 *   start = "a"? start
	 *
	 * In general, if a rule reference can be reached without consuming any input,
	 * it can lead to left recursion.
	 */
	function reportLeftRecursion(ast) {
	  var visitedRules = [];
	
	  var check = visitor.build({
	    rule: function(node) {
	      visitedRules.push(node.name);
	      check(node.expression);
	      visitedRules.pop(node.name);
	    },
	
	    sequence: function(node) {
	      arrays.every(node.elements, function(element) {
	        check(element);
	
	        return !asts.alwaysAdvancesOnSuccess(ast, element);
	      });
	    },
	
	    rule_ref: function(node) {
	      if (arrays.contains(visitedRules, node.name)) {
	        throw new GrammarError(
	          "Left recursion detected for rule \"" + node.name + "\".",
	          node.location
	        );
	      }
	
	      check(asts.findRule(ast, node.name));
	    }
	  });
	
	  check(ast);
	}
	
	module.exports = reportLeftRecursion;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var GrammarError = __webpack_require__(30),
	    asts         = __webpack_require__(22),
	    visitor      = __webpack_require__(10);
	
	/* Checks that all referenced rules exist. */
	function reportMissingRules(ast) {
	  var check = visitor.build({
	    rule_ref: function(node) {
	      if (!asts.findRule(ast, node.name)) {
	        throw new GrammarError(
	          "Referenced rule \"" + node.name + "\" does not exist.",
	          node.location
	        );
	      }
	    }
	  });
	
	  check(ast);
	}
	
	module.exports = reportMissingRules;


/***/ },
/* 103 */
/***/ function(module, exports) {

	module.exports = (function() {
	  "use strict";
	
	  /*
	   * Generated by PEG.js 0.9.0.
	   *
	   * http://pegjs.org/
	   */
	
	  function peg$subclass(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }
	
	  function peg$SyntaxError(message, expected, found, location) {
	    this.message  = message;
	    this.expected = expected;
	    this.found    = found;
	    this.location = location;
	    this.name     = "SyntaxError";
	
	    if (typeof Error.captureStackTrace === "function") {
	      Error.captureStackTrace(this, peg$SyntaxError);
	    }
	  }
	
	  peg$subclass(peg$SyntaxError, Error);
	
	  function peg$parse(input) {
	    var options = arguments.length > 1 ? arguments[1] : {},
	        parser  = this,
	
	        peg$FAILED = {},
	
	        peg$startRuleFunctions = { Grammar: peg$parseGrammar },
	        peg$startRuleFunction  = peg$parseGrammar,
	
	        peg$c0 = function(initializer, rules) {
	              return {
	                type:        "grammar",
	                initializer: extractOptional(initializer, 0),
	                rules:       extractList(rules, 0),
	                location:    location()
	              };
	            },
	        peg$c1 = function(code) {
	              return { type: "initializer", code: code, location: location() };
	            },
	        peg$c2 = "=",
	        peg$c3 = { type: "literal", value: "=", description: "\"=\"" },
	        peg$c4 = function(name, displayName, expression) {
	              return {
	                type:        "rule",
	                name:        name,
	                expression:  displayName !== null
	                  ? {
	                      type:       "named",
	                      name:       displayName[0],
	                      expression: expression,
	                      location:   location()
	                    }
	                  : expression,
	                location:    location()
	              };
	            },
	        peg$c5 = "/",
	        peg$c6 = { type: "literal", value: "/", description: "\"/\"" },
	        peg$c7 = function(first, rest) {
	              return rest.length > 0
	                ? {
	                    type:         "choice",
	                    alternatives: buildList(first, rest, 3),
	                    location:     location()
	                  }
	                : first;
	            },
	        peg$c8 = function(expression, code) {
	              return code !== null
	                ? {
	                    type:       "action",
	                    expression: expression,
	                    code:       code[1],
	                    location:   location()
	                  }
	                : expression;
	            },
	        peg$c9 = function(first, rest) {
	              return rest.length > 0
	                ? {
	                    type:     "sequence",
	                    elements: buildList(first, rest, 1),
	                    location: location()
	                  }
	                : first;
	            },
	        peg$c10 = ":",
	        peg$c11 = { type: "literal", value: ":", description: "\":\"" },
	        peg$c12 = function(label, expression) {
	              return {
	                type:       "labeled",
	                label:      label,
	                expression: expression,
	                location:   location()
	              };
	            },
	        peg$c13 = function(operator, expression) {
	              return {
	                type:       OPS_TO_PREFIXED_TYPES[operator],
	                expression: expression,
	                location:   location()
	              };
	            },
	        peg$c14 = "$",
	        peg$c15 = { type: "literal", value: "$", description: "\"$\"" },
	        peg$c16 = "&",
	        peg$c17 = { type: "literal", value: "&", description: "\"&\"" },
	        peg$c18 = "!",
	        peg$c19 = { type: "literal", value: "!", description: "\"!\"" },
	        peg$c20 = function(expression, operator) {
	              return {
	                type:       OPS_TO_SUFFIXED_TYPES[operator],
	                expression: expression,
	                location:   location()
	              };
	            },
	        peg$c21 = "?",
	        peg$c22 = { type: "literal", value: "?", description: "\"?\"" },
	        peg$c23 = "*",
	        peg$c24 = { type: "literal", value: "*", description: "\"*\"" },
	        peg$c25 = "+",
	        peg$c26 = { type: "literal", value: "+", description: "\"+\"" },
	        peg$c27 = "(",
	        peg$c28 = { type: "literal", value: "(", description: "\"(\"" },
	        peg$c29 = ")",
	        peg$c30 = { type: "literal", value: ")", description: "\")\"" },
	        peg$c31 = function(expression) { return expression; },
	        peg$c32 = function(name) {
	              return { type: "rule_ref", name: name, location: location() };
	            },
	        peg$c33 = function(operator, code) {
	              return {
	                type:     OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
	                code:     code,
	                location: location()
	              };
	            },
	        peg$c34 = { type: "any", description: "any character" },
	        peg$c35 = { type: "other", description: "whitespace" },
	        peg$c36 = "\t",
	        peg$c37 = { type: "literal", value: "\t", description: "\"\\t\"" },
	        peg$c38 = "\x0B",
	        peg$c39 = { type: "literal", value: "\x0B", description: "\"\\x0B\"" },
	        peg$c40 = "\f",
	        peg$c41 = { type: "literal", value: "\f", description: "\"\\f\"" },
	        peg$c42 = " ",
	        peg$c43 = { type: "literal", value: " ", description: "\" \"" },
	        peg$c44 = "\xA0",
	        peg$c45 = { type: "literal", value: "\xA0", description: "\"\\xA0\"" },
	        peg$c46 = "\uFEFF",
	        peg$c47 = { type: "literal", value: "\uFEFF", description: "\"\\uFEFF\"" },
	        peg$c48 = /^[\n\r\u2028\u2029]/,
	        peg$c49 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
	        peg$c50 = { type: "other", description: "end of line" },
	        peg$c51 = "\n",
	        peg$c52 = { type: "literal", value: "\n", description: "\"\\n\"" },
	        peg$c53 = "\r\n",
	        peg$c54 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
	        peg$c55 = "\r",
	        peg$c56 = { type: "literal", value: "\r", description: "\"\\r\"" },
	        peg$c57 = "\u2028",
	        peg$c58 = { type: "literal", value: "\u2028", description: "\"\\u2028\"" },
	        peg$c59 = "\u2029",
	        peg$c60 = { type: "literal", value: "\u2029", description: "\"\\u2029\"" },
	        peg$c61 = { type: "other", description: "comment" },
	        peg$c62 = "/*",
	        peg$c63 = { type: "literal", value: "/*", description: "\"/*\"" },
	        peg$c64 = "*/",
	        peg$c65 = { type: "literal", value: "*/", description: "\"*/\"" },
	        peg$c66 = "//",
	        peg$c67 = { type: "literal", value: "//", description: "\"//\"" },
	        peg$c68 = function(name) { return name; },
	        peg$c69 = { type: "other", description: "identifier" },
	        peg$c70 = function(first, rest) { return first + rest.join(""); },
	        peg$c71 = "_",
	        peg$c72 = { type: "literal", value: "_", description: "\"_\"" },
	        peg$c73 = "\\",
	        peg$c74 = { type: "literal", value: "\\", description: "\"\\\\\"" },
	        peg$c75 = function(sequence) { return sequence; },
	        peg$c76 = "\u200C",
	        peg$c77 = { type: "literal", value: "\u200C", description: "\"\\u200C\"" },
	        peg$c78 = "\u200D",
	        peg$c79 = { type: "literal", value: "\u200D", description: "\"\\u200D\"" },
	        peg$c80 = { type: "other", description: "literal" },
	        peg$c81 = "i",
	        peg$c82 = { type: "literal", value: "i", description: "\"i\"" },
	        peg$c83 = function(value, ignoreCase) {
	              return {
	                type:       "literal",
	                value:      value,
	                ignoreCase: ignoreCase !== null,
	                location:   location()
	              };
	            },
	        peg$c84 = { type: "other", description: "string" },
	        peg$c85 = "\"",
	        peg$c86 = { type: "literal", value: "\"", description: "\"\\\"\"" },
	        peg$c87 = function(chars) { return chars.join(""); },
	        peg$c88 = "'",
	        peg$c89 = { type: "literal", value: "'", description: "\"'\"" },
	        peg$c90 = function() { return text(); },
	        peg$c91 = { type: "other", description: "character class" },
	        peg$c92 = "[",
	        peg$c93 = { type: "literal", value: "[", description: "\"[\"" },
	        peg$c94 = "^",
	        peg$c95 = { type: "literal", value: "^", description: "\"^\"" },
	        peg$c96 = "]",
	        peg$c97 = { type: "literal", value: "]", description: "\"]\"" },
	        peg$c98 = function(inverted, parts, ignoreCase) {
	              return {
	                type:       "class",
	                parts:      filterEmptyStrings(parts),
	                inverted:   inverted !== null,
	                ignoreCase: ignoreCase !== null,
	                rawText:    text(),
	                location:   location()
	              };
	            },
	        peg$c99 = "-",
	        peg$c100 = { type: "literal", value: "-", description: "\"-\"" },
	        peg$c101 = function(begin, end) {
	              if (begin.charCodeAt(0) > end.charCodeAt(0)) {
	                error(
	                  "Invalid character range: " + text() + "."
	                );
	              }
	
	              return [begin, end];
	            },
	        peg$c102 = function() { return ""; },
	        peg$c103 = "0",
	        peg$c104 = { type: "literal", value: "0", description: "\"0\"" },
	        peg$c105 = function() { return "\0"; },
	        peg$c106 = "b",
	        peg$c107 = { type: "literal", value: "b", description: "\"b\"" },
	        peg$c108 = function() { return "\b";   },
	        peg$c109 = "f",
	        peg$c110 = { type: "literal", value: "f", description: "\"f\"" },
	        peg$c111 = function() { return "\f";   },
	        peg$c112 = "n",
	        peg$c113 = { type: "literal", value: "n", description: "\"n\"" },
	        peg$c114 = function() { return "\n";   },
	        peg$c115 = "r",
	        peg$c116 = { type: "literal", value: "r", description: "\"r\"" },
	        peg$c117 = function() { return "\r";   },
	        peg$c118 = "t",
	        peg$c119 = { type: "literal", value: "t", description: "\"t\"" },
	        peg$c120 = function() { return "\t";   },
	        peg$c121 = "v",
	        peg$c122 = { type: "literal", value: "v", description: "\"v\"" },
	        peg$c123 = function() { return "\x0B"; },
	        peg$c124 = "x",
	        peg$c125 = { type: "literal", value: "x", description: "\"x\"" },
	        peg$c126 = "u",
	        peg$c127 = { type: "literal", value: "u", description: "\"u\"" },
	        peg$c128 = function(digits) {
	              return String.fromCharCode(parseInt(digits, 16));
	            },
	        peg$c129 = /^[0-9]/,
	        peg$c130 = { type: "class", value: "[0-9]", description: "[0-9]" },
	        peg$c131 = /^[0-9a-f]/i,
	        peg$c132 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
	        peg$c133 = ".",
	        peg$c134 = { type: "literal", value: ".", description: "\".\"" },
	        peg$c135 = function() { return { type: "any", location: location() }; },
	        peg$c136 = { type: "other", description: "code block" },
	        peg$c137 = "{",
	        peg$c138 = { type: "literal", value: "{", description: "\"{\"" },
	        peg$c139 = "}",
	        peg$c140 = { type: "literal", value: "}", description: "\"}\"" },
	        peg$c141 = function(code) { return code; },
	        peg$c142 = /^[{}]/,
	        peg$c143 = { type: "class", value: "[{}]", description: "[{}]" },
	        peg$c144 = /^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
	        peg$c145 = { type: "class", value: "[\\u0061-\\u007A\\u00B5\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137-\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148-\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C-\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA-\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9-\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC-\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F-\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0-\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB-\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE-\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0529\\u052B\\u052D\\u052F\\u0561-\\u0587\\u13F8-\\u13FD\\u1D00-\\u1D2B\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6-\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FC7\\u1FD0-\\u1FD3\\u1FD6-\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6-\\u1FF7\\u210A\\u210E-\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C-\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65-\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73-\\u2C74\\u2C76-\\u2C7B\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3-\\u2CE4\\u2CEC\\u2CEE\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA699\\uA69B\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA793-\\uA795\\uA797\\uA799\\uA79B\\uA79D\\uA79F\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7B5\\uA7B7\\uA7FA\\uAB30-\\uAB5A\\uAB60-\\uAB65\\uAB70-\\uABBF\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A]", description: "[\\u0061-\\u007A\\u00B5\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137-\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148-\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C-\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA-\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9-\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC-\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F-\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0-\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB-\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE-\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0529\\u052B\\u052D\\u052F\\u0561-\\u0587\\u13F8-\\u13FD\\u1D00-\\u1D2B\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6-\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FC7\\u1FD0-\\u1FD3\\u1FD6-\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6-\\u1FF7\\u210A\\u210E-\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C-\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65-\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73-\\u2C74\\u2C76-\\u2C7B\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3-\\u2CE4\\u2CEC\\u2CEE\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA699\\uA69B\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA793-\\uA795\\uA797\\uA799\\uA79B\\uA79D\\uA79F\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7B5\\uA7B7\\uA7FA\\uAB30-\\uAB5A\\uAB60-\\uAB65\\uAB70-\\uABBF\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A]" },
	        peg$c146 = /^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/,
	        peg$c147 = { type: "class", value: "[\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5-\\u06E6\\u07F4-\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D6A\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7C-\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D-\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA69C-\\uA69D\\uA717-\\uA71F\\uA770\\uA788\\uA7F8-\\uA7F9\\uA9CF\\uA9E6\\uAA70\\uAADD\\uAAF3-\\uAAF4\\uAB5C-\\uAB5F\\uFF70\\uFF9E-\\uFF9F]", description: "[\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5-\\u06E6\\u07F4-\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D6A\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7C-\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D-\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA69C-\\uA69D\\uA717-\\uA71F\\uA770\\uA788\\uA7F8-\\uA7F9\\uA9CF\\uA9E6\\uAA70\\uAADD\\uAAF3-\\uAAF4\\uAB5C-\\uAB5F\\uFF70\\uFF9E-\\uFF9F]" },
	        peg$c148 = /^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
	        peg$c149 = { type: "class", value: "[\\u00AA\\u00BA\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E-\\u066F\\u0671-\\u06D3\\u06D5\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u08A0-\\u08B4\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0980\\u0985-\\u098C\\u098F-\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0-\\u0AE1\\u0AF9\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C39\\u0C3D\\u0C58-\\u0C5A\\u0C60-\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1\\u0CF1-\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D5F-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33\\u0E40-\\u0E45\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u10FD-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16F1-\\u16F8\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191E\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19B0-\\u19C9\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5-\\u1CF6\\u2135-\\u2138\\u2D30-\\u2D67\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FD5\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A-\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA78F\\uA7F7\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA8FD\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9E0-\\uA9E4\\uA9E7-\\uA9EF\\uA9FA-\\uA9FE\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA7E-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADC\\uAAE0-\\uAAEA\\uAAF2\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]", description: "[\\u00AA\\u00BA\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E-\\u066F\\u0671-\\u06D3\\u06D5\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u08A0-\\u08B4\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0980\\u0985-\\u098C\\u098F-\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0-\\u0AE1\\u0AF9\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C39\\u0C3D\\u0C58-\\u0C5A\\u0C60-\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1\\u0CF1-\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D5F-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33\\u0E40-\\u0E45\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u10FD-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u16F1-\\u16F8\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191E\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19B0-\\u19C9\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5-\\u1CF6\\u2135-\\u2138\\u2D30-\\u2D67\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FD5\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A-\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA78F\\uA7F7\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA8FD\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9E0-\\uA9E4\\uA9E7-\\uA9EF\\uA9FA-\\uA9FE\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA7E-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADC\\uAAE0-\\uAAEA\\uAAF2\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]" },
	        peg$c150 = /^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,
	        peg$c151 = { type: "class", value: "[\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC]", description: "[\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC]" },
	        peg$c152 = /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/,
	        peg$c153 = { type: "class", value: "[\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u037F\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0528\\u052A\\u052C\\u052E\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u13A0-\\u13F5\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA698\\uA69A\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA792\\uA796\\uA798\\uA79A\\uA79C\\uA79E\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA-\\uA7AD\\uA7B0-\\uA7B4\\uA7B6\\uFF21-\\uFF3A]", description: "[\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u037F\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0528\\u052A\\u052C\\u052E\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u13A0-\\u13F5\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA698\\uA69A\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA792\\uA796\\uA798\\uA79A\\uA79C\\uA79E\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA-\\uA7AD\\uA7B0-\\uA7B4\\uA7B6\\uFF21-\\uFF3A]" },
	        peg$c154 = /^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
	        peg$c155 = { type: "class", value: "[\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E-\\u094F\\u0982-\\u0983\\u09BE-\\u09C0\\u09C7-\\u09C8\\u09CB-\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB-\\u0ACC\\u0B02-\\u0B03\\u0B3E\\u0B40\\u0B47-\\u0B48\\u0B4B-\\u0B4C\\u0B57\\u0BBE-\\u0BBF\\u0BC1-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82-\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7-\\u0CC8\\u0CCA-\\u0CCB\\u0CD5-\\u0CD6\\u0D02-\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82-\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0F3E-\\u0F3F\\u0F7F\\u102B-\\u102C\\u1031\\u1038\\u103B-\\u103C\\u1056-\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083-\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930-\\u1931\\u1933-\\u1938\\u1A19-\\u1A1A\\u1A55\\u1A57\\u1A61\\u1A63-\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43-\\u1B44\\u1B82\\u1BA1\\u1BA6-\\u1BA7\\u1BAA\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2-\\u1BF3\\u1C24-\\u1C2B\\u1C34-\\u1C35\\u1CE1\\u1CF2-\\u1CF3\\u302E-\\u302F\\uA823-\\uA824\\uA827\\uA880-\\uA881\\uA8B4-\\uA8C3\\uA952-\\uA953\\uA983\\uA9B4-\\uA9B5\\uA9BA-\\uA9BB\\uA9BD-\\uA9C0\\uAA2F-\\uAA30\\uAA33-\\uAA34\\uAA4D\\uAA7B\\uAA7D\\uAAEB\\uAAEE-\\uAAEF\\uAAF5\\uABE3-\\uABE4\\uABE6-\\uABE7\\uABE9-\\uABEA\\uABEC]", description: "[\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E-\\u094F\\u0982-\\u0983\\u09BE-\\u09C0\\u09C7-\\u09C8\\u09CB-\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB-\\u0ACC\\u0B02-\\u0B03\\u0B3E\\u0B40\\u0B47-\\u0B48\\u0B4B-\\u0B4C\\u0B57\\u0BBE-\\u0BBF\\u0BC1-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82-\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7-\\u0CC8\\u0CCA-\\u0CCB\\u0CD5-\\u0CD6\\u0D02-\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82-\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0F3E-\\u0F3F\\u0F7F\\u102B-\\u102C\\u1031\\u1038\\u103B-\\u103C\\u1056-\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083-\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930-\\u1931\\u1933-\\u1938\\u1A19-\\u1A1A\\u1A55\\u1A57\\u1A61\\u1A63-\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43-\\u1B44\\u1B82\\u1BA1\\u1BA6-\\u1BA7\\u1BAA\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2-\\u1BF3\\u1C24-\\u1C2B\\u1C34-\\u1C35\\u1CE1\\u1CF2-\\u1CF3\\u302E-\\u302F\\uA823-\\uA824\\uA827\\uA880-\\uA881\\uA8B4-\\uA8C3\\uA952-\\uA953\\uA983\\uA9B4-\\uA9B5\\uA9BA-\\uA9BB\\uA9BD-\\uA9C0\\uAA2F-\\uAA30\\uAA33-\\uAA34\\uAA4D\\uAA7B\\uAA7D\\uAAEB\\uAAEE-\\uAAEF\\uAAF5\\uABE3-\\uABE4\\uABE6-\\uABE7\\uABE9-\\uABEA\\uABEC]" },
	        peg$c156 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/,
	        peg$c157 = { type: "class", value: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u08E3-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C00\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56\\u0C62-\\u0C63\\u0C81\\u0CBC\\u0CBF\\u0CC6\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3\\u0D01\\u0D41-\\u0D44\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A\\u103D-\\u103E\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085-\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18\\u1A1B\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1AB0-\\u1ABD\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB-\\u1BAD\\u1BE6\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4\\u1CF8-\\u1CF9\\u1DC0-\\u1DF5\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302D\\u3099-\\u309A\\uA66F\\uA674-\\uA67D\\uA69E-\\uA69F\\uA6F0-\\uA6F1\\uA802\\uA806\\uA80B\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uA9E5\\uAA29-\\uAA2E\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAA7C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED\\uAAF6\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE2F]", description: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u08E3-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C00\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56\\u0C62-\\u0C63\\u0C81\\u0CBC\\u0CBF\\u0CC6\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3\\u0D01\\u0D41-\\u0D44\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A\\u103D-\\u103E\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085-\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18\\u1A1B\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1AB0-\\u1ABD\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB-\\u1BAD\\u1BE6\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4\\u1CF8-\\u1CF9\\u1DC0-\\u1DF5\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302D\\u3099-\\u309A\\uA66F\\uA674-\\uA67D\\uA69E-\\uA69F\\uA6F0-\\uA6F1\\uA802\\uA806\\uA80B\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uA9E5\\uAA29-\\uAA2E\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAA7C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED\\uAAF6\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE2F]" },
	        peg$c158 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
	        peg$c159 = { type: "class", value: "[\\u0030-\\u0039\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0DE6-\\u0DEF\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uA9F0-\\uA9F9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]", description: "[\\u0030-\\u0039\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0DE6-\\u0DEF\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uA9F0-\\uA9F9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]" },
	        peg$c160 = /^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,
	        peg$c161 = { type: "class", value: "[\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]", description: "[\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]" },
	        peg$c162 = /^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
	        peg$c163 = { type: "class", value: "[\\u005F\\u203F-\\u2040\\u2054\\uFE33-\\uFE34\\uFE4D-\\uFE4F\\uFF3F]", description: "[\\u005F\\u203F-\\u2040\\u2054\\uFE33-\\uFE34\\uFE4D-\\uFE4F\\uFF3F]" },
	        peg$c164 = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
	        peg$c165 = { type: "class", value: "[\\u0020\\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]", description: "[\\u0020\\u00A0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]" },
	        peg$c166 = "break",
	        peg$c167 = { type: "literal", value: "break", description: "\"break\"" },
	        peg$c168 = "case",
	        peg$c169 = { type: "literal", value: "case", description: "\"case\"" },
	        peg$c170 = "catch",
	        peg$c171 = { type: "literal", value: "catch", description: "\"catch\"" },
	        peg$c172 = "class",
	        peg$c173 = { type: "literal", value: "class", description: "\"class\"" },
	        peg$c174 = "const",
	        peg$c175 = { type: "literal", value: "const", description: "\"const\"" },
	        peg$c176 = "continue",
	        peg$c177 = { type: "literal", value: "continue", description: "\"continue\"" },
	        peg$c178 = "debugger",
	        peg$c179 = { type: "literal", value: "debugger", description: "\"debugger\"" },
	        peg$c180 = "default",
	        peg$c181 = { type: "literal", value: "default", description: "\"default\"" },
	        peg$c182 = "delete",
	        peg$c183 = { type: "literal", value: "delete", description: "\"delete\"" },
	        peg$c184 = "do",
	        peg$c185 = { type: "literal", value: "do", description: "\"do\"" },
	        peg$c186 = "else",
	        peg$c187 = { type: "literal", value: "else", description: "\"else\"" },
	        peg$c188 = "enum",
	        peg$c189 = { type: "literal", value: "enum", description: "\"enum\"" },
	        peg$c190 = "export",
	        peg$c191 = { type: "literal", value: "export", description: "\"export\"" },
	        peg$c192 = "extends",
	        peg$c193 = { type: "literal", value: "extends", description: "\"extends\"" },
	        peg$c194 = "false",
	        peg$c195 = { type: "literal", value: "false", description: "\"false\"" },
	        peg$c196 = "finally",
	        peg$c197 = { type: "literal", value: "finally", description: "\"finally\"" },
	        peg$c198 = "for",
	        peg$c199 = { type: "literal", value: "for", description: "\"for\"" },
	        peg$c200 = "function",
	        peg$c201 = { type: "literal", value: "function", description: "\"function\"" },
	        peg$c202 = "if",
	        peg$c203 = { type: "literal", value: "if", description: "\"if\"" },
	        peg$c204 = "import",
	        peg$c205 = { type: "literal", value: "import", description: "\"import\"" },
	        peg$c206 = "instanceof",
	        peg$c207 = { type: "literal", value: "instanceof", description: "\"instanceof\"" },
	        peg$c208 = "in",
	        peg$c209 = { type: "literal", value: "in", description: "\"in\"" },
	        peg$c210 = "new",
	        peg$c211 = { type: "literal", value: "new", description: "\"new\"" },
	        peg$c212 = "null",
	        peg$c213 = { type: "literal", value: "null", description: "\"null\"" },
	        peg$c214 = "return",
	        peg$c215 = { type: "literal", value: "return", description: "\"return\"" },
	        peg$c216 = "super",
	        peg$c217 = { type: "literal", value: "super", description: "\"super\"" },
	        peg$c218 = "switch",
	        peg$c219 = { type: "literal", value: "switch", description: "\"switch\"" },
	        peg$c220 = "this",
	        peg$c221 = { type: "literal", value: "this", description: "\"this\"" },
	        peg$c222 = "throw",
	        peg$c223 = { type: "literal", value: "throw", description: "\"throw\"" },
	        peg$c224 = "true",
	        peg$c225 = { type: "literal", value: "true", description: "\"true\"" },
	        peg$c226 = "try",
	        peg$c227 = { type: "literal", value: "try", description: "\"try\"" },
	        peg$c228 = "typeof",
	        peg$c229 = { type: "literal", value: "typeof", description: "\"typeof\"" },
	        peg$c230 = "var",
	        peg$c231 = { type: "literal", value: "var", description: "\"var\"" },
	        peg$c232 = "void",
	        peg$c233 = { type: "literal", value: "void", description: "\"void\"" },
	        peg$c234 = "while",
	        peg$c235 = { type: "literal", value: "while", description: "\"while\"" },
	        peg$c236 = "with",
	        peg$c237 = { type: "literal", value: "with", description: "\"with\"" },
	        peg$c238 = ";",
	        peg$c239 = { type: "literal", value: ";", description: "\";\"" },
	
	        peg$currPos          = 0,
	        peg$savedPos         = 0,
	        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
	        peg$maxFailPos       = 0,
	        peg$maxFailExpected  = [],
	        peg$silentFails      = 0,
	
	        peg$result;
	
	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }
	
	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }
	
	    function text() {
	      return input.substring(peg$savedPos, peg$currPos);
	    }
	
	    function location() {
	      return peg$computeLocation(peg$savedPos, peg$currPos);
	    }
	
	    function expected(description) {
	      throw peg$buildException(
	        null,
	        [{ type: "other", description: description }],
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }
	
	    function error(message) {
	      throw peg$buildException(
	        message,
	        null,
	        input.substring(peg$savedPos, peg$currPos),
	        peg$computeLocation(peg$savedPos, peg$currPos)
	      );
	    }
	
	    function peg$computePosDetails(pos) {
	      var details = peg$posDetailsCache[pos],
	          p, ch;
	
	      if (details) {
	        return details;
	      } else {
	        p = pos - 1;
	        while (!peg$posDetailsCache[p]) {
	          p--;
	        }
	
	        details = peg$posDetailsCache[p];
	        details = {
	          line:   details.line,
	          column: details.column,
	          seenCR: details.seenCR
	        };
	
	        while (p < pos) {
	          ch = input.charAt(p);
	          if (ch === "\n") {
	            if (!details.seenCR) { details.line++; }
	            details.column = 1;
	            details.seenCR = false;
	          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	            details.line++;
	            details.column = 1;
	            details.seenCR = true;
	          } else {
	            details.column++;
	            details.seenCR = false;
	          }
	
	          p++;
	        }
	
	        peg$posDetailsCache[pos] = details;
	        return details;
	      }
	    }
	
	    function peg$computeLocation(startPos, endPos) {
	      var startPosDetails = peg$computePosDetails(startPos),
	          endPosDetails   = peg$computePosDetails(endPos);
	
	      return {
	        start: {
	          offset: startPos,
	          line:   startPosDetails.line,
	          column: startPosDetails.column
	        },
	        end: {
	          offset: endPos,
	          line:   endPosDetails.line,
	          column: endPosDetails.column
	        }
	      };
	    }
	
	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) { return; }
	
	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }
	
	      peg$maxFailExpected.push(expected);
	    }
	
	    function peg$buildException(message, expected, found, location) {
	      function cleanupExpected(expected) {
	        var i = 1;
	
	        expected.sort(function(a, b) {
	          if (a.description < b.description) {
	            return -1;
	          } else if (a.description > b.description) {
	            return 1;
	          } else {
	            return 0;
	          }
	        });
	
	        while (i < expected.length) {
	          if (expected[i - 1] === expected[i]) {
	            expected.splice(i, 1);
	          } else {
	            i++;
	          }
	        }
	      }
	
	      function buildMessage(expected, found) {
	        function stringEscape(s) {
	          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }
	
	          return s
	            .replace(/\\/g,   '\\\\')
	            .replace(/"/g,    '\\"')
	            .replace(/\x08/g, '\\b')
	            .replace(/\t/g,   '\\t')
	            .replace(/\n/g,   '\\n')
	            .replace(/\f/g,   '\\f')
	            .replace(/\r/g,   '\\r')
	            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
	            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
	            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
	            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
	        }
	
	        var expectedDescs = new Array(expected.length),
	            expectedDesc, foundDesc, i;
	
	        for (i = 0; i < expected.length; i++) {
	          expectedDescs[i] = expected[i].description;
	        }
	
	        expectedDesc = expected.length > 1
	          ? expectedDescs.slice(0, -1).join(", ")
	              + " or "
	              + expectedDescs[expected.length - 1]
	          : expectedDescs[0];
	
	        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
	
	        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	      }
	
	      if (expected !== null) {
	        cleanupExpected(expected);
	      }
	
	      return new peg$SyntaxError(
	        message !== null ? message : buildMessage(expected, found),
	        expected,
	        found,
	        location
	      );
	    }
	
	    function peg$parseGrammar() {
	      var s0, s1, s2, s3, s4, s5, s6;
	
	      s0 = peg$currPos;
	      s1 = peg$parse__();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parseInitializer();
	        if (s3 !== peg$FAILED) {
	          s4 = peg$parse__();
	          if (s4 !== peg$FAILED) {
	            s3 = [s3, s4];
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$currPos;
	          s5 = peg$parseRule();
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse__();
	            if (s6 !== peg$FAILED) {
	              s5 = [s5, s6];
	              s4 = s5;
	            } else {
	              peg$currPos = s4;
	              s4 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s4;
	            s4 = peg$FAILED;
	          }
	          if (s4 !== peg$FAILED) {
	            while (s4 !== peg$FAILED) {
	              s3.push(s4);
	              s4 = peg$currPos;
	              s5 = peg$parseRule();
	              if (s5 !== peg$FAILED) {
	                s6 = peg$parse__();
	                if (s6 !== peg$FAILED) {
	                  s5 = [s5, s6];
	                  s4 = s5;
	                } else {
	                  peg$currPos = s4;
	                  s4 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s4;
	                s4 = peg$FAILED;
	              }
	            }
	          } else {
	            s3 = peg$FAILED;
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c0(s2, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseInitializer() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$parseCodeBlock();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseEOS();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c1(s1);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseRule() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifierName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$currPos;
	          s4 = peg$parseStringLiteral();
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parse__();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	          if (s3 === peg$FAILED) {
	            s3 = null;
	          }
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 61) {
	              s4 = peg$c2;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c3); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse__();
	              if (s5 !== peg$FAILED) {
	                s6 = peg$parseChoiceExpression();
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parseEOS();
	                  if (s7 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c4(s1, s3, s6);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseChoiceExpression() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseActionExpression();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse__();
	        if (s4 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 47) {
	            s5 = peg$c5;
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c6); }
	          }
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parse__();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseActionExpression();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse__();
	          if (s4 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 47) {
	              s5 = peg$c5;
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c6); }
	            }
	            if (s5 !== peg$FAILED) {
	              s6 = peg$parse__();
	              if (s6 !== peg$FAILED) {
	                s7 = peg$parseActionExpression();
	                if (s7 !== peg$FAILED) {
	                  s4 = [s4, s5, s6, s7];
	                  s3 = s4;
	                } else {
	                  peg$currPos = s3;
	                  s3 = peg$FAILED;
	                }
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c7(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseActionExpression() {
	      var s0, s1, s2, s3, s4;
	
	      s0 = peg$currPos;
	      s1 = peg$parseSequenceExpression();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$parse__();
	        if (s3 !== peg$FAILED) {
	          s4 = peg$parseCodeBlock();
	          if (s4 !== peg$FAILED) {
	            s3 = [s3, s4];
	            s2 = s3;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c8(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSequenceExpression() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      s1 = peg$parseLabeledExpression();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$parse__();
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseLabeledExpression();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$parse__();
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parseLabeledExpression();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c9(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseLabeledExpression() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifier();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 58) {
	            s3 = peg$c10;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c11); }
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parse__();
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parsePrefixedExpression();
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c12(s1, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsePrefixedExpression();
	      }
	
	      return s0;
	    }
	
	    function peg$parsePrefixedExpression() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parsePrefixedOperator();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseSuffixedExpression();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c13(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseSuffixedExpression();
	      }
	
	      return s0;
	    }
	
	    function peg$parsePrefixedOperator() {
	      var s0;
	
	      if (input.charCodeAt(peg$currPos) === 36) {
	        s0 = peg$c14;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c15); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 38) {
	          s0 = peg$c16;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c17); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 33) {
	            s0 = peg$c18;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c19); }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseSuffixedExpression() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parsePrimaryExpression();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseSuffixedOperator();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c20(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsePrimaryExpression();
	      }
	
	      return s0;
	    }
	
	    function peg$parseSuffixedOperator() {
	      var s0;
	
	      if (input.charCodeAt(peg$currPos) === 63) {
	        s0 = peg$c21;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c22); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 42) {
	          s0 = peg$c23;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 43) {
	            s0 = peg$c25;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c26); }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parsePrimaryExpression() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$parseLiteralMatcher();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseCharacterClassMatcher();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseAnyMatcher();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseRuleReferenceExpression();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parseSemanticPredicateExpression();
	              if (s0 === peg$FAILED) {
	                s0 = peg$currPos;
	                if (input.charCodeAt(peg$currPos) === 40) {
	                  s1 = peg$c27;
	                  peg$currPos++;
	                } else {
	                  s1 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c28); }
	                }
	                if (s1 !== peg$FAILED) {
	                  s2 = peg$parse__();
	                  if (s2 !== peg$FAILED) {
	                    s3 = peg$parseChoiceExpression();
	                    if (s3 !== peg$FAILED) {
	                      s4 = peg$parse__();
	                      if (s4 !== peg$FAILED) {
	                        if (input.charCodeAt(peg$currPos) === 41) {
	                          s5 = peg$c29;
	                          peg$currPos++;
	                        } else {
	                          s5 = peg$FAILED;
	                          if (peg$silentFails === 0) { peg$fail(peg$c30); }
	                        }
	                        if (s5 !== peg$FAILED) {
	                          peg$savedPos = s0;
	                          s1 = peg$c31(s3);
	                          s0 = s1;
	                        } else {
	                          peg$currPos = s0;
	                          s0 = peg$FAILED;
	                        }
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$FAILED;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$FAILED;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$FAILED;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$FAILED;
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseRuleReferenceExpression() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifierName();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$currPos;
	        s4 = peg$parse__();
	        if (s4 !== peg$FAILED) {
	          s5 = peg$currPos;
	          s6 = peg$parseStringLiteral();
	          if (s6 !== peg$FAILED) {
	            s7 = peg$parse__();
	            if (s7 !== peg$FAILED) {
	              s6 = [s6, s7];
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$FAILED;
	          }
	          if (s5 === peg$FAILED) {
	            s5 = null;
	          }
	          if (s5 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 61) {
	              s6 = peg$c2;
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c3); }
	            }
	            if (s6 !== peg$FAILED) {
	              s4 = [s4, s5, s6];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c32(s1);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSemanticPredicateExpression() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parseSemanticPredicateOperator();
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parse__();
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseCodeBlock();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c33(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSemanticPredicateOperator() {
	      var s0;
	
	      if (input.charCodeAt(peg$currPos) === 38) {
	        s0 = peg$c16;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c17); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 33) {
	          s0 = peg$c18;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c19); }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseSourceCharacter() {
	      var s0;
	
	      if (input.length > peg$currPos) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c34); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseWhiteSpace() {
	      var s0, s1;
	
	      peg$silentFails++;
	      if (input.charCodeAt(peg$currPos) === 9) {
	        s0 = peg$c36;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c37); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 11) {
	          s0 = peg$c38;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c39); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 12) {
	            s0 = peg$c40;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c41); }
	          }
	          if (s0 === peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 32) {
	              s0 = peg$c42;
	              peg$currPos++;
	            } else {
	              s0 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c43); }
	            }
	            if (s0 === peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 160) {
	                s0 = peg$c44;
	                peg$currPos++;
	              } else {
	                s0 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c45); }
	              }
	              if (s0 === peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 65279) {
	                  s0 = peg$c46;
	                  peg$currPos++;
	                } else {
	                  s0 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c47); }
	                }
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parseZs();
	                }
	              }
	            }
	          }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c35); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLineTerminator() {
	      var s0;
	
	      if (peg$c48.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c49); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLineTerminatorSequence() {
	      var s0, s1;
	
	      peg$silentFails++;
	      if (input.charCodeAt(peg$currPos) === 10) {
	        s0 = peg$c51;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c52); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.substr(peg$currPos, 2) === peg$c53) {
	          s0 = peg$c53;
	          peg$currPos += 2;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c54); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 13) {
	            s0 = peg$c55;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c56); }
	          }
	          if (s0 === peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 8232) {
	              s0 = peg$c57;
	              peg$currPos++;
	            } else {
	              s0 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c58); }
	            }
	            if (s0 === peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 8233) {
	                s0 = peg$c59;
	                peg$currPos++;
	              } else {
	                s0 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c60); }
	              }
	            }
	          }
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c50); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseComment() {
	      var s0, s1;
	
	      peg$silentFails++;
	      s0 = peg$parseMultiLineComment();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseSingleLineComment();
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c61); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseMultiLineComment() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c62) {
	        s1 = peg$c62;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c63); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$currPos;
	        peg$silentFails++;
	        if (input.substr(peg$currPos, 2) === peg$c64) {
	          s5 = peg$c64;
	          peg$currPos += 2;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c65); }
	        }
	        peg$silentFails--;
	        if (s5 === peg$FAILED) {
	          s4 = void 0;
	        } else {
	          peg$currPos = s4;
	          s4 = peg$FAILED;
	        }
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseSourceCharacter();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$currPos;
	          peg$silentFails++;
	          if (input.substr(peg$currPos, 2) === peg$c64) {
	            s5 = peg$c64;
	            peg$currPos += 2;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          peg$silentFails--;
	          if (s5 === peg$FAILED) {
	            s4 = void 0;
	          } else {
	            peg$currPos = s4;
	            s4 = peg$FAILED;
	          }
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parseSourceCharacter();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c64) {
	            s3 = peg$c64;
	            peg$currPos += 2;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseMultiLineCommentNoLineTerminator() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c62) {
	        s1 = peg$c62;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c63); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$currPos;
	        peg$silentFails++;
	        if (input.substr(peg$currPos, 2) === peg$c64) {
	          s5 = peg$c64;
	          peg$currPos += 2;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c65); }
	        }
	        if (s5 === peg$FAILED) {
	          s5 = peg$parseLineTerminator();
	        }
	        peg$silentFails--;
	        if (s5 === peg$FAILED) {
	          s4 = void 0;
	        } else {
	          peg$currPos = s4;
	          s4 = peg$FAILED;
	        }
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseSourceCharacter();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$currPos;
	          peg$silentFails++;
	          if (input.substr(peg$currPos, 2) === peg$c64) {
	            s5 = peg$c64;
	            peg$currPos += 2;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          if (s5 === peg$FAILED) {
	            s5 = peg$parseLineTerminator();
	          }
	          peg$silentFails--;
	          if (s5 === peg$FAILED) {
	            s4 = void 0;
	          } else {
	            peg$currPos = s4;
	            s4 = peg$FAILED;
	          }
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parseSourceCharacter();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c64) {
	            s3 = peg$c64;
	            peg$currPos += 2;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c65); }
	          }
	          if (s3 !== peg$FAILED) {
	            s1 = [s1, s2, s3];
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSingleLineComment() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c66) {
	        s1 = peg$c66;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c67); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$currPos;
	        peg$silentFails++;
	        s5 = peg$parseLineTerminator();
	        peg$silentFails--;
	        if (s5 === peg$FAILED) {
	          s4 = void 0;
	        } else {
	          peg$currPos = s4;
	          s4 = peg$FAILED;
	        }
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseSourceCharacter();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$currPos;
	          peg$silentFails++;
	          s5 = peg$parseLineTerminator();
	          peg$silentFails--;
	          if (s5 === peg$FAILED) {
	            s4 = void 0;
	          } else {
	            peg$currPos = s4;
	            s4 = peg$FAILED;
	          }
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parseSourceCharacter();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseIdentifier() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      peg$silentFails++;
	      s2 = peg$parseReservedWord();
	      peg$silentFails--;
	      if (s2 === peg$FAILED) {
	        s1 = void 0;
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseIdentifierName();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c68(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseIdentifierName() {
	      var s0, s1, s2, s3;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parseIdentifierStart();
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseIdentifierPart();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseIdentifierPart();
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c70(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c69); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseIdentifierStart() {
	      var s0, s1, s2;
	
	      s0 = peg$parseUnicodeLetter();
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 36) {
	          s0 = peg$c14;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c15); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 95) {
	            s0 = peg$c71;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c72); }
	          }
	          if (s0 === peg$FAILED) {
	            s0 = peg$currPos;
	            if (input.charCodeAt(peg$currPos) === 92) {
	              s1 = peg$c73;
	              peg$currPos++;
	            } else {
	              s1 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c74); }
	            }
	            if (s1 !== peg$FAILED) {
	              s2 = peg$parseUnicodeEscapeSequence();
	              if (s2 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c75(s2);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseIdentifierPart() {
	      var s0;
	
	      s0 = peg$parseIdentifierStart();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseUnicodeCombiningMark();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseNd();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parsePc();
	            if (s0 === peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 8204) {
	                s0 = peg$c76;
	                peg$currPos++;
	              } else {
	                s0 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c77); }
	              }
	              if (s0 === peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 8205) {
	                  s0 = peg$c78;
	                  peg$currPos++;
	                } else {
	                  s0 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c79); }
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseUnicodeLetter() {
	      var s0;
	
	      s0 = peg$parseLu();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseLl();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseLt();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseLm();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parseLo();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parseNl();
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseUnicodeCombiningMark() {
	      var s0;
	
	      s0 = peg$parseMn();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseMc();
	      }
	
	      return s0;
	    }
	
	    function peg$parseReservedWord() {
	      var s0;
	
	      s0 = peg$parseKeyword();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseFutureReservedWord();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseNullToken();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseBooleanLiteral();
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseKeyword() {
	      var s0;
	
	      s0 = peg$parseBreakToken();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseCaseToken();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseCatchToken();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseContinueToken();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parseDebuggerToken();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parseDefaultToken();
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parseDeleteToken();
	                  if (s0 === peg$FAILED) {
	                    s0 = peg$parseDoToken();
	                    if (s0 === peg$FAILED) {
	                      s0 = peg$parseElseToken();
	                      if (s0 === peg$FAILED) {
	                        s0 = peg$parseFinallyToken();
	                        if (s0 === peg$FAILED) {
	                          s0 = peg$parseForToken();
	                          if (s0 === peg$FAILED) {
	                            s0 = peg$parseFunctionToken();
	                            if (s0 === peg$FAILED) {
	                              s0 = peg$parseIfToken();
	                              if (s0 === peg$FAILED) {
	                                s0 = peg$parseInstanceofToken();
	                                if (s0 === peg$FAILED) {
	                                  s0 = peg$parseInToken();
	                                  if (s0 === peg$FAILED) {
	                                    s0 = peg$parseNewToken();
	                                    if (s0 === peg$FAILED) {
	                                      s0 = peg$parseReturnToken();
	                                      if (s0 === peg$FAILED) {
	                                        s0 = peg$parseSwitchToken();
	                                        if (s0 === peg$FAILED) {
	                                          s0 = peg$parseThisToken();
	                                          if (s0 === peg$FAILED) {
	                                            s0 = peg$parseThrowToken();
	                                            if (s0 === peg$FAILED) {
	                                              s0 = peg$parseTryToken();
	                                              if (s0 === peg$FAILED) {
	                                                s0 = peg$parseTypeofToken();
	                                                if (s0 === peg$FAILED) {
	                                                  s0 = peg$parseVarToken();
	                                                  if (s0 === peg$FAILED) {
	                                                    s0 = peg$parseVoidToken();
	                                                    if (s0 === peg$FAILED) {
	                                                      s0 = peg$parseWhileToken();
	                                                      if (s0 === peg$FAILED) {
	                                                        s0 = peg$parseWithToken();
	                                                      }
	                                                    }
	                                                  }
	                                                }
	                                              }
	                                            }
	                                          }
	                                        }
	                                      }
	                                    }
	                                  }
	                                }
	                              }
	                            }
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseFutureReservedWord() {
	      var s0;
	
	      s0 = peg$parseClassToken();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseConstToken();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseEnumToken();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseExportToken();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parseExtendsToken();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parseImportToken();
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parseSuperToken();
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseBooleanLiteral() {
	      var s0;
	
	      s0 = peg$parseTrueToken();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseFalseToken();
	      }
	
	      return s0;
	    }
	
	    function peg$parseLiteralMatcher() {
	      var s0, s1, s2;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      s1 = peg$parseStringLiteral();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 105) {
	          s2 = peg$c81;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c82); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c83(s1, s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c80); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseStringLiteral() {
	      var s0, s1, s2, s3;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 34) {
	        s1 = peg$c85;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c86); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = [];
	        s3 = peg$parseDoubleStringCharacter();
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$parseDoubleStringCharacter();
	        }
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 34) {
	            s3 = peg$c85;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c86); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c87(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 39) {
	          s1 = peg$c88;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c89); }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = [];
	          s3 = peg$parseSingleStringCharacter();
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$parseSingleStringCharacter();
	          }
	          if (s2 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 39) {
	              s3 = peg$c88;
	              peg$currPos++;
	            } else {
	              s3 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c89); }
	            }
	            if (s3 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c87(s2);
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c84); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseDoubleStringCharacter() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      peg$silentFails++;
	      if (input.charCodeAt(peg$currPos) === 34) {
	        s2 = peg$c85;
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c86); }
	      }
	      if (s2 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s2 = peg$c73;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = peg$parseLineTerminator();
	        }
	      }
	      peg$silentFails--;
	      if (s2 === peg$FAILED) {
	        s1 = void 0;
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseSourceCharacter();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c90();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s1 = peg$c73;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parseEscapeSequence();
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c75(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseLineContinuation();
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseSingleStringCharacter() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      peg$silentFails++;
	      if (input.charCodeAt(peg$currPos) === 39) {
	        s2 = peg$c88;
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c89); }
	      }
	      if (s2 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s2 = peg$c73;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = peg$parseLineTerminator();
	        }
	      }
	      peg$silentFails--;
	      if (s2 === peg$FAILED) {
	        s1 = void 0;
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseSourceCharacter();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c90();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s1 = peg$c73;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parseEscapeSequence();
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c75(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseLineContinuation();
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseCharacterClassMatcher() {
	      var s0, s1, s2, s3, s4, s5;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 91) {
	        s1 = peg$c92;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c93); }
	      }
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 94) {
	          s2 = peg$c94;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c95); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = null;
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = [];
	          s4 = peg$parseClassCharacterRange();
	          if (s4 === peg$FAILED) {
	            s4 = peg$parseClassCharacter();
	          }
	          while (s4 !== peg$FAILED) {
	            s3.push(s4);
	            s4 = peg$parseClassCharacterRange();
	            if (s4 === peg$FAILED) {
	              s4 = peg$parseClassCharacter();
	            }
	          }
	          if (s3 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 93) {
	              s4 = peg$c96;
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c97); }
	            }
	            if (s4 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 105) {
	                s5 = peg$c81;
	                peg$currPos++;
	              } else {
	                s5 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c82); }
	              }
	              if (s5 === peg$FAILED) {
	                s5 = null;
	              }
	              if (s5 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c98(s2, s3, s5);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c91); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseClassCharacterRange() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parseClassCharacter();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 45) {
	          s2 = peg$c99;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c100); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parseClassCharacter();
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c101(s1, s3);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseClassCharacter() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      peg$silentFails++;
	      if (input.charCodeAt(peg$currPos) === 93) {
	        s2 = peg$c96;
	        peg$currPos++;
	      } else {
	        s2 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c97); }
	      }
	      if (s2 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s2 = peg$c73;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s2 === peg$FAILED) {
	          s2 = peg$parseLineTerminator();
	        }
	      }
	      peg$silentFails--;
	      if (s2 === peg$FAILED) {
	        s1 = void 0;
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseSourceCharacter();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c90();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 92) {
	          s1 = peg$c73;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c74); }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parseEscapeSequence();
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c75(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseLineContinuation();
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLineContinuation() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 92) {
	        s1 = peg$c73;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c74); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseLineTerminatorSequence();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c102();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseEscapeSequence() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$parseCharacterEscapeSequence();
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 48) {
	          s1 = peg$c103;
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c104); }
	        }
	        if (s1 !== peg$FAILED) {
	          s2 = peg$currPos;
	          peg$silentFails++;
	          s3 = peg$parseDecimalDigit();
	          peg$silentFails--;
	          if (s3 === peg$FAILED) {
	            s2 = void 0;
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	          if (s2 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c105();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$parseHexEscapeSequence();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parseUnicodeEscapeSequence();
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseCharacterEscapeSequence() {
	      var s0;
	
	      s0 = peg$parseSingleEscapeCharacter();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseNonEscapeCharacter();
	      }
	
	      return s0;
	    }
	
	    function peg$parseSingleEscapeCharacter() {
	      var s0, s1;
	
	      if (input.charCodeAt(peg$currPos) === 39) {
	        s0 = peg$c88;
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c89); }
	      }
	      if (s0 === peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 34) {
	          s0 = peg$c85;
	          peg$currPos++;
	        } else {
	          s0 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c86); }
	        }
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 92) {
	            s0 = peg$c73;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c74); }
	          }
	          if (s0 === peg$FAILED) {
	            s0 = peg$currPos;
	            if (input.charCodeAt(peg$currPos) === 98) {
	              s1 = peg$c106;
	              peg$currPos++;
	            } else {
	              s1 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c107); }
	            }
	            if (s1 !== peg$FAILED) {
	              peg$savedPos = s0;
	              s1 = peg$c108();
	            }
	            s0 = s1;
	            if (s0 === peg$FAILED) {
	              s0 = peg$currPos;
	              if (input.charCodeAt(peg$currPos) === 102) {
	                s1 = peg$c109;
	                peg$currPos++;
	              } else {
	                s1 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c110); }
	              }
	              if (s1 !== peg$FAILED) {
	                peg$savedPos = s0;
	                s1 = peg$c111();
	              }
	              s0 = s1;
	              if (s0 === peg$FAILED) {
	                s0 = peg$currPos;
	                if (input.charCodeAt(peg$currPos) === 110) {
	                  s1 = peg$c112;
	                  peg$currPos++;
	                } else {
	                  s1 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c113); }
	                }
	                if (s1 !== peg$FAILED) {
	                  peg$savedPos = s0;
	                  s1 = peg$c114();
	                }
	                s0 = s1;
	                if (s0 === peg$FAILED) {
	                  s0 = peg$currPos;
	                  if (input.charCodeAt(peg$currPos) === 114) {
	                    s1 = peg$c115;
	                    peg$currPos++;
	                  } else {
	                    s1 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c116); }
	                  }
	                  if (s1 !== peg$FAILED) {
	                    peg$savedPos = s0;
	                    s1 = peg$c117();
	                  }
	                  s0 = s1;
	                  if (s0 === peg$FAILED) {
	                    s0 = peg$currPos;
	                    if (input.charCodeAt(peg$currPos) === 116) {
	                      s1 = peg$c118;
	                      peg$currPos++;
	                    } else {
	                      s1 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c119); }
	                    }
	                    if (s1 !== peg$FAILED) {
	                      peg$savedPos = s0;
	                      s1 = peg$c120();
	                    }
	                    s0 = s1;
	                    if (s0 === peg$FAILED) {
	                      s0 = peg$currPos;
	                      if (input.charCodeAt(peg$currPos) === 118) {
	                        s1 = peg$c121;
	                        peg$currPos++;
	                      } else {
	                        s1 = peg$FAILED;
	                        if (peg$silentFails === 0) { peg$fail(peg$c122); }
	                      }
	                      if (s1 !== peg$FAILED) {
	                        peg$savedPos = s0;
	                        s1 = peg$c123();
	                      }
	                      s0 = s1;
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseNonEscapeCharacter() {
	      var s0, s1, s2;
	
	      s0 = peg$currPos;
	      s1 = peg$currPos;
	      peg$silentFails++;
	      s2 = peg$parseEscapeCharacter();
	      if (s2 === peg$FAILED) {
	        s2 = peg$parseLineTerminator();
	      }
	      peg$silentFails--;
	      if (s2 === peg$FAILED) {
	        s1 = void 0;
	      } else {
	        peg$currPos = s1;
	        s1 = peg$FAILED;
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseSourceCharacter();
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c90();
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseEscapeCharacter() {
	      var s0;
	
	      s0 = peg$parseSingleEscapeCharacter();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parseDecimalDigit();
	        if (s0 === peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 120) {
	            s0 = peg$c124;
	            peg$currPos++;
	          } else {
	            s0 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c125); }
	          }
	          if (s0 === peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 117) {
	              s0 = peg$c126;
	              peg$currPos++;
	            } else {
	              s0 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c127); }
	            }
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseHexEscapeSequence() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 120) {
	        s1 = peg$c124;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c125); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$currPos;
	        s4 = peg$parseHexDigit();
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseHexDigit();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = input.substring(s2, peg$currPos);
	        } else {
	          s2 = s3;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c128(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseUnicodeEscapeSequence() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 117) {
	        s1 = peg$c126;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c127); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        s3 = peg$currPos;
	        s4 = peg$parseHexDigit();
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseHexDigit();
	          if (s5 !== peg$FAILED) {
	            s6 = peg$parseHexDigit();
	            if (s6 !== peg$FAILED) {
	              s7 = peg$parseHexDigit();
	              if (s7 !== peg$FAILED) {
	                s4 = [s4, s5, s6, s7];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        if (s3 !== peg$FAILED) {
	          s2 = input.substring(s2, peg$currPos);
	        } else {
	          s2 = s3;
	        }
	        if (s2 !== peg$FAILED) {
	          peg$savedPos = s0;
	          s1 = peg$c128(s2);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDecimalDigit() {
	      var s0;
	
	      if (peg$c129.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c130); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseHexDigit() {
	      var s0;
	
	      if (peg$c131.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c132); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseAnyMatcher() {
	      var s0, s1;
	
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 46) {
	        s1 = peg$c133;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c134); }
	      }
	      if (s1 !== peg$FAILED) {
	        peg$savedPos = s0;
	        s1 = peg$c135();
	      }
	      s0 = s1;
	
	      return s0;
	    }
	
	    function peg$parseCodeBlock() {
	      var s0, s1, s2, s3;
	
	      peg$silentFails++;
	      s0 = peg$currPos;
	      if (input.charCodeAt(peg$currPos) === 123) {
	        s1 = peg$c137;
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c138); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parseCode();
	        if (s2 !== peg$FAILED) {
	          if (input.charCodeAt(peg$currPos) === 125) {
	            s3 = peg$c139;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c140); }
	          }
	          if (s3 !== peg$FAILED) {
	            peg$savedPos = s0;
	            s1 = peg$c141(s2);
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      peg$silentFails--;
	      if (s0 === peg$FAILED) {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c136); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseCode() {
	      var s0, s1, s2, s3, s4, s5;
	
	      s0 = peg$currPos;
	      s1 = [];
	      s2 = [];
	      s3 = peg$currPos;
	      s4 = peg$currPos;
	      peg$silentFails++;
	      if (peg$c142.test(input.charAt(peg$currPos))) {
	        s5 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s5 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c143); }
	      }
	      peg$silentFails--;
	      if (s5 === peg$FAILED) {
	        s4 = void 0;
	      } else {
	        peg$currPos = s4;
	        s4 = peg$FAILED;
	      }
	      if (s4 !== peg$FAILED) {
	        s5 = peg$parseSourceCharacter();
	        if (s5 !== peg$FAILED) {
	          s4 = [s4, s5];
	          s3 = s4;
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s3;
	        s3 = peg$FAILED;
	      }
	      if (s3 !== peg$FAILED) {
	        while (s3 !== peg$FAILED) {
	          s2.push(s3);
	          s3 = peg$currPos;
	          s4 = peg$currPos;
	          peg$silentFails++;
	          if (peg$c142.test(input.charAt(peg$currPos))) {
	            s5 = input.charAt(peg$currPos);
	            peg$currPos++;
	          } else {
	            s5 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c143); }
	          }
	          peg$silentFails--;
	          if (s5 === peg$FAILED) {
	            s4 = void 0;
	          } else {
	            peg$currPos = s4;
	            s4 = peg$FAILED;
	          }
	          if (s4 !== peg$FAILED) {
	            s5 = peg$parseSourceCharacter();
	            if (s5 !== peg$FAILED) {
	              s4 = [s4, s5];
	              s3 = s4;
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        }
	      } else {
	        s2 = peg$FAILED;
	      }
	      if (s2 === peg$FAILED) {
	        s2 = peg$currPos;
	        if (input.charCodeAt(peg$currPos) === 123) {
	          s3 = peg$c137;
	          peg$currPos++;
	        } else {
	          s3 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c138); }
	        }
	        if (s3 !== peg$FAILED) {
	          s4 = peg$parseCode();
	          if (s4 !== peg$FAILED) {
	            if (input.charCodeAt(peg$currPos) === 125) {
	              s5 = peg$c139;
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c140); }
	            }
	            if (s5 !== peg$FAILED) {
	              s3 = [s3, s4, s5];
	              s2 = s3;
	            } else {
	              peg$currPos = s2;
	              s2 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	      }
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        s2 = [];
	        s3 = peg$currPos;
	        s4 = peg$currPos;
	        peg$silentFails++;
	        if (peg$c142.test(input.charAt(peg$currPos))) {
	          s5 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s5 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c143); }
	        }
	        peg$silentFails--;
	        if (s5 === peg$FAILED) {
	          s4 = void 0;
	        } else {
	          peg$currPos = s4;
	          s4 = peg$FAILED;
	        }
	        if (s4 !== peg$FAILED) {
	          s5 = peg$parseSourceCharacter();
	          if (s5 !== peg$FAILED) {
	            s4 = [s4, s5];
	            s3 = s4;
	          } else {
	            peg$currPos = s3;
	            s3 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s3;
	          s3 = peg$FAILED;
	        }
	        if (s3 !== peg$FAILED) {
	          while (s3 !== peg$FAILED) {
	            s2.push(s3);
	            s3 = peg$currPos;
	            s4 = peg$currPos;
	            peg$silentFails++;
	            if (peg$c142.test(input.charAt(peg$currPos))) {
	              s5 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c143); }
	            }
	            peg$silentFails--;
	            if (s5 === peg$FAILED) {
	              s4 = void 0;
	            } else {
	              peg$currPos = s4;
	              s4 = peg$FAILED;
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parseSourceCharacter();
	              if (s5 !== peg$FAILED) {
	                s4 = [s4, s5];
	                s3 = s4;
	              } else {
	                peg$currPos = s3;
	                s3 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s3;
	              s3 = peg$FAILED;
	            }
	          }
	        } else {
	          s2 = peg$FAILED;
	        }
	        if (s2 === peg$FAILED) {
	          s2 = peg$currPos;
	          if (input.charCodeAt(peg$currPos) === 123) {
	            s3 = peg$c137;
	            peg$currPos++;
	          } else {
	            s3 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c138); }
	          }
	          if (s3 !== peg$FAILED) {
	            s4 = peg$parseCode();
	            if (s4 !== peg$FAILED) {
	              if (input.charCodeAt(peg$currPos) === 125) {
	                s5 = peg$c139;
	                peg$currPos++;
	              } else {
	                s5 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c140); }
	              }
	              if (s5 !== peg$FAILED) {
	                s3 = [s3, s4, s5];
	                s2 = s3;
	              } else {
	                peg$currPos = s2;
	                s2 = peg$FAILED;
	              }
	            } else {
	              peg$currPos = s2;
	              s2 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s2;
	            s2 = peg$FAILED;
	          }
	        }
	      }
	      if (s1 !== peg$FAILED) {
	        s0 = input.substring(s0, peg$currPos);
	      } else {
	        s0 = s1;
	      }
	
	      return s0;
	    }
	
	    function peg$parseLl() {
	      var s0;
	
	      if (peg$c144.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c145); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLm() {
	      var s0;
	
	      if (peg$c146.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c147); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLo() {
	      var s0;
	
	      if (peg$c148.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c149); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLt() {
	      var s0;
	
	      if (peg$c150.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c151); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseLu() {
	      var s0;
	
	      if (peg$c152.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c153); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseMc() {
	      var s0;
	
	      if (peg$c154.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c155); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseMn() {
	      var s0;
	
	      if (peg$c156.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c157); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseNd() {
	      var s0;
	
	      if (peg$c158.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c159); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseNl() {
	      var s0;
	
	      if (peg$c160.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c161); }
	      }
	
	      return s0;
	    }
	
	    function peg$parsePc() {
	      var s0;
	
	      if (peg$c162.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c163); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseZs() {
	      var s0;
	
	      if (peg$c164.test(input.charAt(peg$currPos))) {
	        s0 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s0 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c165); }
	      }
	
	      return s0;
	    }
	
	    function peg$parseBreakToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c166) {
	        s1 = peg$c166;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c167); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseCaseToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c168) {
	        s1 = peg$c168;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c169); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseCatchToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c170) {
	        s1 = peg$c170;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c171); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseClassToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c172) {
	        s1 = peg$c172;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c173); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseConstToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c174) {
	        s1 = peg$c174;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c175); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseContinueToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 8) === peg$c176) {
	        s1 = peg$c176;
	        peg$currPos += 8;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c177); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDebuggerToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 8) === peg$c178) {
	        s1 = peg$c178;
	        peg$currPos += 8;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c179); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDefaultToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 7) === peg$c180) {
	        s1 = peg$c180;
	        peg$currPos += 7;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c181); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDeleteToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c182) {
	        s1 = peg$c182;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c183); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseDoToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c184) {
	        s1 = peg$c184;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c185); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseElseToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c186) {
	        s1 = peg$c186;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c187); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseEnumToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c188) {
	        s1 = peg$c188;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c189); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseExportToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c190) {
	        s1 = peg$c190;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c191); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseExtendsToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 7) === peg$c192) {
	        s1 = peg$c192;
	        peg$currPos += 7;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c193); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseFalseToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c194) {
	        s1 = peg$c194;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c195); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseFinallyToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 7) === peg$c196) {
	        s1 = peg$c196;
	        peg$currPos += 7;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c197); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseForToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 3) === peg$c198) {
	        s1 = peg$c198;
	        peg$currPos += 3;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c199); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseFunctionToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 8) === peg$c200) {
	        s1 = peg$c200;
	        peg$currPos += 8;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c201); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseIfToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c202) {
	        s1 = peg$c202;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c203); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseImportToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c204) {
	        s1 = peg$c204;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c205); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseInstanceofToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 10) === peg$c206) {
	        s1 = peg$c206;
	        peg$currPos += 10;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c207); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseInToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 2) === peg$c208) {
	        s1 = peg$c208;
	        peg$currPos += 2;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c209); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseNewToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 3) === peg$c210) {
	        s1 = peg$c210;
	        peg$currPos += 3;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c211); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseNullToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c212) {
	        s1 = peg$c212;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c213); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseReturnToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c214) {
	        s1 = peg$c214;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c215); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSuperToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c216) {
	        s1 = peg$c216;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c217); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseSwitchToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c218) {
	        s1 = peg$c218;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c219); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseThisToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c220) {
	        s1 = peg$c220;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c221); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseThrowToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c222) {
	        s1 = peg$c222;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c223); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseTrueToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c224) {
	        s1 = peg$c224;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c225); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseTryToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 3) === peg$c226) {
	        s1 = peg$c226;
	        peg$currPos += 3;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c227); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseTypeofToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 6) === peg$c228) {
	        s1 = peg$c228;
	        peg$currPos += 6;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c229); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseVarToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 3) === peg$c230) {
	        s1 = peg$c230;
	        peg$currPos += 3;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c231); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseVoidToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c232) {
	        s1 = peg$c232;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c233); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseWhileToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 5) === peg$c234) {
	        s1 = peg$c234;
	        peg$currPos += 5;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c235); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parseWithToken() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      if (input.substr(peg$currPos, 4) === peg$c236) {
	        s1 = peg$c236;
	        peg$currPos += 4;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c237); }
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$currPos;
	        peg$silentFails++;
	        s3 = peg$parseIdentifierPart();
	        peg$silentFails--;
	        if (s3 === peg$FAILED) {
	          s2 = void 0;
	        } else {
	          peg$currPos = s2;
	          s2 = peg$FAILED;
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	    function peg$parse__() {
	      var s0, s1;
	
	      s0 = [];
	      s1 = peg$parseWhiteSpace();
	      if (s1 === peg$FAILED) {
	        s1 = peg$parseLineTerminatorSequence();
	        if (s1 === peg$FAILED) {
	          s1 = peg$parseComment();
	        }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        s1 = peg$parseWhiteSpace();
	        if (s1 === peg$FAILED) {
	          s1 = peg$parseLineTerminatorSequence();
	          if (s1 === peg$FAILED) {
	            s1 = peg$parseComment();
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parse_() {
	      var s0, s1;
	
	      s0 = [];
	      s1 = peg$parseWhiteSpace();
	      if (s1 === peg$FAILED) {
	        s1 = peg$parseMultiLineCommentNoLineTerminator();
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        s1 = peg$parseWhiteSpace();
	        if (s1 === peg$FAILED) {
	          s1 = peg$parseMultiLineCommentNoLineTerminator();
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseEOS() {
	      var s0, s1, s2, s3;
	
	      s0 = peg$currPos;
	      s1 = peg$parse__();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 59) {
	          s2 = peg$c238;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c239); }
	        }
	        if (s2 !== peg$FAILED) {
	          s1 = [s1, s2];
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parse_();
	        if (s1 !== peg$FAILED) {
	          s2 = peg$parseSingleLineComment();
	          if (s2 === peg$FAILED) {
	            s2 = null;
	          }
	          if (s2 !== peg$FAILED) {
	            s3 = peg$parseLineTerminatorSequence();
	            if (s3 !== peg$FAILED) {
	              s1 = [s1, s2, s3];
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$FAILED;
	        }
	        if (s0 === peg$FAILED) {
	          s0 = peg$currPos;
	          s1 = peg$parse__();
	          if (s1 !== peg$FAILED) {
	            s2 = peg$parseEOF();
	            if (s2 !== peg$FAILED) {
	              s1 = [s1, s2];
	              s0 = s1;
	            } else {
	              peg$currPos = s0;
	              s0 = peg$FAILED;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$FAILED;
	          }
	        }
	      }
	
	      return s0;
	    }
	
	    function peg$parseEOF() {
	      var s0, s1;
	
	      s0 = peg$currPos;
	      peg$silentFails++;
	      if (input.length > peg$currPos) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c34); }
	      }
	      peg$silentFails--;
	      if (s1 === peg$FAILED) {
	        s0 = void 0;
	      } else {
	        peg$currPos = s0;
	        s0 = peg$FAILED;
	      }
	
	      return s0;
	    }
	
	
	      var OPS_TO_PREFIXED_TYPES = {
	        "$": "text",
	        "&": "simple_and",
	        "!": "simple_not"
	      };
	
	      var OPS_TO_SUFFIXED_TYPES = {
	        "?": "optional",
	        "*": "zero_or_more",
	        "+": "one_or_more"
	      };
	
	      var OPS_TO_SEMANTIC_PREDICATE_TYPES = {
	        "&": "semantic_and",
	        "!": "semantic_not"
	      };
	
	      function filterEmptyStrings(array) {
	        var result = [], i;
	
	        for (i = 0; i < array.length; i++) {
	          if (array[i] !== "") {
	            result.push(array[i]);
	          }
	        }
	
	        return result;
	      }
	
	      function extractOptional(optional, index) {
	        return optional ? optional[index] : null;
	      }
	
	      function extractList(list, index) {
	        var result = new Array(list.length), i;
	
	        for (i = 0; i < list.length; i++) {
	          result[i] = list[i][index];
	        }
	
	        return result;
	      }
	
	      function buildList(first, rest, index) {
	        return [first].concat(extractList(rest, index));
	      }
	
	
	    peg$result = peg$startRuleFunction();
	
	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail({ type: "end", description: "end of input" });
	      }
	
	      throw peg$buildException(
	        null,
	        peg$maxFailExpected,
	        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
	        peg$maxFailPos < input.length
	          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
	          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
	      );
	    }
	  }
	
	  return {
	    SyntaxError: peg$SyntaxError,
	    parse:       peg$parse
	  };
	})();


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var arrays  = __webpack_require__(3),
	    objects = __webpack_require__(31);
	
	var PEG = {
	  /* PEG.js version (uses semantic versioning). */
	  VERSION: "0.9.0",
	
	  GrammarError: __webpack_require__(30),
	  parser:       __webpack_require__(103),
	  compiler:     __webpack_require__(96),
	
	  /*
	   * Generates a parser from a specified grammar and returns it.
	   *
	   * The grammar must be a string in the format described by the metagramar in
	   * the parser.pegjs file.
	   *
	   * Throws |PEG.parser.SyntaxError| if the grammar contains a syntax error or
	   * |PEG.GrammarError| if it contains a semantic error. Note that not all
	   * errors are detected during the generation and some may protrude to the
	   * generated parser and cause its malfunction.
	   */
	  buildParser: function(grammar) {
	    function convertPasses(passes) {
	      var converted = {}, stage;
	
	      for (stage in passes) {
	        if (passes.hasOwnProperty(stage)) {
	          converted[stage] = objects.values(passes[stage]);
	        }
	      }
	
	      return converted;
	    }
	
	    var options = arguments.length > 1 ? objects.clone(arguments[1]) : {},
	        plugins = "plugins" in options ? options.plugins : [],
	        config  = {
	          parser: this.parser,
	          passes: convertPasses(this.compiler.passes)
	        };
	
	    arrays.each(plugins, function(p) { p.use(config, options); });
	
	    return this.compiler.compile(
	      config.parser.parse(grammar),
	      config.passes,
	      options
	    );
	  }
	};
	
	module.exports = PEG;


/***/ },
/* 105 */
/***/ function(module, exports) {

	"use strict";
	
	/* Class utilities */
	var classes = {
	  subclass: function(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }
	};
	
	module.exports = classes;


/***/ },
/* 106 */
/***/ function(module, exports) {

	module.exports = "{\n\tconst STEP_NUMBER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];\n\tvar currentMeasureNumber = 1;\n\tvar currentOctave        = 5;\n\tvar currentDuration      = '4';\n\tvar accidentalRecord     = []; // stepNumber: { octave: 4 }\n\tvar noteIdCounter = 0, lastNoteNumber = 0;\n\t\n\tfunction addPartToMeasures(part, measures) {\n\t\tmeasures[part.measureNumber-1] = measures[part.measureNumber-1] || [];\n\t\tmeasures[part.measureNumber-1].push(part);\n\t}\n\n\tfunction createNote(name, octave, duration, isConsecutive) {\n\t\tlet note = {\n\t\t\tnoteId: noteIdCounter,\n\t\t\tname: name,\n\t\t\tduration: duration !== null ? duration : currentDuration\n\t\t};\n\n\t\tif (name !== 'O') {\n\t\t\toctave = octave !== null ? octave : currentOctave;\n\n\t\t\tlet stepName = name[0];\n\t\t\tlet accidental = name[1];\n\t\t\tlet noteNumber = STEP_NUMBER.findIndex(v => v === stepName);\n\n\t\t\tswitch (accidental) {\n\t\t\t\tcase 'b':\n\t\t\t\t\taccidentalRecord[`${stepName},${octave}`] = -1;\n\t\t\t\t\tnoteNumber -= 1;\n\t\t\t\t\tconsole.log(note);\n\t\t\t\t\tbreak;\n\t\t\t\tcase '#':\n\t\t\t\t\taccidentalRecord[`${stepName},${octave}`] = 1;\n\t\t\t\t\tnoteNumber +=1;\n\t\t\t\t\tbreak;\n\t\t\t\tcase 'n':\n\t\t\t\t\taccidentalRecord[`${stepName},${octave}`] = 0;\n\t\t\t\t\tbreak;\n\t\t\t\tcase undefined:\n\t\t\t\t\tnoteNumber += accidentalRecord[`${stepName},${octave}`] || 0;\n\t\t\t\t\tbreak;\n\t\t\t\tdefault:\n\t\t\t\t\texpected('accidental to be b / # / n');\n\t\t\t}\n\t\t\n\t\t\tnote.octave = octave;\n\t\t\tnote.noteNumber = noteNumber + octave * 12;\n\t\t\t\n\t\t\tif (isConsecutive) {\n\t\t\t\tif (note.noteNumber < lastNoteNumber) {\n\t\t\t\t\tnote.octave += 1;\n\t\t\t\t\tnote.noteNumber += 12;\n\t\t\t\t}\n\n\t\t\t\tlastNoteNumber = note.noteNumber;\n\t\t\t} else {\n\t\t\t\tresetLastNote();\n\t\t\t}\n\t\t}\n\t\n\t\tnoteIdCounter += 1;\n\t\tcurrentOctave = note.octave;\n\t\tcurrentDuration = note.duration;\n\t\n\t\treturn note;\n\t}\n\t\n\tfunction resetLastNote() {\n\t\tlastNoteNumber = 0;\n\t}\n}\n\nStart =\n\tparts: Part+ {\n\t\tvar measures = [];\n\t\tparts.forEach(v => addPartToMeasures(v, measures));\n\n\t\treturn measures;\n\t}\n\nPart \"part\" =\n\tmeasureNumber:(NonZeroInt / \"-\") stave:(\"T\" / \"B\") clef:(\"T\" / \"B\") \"|\" _ notes:Note+ _ \"|\"? _ {\n\t\treturn {\n\t\t\tmeasureNumber: measureNumber === '-' ? currentMeasureNumber : measureNumber,\n\t\t\tstave: stave == 'T' ? 'TOP' : 'BOTTOM',\n\t\t\tclef: clef == 'B' ? 'BASS' : 'TREBLE',\n\t\t\tnotes: notes\n\t\t}\n\t}\n\nOctave \"octave\" =\n\t_ octave:(\"^\"+ / \"_\"+ / \"=\") _ {\n\n\t\tif (octave === '=') {\n\t\t\toctave = 5;\n\t\t} else if (octave.length <= 5) {\n\t\t\toctave = currentOctave + octave.length * (octave[0] === '^' ? 1 : -1);\n\t\t} else {\n\t\t\texpected(`octave indicator, got \"${octave}\"`);\n\t\t}\n\t\t\n\t\treturn octave;\n\t}\n\nToken =\n\tCommand\n\t/ Note\n\nCommand \"command\" =\n\tBeamCommand\n\nBeamCommand =\n\t_ \"beam:\" beat:NonZeroInt \"/\" noteValue:NonZeroInt  _ {\n\t\treturn {\n\t\t\tcommand: 'beam',\n\t\t\tbeat: beat,\n\t\t\tnoteValue: noteValue\n\t\t};\n\t}\n\nNote \"note\" =\n\t_ octave:Octave? notes:(NoteGroup / NoteName) duration:Duration? _ {\n\t\t\tif (Array.isArray(notes)) {\n\t\t\t\tnotes = notes.reduce((r, name) => {\n\t\t\t\t\tlet note = createNote(name, octave, duration, true);\n\n\t\t\t\t\tr.push(note);\n\n\t\t\t\t\treturn r;\n\t\t\t\t}, []);\n\t\t\t} else {\n\t\t\t\tnotes = [createNote(notes, octave, duration)];\n\t\t\t}\n\n\t\t\tresetLastNote();\n\n\t\t\treturn notes;\n\t\t}\n\nNoteGroup \"note-group\" =\n\thead:(NoteName \"-\")+ tail:NoteName {\n\t\tvar result = [];\n\t\n\t\tfor (var i = 0; i < head.length; ++i) {\n\t\t\tresult.push(head[i][0]);\n\t\t}\n\n\t\tresult.push(tail);\n\t\t\n\t\treturn result;\n\t}\n\nNoteName \"note-name\" =\n\tname:[a-gA-G] accidental:[b#]? {\n\t\taccidental = accidental ? accidental : '';\n\t\treturn name.toUpperCase()+accidental;\n\t}\n\t/ Rest\n\nRest \"rest\" =\n\trest:\"o\" { return rest.toUpperCase(); }\n\nDuration \"duration\" =\n\tduration:(\"32\" / \"16\" / \"8\" / \"4\" / \"2\" / \"1\") dots:\".\"* { \n\t\tdots = dots === null ? '' : dots;\n\n\t\tif (dots.length > 3) {\n\t\t\texpected('3 dots maximum.');\n\t\t}\n\n\t\treturn duration + dots;\n\t}\n\nNonZeroInt =\n\t[1-9] Int* { return parseInt(text(), 10); }\n\nInt =\n\t[0-9]\n\n_ =\n\t[ \\s\\t\\r\\n]*\n"

/***/ },
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	'use strict';
	
	var peg = __webpack_require__(104);
	
	let parser = peg.buildParser(__webpack_require__(106), {trace: true});
	
	module.exports = parser;


/***/ },
/* 115 */,
/* 116 */,
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./basic.spec.js": 118,
		"./parser.spec.js": 119,
		"./performance.spec.js": 120
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 117;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	/* globals describe, it, expect */
	'use strict';
	
	var { Effects, loop } = __webpack_require__(4);
	
	var API = __webpack_require__(6);
	var { reducer, reducerMap } = __webpack_require__(32);
	/*
	
		START_APP: createAction('START_APP'),
		GRANT_MIDI_ACCESS: createAction('GRANT_MIDI_ACCESS'),
		POLL_MIDI_INPUT: createAction('POLL_MIDI_INPUT'),
		UPDATE_MIDI_INPUT: createAction('UPDATE_MIDI_INPUT'),
		LIST_MIDI_INPUTS: createAction('LIST_MIDI_INPUTS'),
		RECEIVE_MIDI_NOTE: null,
		LOG: null
	*/
	describe('START_APP', () => {
		it('should not alter state', () => {
			let result = reducer({whatever: 'whatever'}, API.START_APP());
			let expected = {whatever: 'whatever'};
			
			//expect(result).toEqual(expected);
		});
	});
	


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	/* globals jasmine, beforeEach, describe, it, expect */
	'use strict';
	
	var jsondiffpatch = __webpack_require__(28);
	var formatters = __webpack_require__(18);
	var trace = __webpack_require__(94);
	
	var parser = __webpack_require__(114);
	
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


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	/* jslint browser: true, node: true, sub: true, esversion: 6 */
	/* globals describe, it, expect, before, beforeEach */
	'use strict';
	
	var { Effects, loop } = __webpack_require__(4);
	
	var API = __webpack_require__(6);
	var { reducer, reducerMap } = __webpack_require__(32);
	
	describe('TRACK_MIDI_NOTE', () => {
		var state;
		var notePressed, notePerformed, notesOfCurrentBeat;
		var expectedBeat;
		var result, expectedResult;
	
		beforeEach(() => {
			notePerformed = [];
			notePerformed[55] = {
				noteId: 2,
				pressed: true
			};
			
			notesOfCurrentBeat = [];
			notesOfCurrentBeat[48] = createNote(0, 'C', 4, 48, 4);
			notesOfCurrentBeat[52] = createNote(1, 'E', 4, 52, 4);
			notesOfCurrentBeat[55] = createNote(2, 'G', 4, 55, 4);
	
			state = {
				config: {
					samplingRate: 100
				},
				score: {
					beats: [
						notesOfCurrentBeat
					]
				},
				performance: {
					currentBeat: 0,
					noteSeq: [
						[createMIDINote('NOTE_ON', 55, 60, 1000)]
					],
					beats: [
						notePerformed
					]
				}
			};
	
			Object.freeze(state);
		});
	
		describe('when score[c-d-e], seq[d], perf[d:true] | quickly pressed [c]', () => {
			beforeEach(() => {
				notePressed = createMIDINote('NOTE_ON', 48, 60, 1100);
				result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
			});
	
			it('should set seq [c,d]', () => {
				expectedResult = {
					noteSeq: [ state.performance.noteSeq[0].concat(notePressed) ]
				};
	
				expect(result.performance.noteSeq).toEqual(expectedResult.noteSeq);
			});
	
			it('should set perf [c:true,d:true]', () => {
				expectedBeat = [];
				expectedBeat[48] = {
					noteId: 0,
					pressed: true
				};
	
				expectedResult = {
					performance: {
						beats: [
							Object.assign([], state.performance.beats[0], expectedBeat)
						]
					}			
				};
	
				expect(result.performance.beats).toEqual(expectedResult.performance.beats);
			});
			
			it('should not advance beat counter', () => {
				expect(result.performance.currentBeat).toBe(state.performance.currentBeat);
			});
		});
	
		describe('when score[c-d-e], seq[d], perf[d:true] | slowly pressed [c]', () => {
			beforeEach(() => {
				notePressed = createMIDINote('NOTE_ON', 48, 60, 1105);
				result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
			});
	
			it('should not change seq', () => {
				expect(result.performance.noteSeq).toEqual(state.performance.noteSeq);
			});
	
			it('should not change perf', () => {
				expect(result.performance.beats).toEqual(state.performance.beats);
			});
			
			it('should not advance beat counter', () => {
				expect(result.performance.currentBeat).toBe(state.performance.currentBeat);
			});
		});
		
		describe('when score[c-d-e][a-c], seq[d,e], perf[d:true,e:true] | pressed c', () => {
			beforeEach(() => {
				let newBeat = [];
				newBeat[57] = createNote(3, 'A', 4, 57, 4);
				newBeat[60] = createNote(4, 'C', 4, 60, 4);
	
				state.score.beats.push(newBeat);
	
				state.performance.noteSeq[0] = [
					createMIDINote('NOTE_ON', 50, 60, 1010),
					createMIDINote('NOTE_ON', 52, 60, 1050)
				];
	
				notePressed = createMIDINote('NOTE_ON', 57, 60, 2000);
	
				result = reducer(state, API.TRACK_MIDI_NOTE(notePressed));
			});
	
			it('should set seq[d,e][c]', () => {
				let expectedNoteSeq = [
					state.performance.noteSeq[0],
					[createMIDINote('NOTE_ON', 57, 60, 2000)]
				];
	
				expect(result.performance.noteSeq).toEqual(expectedNoteSeq);
			});
	
			it('should set perf[d,e][c:true]', () => {
				let expectedPerfBeats = [
					state.performance.beats[0],
					[]
				];
	
				expectedPerfBeats[1][57] = {
					pressed: true,
					noteId: 3
				};
	
				expect(result.performance.beats).toEqual(expectedPerfBeats);
			});
			
			it('should advance beat counter', () => {
				expect(result.performance.currentBeat).toBe(state.performance.currentBeat+1);
			});
		});
	});
	
	function createNote(i, n, o, nn, d) {
		return {
			noteId: i,
			name: n,
			octave: o,
			noteNumber: nn,
			duration: d
		};
	}
	
	function createMIDINote(t, nn, vl, time) {
		 return {
		 	 type: t,
			 noteNumber: nn,
			 velocity: vl,
			 receivedTime: time
		 };
	}


/***/ }
/******/ ]);
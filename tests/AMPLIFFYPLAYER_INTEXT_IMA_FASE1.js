(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
(function (global){(function (){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":5,"ieee754":10}],6:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],7:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],8:[function(require,module,exports){
(function (global){(function (){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
var http = require('http')
var url = require('url')

var https = module.exports

for (var key in http) {
  if (http.hasOwnProperty(key)) https[key] = http[key]
}

https.request = function (params, cb) {
  params = validateParams(params)
  return http.request.call(this, params, cb)
}

https.get = function (params, cb) {
  params = validateParams(params)
  return http.get.call(this, params, cb)
}

function validateParams (params) {
  if (typeof params === 'string') {
    params = url.parse(params)
  }
  if (!params.protocol) {
    params.protocol = 'https:'
  }
  if (params.protocol !== 'https:') {
    throw new Error('Protocol "' + params.protocol + '" not supported. Expected "https:"')
  }
  return params
}

},{"http":17,"url":37}],10:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
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
    var timeout = runTimeout(cleanUpNextTick);
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
    runClearTimeout(timeout);
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
        runTimeout(drainQueue);
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],15:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":13,"./encode":14}],16:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":5}],17:[function(require,module,exports){
(function (global){(function (){
var ClientRequest = require('./lib/request')
var response = require('./lib/response')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.ClientRequest = ClientRequest
http.IncomingMessage = response.IncomingMessage

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.globalAgent = new http.Agent()

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":19,"./lib/response":20,"builtin-status-codes":6,"url":37,"xtend":44}],18:[function(require,module,exports){
(function (global){(function (){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.writableStream = isFunction(global.WritableStream)

exports.abortController = isFunction(global.AbortController)

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || checkTypeSupport('arraybuffer')

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (process,global,Buffer){(function (){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + Buffer.from(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || ('requestTimeout' in opts && !capability.abortController)) {
		// If the use of XHR should be preferred. Not typically needed.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)
	self._fetchTimer = null
	self._socketTimeout = null
	self._socketTimer = null

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var header = this._headers[name.toLowerCase()]
	if (header)
		return header.value
	return null
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	if ('timeout' in opts && opts.timeout !== 0) {
		self.setTimeout(opts.timeout)
	}

	var headersObj = self._headers
	var body = null
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
        body = new Blob(self._body, {
            type: (headersObj['content-type'] || {}).value || ''
        });
    }

	// create flattened list of headers
	var headersList = []
	Object.keys(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name
		var value = headersObj[keyName].value
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v])
			})
		} else {
			headersList.push([name, value])
		}
	})

	if (self._mode === 'fetch') {
		var signal = null
		if (capability.abortController) {
			var controller = new AbortController()
			signal = controller.signal
			self._fetchAbortController = controller

			if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
				self._fetchTimer = global.setTimeout(function () {
					self.emit('requestTimeout')
					if (self._fetchAbortController)
						self._fetchAbortController.abort()
				}, opts.requestTimeout)
			}
		}

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin',
			signal: signal
		}).then(function (response) {
			self._fetchResponse = response
			self._resetTimers(false)
			self._connect()
		}, function (reason) {
			self._resetTimers(true)
			if (!self._destroyed)
				self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('requestTimeout' in opts) {
			xhr.timeout = opts.requestTimeout
			xhr.ontimeout = function () {
				self.emit('requestTimeout')
			}
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1])
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self._resetTimers(true)
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	self._resetTimers(false)

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress(self._resetTimers.bind(self))
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode, self._resetTimers.bind(self))
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype._resetTimers = function (done) {
	var self = this

	global.clearTimeout(self._socketTimer)
	self._socketTimer = null

	if (done) {
		global.clearTimeout(self._fetchTimer)
		self._fetchTimer = null
	} else if (self._socketTimeout) {
		self._socketTimer = global.setTimeout(function () {
			self.emit('timeout')
		}, self._socketTimeout)
	}
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function (err) {
	var self = this
	self._destroyed = true
	self._resetTimers(true)
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	else if (self._fetchAbortController)
		self._fetchAbortController.abort()

	if (err)
		self.emit('error', err)
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.setTimeout = function (timeout, cb) {
	var self = this

	if (cb)
		self.once('timeout', cb)

	self._socketTimeout = timeout
	self._resetTimers(false)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'via'
]

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":18,"./response":20,"_process":12,"buffer":5,"inherits":11,"readable-stream":35}],20:[function(require,module,exports){
(function (process,global,Buffer){(function (){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode, resetTimers) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function (header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})

		if (capability.writableStream) {
			var writable = new WritableStream({
				write: function (chunk) {
					resetTimers(false)
					return new Promise(function (resolve, reject) {
						if (self._destroyed) {
							reject()
						} else if(self.push(Buffer.from(chunk))) {
							resolve()
						} else {
							self._resumeFetch = resolve
						}
					})
				},
				close: function () {
					resetTimers(true)
					if (!self._destroyed)
						self.push(null)
				},
				abort: function (err) {
					resetTimers(true)
					if (!self._destroyed)
						self.emit('error', err)
				}
			})

			try {
				response.body.pipeTo(writable).catch(function (err) {
					resetTimers(true)
					if (!self._destroyed)
						self.emit('error', err)
				})
				return
			} catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
		}
		// fallback for when writableStream or pipeTo aren't available
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				resetTimers(result.done)
				if (result.done) {
					self.push(null)
					return
				}
				self.push(Buffer.from(result.value))
				read()
			}).catch(function (err) {
				resetTimers(true)
				if (!self._destroyed)
					self.emit('error', err)
			})
		}
		read()
	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {
	var self = this

	var resolve = self._resumeFetch
	if (resolve) {
		self._resumeFetch = null
		resolve()
	}
}

IncomingMessage.prototype._onXHRProgress = function (resetTimers) {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text':
			response = xhr.responseText
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = Buffer.alloc(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(Buffer.from(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(Buffer.from(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(Buffer.from(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				resetTimers(true)
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		resetTimers(true)
		self.push(null)
	}
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":18,"_process":12,"buffer":5,"inherits":11,"readable-stream":35}],21:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],22:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

module.exports = Duplex;
var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');
require('inherits')(Duplex, Readable);
{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;
    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

// the no-half-open enforcer
function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":24,"./_stream_writable":26,"_process":12,"inherits":11}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;
var Transform = require('./_stream_transform');
require('inherits')(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":25,"inherits":11}],24:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

module.exports = Readable;

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;
var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*<replacement>*/
var debugUtil = require('util');
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/buffer_list');
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

// Lazy loaded to improve the startup performance.
var StringDecoder;
var createReadableStreamAsyncIterator;
var from;
require('inherits')(Readable, Stream);
var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish')
  this.autoDestroy = !!options.autoDestroy;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);

  // legacy
  this.readable = true;
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }
  Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }
  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }
  return er;
}
Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8
  this._readableState.encoding = this._readableState.decoder.encoding;

  // Iterate over current buffer to convert already stored Buffers:
  var p = this._readableState.buffer.head;
  var content = '';
  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }
  this._readableState.buffer.clear();
  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null) this.emit('data', ret);
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state.paused = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState.paused = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;
  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }
    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };
  return this;
};
if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }
    return createReadableStreamAsyncIterator(this);
  };
}
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;
      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}
if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }
    return from(Readable, iterable, opts);
  };
}
function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":21,"./_stream_duplex":22,"./internal/streams/async_iterator":27,"./internal/streams/buffer_list":28,"./internal/streams/destroy":29,"./internal/streams/from":31,"./internal/streams/state":33,"./internal/streams/stream":34,"_process":12,"buffer":5,"events":7,"inherits":11,"string_decoder/":36,"util":2}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;
var _require$codes = require('../errors').codes,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
var Duplex = require('./_stream_duplex');
require('inherits')(Transform, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};
Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};
Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};
function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null)
    // single equals check for both `null` and `undefined`
    stream.push(data);

  // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":21,"./_stream_duplex":22,"inherits":11}],26:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;
  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
require('inherits')(Writable, Stream);
function nop() {}
function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end')
  this.autoDestroy = !!options.autoDestroy;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}
function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);

  // legacy.
  this.writable = true;
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }
  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  // TODO: defer error events consistently everywhere, not just the cb
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var er;
  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }
  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }
  return true;
}
Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);
  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};
Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }
  return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}
function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;
    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }
    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }
    if (entry === null) state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
  return this;
};
Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});
function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      errorOrDestroy(stream, err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;
        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }
  return need;
}
function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}
function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":21,"./_stream_duplex":22,"./internal/streams/destroy":29,"./internal/streams/state":33,"./internal/streams/stream":34,"_process":12,"buffer":5,"inherits":11,"util-deprecate":39}],27:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var finished = require('./end-of-stream');
var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');
function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}
function readAndResolve(iter) {
  var resolve = iter[kLastResolve];
  if (resolve !== null) {
    var data = iter[kStream].read();
    // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'
    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}
function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }
      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },
  next: function next() {
    var _this = this;
    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];
    if (error !== null) {
      return Promise.reject(error);
    }
    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }
    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time
    var lastPromise = this[kLastPromise];
    var promise;
    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();
      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }
      promise = new Promise(this[kHandlePromise]);
    }
    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;
  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;
  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();
      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];
      // reject if we are waiting for data in the Promise
      // returned by next() and store the error
      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }
      iterator[kError] = err;
      return;
    }
    var resolve = iterator[kLastResolve];
    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }
    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};
module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":30,"_process":12}],28:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = require('buffer'),
  Buffer = _require.Buffer;
var _require2 = require('util'),
  inspect = _require2.inspect;
var custom = inspect && inspect.custom || 'inspect';
function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}
module.exports = /*#__PURE__*/function () {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while (p = p.next) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;
      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }

    // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}();
},{"buffer":5,"util":2}],29:[function(require,module,exports){
(function (process){(function (){
'use strict';

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });
  return this;
}
function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit('error', err);
}
function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}
module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":12}],30:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    callback.apply(this, args);
  };
}
function noop() {}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };
  var writableEnded = stream._writableState && stream._writableState.finished;
  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };
  var readableEnded = stream._readableState && stream._readableState.endEmitted;
  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var onclose = function onclose() {
    var err;
    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}
module.exports = eos;
},{"../../../errors":21}],31:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],32:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var eos;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}
var _require$codes = require('../../../errors').codes,
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}
function call(fn) {
  fn();
}
function pipe(from, to) {
  return from.pipe(to);
}
function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}
module.exports = pipeline;
},{"../../../errors":21,"./end-of-stream":30}],33:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }
    return Math.floor(hwm);
  }

  // Default value
  return state.objectMode ? 16 : 16 * 1024;
}
module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":21}],34:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":7}],35:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');
exports.finished = require('./lib/internal/streams/end-of-stream.js');
exports.pipeline = require('./lib/internal/streams/pipeline.js');

},{"./lib/_stream_duplex.js":22,"./lib/_stream_passthrough.js":23,"./lib/_stream_readable.js":24,"./lib/_stream_transform.js":25,"./lib/_stream_writable.js":26,"./lib/internal/streams/end-of-stream.js":30,"./lib/internal/streams/pipeline.js":32}],36:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":16}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":38,"punycode":4,"querystring":15}],38:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],39:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var events=require("events"),classCallCheck=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var i=t[r];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,r,i){return r&&e(t.prototype,r),i&&e(t,i),t}}(),inherits=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)},possibleConstructorReturn=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},Ad=function e(){classCallCheck(this,e),this.id=null,this.sequence=null,this.system=null,this.title=null,this.description=null,this.advertiser=null,this.pricing=null,this.survey=null,this.errorURLTemplates=[],this.impressionURLTemplates=[],this.creatives=[],this.extensions=[]},AdExtension=function e(){classCallCheck(this,e),this.attributes={},this.children=[]},AdExtensionChild=function e(){classCallCheck(this,e),this.name=null,this.value=null,this.attributes={}},CompanionAd=function e(){classCallCheck(this,e),this.id=null,this.width=0,this.height=0,this.type=null,this.staticResource=null,this.htmlResource=null,this.iframeResource=null,this.altText=null,this.companionClickThroughURLTemplate=null,this.companionClickTrackingURLTemplates=[],this.trackingEvents={}},Creative=function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};classCallCheck(this,e),this.id=t.id||null,this.adId=t.adId||null,this.sequence=t.sequence||null,this.apiFramework=t.apiFramework||null,this.trackingEvents={}},CreativeCompanion=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};classCallCheck(this,t);var r=possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.type="companion",r.variations=[],r}return inherits(t,Creative),t}();function track(e,t,r){resolveURLTemplates(e,t,r).forEach(function(e){"undefined"!=typeof window&&null!==window&&((new Image).src=e)})}function resolveURLTemplates(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=[];for(var a in t.ASSETURI&&(t.ASSETURI=encodeURIComponentRFC3986(t.ASSETURI)),t.CONTENTPLAYHEAD&&(t.CONTENTPLAYHEAD=encodeURIComponentRFC3986(t.CONTENTPLAYHEAD)),!t.ERRORCODE||r.isCustomCode||/^[0-9]{3}$/.test(t.ERRORCODE)||(t.ERRORCODE=900),t.CACHEBUSTING=leftpad(Math.round(1e8*Math.random()).toString()),t.TIMESTAMP=encodeURIComponentRFC3986((new Date).toISOString()),t.RANDOM=t.random=t.CACHEBUSTING,e){var n=e[a];if("string"==typeof n){for(var s in t){var o=t[s],l="["+s+"]",c="%%"+s+"%%";n=(n=n.replace(l,o)).replace(c,o)}i.push(n)}}return i}function encodeURIComponentRFC3986(e){return encodeURIComponent(e).replace(/[!'()*]/g,function(e){return"%"+e.charCodeAt(0).toString(16)})}function leftpad(e){return e.length<8?range(0,8-e.length,!1).map(function(){return"0"}).join("")+e:e}function range(e,t,r){for(var i=[],a=e<t,n=r?a?t+1:t-1:t,s=e;a?s<n:s>n;a?s++:s--)i.push(s);return i}function isNumeric(e){return!isNaN(parseFloat(e))&&isFinite(e)}function flatten(e){return e.reduce(function(e,t){return e.concat(Array.isArray(t)?flatten(t):t)},[])}var util={track:track,resolveURLTemplates:resolveURLTemplates,encodeURIComponentRFC3986:encodeURIComponentRFC3986,leftpad:leftpad,range:range,isNumeric:isNumeric,flatten:flatten};function childByName(e,t){var r=e.childNodes;for(var i in r){var a=r[i];if(a.nodeName===t)return a}}function childrenByName(e,t){var r=[],i=e.childNodes;for(var a in i){var n=i[a];n.nodeName===t&&r.push(n)}return r}function resolveVastAdTagURI(e,t){return t?0===e.indexOf("//")?""+location.protocol+e:-1===e.indexOf("://")?t.slice(0,t.lastIndexOf("/"))+"/"+e:e:e}function parseBoolean(e){return-1!==["true","TRUE","1"].indexOf(e)}function parseNodeText(e){return e&&(e.textContent||e.text||"").trim()}function copyNodeAttribute(e,t,r){var i=t.getAttribute(e);i&&r.setAttribute(e,i)}function parseDuration(e){if(null===e||void 0===e)return-1;if(util.isNumeric(e))return parseInt(e);var t=e.split(":");if(3!==t.length)return-1;var r=t[2].split("."),i=parseInt(r[0]);2===r.length&&(i+=parseFloat("0."+r[1]));var a=parseInt(60*t[1]),n=parseInt(60*t[0]*60);return isNaN(n)||isNaN(a)||isNaN(i)||a>3600||i>60?-1:n+a+i}function splitVAST(e){var t=[],r=null;return e.forEach(function(i,a){if(i.sequence&&(i.sequence=parseInt(i.sequence,10)),i.sequence>1){var n=e[a-1];if(n&&n.sequence===i.sequence-1)return void(r&&r.push(i));delete i.sequence}r=[i],t.push(r)}),t}function mergeWrapperAdData(e,t){e.errorURLTemplates=t.errorURLTemplates.concat(e.errorURLTemplates),e.impressionURLTemplates=t.impressionURLTemplates.concat(e.impressionURLTemplates),e.extensions=t.extensions.concat(e.extensions),e.creatives.forEach(function(e){if(t.trackingEvents&&t.trackingEvents[e.type])for(var r in t.trackingEvents[e.type]){var i=t.trackingEvents[e.type][r];Array.isArray(e.trackingEvents[r])||(e.trackingEvents[r]=[]),e.trackingEvents[r]=e.trackingEvents[r].concat(i)}}),t.videoClickTrackingURLTemplates&&t.videoClickTrackingURLTemplates.length&&e.creatives.forEach(function(e){"linear"===e.type&&(e.videoClickTrackingURLTemplates=e.videoClickTrackingURLTemplates.concat(t.videoClickTrackingURLTemplates))}),t.videoCustomClickURLTemplates&&t.videoCustomClickURLTemplates.length&&e.creatives.forEach(function(e){"linear"===e.type&&(e.videoCustomClickURLTemplates=e.videoCustomClickURLTemplates.concat(t.videoCustomClickURLTemplates))}),t.videoClickThroughURLTemplate&&e.creatives.forEach(function(e){"linear"!==e.type||null!==e.videoClickThroughURLTemplate&&void 0!==e.videoClickThroughURLTemplate||(e.videoClickThroughURLTemplate=t.videoClickThroughURLTemplate)})}var parserUtils={childByName:childByName,childrenByName:childrenByName,resolveVastAdTagURI:resolveVastAdTagURI,parseBoolean:parseBoolean,parseNodeText:parseNodeText,copyNodeAttribute:copyNodeAttribute,parseDuration:parseDuration,splitVAST:splitVAST,mergeWrapperAdData:mergeWrapperAdData};function parseCreativeCompanion(e,t){var r=new CreativeCompanion(t);return parserUtils.childrenByName(e,"Companion").forEach(function(e){var t=new CompanionAd;t.id=e.getAttribute("id")||null,t.width=e.getAttribute("width"),t.height=e.getAttribute("height"),t.companionClickTrackingURLTemplates=[],parserUtils.childrenByName(e,"HTMLResource").forEach(function(e){t.type=e.getAttribute("creativeType")||"text/html",t.htmlResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"IFrameResource").forEach(function(e){t.type=e.getAttribute("creativeType")||0,t.iframeResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"StaticResource").forEach(function(r){t.type=r.getAttribute("creativeType")||0,parserUtils.childrenByName(e,"AltText").forEach(function(e){t.altText=parserUtils.parseNodeText(e)}),t.staticResource=parserUtils.parseNodeText(r)}),parserUtils.childrenByName(e,"TrackingEvents").forEach(function(e){parserUtils.childrenByName(e,"Tracking").forEach(function(e){var r=e.getAttribute("event"),i=parserUtils.parseNodeText(e);r&&i&&(Array.isArray(t.trackingEvents[r])||(t.trackingEvents[r]=[]),t.trackingEvents[r].push(i))})}),parserUtils.childrenByName(e,"CompanionClickTracking").forEach(function(e){t.companionClickTrackingURLTemplates.push(parserUtils.parseNodeText(e))}),t.companionClickThroughURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(e,"CompanionClickThrough")),t.companionClickTrackingURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(e,"CompanionClickTracking")),r.variations.push(t)}),r}var CreativeLinear=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};classCallCheck(this,t);var r=possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.type="linear",r.duration=0,r.skipDelay=null,r.mediaFiles=[],r.videoClickThroughURLTemplate=null,r.videoClickTrackingURLTemplates=[],r.videoCustomClickURLTemplates=[],r.adParameters=null,r.icons=[],r}return inherits(t,Creative),t}(),Icon=function e(){classCallCheck(this,e),this.program=null,this.height=0,this.width=0,this.xPosition=0,this.yPosition=0,this.apiFramework=null,this.offset=null,this.duration=0,this.type=null,this.staticResource=null,this.htmlResource=null,this.iframeResource=null,this.iconClickThroughURLTemplate=null,this.iconClickTrackingURLTemplates=[],this.iconViewTrackingURLTemplate=null},MediaFile=function e(){classCallCheck(this,e),this.id=null,this.fileURL=null,this.deliveryType="progressive",this.mimeType=null,this.codec=null,this.bitrate=0,this.minBitrate=0,this.maxBitrate=0,this.width=0,this.height=0,this.apiFramework=null,this.scalable=null,this.maintainAspectRatio=null};function parseCreativeLinear(e,t){var r=void 0,i=new CreativeLinear(t);i.duration=parserUtils.parseDuration(parserUtils.parseNodeText(parserUtils.childByName(e,"Duration")));var a=e.getAttribute("skipoffset");if(void 0===a||null===a)i.skipDelay=null;else if("%"===a.charAt(a.length-1)&&-1!==i.duration){var n=parseInt(a,10);i.skipDelay=i.duration*(n/100)}else i.skipDelay=parserUtils.parseDuration(a);var s=parserUtils.childByName(e,"VideoClicks");s&&(i.videoClickThroughURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(s,"ClickThrough")),parserUtils.childrenByName(s,"ClickTracking").forEach(function(e){i.videoClickTrackingURLTemplates.push(parserUtils.parseNodeText(e))}),parserUtils.childrenByName(s,"CustomClick").forEach(function(e){i.videoCustomClickURLTemplates.push(parserUtils.parseNodeText(e))}));var o=parserUtils.childByName(e,"AdParameters");o&&(i.adParameters=parserUtils.parseNodeText(o)),parserUtils.childrenByName(e,"TrackingEvents").forEach(function(e){parserUtils.childrenByName(e,"Tracking").forEach(function(e){var t=e.getAttribute("event"),a=parserUtils.parseNodeText(e);if(t&&a){if("progress"===t){if(!(r=e.getAttribute("offset")))return;t="%"===r.charAt(r.length-1)?"progress-"+r:"progress-"+Math.round(parserUtils.parseDuration(r))}Array.isArray(i.trackingEvents[t])||(i.trackingEvents[t]=[]),i.trackingEvents[t].push(a)}})}),parserUtils.childrenByName(e,"MediaFiles").forEach(function(e){parserUtils.childrenByName(e,"MediaFile").forEach(function(e){var t=new MediaFile;t.id=e.getAttribute("id"),t.fileURL=parserUtils.parseNodeText(e),t.deliveryType=e.getAttribute("delivery"),t.codec=e.getAttribute("codec"),t.mimeType=e.getAttribute("type"),t.apiFramework=e.getAttribute("apiFramework"),t.bitrate=parseInt(e.getAttribute("bitrate")||0),t.minBitrate=parseInt(e.getAttribute("minBitrate")||0),t.maxBitrate=parseInt(e.getAttribute("maxBitrate")||0),t.width=parseInt(e.getAttribute("width")||0),t.height=parseInt(e.getAttribute("height")||0);var r=e.getAttribute("scalable");r&&"string"==typeof r&&("true"===(r=r.toLowerCase())?t.scalable=!0:"false"===r&&(t.scalable=!1));var a=e.getAttribute("maintainAspectRatio");a&&"string"==typeof a&&("true"===(a=a.toLowerCase())?t.maintainAspectRatio=!0:"false"===a&&(t.maintainAspectRatio=!1)),i.mediaFiles.push(t)})});var l=parserUtils.childByName(e,"Icons");return l&&parserUtils.childrenByName(l,"Icon").forEach(function(e){var t=new Icon;t.program=e.getAttribute("program"),t.height=parseInt(e.getAttribute("height")||0),t.width=parseInt(e.getAttribute("width")||0),t.xPosition=parseXPosition(e.getAttribute("xPosition")),t.yPosition=parseYPosition(e.getAttribute("yPosition")),t.apiFramework=e.getAttribute("apiFramework"),t.offset=parserUtils.parseDuration(e.getAttribute("offset")),t.duration=parserUtils.parseDuration(e.getAttribute("duration")),parserUtils.childrenByName(e,"HTMLResource").forEach(function(e){t.type=e.getAttribute("creativeType")||"text/html",t.htmlResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"IFrameResource").forEach(function(e){t.type=e.getAttribute("creativeType")||0,t.iframeResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"StaticResource").forEach(function(e){t.type=e.getAttribute("creativeType")||0,t.staticResource=parserUtils.parseNodeText(e)});var r=parserUtils.childByName(e,"IconClicks");r&&(t.iconClickThroughURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(r,"IconClickThrough")),parserUtils.childrenByName(r,"IconClickTracking").forEach(function(e){t.iconClickTrackingURLTemplates.push(parserUtils.parseNodeText(e))})),t.iconViewTrackingURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(e,"IconViewTracking")),i.icons.push(t)}),i}function parseXPosition(e){return-1!==["left","right"].indexOf(e)?e:parseInt(e||0)}function parseYPosition(e){return-1!==["top","bottom"].indexOf(e)?e:parseInt(e||0)}var CreativeNonLinear=function(e){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};classCallCheck(this,t);var r=possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.type="nonlinear",r.variations=[],r}return inherits(t,Creative),t}(),NonLinearAd=function e(){classCallCheck(this,e),this.id=null,this.width=0,this.height=0,this.expandedWidth=0,this.expandedHeight=0,this.scalable=!0,this.maintainAspectRatio=!0,this.minSuggestedDuration=0,this.apiFramework="static",this.type=null,this.staticResource=null,this.htmlResource=null,this.iframeResource=null,this.nonlinearClickThroughURLTemplate=null,this.nonlinearClickTrackingURLTemplates=[],this.adParameters=null};function parseCreativeNonLinear(e,t){var r=new CreativeNonLinear(t);return parserUtils.childrenByName(e,"TrackingEvents").forEach(function(e){var t=void 0,i=void 0;parserUtils.childrenByName(e,"Tracking").forEach(function(e){t=e.getAttribute("event"),i=parserUtils.parseNodeText(e),t&&i&&(Array.isArray(r.trackingEvents[t])||(r.trackingEvents[t]=[]),r.trackingEvents[t].push(i))})}),parserUtils.childrenByName(e,"NonLinear").forEach(function(e){var t=new NonLinearAd;t.id=e.getAttribute("id")||null,t.width=e.getAttribute("width"),t.height=e.getAttribute("height"),t.expandedWidth=e.getAttribute("expandedWidth"),t.expandedHeight=e.getAttribute("expandedHeight"),t.scalable=parserUtils.parseBoolean(e.getAttribute("scalable")),t.maintainAspectRatio=parserUtils.parseBoolean(e.getAttribute("maintainAspectRatio")),t.minSuggestedDuration=parserUtils.parseDuration(e.getAttribute("minSuggestedDuration")),t.apiFramework=e.getAttribute("apiFramework"),parserUtils.childrenByName(e,"HTMLResource").forEach(function(e){t.type=e.getAttribute("creativeType")||"text/html",t.htmlResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"IFrameResource").forEach(function(e){t.type=e.getAttribute("creativeType")||0,t.iframeResource=parserUtils.parseNodeText(e)}),parserUtils.childrenByName(e,"StaticResource").forEach(function(e){t.type=e.getAttribute("creativeType")||0,t.staticResource=parserUtils.parseNodeText(e)});var i=parserUtils.childByName(e,"AdParameters");i&&(t.adParameters=parserUtils.parseNodeText(i)),t.nonlinearClickThroughURLTemplate=parserUtils.parseNodeText(parserUtils.childByName(e,"NonLinearClickThrough")),parserUtils.childrenByName(e,"NonLinearClickTracking").forEach(function(e){t.nonlinearClickTrackingURLTemplates.push(parserUtils.parseNodeText(e))}),r.variations.push(t)}),r}function parseAd(e){var t=e.childNodes;for(var r in t){var i=t[r];if(-1!==["Wrapper","InLine"].indexOf(i.nodeName)){if(parserUtils.copyNodeAttribute("id",e,i),parserUtils.copyNodeAttribute("sequence",e,i),"Wrapper"===i.nodeName)return parseWrapper(i);if("InLine"===i.nodeName)return parseInLine(i)}}}function parseInLine(e){var t=e.childNodes,r=new Ad;for(var i in r.id=e.getAttribute("id")||null,r.sequence=e.getAttribute("sequence")||null,t){var a=t[i];switch(a.nodeName){case"Error":r.errorURLTemplates.push(parserUtils.parseNodeText(a));break;case"Impression":r.impressionURLTemplates.push(parserUtils.parseNodeText(a));break;case"Creatives":parserUtils.childrenByName(a,"Creative").forEach(function(e){var t={id:e.getAttribute("id")||null,adId:parseCreativeAdIdAttribute(e),sequence:e.getAttribute("sequence")||null,apiFramework:e.getAttribute("apiFramework")||null};for(var i in e.childNodes){var a=e.childNodes[i],n=void 0;switch(a.nodeName){case"Linear":(n=parseCreativeLinear(a,t))&&r.creatives.push(n);break;case"NonLinearAds":(n=parseCreativeNonLinear(a,t))&&r.creatives.push(n);break;case"CompanionAds":(n=parseCreativeCompanion(a,t))&&r.creatives.push(n)}}});break;case"Extensions":parseExtensions(r.extensions,parserUtils.childrenByName(a,"Extension"));break;case"AdSystem":r.system={value:parserUtils.parseNodeText(a),version:a.getAttribute("version")||null};break;case"AdTitle":r.title=parserUtils.parseNodeText(a);break;case"Description":r.description=parserUtils.parseNodeText(a);break;case"Advertiser":r.advertiser=parserUtils.parseNodeText(a);break;case"Pricing":r.pricing={value:parserUtils.parseNodeText(a),model:a.getAttribute("model")||null,currency:a.getAttribute("currency")||null};break;case"Survey":r.survey=parserUtils.parseNodeText(a)}}return r}function parseWrapper(e){var t=parseInLine(e),r=parserUtils.childByName(e,"VASTAdTagURI");if(r?t.nextWrapperURL=parserUtils.parseNodeText(r):(r=parserUtils.childByName(e,"VASTAdTagURL"))&&(t.nextWrapperURL=parserUtils.parseNodeText(parserUtils.childByName(r,"URL"))),t.creatives.forEach(function(e){if(-1!==["linear","nonlinear"].indexOf(e.type)){if(e.trackingEvents){t.trackingEvents||(t.trackingEvents={}),t.trackingEvents[e.type]||(t.trackingEvents[e.type]={});var r=function(r){var i=e.trackingEvents[r];Array.isArray(t.trackingEvents[e.type][r])||(t.trackingEvents[e.type][r]=[]),i.forEach(function(i){t.trackingEvents[e.type][r].push(i)})};for(var i in e.trackingEvents)r(i)}e.videoClickTrackingURLTemplates&&(Array.isArray(t.videoClickTrackingURLTemplates)||(t.videoClickTrackingURLTemplates=[]),e.videoClickTrackingURLTemplates.forEach(function(e){t.videoClickTrackingURLTemplates.push(e)})),e.videoClickThroughURLTemplate&&(t.videoClickThroughURLTemplate=e.videoClickThroughURLTemplate),e.videoCustomClickURLTemplates&&(Array.isArray(t.videoCustomClickURLTemplates)||(t.videoCustomClickURLTemplates=[]),e.videoCustomClickURLTemplates.forEach(function(e){t.videoCustomClickURLTemplates.push(e)}))}}),t.nextWrapperURL)return t}function parseExtensions(e,t){t.forEach(function(t){var r=new AdExtension,i=t.attributes,a=t.childNodes;if(t.attributes)for(var n in i){var s=i[n];s.nodeName&&s.nodeValue&&(r.attributes[s.nodeName]=s.nodeValue)}for(var o in a){var l=a[o],c=parserUtils.parseNodeText(l);if("#comment"!==l.nodeName&&""!==c){var u=new AdExtensionChild;if(u.name=l.nodeName,u.value=c,l.attributes){var p=l.attributes;for(var h in p){var d=p[h];u.attributes[d.nodeName]=d.nodeValue}}r.children.push(u)}}e.push(r)})}function parseCreativeAdIdAttribute(e){return e.getAttribute("AdID")||e.getAttribute("adID")||e.getAttribute("adId")||null}function xdr(){var e=void 0;return window.XDomainRequest&&(e=new XDomainRequest),e}function supported(){return!!xdr()}function get$1(e,t,r){var i="function"==typeof window.ActiveXObject?new window.ActiveXObject("Microsoft.XMLDOM"):void 0;if(!i)return r(new Error("FlashURLHandler: Microsoft.XMLDOM format not supported"));i.async=!1;var a=xdr();a.open("GET",e),a.timeout=t.timeout||0,a.withCredentials=t.withCredentials||!1,a.send(),a.onprogress=function(){},a.onload=function(){i.loadXML(a.responseText),r(null,i)}}var flashURLHandler={get:get$1,supported:supported},uri=require("url"),fs=require("fs"),http=require("http"),https=require("https"),DOMParser=require("xmldom").DOMParser;function get$2(e,t,r){var i="https:"===(e=uri.parse(e)).protocol?https:http;if("file:"===e.protocol)fs.readFile(e.pathname,"utf8",function(e,t){if(e)return r(e);var i=(new DOMParser).parseFromString(t);r(null,i)});else{var a=void 0,n="",s=i.get(e.href,function(e){e.on("data",function(e){n+=e,clearTimeout(a),a=setTimeout(o,t.timeout||12e4)}),e.on("end",function(){clearTimeout(a);var e=(new DOMParser).parseFromString(n);r(null,e)})});s.on("error",function(e){clearTimeout(a),r(e)});var o=function(e){return function(){return e.abort()}}(s);a=setTimeout(o,t.timeout||12e4)}}var nodeURLHandler={get:get$2};function xhr(){try{var e=new window.XMLHttpRequest;return"withCredentials"in e?e:null}catch(e){return null}}function supported$1(){return!!xhr()}function get$3(e,t,r){if("https:"===window.location.protocol&&0===e.indexOf("http://"))return r(new Error("XHRURLHandler: Cannot go from HTTPS to HTTP."));try{var i=xhr();i.open("GET",e),i.timeout=t.timeout||0,i.withCredentials=t.withCredentials||!1,i.overrideMimeType&&i.overrideMimeType("text/xml"),i.onreadystatechange=function(){4===i.readyState&&(200===i.status?r(null,i.responseXML):r(new Error("XHRURLHandler: "+i.statusText)))},i.send()}catch(e){r(new Error("XHRURLHandler: Unexpected error"))}}var XHRURLHandler={get:get$3,supported:supported$1};function get$4(e,t,r){return r||("function"==typeof t&&(r=t),t={}),"undefined"==typeof window||null===window?nodeURLHandler.get(e,t,r):XHRURLHandler.supported()?XHRURLHandler.get(e,t,r):flashURLHandler.supported()?flashURLHandler.get(e,t,r):r(new Error("Current context is not supported by any of the default URLHandlers. Please provide a custom URLHandler"))}var urlHandler={get:get$4},VASTResponse=function e(){classCallCheck(this,e),this.ads=[],this.errorURLTemplates=[],this.version=null},DEFAULT_MAX_WRAPPER_DEPTH=10,DEFAULT_EVENT_DATA={ERRORCODE:900,extensions:[]},VASTParser=function(e){function t(){classCallCheck(this,t);var e=possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.remainingAds=[],e.parentURLs=[],e.errorURLTemplates=[],e.rootErrorURLTemplates=[],e.maxWrapperDepth=null,e.URLTemplateFilters=[],e.fetchingOptions={},e}return inherits(t,e),createClass(t,[{key:"addURLTemplateFilter",value:function(e){"function"==typeof e&&this.URLTemplateFilters.push(e)}},{key:"removeURLTemplateFilter",value:function(){this.URLTemplateFilters.pop()}},{key:"countURLTemplateFilters",value:function(){return this.URLTemplateFilters.length}},{key:"clearURLTemplateFilters",value:function(){this.URLTemplateFilters=[]}},{key:"trackVastError",value:function(e,t){for(var r=arguments.length,i=Array(r>2?r-2:0),a=2;a<r;a++)i[a-2]=arguments[a];this.emit("VAST-error",Object.assign.apply(Object,[{},DEFAULT_EVENT_DATA,t].concat(i))),util.track(e,t)}},{key:"getErrorURLTemplates",value:function(){return this.rootErrorURLTemplates.concat(this.errorURLTemplates)}},{key:"fetchVAST",value:function(e,t,r){var i=this;return new Promise(function(a,n){i.URLTemplateFilters.forEach(function(t){e=t(e)}),i.parentURLs.push(e),i.emit("VAST-resolving",{url:e,wrapperDepth:t,originalUrl:r}),i.urlHandler.get(e,i.fetchingOptions,function(t,r){i.emit("VAST-resolved",{url:e,error:t}),t?n(t):a(r)})})}},{key:"initParsingStatus",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.rootURL="",this.remainingAds=[],this.parentURLs=[],this.errorURLTemplates=[],this.rootErrorURLTemplates=[],this.maxWrapperDepth=e.wrapperLimit||DEFAULT_MAX_WRAPPER_DEPTH,this.fetchingOptions={timeout:e.timeout,withCredentials:e.withCredentials},this.urlHandler=e.urlHandler||e.urlhandler||urlHandler,this.vastVersion=null}},{key:"getRemainingAds",value:function(e){var t=this;if(0===this.remainingAds.length)return Promise.reject(new Error("No more ads are available for the given VAST"));var r=e?util.flatten(this.remainingAds):this.remainingAds.shift();return this.errorURLTemplates=[],this.parentURLs=[],this.resolveAds(r,{wrapperDepth:0,originalUrl:this.rootURL}).then(function(e){return t.buildVASTResponse(e)})}},{key:"getAndParseVAST",value:function(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return this.initParsingStatus(r),this.rootURL=e,this.fetchVAST(e).then(function(i){return r.originalUrl=e,r.isRootVAST=!0,t.parse(i,r).then(function(e){return t.buildVASTResponse(e)})})}},{key:"parseVAST",value:function(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return this.initParsingStatus(r),r.isRootVAST=!0,this.parse(e,r).then(function(e){return t.buildVASTResponse(e)})}},{key:"buildVASTResponse",value:function(e){var t=new VASTResponse;return t.ads=e,t.errorURLTemplates=this.getErrorURLTemplates(),t.version=this.vastVersion,this.completeWrapperResolving(t),t}},{key:"parseVastXml",value:function(e,t){var r=t.isRootVAST,i=void 0!==r&&r;if(!e||!e.documentElement||"VAST"!==e.documentElement.nodeName)throw new Error("Invalid VAST XMLDocument");var a=[],n=e.documentElement.childNodes;if(i){var s=e.documentElement.getAttribute("version");s&&(this.vastVersion=s)}for(var o in n){var l=n[o];if("Error"===l.nodeName){var c=parserUtils.parseNodeText(l);i?this.rootErrorURLTemplates.push(c):this.errorURLTemplates.push(c)}if("Ad"===l.nodeName){var u=parseAd(l);u?a.push(u):this.trackVastError(this.getErrorURLTemplates(),{ERRORCODE:101})}}return a}},{key:"parse",value:function(e,t){var r=t.resolveAll,i=void 0===r||r,a=t.wrapperSequence,n=void 0===a?null:a,s=t.originalUrl,o=void 0===s?null:s,l=t.wrapperDepth,c=void 0===l?0:l,u=t.isRootVAST,p=void 0!==u&&u,h=[];try{h=this.parseVastXml(e,{isRootVAST:p})}catch(e){return Promise.reject(e)}var d=h.length,v=h[d-1];return 1===d&&void 0!==n&&null!==n&&v&&!v.sequence&&(v.sequence=n),!1===i&&(this.remainingAds=parserUtils.splitVAST(h),h=this.remainingAds.shift()),this.resolveAds(h,{wrapperDepth:c,originalUrl:o})}},{key:"resolveAds",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],r=arguments[1],i=r.wrapperDepth,a=r.originalUrl,n=[];return t.forEach(function(t){var r=e.resolveWrappers(t,i,a);n.push(r)}),Promise.all(n).then(function(t){var r=util.flatten(t);if(!r&&e.remainingAds.length>0){var n=e.remainingAds.shift();return e.resolveAds(n,{wrapperDepth:i,originalUrl:a})}return r})}},{key:"resolveWrappers",value:function(e,t,r){var i=this;return new Promise(function(a){if(t++,!e.nextWrapperURL)return delete e.nextWrapperURL,a(e);if(t>=i.maxWrapperDepth||-1!==i.parentURLs.indexOf(e.nextWrapperURL))return e.errorCode=302,delete e.nextWrapperURL,a(e);e.nextWrapperURL=parserUtils.resolveVastAdTagURI(e.nextWrapperURL,r);var n=e.sequence;r=e.nextWrapperURL,i.fetchVAST(e.nextWrapperURL,t,r).then(function(s){return i.parse(s,{originalUrl:r,wrapperSequence:n,wrapperDepth:t}).then(function(t){if(delete e.nextWrapperURL,0===t.length)return e.creatives=[],a(e);t.forEach(function(t){t&&parserUtils.mergeWrapperAdData(t,e)}),a(t)})}).catch(function(t){e.errorCode=301,e.errorMessage=t.message,a(e)})})}},{key:"completeWrapperResolving",value:function(e){if(0===e.ads.length)this.trackVastError(e.errorURLTemplates,{ERRORCODE:303});else for(var t=e.ads.length-1;t>=0;t--){var r=e.ads[t];(r.errorCode||0===r.creatives.length)&&(this.trackVastError(r.errorURLTemplates.concat(e.errorURLTemplates),{ERRORCODE:r.errorCode||303},{ERRORMESSAGE:r.errorMessage||""},{extensions:r.extensions},{system:r.system}),e.ads.splice(t,1))}}}]),t}(events.EventEmitter),storage=null,DEFAULT_STORAGE={data:{},length:0,getItem:function(e){return this.data[e]},setItem:function(e,t){this.data[e]=t,this.length=Object.keys(this.data).length},removeItem:function(e){delete this.data[e],this.length=Object.keys(this.data).length},clear:function(){this.data={},this.length=0}},Storage=function(){function e(){classCallCheck(this,e),this.storage=this.initStorage()}return createClass(e,[{key:"initStorage",value:function(){if(storage)return storage;try{storage="undefined"!=typeof window&&null!==window?window.localStorage||window.sessionStorage:null}catch(e){storage=null}return storage&&!this.isStorageDisabled(storage)||(storage=DEFAULT_STORAGE).clear(),storage}},{key:"isStorageDisabled",value:function(e){var t="__VASTStorage__";try{if(e.setItem(t,t),e.getItem(t)!==t)return e.removeItem(t),!0}catch(e){return!0}return e.removeItem(t),!1}},{key:"getItem",value:function(e){return this.storage.getItem(e)}},{key:"setItem",value:function(e,t){return this.storage.setItem(e,t)}},{key:"removeItem",value:function(e){return this.storage.removeItem(e)}},{key:"clear",value:function(){return this.storage.clear()}}]),e}(),VASTClient=function(){function e(t,r,i){classCallCheck(this,e),this.cappingFreeLunch=t||0,this.cappingMinimumTimeInterval=r||0,this.defaultOptions={withCredentials:!1,timeout:0},this.vastParser=new VASTParser,this.storage=i||new Storage,void 0===this.lastSuccessfulAd&&(this.lastSuccessfulAd=0),void 0===this.totalCalls&&(this.totalCalls=0),void 0===this.totalCallsTimeout&&(this.totalCallsTimeout=0)}return createClass(e,[{key:"getParser",value:function(){return this.vastParser}},{key:"hasRemainingAds",value:function(){return this.vastParser.remainingAds.length>0}},{key:"getNextAds",value:function(e){return this.vastParser.getRemainingAds(e)}},{key:"get",value:function(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=Date.now();return(r=Object.assign({},this.defaultOptions,r)).hasOwnProperty("resolveAll")||(r.resolveAll=!1),this.totalCallsTimeout<i?(this.totalCalls=1,this.totalCallsTimeout=i+36e5):this.totalCalls++,new Promise(function(a,n){if(t.cappingFreeLunch>=t.totalCalls)return n(new Error("VAST call canceled – FreeLunch capping not reached yet "+t.totalCalls+"/"+t.cappingFreeLunch));var s=i-t.lastSuccessfulAd;if(s<0)t.lastSuccessfulAd=0;else if(s<t.cappingMinimumTimeInterval)return n(new Error("VAST call canceled – ("+t.cappingMinimumTimeInterval+")ms minimum interval reached"));t.vastParser.getAndParseVAST(e,r).then(function(e){return a(e)}).catch(function(e){return n(e)})})}},{key:"lastSuccessfulAd",get:function(){return this.storage.getItem("vast-client-last-successful-ad")},set:function(e){this.storage.setItem("vast-client-last-successful-ad",e)}},{key:"totalCalls",get:function(){return this.storage.getItem("vast-client-total-calls")},set:function(e){this.storage.setItem("vast-client-total-calls",e)}},{key:"totalCallsTimeout",get:function(){return this.storage.getItem("vast-client-total-calls-timeout")},set:function(e){this.storage.setItem("vast-client-total-calls-timeout",e)}}]),e}(),DEFAULT_SKIP_DELAY=-1,VASTTracker=function(e){function t(e,r,i){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null;classCallCheck(this,t);var n=possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));for(var s in n.ad=r,n.creative=i,n.variation=a,n.muted=!1,n.impressed=!1,n.skippable=!1,n.trackingEvents={},n._alreadyTriggeredQuartiles={},n.emitAlwaysEvents=["creativeView","start","firstQuartile","midpoint","thirdQuartile","complete","resume","pause","rewind","skip","closeLinear","close"],n.creative.trackingEvents){var o=n.creative.trackingEvents[s];n.trackingEvents[s]=o.slice(0)}return n.creative instanceof CreativeLinear?n._initLinearTracking():n._initVariationTracking(),e&&n.on("start",function(){e.lastSuccessfulAd=Date.now()}),n}return inherits(t,e),createClass(t,[{key:"_initLinearTracking",value:function(){this.linear=!0,this.skipDelay=this.creative.skipDelay,this.setDuration(this.creative.duration),this.clickThroughURLTemplate=this.creative.videoClickThroughURLTemplate,this.clickTrackingURLTemplates=this.creative.videoClickTrackingURLTemplates}},{key:"_initVariationTracking",value:function(){if(this.linear=!1,this.skipDelay=DEFAULT_SKIP_DELAY,this.variation){for(var e in this.variation.trackingEvents){var t=this.variation.trackingEvents[e];this.trackingEvents[e]?this.trackingEvents[e]=this.trackingEvents[e].concat(t.slice(0)):this.trackingEvents[e]=t.slice(0)}this.variation instanceof NonLinearAd?(this.clickThroughURLTemplate=this.variation.nonlinearClickThroughURLTemplate,this.clickTrackingURLTemplates=this.variation.nonlinearClickTrackingURLTemplates,this.setDuration(this.variation.minSuggestedDuration)):this.variation instanceof CompanionAd&&(this.clickThroughURLTemplate=this.variation.companionClickThroughURLTemplate,this.clickTrackingURLTemplates=this.variation.companionClickTrackingURLTemplates)}}},{key:"setDuration",value:function(e){this.assetDuration=e,this.quartiles={firstQuartile:Math.round(25*this.assetDuration)/100,midpoint:Math.round(50*this.assetDuration)/100,thirdQuartile:Math.round(75*this.assetDuration)/100}}},{key:"setProgress",value:function(e){var t=this,r=this.skipDelay||DEFAULT_SKIP_DELAY;if(-1===r||this.skippable||(r>e?this.emit("skip-countdown",r-e):(this.skippable=!0,this.emit("skip-countdown",0))),this.assetDuration>0){var i=[];if(e>0){var a=Math.round(e/this.assetDuration*100);for(var n in i.push("start"),i.push("progress-"+a+"%"),i.push("progress-"+Math.round(e)),this.quartiles)this.isQuartileReached(n,this.quartiles[n],e)&&(i.push(n),this._alreadyTriggeredQuartiles[n]=!0)}i.forEach(function(e){t.track(e,!0)}),e<this.progress&&this.track("rewind")}this.progress=e}},{key:"isQuartileReached",value:function(e,t,r){var i=!1;return t<=r&&!this._alreadyTriggeredQuartiles[e]&&(i=!0),i}},{key:"setMuted",value:function(e){this.muted!==e&&this.track(e?"mute":"unmute"),this.muted=e}},{key:"setPaused",value:function(e){this.paused!==e&&this.track(e?"pause":"resume"),this.paused=e}},{key:"setFullscreen",value:function(e){this.fullscreen!==e&&this.track(e?"fullscreen":"exitFullscreen"),this.fullscreen=e}},{key:"setExpand",value:function(e){this.expanded!==e&&this.track(e?"expand":"collapse"),this.expanded=e}},{key:"setSkipDelay",value:function(e){"number"==typeof e&&(this.skipDelay=e)}},{key:"trackImpression",value:function(){this.impressed||(this.impressed=!0,this.trackURLs(this.ad.impressionURLTemplates),this.track("creativeView"))}},{key:"errorWithCode",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this.trackURLs(this.ad.errorURLTemplates,{ERRORCODE:e},{isCustomCode:t})}},{key:"complete",value:function(){this.track("complete")}},{key:"close",value:function(){this.track(this.linear?"closeLinear":"close")}},{key:"skip",value:function(){this.track("skip")}},{key:"click",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;this.clickTrackingURLTemplates&&this.clickTrackingURLTemplates.length&&this.trackURLs(this.clickTrackingURLTemplates);var t=this.clickThroughURLTemplate||e;if(t){var r=this.linear?{CONTENTPLAYHEAD:this.progressFormatted()}:{},i=util.resolveURLTemplates([t],r)[0];this.emit("clickthrough",i)}}},{key:"track",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];"closeLinear"===e&&!this.trackingEvents[e]&&this.trackingEvents.close&&(e="close");var r=this.trackingEvents[e],i=this.emitAlwaysEvents.indexOf(e)>-1;r?(this.emit(e,""),this.trackURLs(r)):i&&this.emit(e,""),t&&(delete this.trackingEvents[e],i&&this.emitAlwaysEvents.splice(this.emitAlwaysEvents.indexOf(e),1))}},{key:"trackURLs",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};this.linear&&(this.creative&&this.creative.mediaFiles&&this.creative.mediaFiles[0]&&this.creative.mediaFiles[0].fileURL&&(t.ASSETURI=this.creative.mediaFiles[0].fileURL),t.CONTENTPLAYHEAD=this.progressFormatted()),util.track(e,t,r)}},{key:"progressFormatted",value:function(){var e=parseInt(this.progress),t=e/3600;t.length<2&&(t="0"+t);var r=e/60%60;r.length<2&&(r="0"+r);var i=e%60;return i.length<2&&(i="0"+r),t+":"+r+":"+i+"."+parseInt(100*(this.progress-e))}}]),t}(events.EventEmitter);exports.VASTClient=VASTClient,exports.VASTParser=VASTParser,exports.VASTTracker=VASTTracker;

},{"events":7,"fs":3,"http":17,"https":9,"url":37,"xmldom":41}],41:[function(require,module,exports){
function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = require('./sax').XMLReader;
	var DOMImplementation = exports.DOMImplementation = require('./dom').DOMImplementation;
	exports.XMLSerializer = require('./dom').XMLSerializer ;
	exports.DOMParser = DOMParser;
//}

},{"./dom":42,"./sax":43}],42:[function(require,module,exports){
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}

},{}],43:[function(require,module,exports){
//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;


},{}],44:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],45:[function(require,module,exports){
(function (global){(function (){

; playList = global.playList = require("global");
; var __browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
    /* Start Amp Playlist */
    var urlDebugParameter;
    try {
        urlDebugParameter = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
    } catch(e) {}

    function cLog() {
        if(urlDebugParameter) console.log.apply(this,arguments);
    }

    var playListEnabled = true;
    var videojs,player; // Important to be "var" to avoid problems with older browsers
    function installPlayList(playListToUse,videojsToUse,playerToUse, playerStorage,options,topElement,e) {
        if(videojsToUse) videojs = videojsToUse;
        else videojs = playerStorage.videojs;
        if(playerToUse) player = playerToUse;
        else player = playerStorage.player;
        var playerElement = playerStorage.rootDocument.getElementById(playerToUse.id());
        playerElement.parentElement.classList.add('bc-iframe');
        var L=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var i in r){if(Object.prototype.hasOwnProperty.call(r,i)){e[i]=r[i]}}}return e};
        var b={};
        var s;
        if(typeof e!=="undefined"){s=e}else if(typeof a!=="undefined"){s=a}else if(typeof self!=="undefined"){s=self}else{s={}};
        var o=s;
        var m=o&&o.navigator||{};
        var g={isArr:function e(t){return Array.isArray(t)},isFn:function e(t){return typeof t==="function"},isNil:function e(t){return t===null||t===undefined},isNum:function e(t){return typeof t==="number"&&t===t},isNonEmptyStr:function e(t){return typeof t==="string"&&/\S/.test(t)},isObj:function e(t){return Object.prototype.toString.call(t)==="[object Object]"}};
        var Z={perf:b,Promise:m,assign:function e(){var t;return(t=Q).extends.apply(t,arguments)},withoutNilValues:function e(t){var r=t;if(g.isArr(t)){r=t.filter(function(e){return!g.isNil(e)}).map(Z.withoutNilValues)}else if(g.isObj(t)){r={};Object.keys(t).forEach(function(e){if(!g.isNil(t[e])){r[e]=Z.withoutNilValues(t[e])}})}return r},debounce:function e(t,r,i){var n=arguments.length>3&&arguments[3]!==undefined?arguments[3]:o;var a=void 0;return function(){var e=this;var s=arguments;var o=function r(){a=null;o=null;if(!i){t.apply(e,s)}};if(!a&&i){t.apply(e,s)}n.clearTimeout(a);a=n.setTimeout(o,r)}},throttle:function e(t,r){var i=Date.now();return function(){var e=Date.now();if(e-i>=r){t.apply(undefined,arguments);i=e}}},qs:function e(){var t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:o&&o.location||{};return L({hash:v.parse((t.hash||"#").substr(1)),search:v.parse((t.search||"?").substr(1))},v)}};
        L(Z,g);
        videojs.bc_ = Z;
        (function(videojsRef, docu) {
            if (videojsRef.getPlugin("bcPlaylistUi")) {
                return
            }! function(e, t) {
                "object" == typeof exports && "undefined" != typeof module ? module.exports = t(__browserify_shim_require__("video.js"), __browserify_shim_require__("@brightcove/loscore")) : "function" == typeof r && r.amd ? r(["video.js", "@brightcove/loscore"], t) : e.videojsBcPlaylistUi = t(playerStorage.videojs, playerStorage.videojs.bc_)
            }(this, function(r, i) {
                "use strict";
                r = r && r.hasOwnProperty("default") ? r.default : r, i = i && i.hasOwnProperty("default") ? i.default : i;
                var n, a = "undefined" != typeof e ? e : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {},
                    s = {},
                    o = Object.freeze({
                        default: s
                    }),
                    u = o && s || o,
                    l = void 0 !== a ? a : "undefined" != typeof e ? e : {};
                "undefined" != typeof docu ? n = docu : (n = l["__GLOBAL_DOCUMENT_CACHE@4"]) || (n = l["__GLOBAL_DOCUMENT_CACHE@4"] = u);
                var c = n,
                    d = function(e) {
                        var t = e.playlist.autoadvance_;
                        t.timeout && e.clearTimeout(t.timeout), t.trigger && e.off("ended", t.trigger), t.timeout = null, t.trigger = null
                    },
                    f = function e(t, r) {
                        d(t),
                            function(e) {
                                return "number" == typeof e && !isNaN(e) && e >= 0 && e < 1 / 0
                            }(r) ? (t.playlist.autoadvance_.delay = r, t.playlist.autoadvance_.trigger = function() {
                                var i = function() {
                                    return e(t, r)
                                };
                                t.one("play", i), t.playlist.autoadvance_.timeout = t.setTimeout(function() {
                                    d(t), t.off("play", i), t.playlist.next()
                                }, 1e3 * r)
                            }, t.one("ended", t.playlist.autoadvance_.trigger)) : t.playlist.autoadvance_.delay = null
                    },
                    h = function(e, t) {
                        var r = !e.paused() || e.ended();
                        return e.trigger("beforeplaylistitem", t), e.poster(t.poster || ""), e.src(t.sources),
                            function(e) {
                                for (var t = e.remoteTextTracks(), r = t && t.length || 0; r--;) e.removeRemoteTextTrack(t[r])
                            }(e), e.ready(function() {
                            (t.textTracks || []).forEach(e.addRemoteTextTrack.bind(e)), e.trigger("playlistitem", t), r && e.play(), f(e, e.playlist.autoadvance_.delay)
                        }), e
                    },
                    p = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                        return typeof e
                    } : function(e) {
                        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                    },
                    v = (function() {
                        function e(e) {
                            this.value = e
                        }

                        function t(t) {
                            function r(n, a) {
                                try {
                                    var s = t[n](a),
                                        o = s.value;
                                    o instanceof e ? Promise.resolve(o.value).then(function(e) {
                                        r("next", e)
                                    }, function(e) {
                                        r("throw", e)
                                    }) : i(s.done ? "return" : "normal", s.value)
                                } catch (e) {
                                    i("throw", e)
                                }
                            }

                            function i(e, t) {
                                switch (e) {
                                    case "return":
                                        n.resolve({
                                            value: t,
                                            done: !0
                                        });
                                        break;
                                    case "throw":
                                        n.reject(t);
                                        break;
                                    default:
                                        n.resolve({
                                            value: t,
                                            done: !1
                                        })
                                }(n = n.next) ? r(n.key, n.arg): a = null
                            }
                            var n, a;
                            this._invoke = function(e, t) {
                                return new Promise(function(i, s) {
                                    var o = {
                                        key: e,
                                        arg: t,
                                        resolve: i,
                                        reject: s,
                                        next: null
                                    };
                                    a ? a = a.next = o : (n = a = o, r(e, t))
                                })
                            }, "function" != typeof t.return && (this.return = void 0)
                        }
                        "function" == typeof Symbol && Symbol.asyncIterator && (t.prototype[Symbol.asyncIterator] = function() {
                            return this
                        }), t.prototype.next = function(e) {
                            return this._invoke("next", e)
                        }, t.prototype.throw = function(e) {
                            return this._invoke("throw", e)
                        }, t.prototype.return = function(e) {
                            return this._invoke("return", e)
                        }
                    }(), function(e, t) {
                        var r = e,
                            i = t;
                        return "object" === (void 0 === e ? "undefined" : p(e)) && (r = e.src), "object" === (void 0 === t ? "undefined" : p(t)) && (i = t.src), /^\/\//.test(r) && (i = i.slice(i.indexOf("//"))), /^\/\//.test(i) && (r = r.slice(r.indexOf("//"))), r === i
                    }),
                    m = function(e, t) {
                        for (var r = 0; r < e.length; r++) {
                            var i = e[r].sources;
                            if (Array.isArray(i))
                                for (var n = 0; n < i.length; n++) {
                                    var a = i[n];
                                    if (a && v(a, t)) return r
                                }
                        }
                        return -1
                    },
                    y = function(e) {
                        for (var t = -1, r = e.length - 1; ++t < e.length;) {
                            var i = t + Math.floor(Math.random() * (r - t + 1)),
                                n = e[i];
                            e[i] = e[t], e[t] = n
                        }
                        return e
                    };
                (r.registerPlugin || r.plugin)("playlist", function(e, t) {
                    ! function(e, t) {
                        var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0,
                            n = null,
                            a = !1,
                            s = e.playlist = function(t) {
                                var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
                                if (a) throw new Error("do not call playlist() during a playlist change");
                                if (Array.isArray(t)) {
                                    var i = Array.isArray(n) ? n.slice() : null;
                                    n = t.slice(), a = !0, e.trigger({
                                        type: "duringplaylistchange",
                                        nextIndex: r,
                                        nextPlaylist: n,
                                        previousIndex: s.currentIndex_,
                                        previousPlaylist: i || []
                                    }), a = !1, -1 !== r && s.currentItem(r), i && e.setTimeout(function() {
                                        e.trigger("playlistchange")
                                    }, 0)
                                }
                                return n.slice()
                            };
                        e.on("loadstart", function() {
                            -1 === s.currentItem() && d(e)
                        }), s.currentIndex_ = -1, s.player_ = e, s.autoadvance_ = {}, s.repeat_ = !1, s.currentItem = function(e) {
                            return a ? s.currentIndex_ : ("number" == typeof e && s.currentIndex_ !== e && e >= 0 && e < n.length ? (s.currentIndex_ = e, h(s.player_, n[s.currentIndex_])) : s.currentIndex_ = s.indexOf(s.player_.currentSrc() || ""), s.currentIndex_)
                        }, s.contains = function(e) {
                            return -1 !== s.indexOf(e)
                        }, s.indexOf = function(e) {
                            if ("string" == typeof e) return m(n, e);
                            for (var t = Array.isArray(e) ? e : e.sources, r = 0; r < t.length; r++) {
                                var i = t[r];
                                if ("string" == typeof i) return m(n, i);
                                if (i.src) return m(n, i.src)
                            }
                            return -1
                        }, s.currentIndex = function() {
                            return s.currentItem()
                        }, s.lastIndex = function() {
                            return n.length - 1
                        }, s.nextIndex = function() {
                            var e = s.currentItem();
                            if (-1 === e) return -1;
                            var t = s.lastIndex();
                            return s.repeat_ && e === t ? 0 : Math.min(e + 1, t)
                        }, s.previousIndex = function() {
                            var e = s.currentItem();
                            return -1 === e ? -1 : s.repeat_ && 0 === e ? s.lastIndex() : Math.max(e - 1, 0)
                        }, s.first = function() {
                            if (!a) return n.length ? n[s.currentItem(0)] : void(s.currentIndex_ = -1)
                        }, s.last = function() {
                            if (!a) return n.length ? n[s.currentItem(s.lastIndex())] : void(s.currentIndex_ = -1)
                        }, s.next = function() {
                            if (!a) {
                                var e = s.nextIndex();
                                return e !== s.currentIndex_ ? n[s.currentItem(e)] : void 0
                            }
                        }, s.previous = function() {
                            if (!a) {
                                var e = s.previousIndex();
                                return e !== s.currentIndex_ ? n[s.currentItem(e)] : void 0
                            }
                        }, s.autoadvance = function(e) {
                            f(s.player_, e)
                        }, s.repeat = function(e) {
                            return void 0 === e ? s.repeat_ : "boolean" == typeof e ? (s.repeat_ = !!e, s.repeat_) : void r.log.error("videojs-playlist: Invalid value for repeat", e)
                        }, s.sort = function(t) {
                            n.length && (n.sort(t), a || e.trigger("playlistsorted"))
                        }, s.reverse = function() {
                            n.length && (n.reverse(), a || e.trigger("playlistsorted"))
                        }, s.shuffle = function() {
                            var t = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}).rest,
                                r = 0,
                                i = n;
                            if (t && (r = s.currentIndex_ + 1, i = n.slice(r)), !(i.length <= 1)) {
                                if (y(i), t) {
                                    var o;
                                    (o = n).splice.apply(o, [r, i.length].concat(i))
                                }
                                a || e.trigger("playlistsorted")
                            }
                        }, Array.isArray(t) ? s(t.slice(), i) : n = []
                    }(this, e, t)
                });
                ! function() {
                    function e(e) {
                        this.value = e
                    }

                    function t(t) {
                        function r(n, a) {
                            try {
                                var s = t[n](a),
                                    o = s.value;
                                o instanceof e ? Promise.resolve(o.value).then(function(e) {
                                    r("next", e)
                                }, function(e) {
                                    r("throw", e)
                                }) : i(s.done ? "return" : "normal", s.value)
                            } catch (e) {
                                i("throw", e)
                            }
                        }

                        function i(e, t) {
                            switch (e) {
                                case "return":
                                    n.resolve({
                                        value: t,
                                        done: !0
                                    });
                                    break;
                                case "throw":
                                    n.reject(t);
                                    break;
                                default:
                                    n.resolve({
                                        value: t,
                                        done: !1
                                    })
                            }(n = n.next) ? r(n.key, n.arg): a = null
                        }
                        var n, a;
                        this._invoke = function(e, t) {
                            return new Promise(function(i, s) {
                                var o = {
                                    key: e,
                                    arg: t,
                                    resolve: i,
                                    reject: s,
                                    next: null
                                };
                                a ? a = a.next = o : (n = a = o, r(e, t))
                            })
                        }, "function" != typeof t.return && (this.return = void 0)
                    }
                    "function" == typeof Symbol && Symbol.asyncIterator && (t.prototype[Symbol.asyncIterator] = function() {
                        return this
                    }), t.prototype.next = function(e) {
                        return this._invoke("next", e)
                    }, t.prototype.throw = function(e) {
                        return this._invoke("throw", e)
                    }, t.prototype.return = function(e) {
                        return this._invoke("return", e)
                    }
                }();
                var g = function(e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    },
                    _ = function(e, t) {
                        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                        e.prototype = Object.create(t && t.prototype, {
                            constructor: {
                                value: e,
                                enumerable: !1,
                                writable: !0,
                                configurable: !0
                            }
                        }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
                    },
                    b = function(e, t) {
                        if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return !t || "object" != typeof t && "function" != typeof t ? e : t
                    },
                    T = r.dom || r,
                    S = r.registerPlugin || r.plugin,
                    k = {
                        className: "vjs-playlist",
                        playOnSelect: !1,
                        supportsCssPointerEvents: function() {
                            var e = c.createElement("x");
                            return e.style.cssText = "pointer-events:auto", "auto" === e.style.pointerEvents
                        }()
                    },
                    w = function(e) {
                        e.addClass("vjs-selected")
                    },
                    E = function(e) {
                        e.removeClass("vjs-selected"), e.thumbnail && T.removeClass(e.thumbnail, "vjs-playlist-now-playing")
                    },
                    C = function(e) {
                        e.addClass("vjs-up-next")
                    },
                    A = function(e) {
                        e.removeClass("vjs-up-next")
                    },
                    I = r.getComponent("Component"),
                    O = function(e) {
                        function t(r, i, n) {
                            if (g(this, t), !i.item) throw new Error("Cannot construct a PlaylistMenuItem without an item option");
                            var a = b(this, e.call(this, r, i));
                            return a.item = i.item, a.playOnSelect = n.playOnSelect, a.emitTapEvents(), a.on(["click", "tap"], a.switchPlaylistItem_), a.on("keydown", a.handleKeyDown_), a
                        }
                        return _(t, e), t.prototype.handleKeyDown_ = function(e) {
                            13 !== e.which && 32 !== e.which || this.switchPlaylistItem_()
                        }, t.prototype.switchPlaylistItem_ = function(e) {
                            this.player_.playlist.currentItem(function(e, t) {
                                for (var r = 0, i = e.length; r < i; r++)
                                    if (e[r] === t) return r;
                                return -1
                            }(this.player_.playlist(), this.item)), this.playOnSelect && this.player_.play()
                        }, t.prototype.createEl = function() {
                            var e = c.createElement("li"),
                                t = this.options_.item;
                            if (e.className = "vjs-playlist-item", e.setAttribute("tabIndex", 0), this.thumbnail = function(e) {
                                if (!e) {
                                    var t = c.createElement("div");
                                    return t.className = "vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder", t
                                }
                                var r = c.createElement("picture");
                                if (r.className = "vjs-playlist-thumbnail", "string" == typeof e) {
                                    var i = c.createElement("img");
                                    i.src = e, i.alt = "", r.appendChild(i)
                                } else {
                                    for (var n = 0; n < e.length - 1; n++) {
                                        var a = e[n],
                                            s = c.createElement("source");
                                        for (var o in a) s[o] = a[o];
                                        r.appendChild(s)
                                    }
                                    var u = e[e.length - 1],
                                        l = c.createElement("img");
                                    l.alt = "";
                                    for (var d in u) l[d] = u[d];
                                    r.appendChild(l)
                                }
                                return r
                            }(t.thumbnail), e.appendChild(this.thumbnail), t.duration) {
                                var i = c.createElement("time"),
                                    n = r.formatTime(t.duration);
                                i.className = "vjs-playlist-duration", i.setAttribute("datetime", "PT0H0M" + t.duration + "S"), i.appendChild(c.createTextNode(n)), e.appendChild(i)
                            }
                            var a = c.createElement("span"),
                                s = this.localize("Now Playing");
                            a.className = "vjs-playlist-now-playing-text", a.appendChild(c.createTextNode(s)), a.setAttribute("title", s), this.thumbnail.appendChild(a);
                            var o = c.createElement("div");
                            o.className = "vjs-playlist-title-container", this.thumbnail.appendChild(o);
                            var u = c.createElement("span"),
                                l = this.localize("Up Next");
                            u.className = "vjs-up-next-text", u.appendChild(c.createTextNode(l)), u.setAttribute("title", l), o.appendChild(u);
                            var d = c.createElement("cite"),
                                f = t.name || this.localize("Untitled Video");
                            return d.className = "vjs-playlist-name", d.appendChild(c.createTextNode(f)), d.setAttribute("title", f), o.appendChild(d), e
                        }, t
                    }(I),
                    P = function(e) {
                        function t(i, n) {
                            if (g(this, t), !i.playlist) throw new Error("videojs-playlist is required for the playlist component");
                            var a = b(this, e.call(this, i, n));
                            return a.items = [], n.horizontal ? a.addClass("vjs-playlist-horizontal") : a.addClass("vjs-playlist-vertical"), n.supportsCssPointerEvents && a.addClass("vjs-csspointerevents"), a.createPlaylist_(), r.browser.TOUCH_ENABLED || a.addClass("vjs-mouse"), i.on(["loadstart", "playlistchange", "playlistsorted"], function(e) {
                                a.update()
                            }), i.on("adstart", function() {
                                a.addClass("vjs-ad-playing")
                            }), i.on("adend", function() {
                                a.removeClass("vjs-ad-playing")
                            }), a
                        }
                        return _(t, e), t.prototype.createEl = function() {
                            return T.createEl("div", {
                                className: this.options_.className
                            })
                        }, t.prototype.createPlaylist_ = function() {
                            var e = this.player_.playlist() || [],
                                t = this.el_.querySelector(".vjs-playlist-item-list"),
                                r = this.el_.querySelector(".vjs-playlist-ad-overlay");
                            t || ((t = c.createElement("ol")).className = "vjs-playlist-item-list", this.el_.appendChild(t));
                            for (var i = 0; i < this.items.length; i++) t.removeChild(this.items[i].el_);
                            this.items.length = 0;
                            for (var n = 0; n < e.length; n++) {
                                var a = new O(this.player_, {
                                    item: e[n]
                                }, this.options_);
                                this.items.push(a), t.appendChild(a.el_)
                            }
                            r ? t.appendChild(r) : ((r = c.createElement("li")).className = "vjs-playlist-ad-overlay", t.appendChild(r));
                            var s = this.player_.playlist.currentItem();
                            if (this.items.length && s >= 0) {
                                w(this.items[s]);
                                var o = this.items[s].$(".vjs-playlist-thumbnail");
                                o && T.addClass(o, "vjs-playlist-now-playing")
                            }
                        }, t.prototype.update = function() {
                            var e = this.player_.playlist();
                            if (this.items.length === e.length) {
                                for (var t = 0; t < this.items.length; t++)
                                    if (this.items[t].item !== e[t]) return void this.createPlaylist_();
                                for (var r = this.player_.playlist.currentItem(), i = 0; i < this.items.length; i++) {
                                    var n = this.items[i];
                                    i === r ? (w(n), c.activeElement !== n.el() && T.addClass(n.thumbnail, "vjs-playlist-now-playing"), A(n)) : i === r + 1 ? (E(n), C(n)) : (E(n), A(n))
                                }
                            } else this.createPlaylist_()
                        }, t
                    }(I),
                    x = function(e) {
                        for (var t = 0; t < e.childNodes.length; t++)
                            if (T.isEl(e.childNodes[t])) return !0;
                        return !1
                    },
                    L = function(e) {
                        if (!this.playlist) throw new Error("videojs-playlist plugin is required by the videojs-playlist-ui plugin");
                        if (T.isEl(e) && (r.log.warn('videojs-playlist-ui: Passing an element directly to playlistUi() is deprecated, use the "el" option instead!'), e = {
                            el: e
                        }), e = r.mergeOptions(k, e), this.playlistMenu) {
                            var t = this.playlistMenu.el();
                            if (t) {
                                var i = t.parentNode,
                                    n = t.nextSibling;
                                this.playlistMenu.dispose(), T.emptyEl(t), n ? i.insertBefore(t, n) : i.appendChild(t), e.el = t
                            }
                        }
                        T.isEl(e.el) || (e.el = function(e) {
                            for (var t = topElement.querySelectorAll("." + e), r = void 0, i = 0; i < t.length; i++)
                                if (!x(t[i])) {
                                    r = t[i];
                                    break
                                } return r
                        }(e.className)), this.playlistMenu = new P(this, e)
                    };
                r.registerComponent("PlaylistMenu", P), r.registerComponent("PlaylistMenuItem", O), S("playlistUi", L), L.VERSION = "3.4.0";
                ! function() {
                    function e(e) {
                        this.value = e
                    }

                    function t(t) {
                        function r(n, a) {
                            try {
                                var s = t[n](a),
                                    o = s.value;
                                o instanceof e ? Promise.resolve(o.value).then(function(e) {
                                    r("next", e)
                                }, function(e) {
                                    r("throw", e)
                                }) : i(s.done ? "return" : "normal", s.value)
                            } catch (e) {
                                i("throw", e)
                            }
                        }

                        function i(e, t) {
                            switch (e) {
                                case "return":
                                    n.resolve({
                                        value: t,
                                        done: !0
                                    });
                                    break;
                                case "throw":
                                    n.reject(t);
                                    break;
                                default:
                                    n.resolve({
                                        value: t,
                                        done: !1
                                    })
                            }(n = n.next) ? r(n.key, n.arg): a = null
                        }
                        var n, a;
                        this._invoke = function(e, t) {
                            return new Promise(function(i, s) {
                                var o = {
                                    key: e,
                                    arg: t,
                                    resolve: i,
                                    reject: s,
                                    next: null
                                };
                                a ? a = a.next = o : (n = a = o, r(e, t))
                            })
                        }, "function" != typeof t.return && (this.return = void 0)
                    }
                    "function" == typeof Symbol && Symbol.asyncIterator && (t.prototype[Symbol.asyncIterator] = function() {
                        return this
                    }), t.prototype.next = function(e) {
                        return this._invoke("next", e)
                    }, t.prototype.throw = function(e) {
                        return this._invoke("throw", e)
                    }, t.prototype.return = function(e) {
                        return this._invoke("return", e)
                    }
                }();
                var D = function(e, t) {
                        if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
                    },
                    U = function(e, t) {
                        if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);
                        e.prototype = Object.create(t && t.prototype, {
                            constructor: {
                                value: e,
                                enumerable: !1,
                                writable: !0,
                                configurable: !0
                            }
                        }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t)
                    },
                    R = function(e, t) {
                        if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                        return !t || "object" != typeof t && "function" != typeof t ? e : t
                    },
                    N = function(e) {
                        function t(r, i) {
                            D(this, t);
                            var n = R(this, e.call(this, r, i));
                            return n.controlText(n.localize("Next playlist item")), n.on(r, ["adstart"], n.disable), n.on(r, ["adend", "adtimeout"], n.enable), n
                        }
                        return U(t, e), t.prototype.buildCSSClass = function() {
                            return "vjs-next-button " + e.prototype.buildCSSClass.call(this)
                        }, t.prototype.createEl = function() {
                            return e.prototype.createEl.call(this, "button", {
                                innerHTML: '<span class="vjs-icon-placeholder" aria-hidden="true"></span>'
                            })
                        }, t.prototype.handleClick = function(e) {
                            this.player_.playlist.next(), this.options_.playOnSelect && this.player_.play()
                        }, t
                    }(r.getComponent("Button"));
                r.registerComponent("NextButton", N);
                var j = "undefined" != typeof e ? e : void 0 !== a ? a : "undefined" != typeof self ? self : {},
                    M = function(e) {
                        function t(n, a) {
                            D(this, t);
                            var s = R(this, e.call(this, n, a));
                            return s.haveSeenEnded_ = !1, s.haveSeenNoPostroll_ = !1, s.closeButton_ = s.addChild("CloseButton"), s.on("click", s.handleClick), s.throttledHandleTimeupdate_ = i.throttle(r.bind(s, s.handleTimeupdate_), 200), s.boundHandleEnded_ = r.bind(s, s.handleEnded_), s.boundHandleLoadstart_ = r.bind(s, s.handleLoadstart_), s.on(s.closeButton_, "close", s.handleClose_), s.on(n, "adstart", s.handleAdStart_), s.on(n, "nopostroll", s.handleNoPostroll_), s.toggleListeners_("on"), s
                        }
                        return U(t, e), t.prototype.createEl = function() {
                            this.countdownEl_ = r.dom.createEl("div", {
                                className: "vjs-next-overlay-countdown"
                            }), this.nameEl_ = r.dom.createEl("div", {
                                className: "vjs-next-overlay-name"
                            }), this.bannerEl_ = r.dom.createEl("div", {
                                className: "vjs-next-overlay-banner"
                            }, {}, [this.countdownEl_, this.nameEl_]);
                            var t = e.prototype.createEl.call(this, "div", {
                                className: "vjs-next-overlay vjs-hidden"
                            });
                            return t.appendChild(this.bannerEl_), t
                        }, t.prototype.dispose = function() {
                            this.bannerEl_ = null, this.countdownEl_ = null, this.nameEl_ = null, this.imageEl_ && r.off(this.imageEl_), this.imageEl_ = null, e.prototype.dispose.call(this)
                        }, t.prototype.handleClick = function(e) {
                            var t = this.closeButton_.el();
                            e.target === t || t.contains(e.target) || this.player_.playlist.next()
                        }, t.prototype.handleStateChanged = function(e) {
                            var t = this,
                                i = e.changes,
                                n = this.state,
                                a = n.name,
                                s = n.seconds,
                                o = n.thumbnail,
                                thumbnail;
                            if (i.seconds) {
                                var u = this.localize("Up next");
                                if(this.canShowCountdown_() && "number" == typeof s)
                                    u = this.localize("Up next in {1} seconds", [s]);
                                r.dom.textContent(this.countdownEl_, u);
                            }
                            if (i.name && r.dom.textContent(this.nameEl_, a || ""), i.thumbnail && (this.imageEl_ && this.el_.removeChild(this.imageEl_), (
                                "string" == typeof o && /\S/.test(o) && (thumbnail = o)
                            )
                            ||
                                    "object" === typeof o && "number" === typeof o.length && "object" === typeof o[0] && "string" === typeof o[0].src && (thumbnail = o[0].src)
                            )) {
                                var l = this.imageEl_ = new j.Image;
                                l.src = thumbnail, l.alt = "", r.on(l, "load", function() {
                                    r.dom.appendContent(t.el_, l)
                                }), r.on(l, "error", function() {
                                    t.imageEl_ = null
                                })
                            }
                        }, t.prototype.shouldShow_ = function() {
                            var e = this.player(),
                                t = e.playlist;
                            return !(this.hiddenByUser_ || t.nextIndex() === t.currentIndex() || e.getChild("NextEndscreen") && e.ended())
                        }, t.prototype.canShowCountdown_ = function() {
                            var e = this.player();
                            return "number" == typeof e.playlist.autoadvance_.delay && (!e.usingPlugin("ads") || (J && J.forceCountdown) || this.haveSeenNoPostroll_ || this.haveSeenEnded_)
                        }, t.prototype.getRemaining_ = function() {
                            var e = this.player(),
                                t = e.duration(),
                                r = e.currentTime(),
                                i = void 0;
                            if (i = t > 30 ? t - 10 : Math.ceil(.6666 * t), !(r < i)) {
                                var n = Math.ceil(t) - Math.ceil(r);
                                return e.playlist.autoadvance_.delay && (n += e.playlist.autoadvance_.delay), n
                            }
                        }, t.prototype.handleClose_ = function() {
                            this.hiddenByUser_ = !0, this.hide()
                        }, t.prototype.toggleListeners_ = function(e) {
                            this[e](this.player_, "ended", this.boundHandleEnded_), this[e](this.player_, "loadstart", this.boundHandleLoadstart_), this[e](this.player_, "timeupdate", this.throttledHandleTimeupdate_)
                        }, t.prototype.handleAdStart_ = function() {
                            var e = this;
                            this.hide(), this.toggleListeners_("off"), this.one(this.player_, ["adend", "adtimeout"], function() {
                                e.toggleListeners_("on")
                            })
                        }, t.prototype.handleNoPostroll_ = function() {
                            this.haveSeenNoPostroll_ = !0
                        }, t.prototype.handleEnded_ = function() {
                            var e = this;
                            if (this.haveSeenEnded_ = !0, this.clearInterval(this.countdownInterval_), this.shouldShow_()) {
                                var t = this.player().playlist.autoadvance_.delay;
                                if (t > 0) {
                                    var r = Date.now();
                                    this.show(), this.state.seconds = null, this.setState({
                                        seconds: t
                                    }), this.countdownInterval_ = this.setInterval(function() {
                                        var i = Date.now();
                                        i - r >= 1e3 && (r = i, t--, e.setState({
                                            seconds: t
                                        }), 0 === t && e.clearInterval(e.countdownInterval_))
                                    }, 100)
                                }
                            } else this.hide()
                        }, t.prototype.handleLoadstart_ = function() {
                            var e = this.player().playlist,
                                t = e()[e.nextIndex()];
                            this.clearInterval(this.countdownInterval_), this.hiddenByUser_ = !1, this.haveSeenEnded_ = !1, this.haveSeenNoPostroll_ = !1, this.hide(), t && this.setState({
                                name: t.name,
                                thumbnail: t.thumbnail
                            })
                        }, t.prototype.handleTimeupdate_ = function() {
                            this.shouldShow_() ? (this.setState({
                                seconds: this.getRemaining_()
                            }), this.state.seconds >= 0 ? this.show() : this.hide()) : this.hide()
                        }, t
                    }(r.getComponent("Component"));
                r.registerComponent("NextOverlay", M);
                var B = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
                        return typeof e
                    } : function(e) {
                        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
                    },
                    F = (function() {
                        function e(e) {
                            this.value = e
                        }

                        function t(t) {
                            function r(n, a) {
                                try {
                                    var s = t[n](a),
                                        o = s.value;
                                    o instanceof e ? Promise.resolve(o.value).then(function(e) {
                                        r("next", e)
                                    }, function(e) {
                                        r("throw", e)
                                    }) : i(s.done ? "return" : "normal", s.value)
                                } catch (e) {
                                    i("throw", e)
                                }
                            }

                            function i(e, t) {
                                switch (e) {
                                    case "return":
                                        n.resolve({
                                            value: t,
                                            done: !0
                                        });
                                        break;
                                    case "throw":
                                        n.reject(t);
                                        break;
                                    default:
                                        n.resolve({
                                            value: t,
                                            done: !1
                                        })
                                }(n = n.next) ? r(n.key, n.arg): a = null
                            }
                            var n, a;
                            this._invoke = function(e, t) {
                                return new Promise(function(i, s) {
                                    var o = {
                                        key: e,
                                        arg: t,
                                        resolve: i,
                                        reject: s,
                                        next: null
                                    };
                                    a ? a = a.next = o : (n = a = o, r(e, t))
                                })
                            }, "function" != typeof t.return && (this.return = void 0)
                        }
                        "function" == typeof Symbol && Symbol.asyncIterator && (t.prototype[Symbol.asyncIterator] = function() {
                            return this
                        }), t.prototype.next = function(e) {
                            return this._invoke("next", e)
                        }, t.prototype.throw = function(e) {
                            return this._invoke("throw", e)
                        }, t.prototype.return = function(e) {
                            return this._invoke("return", e)
                        }
                    }(), function(e, t) {
                        return "function" == typeof e.usingPlugin ? e.usingPlugin(t) : "ads" === t ? "object" === B(e.ads) : "playlist" === t ? !(!e.playlist || "object" !== B(e.playlist.autoadvance_)) : !!e[t]
                    }),
                    q = function(e) {
                        e.postrollStarted = !1, e.postrollFinished = !1, e.postrollTimedOut = !1, e.sawNoPostrollEvent = !1
                    },
                    V = function() {
                        var e = this;
                        if (!this.endscreenState_) {
                            var t = this.endscreenState_ = {},
                                r = function() {
                                    return e.trigger("endscreen")
                                };
                            q(t), this.on("adstart", function() {
                                var r = e.ended();
                                t.postrollStarted = r, t.postrollFinished = !r
                            }), this.on("adend", function() {
                                t.postrollFinished = e.ended()
                            }), this.on("adtimeout", function() {
                                t.postrollTimedOut = e.ended()
                            }), this.on(["endscreen", "loadstart"], function() {
                                e.off("adend", r), q(t)
                            }), this.on("nopostroll", function() {
                                t.sawNoPostrollEvent = !0
                            }), this.on("ended", function() {
                                (function(e) {
                                    if (!F(e, "playlist")) return !1;
                                    var t = e.playlist,
                                        r = t();
                                    return !(0 !== t.autoadvance_.delay || !r.length) && (t.repeat() || t.currentItem() !== r.length - 1)
                                })(e) || (! function(e) {
                                    if (!F(e, "ads")) return !1;
                                    var t = e.endscreenState_;
                                    return !t.sawNoPostrollEvent && t.postrollStarted && !t.postrollFinished && !t.postrollTimedOut
                                }(e) ? r() : e.one("adend", r))
                            })
                        }
                    };
                r.registerPlugin ? r.getPlugin("endscreen") || r.registerPlugin("endscreen", V) : r.plugin("endscreen", V);
                var H = j.Date,
                    z = r.getComponent("Button"),
                    G = r.getComponent("ModalDialog"),
                    W = function(e) {
                        return "string" == typeof e && /\S/.test(e)
                    },
                    Y = function(e) {
                        function t() {
                            return D(this, t), R(this, e.apply(this, arguments))
                        }
                        return U(t, e), t.prototype.buildCSSClass = function() {
                            return "vjs-play-control " + e.prototype.buildCSSClass.call(this)
                        }, t.prototype.handleClick = function(e) {
                            e.stopPropagation(), this.player_.playlist.next()
                        }, t
                    }(z),
                    X = function(e) {
                        function t(r, i) {
                            D(this, t);
                            var n = R(this, e.call(this, r, i));
                            return r.endscreen(), n.closeable(!1), n.on("click", n.handleClick), n.on(r, "endscreen", n.handleEndscreen_), n.on(r, "loadstart", n.handleLoadstart_), n.on(r, "adstart", n.handleAdStart_), n
                        }
                        return U(t, e), t.prototype.buildCSSClass = function() {
                            return "vjs-next-endscreen " + e.prototype.buildCSSClass.call(this)
                        }, t.prototype.dispose = function() {
                            this.countdownEl_ = null, this.nameEl_ = null, this.thumbPlay_ && this.thumbPlay_.dispose(), this.imageEl_ && r.off(this.imageEl_), this.imageEl_ = null, this.thumbEl_ = null, e.prototype.dispose.call(this)
                        }, t.prototype.content = function() {
                            var e = this;
                            return this.countdownEl_ = r.dom.createEl("div", {
                                className: "vjs-next-endscreen-countdown"
                            }), this.nameEl_ = r.dom.createEl("div", {
                                className: "vjs-next-endscreen-name"
                            }), this.thumbEl_ = r.dom.createEl("div", {
                                className: "vjs-next-endscreen-thumbnail"
                            }), W(this.state.name) && r.dom.textContent(this.nameEl_, this.state.name), this.thumbPlay_ && (this.thumbPlay_.dispose(), this.thumbPlay_ = null), W(this.state.thumbnail) ? (this.imageEl_ = new j.Image, this.imageEl_.src = this.state.thumbnail, this.imageEl_.alt = "", r.on(this.imageEl_, "load", function() {
                                e.thumbPlay_ = new Y(e.player()), r.dom.appendContent(e.thumbEl_, [e.imageEl_, e.thumbPlay_.el()])
                            }), r.on(this.imageEl_, "error", function() {
                                e.imageEl_ = null
                            })) : (this.thumbEl_ = null, this.imageEl_ = null), [this.countdownEl_, this.nameEl_, this.thumbEl_]
                        }, t.prototype.handleClick = function(e) {
                            this.player_.playlist.next()
                        }, t.prototype.handleStateChanged = function(e) {
                            var t = this;
                            e.changes.seconds && this.requestAnimationFrame(function() {
                                r.dom.textContent(t.countdownEl_, t.localize("Up next in {1} seconds", [t.state.seconds]))
                            })
                        }, t.prototype.shouldOpen_ = function() {
                            var e = this.player(),
                                t = e.playlist;
                            return !(e.usingPlugin("customEndscreen") || e.usingPlugin("social") && e.socialOverlay && e.socialOverlay.asEndscreen()) && (t.nextIndex() !== t.currentIndex() && "number" == typeof t.autoadvance_.delay)
                        }, t.prototype.handleEndscreen_ = function() {
                            var e = this;
                            if (this.clearInterval(this.countdownInterval_), this.shouldOpen_()) {
                                var t = this.player().playlist.autoadvance_.delay;
                                if (t > 0) {
                                    var r = H.now();
                                    this.open(), this.setState({
                                        seconds: t
                                    }), this.countdownInterval_ = this.setInterval(function() {
                                        var i = H.now();
                                        i - r >= 1e3 && (r = i, t--, e.setState({
                                            seconds: t
                                        }), 0 === t && e.clearInterval(e.countdownInterval_))
                                    }, 100)
                                }
                            } else this.close()
                        }, t.prototype.handleLoadstart_ = function() {
                            var e = this.player().playlist,
                                t = e()[e.nextIndex()];
                            this.clearInterval(this.countdownInterval_), this.close(), t && this.setState({
                                name: t.name,
                                seconds: void 0,
                                thumbnail: t.thumbnail
                            })
                        }, t.prototype.handleAdStart_ = function() {
                            this.opened() && (this.clearInterval(this.countdownInterval_), this.setState({
                                seconds: void 0
                            }), this.close())
                        }, t
                    }(G);
                X.prototype.options_ = {
                    fillAlways: !0,
                    pauseOnOpen: !0,
                    temporary: !1
                }, r.registerComponent("NextEndscreen", X);
                var K = function(e) {
                    function t() {
                        return D(this, t), R(this, e.apply(this, arguments))
                    }
                    return U(t, e), t.prototype.createEl = function() {
                        return this.listEl_ = r.dom.createEl("div", {
                            className: "vjs-playlist"
                        }), r.dom.createEl("div", {
                            className: "vjs-playlist-sidebar vjs-playlist-sidebar-" + this.options_.orientation
                        }, {}, this.listEl_)
                    }, t.prototype.listEl = function() {
                        return this.listEl_
                    }, t.prototype.toggleHidden = function() {}, t
                }(r.getComponent("Component"));
                r.registerComponent("PlaylistSidebar", K);
                var $ = function(e) {
                    function t(r, i) {
                        D(this, t);
                        var n = R(this, e.call(this, r, i));
                        return n.setState({
                            hidden: !!i.hideOnStart
                        }), n.on(n.showHideEl_, "click", function() {
                            return n.toggleHidden()
                        }), n.on(r, "play", function() {
                            return n.toggleHidden(!0)
                        }), n.on(c.body, ["mouseenter", "mouseleave"], function(e) {
                            n.toggleClass("vjs-playlist-show-hide-hidden", "mouseleave" === e.type)
                        }), n
                    }
                    return U(t, e), t.prototype.createEl = function() {
                        var t = e.prototype.createEl.call(this);
                        return this.showHideBtnEl_ = r.dom.createEl("button"), this.showHideEl_ = r.dom.createEl("div", {
                            className: "vjs-playlist-show-hide"
                        }, {}, this.showHideBtnEl_), t.appendChild(this.showHideEl_), t
                    }, t.prototype.handleStateChanged = function(e) {
                        var t = this;
                        if (e.changes.hidden) {
                            var i = e.changes.hidden.to;
                            this.toggleClass("vjs-playlist-hidden", i), r.dom.textContent(this.showHideBtnEl_, i ? "<" : ">"), this.setState({
                                animating: !0
                            })
                        }
                        if (e.changes.animating) {
                            var n = e.changes.animating.to;
                            this.toggleClass("vjs-playlist-animating", n), n && this.setTimeout(function() {
                                return t.setState({
                                    animating: !1
                                })
                            }, 50)
                        }
                    }, t.prototype.toggleHidden = function(e) {
                        void 0 === e && (e = !this.state.hidden), this.state.animating || this.setState({
                            hidden: e
                        })
                    }, t
                }(K);
                $.defaultState = {
                    hidden: void 0,
                    animating: !1
                }, r.registerComponent("CollapsiblePlaylistSidebar", $);
                var J = {
                        hideOnStart: false,
                        nextButton: true,
                        nextOverlay: true,
                        nextEndscreen: true,
                        playOnSelect: false,
                        forceCountdown: true,
                        repeat: false,
                        shuffle: false
                    },
                    Q = function(e) {
                        function t(i, n) {
                            D(this, t);
                            var a = R(this, e.call(this, i, n));
                            return a.options = r.mergeOptions(J, n), a.isInIframe_ = r.dom.hasClass(playerElement.parentElement, "bc-iframe"), i.addClass("vjs-playlist-enabled"), a.orientation_ = a.options.horizontal ? "horizontal" : "vertical", a.initPlaylist_(), a.initPlaylistUi_(), a.initNextButton_(), a.initNextEndscreen_(), a.initNextOverlay_(), a.isInIframe_ && (a.handlePlaylistChangeBound_ = r.bind(a, a.handlePlaylistChange_), a.on(i, "playlistchange", a.handlePlaylistChangeBound_), a.handlePlaylistChangeBound_()), a
                        }
                        return U(t, e), t.prototype.toggleSidebar = function() {
                            this.sidebar_ && this.sidebar_.toggleHidden()
                        }, t.prototype.dispose = function() {
                            var t = this;
                            e.prototype.dispose.call(this), ["sidebar_", "nextButton_", "nextOverlay_", "nextEndscreen_"].forEach(function(e) {
                                t[e] && t[e].dispose()
                            })
                        }, t.prototype.initNextButton_ = function() {
                            var e = this.options,
                                t = e.nextButton,
                                r = e.playOnSelect;
                            if (t) {
                                i.isObj(t) || (t = {}), t.hasOwnProperty("playOnSelect") || (t.playOnSelect = !!r);
                                var n = this.player.getChild("controlBar"),
                                    a = n.children().map(function(e) {
                                        return e.name()
                                    }).indexOf("PlayToggle") + 1;
                                this.nextButton_ = n.addChild("NextButton", t, a)
                            }
                        }, t.prototype.initNextOverlay_ = function() {
                            var nowOptions = this.options,
                                t = this.player;
                            nowOptions.nextOverlay && (this.nextOverlay_ = t.addChild("NextOverlay", {nextOverlay:nowOptions.nextOverlay}))
                        }, t.prototype.initNextEndscreen_ = function() {
                            var nowOptions = this.options,
                                t = this.player;
                            nowOptions.nextEndscreen && (this.nextEndscreen_ = t.addChild("NextEndscreen", {nextEndscreen:nowOptions.nextEndscreen}))
                        }, t.prototype.initPlaylist_ = function() {
                            var e = this.options,
                                t = this.player;
                            e.shuffle && t.on("duringplaylistchange", function() {
                                return t.playlist.shuffle()
                            }), t.playlist(e.playlist), t.playlist.repeat(!!e.repeat), void 0 !== e.autoadvance && t.playlist.autoadvance(e.autoadvance)
                        }, t.prototype.initPlaylistUi_ = function() {
                            var e = this,
                                t = this.options,
                                i = this.player,
                                n = {
                                    horizontal: t.horizontal,
                                    playOnSelect: t.playOnSelect
                                };
                            this.isInIframe_ ? (t.horizontal ? this.sidebar_ = i.addChild("PlaylistSidebar", {
                                orientation: this.orientation_
                            }) : this.sidebar_ = i.addChild("CollapsiblePlaylistSidebar", {
                                hideOnStart: t.hideOnStart,
                                orientation: this.orientation_
                            }), i.el().parentNode.appendChild(this.sidebar_.el()), n.el = this.sidebar_.listEl(), this.finalizePlaylistUi_(n)) : "complete" === c.readyState ? this.finalizePlaylistUi_(n) : r.one(c, "DOMContentLoaded", function() {
                                e.finalizePlaylistUi_(n)
                            })
                        }, t.prototype.finalizePlaylistUi_ = function(e) {
                            var t = this.player,
                                r = t.bcinfo,
                                i = r && r.playerId || t.tagAttributes["data-player"],
                                n = r && r.embedId || t.tagAttributes["data-embed"],
                                a = r && r.applicationId || t.tagAttributes["data-application-id"];
                            if (t.el()) {
                                var s = topElement.querySelector('.vjs-playlist[data-for="' + t.id() + '"]');
                                if (s) e.el = s;
                                else if (i && n)
                                    for (var o = Array.prototype.slice.call(topElement.querySelectorAll('.vjs-playlist[data-player="' + i + '"][data-embed="' + n + '"]')), u = 0; u < o.length; u++) {
                                        var l = o[u];
                                        if (!a) {
                                            e.el = l;
                                            break
                                        }
                                        if (a === l.getAttribute("data-application-id")) {
                                            e.el = l;
                                            break
                                        }
                                    }
                                t.playlistUi(e)
                            }
                        }, t.prototype.handlePlaylistChange_ = function() {
                            var e = "vjs-playlist-" + this.orientation_ + "-enabled";
                            this.isInIframe_ && (this.player.playlist().length ? (r.dom.addClass(c.body, e), this.sidebar_.show()) : (r.dom.removeClass(c.body, e), this.sidebar_.hide()))
                        }, t
                    }(r.getPlugin("plugin"));
                return r.registerPlugin("bcPlaylistUi", Q), Q.VERSION = "3.3.1", Q
            })
        })(videojs, document);
        (function () {
            /*
            if(0) player.playlist([{
                name: 'Disney\'s Oceans 1',
                description: 'Explore the depths of our planet\'s oceans. ' +
                    'Experience the stories that connect their world to ours. ' +
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
                    'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
                    'aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
                    'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
                    'dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
                    'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
                    'proident, sunt in culpa qui officia deserunt mollit anim id est ' +
                    'laborum.',
                duration: 45,
                data: {
                    id: 1
                },
                sources: [
                    { src: 'http://vjs.zencdn.net/v/oceans.mp4', type: 'video/mp4' },
                    { src: 'http://vjs.zencdn.net/v/oceans.webm', type: 'video/webm' },
                ],

                // you can use <picture> syntax to display responsive images
                thumbnail: [
                    {
                        srcset: 'test/example/oceans.jpg',
                        type: 'image/jpeg',
                        media: '(min-width: 400px;)'
                    },
                    {
                        src: 'test/example/oceans-low.jpg'
                    }
                ]
            },
                {
                    name: 'Disney\'s Oceans 2',
                    description: 'Explore the depths of our planet\'s oceans. ' +
                        'Experience the stories that connect their world to ours. ' +
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
                        'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
                        'aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
                        'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
                        'dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
                        'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
                        'proident, sunt in culpa qui officia deserunt mollit anim id est ' +
                        'laborum.',
                    duration: 45,
                    data: {
                        id: 2
                    },
                    sources: [
                        { src: 'http://vjs.zencdn.net/v/oceans.mp4?2', type: 'video/mp4' },
                        { src: 'http://vjs.zencdn.net/v/oceans.webm?2', type: 'video/webm' },
                    ],

                    // you can use <picture> syntax to display responsive images
                    thumbnail: [
                        {
                            srcset: 'test/example/oceans.jpg',
                            type: 'image/jpeg',
                            media: '(min-width: 400px;)'
                        },
                        {
                            src: 'test/example/oceans-low.jpg'
                        }
                    ]
                },
                {
                    name: 'Disney\'s Oceans 3',
                    description: 'Explore the depths of our planet\'s oceans. ' +
                        'Experience the stories that connect their world to ours. ' +
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
                        'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
                        'aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
                        'laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure ' +
                        'dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
                        'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non ' +
                        'proident, sunt in culpa qui officia deserunt mollit anim id est ' +
                        'laborum.',
                    duration: 45,
                    sources: [
                        { src: 'http://vjs.zencdn.net/v/oceans.mp4?3', type: 'video/mp4' },
                        { src: 'http://vjs.zencdn.net/v/oceans.webm?3', type: 'video/webm' },
                    ],

                    // you can use <picture> syntax to display responsive images
                    thumbnail: [
                        {
                            srcset: 'test/example/oceans.jpg',
                            type: 'image/jpeg',
                            media: '(min-width: 400px;)'
                        },
                        {
                            src: 'test/example/oceans-low.jpg'
                        }
                    ]
                }, {
                    name: 'Sintel (No Thumbnail)',
                    description: 'The film follows a girl named Sintel who is searching for a baby dragon she calls Scales.',
                    sources: [
                        { src: 'http://media.w3.org/2010/05/sintel/trailer.mp4', type: 'video/mp4' },
                        { src: 'http://media.w3.org/2010/05/sintel/trailer.webm', type: 'video/webm' },
                        { src: 'http://media.w3.org/2010/05/sintel/trailer.ogv', type: 'video/ogg' }
                    ],
                    thumbnail: false
                },

                // This is a really underspecified video to demonstrate the
                // behavior when optional parameters are missing. You'll get better
                // results with more video metadata!
                {
                    name: 'Invalid Source',
                    sources: [{
                        src: 'Invalid'
                    }]
                }]);
        */

            player.playlist(playListToUse ? playListToUse : playList.items);
            // Initialize the playlist-ui plugin with no option (i.e. the defaults).
            if(!options)
                options = {};
            if(typeof options.autoadvance === 'undefined')
                options.autoadvance = 0;
            if(typeof options.forceCountdown === 'undefined')
                options.forceCountdown = true;
            if(typeof options.playOnSelect === 'undefined')
                options.playOnSelect = true;
            var uiInstance = player.bcPlaylistUi(options);
            // FIX: Sometimes (at least on autoplay), the overlay showing the next video doesn't update right
            var tries = 4,tryNumber = 0;
            var intervalChecker = setInterval(function () {
                if(uiInstance && uiInstance.nextOverlay_ && uiInstance.nextOverlay_.state && uiInstance.nextOverlay_.state.name) {
                    var playlist = uiInstance.player.playlist(), playlistCurrentItem = uiInstance.player.playlist.currentItem();
                    if(playlist.length && playlistCurrentItem>=0 && playlistCurrentItem < playlist.length) {
                        var item = playlist[playlistCurrentItem];
                        if (uiInstance.nextOverlay_.state.name === item.name) {
                            uiInstance.nextOverlay_.handleLoadstart_();
                            cLog("FIX uiInstance DONE",uiInstance,item,item.name,uiInstance.nextOverlay_.state,uiInstance.nextOverlay_.state.name);
                            if(++tryNumber > tries) {
                                clearInterval(intervalChecker);
                                intervalChecker = 0;
                            }
                        }
                    }
                }
            },1000);
            playerStorage.disposeCallback.push(function(x) {
                if(intervalChecker) clearInterval(intervalChecker)
                intervalChecker = 0;
            });
            // End FIX
        })();
    }
    var plExport = {playListEnabled:playListEnabled,installPlayList:installPlayList};
    /* End Amp Playlist */

; browserify_shim__define__module__export__(typeof plExport != "undefined" ? plExport : window.plExport);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"global":8}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkState = checkState;
exports.loaded = loaded;
exports.prepareComScore = prepareComScore;
var _log = require("../log/log");
var comScoreID = 0,
  comScore;
function prepareComScore(useComScoreID, playerStorageToUse) {
  if (playerStorageToUse) playerStorage = playerStorageToUse;
  if (!useComScoreID) return false;
  if (typeof window.comScore6 !== 'string') return false;
  var d = document,
    s = 'script';
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s);
  j.async = true;
  j.src = window.comScore6;
  j.onload = loaded;
  f.parentNode.insertBefore(j, f);
  comScoreID = useComScoreID;
}
function loaded() {
  (0, _log.cLog)("HERE loaded comScore6", comScoreID, window.ns_.ReducedRequirementsStreamingAnalytics);
  if (typeof ns_.ReducedRequirementsStreamingAnalytics !== 'function') {
    (0, _log.cLog)("missing ns_.ReducedRequirementsStreamingAnalytics");
    return;
  }
  setInterval(checkState, 500);
  window.addEventListener('beforeunload', function () {
    (0, _log.cLog)('beforeunload', comScore);
    if (comScore) {
      comScore.stop();
      comScore = undefined;
    }
  });
  window.addEventListener('unload', function () {
    (0, _log.cLog)('unload', comScore);
    if (comScore) {
      comScore.stop();
      comScore = undefined;
    }
  });
}
var playingAnAd = false;
var playingContent = false;
var comScoreStopped = true;
var c3, playerStorage;
try {
  c3 = window.location.hostname && window.location.hostname.length ? window.location.hostname.split('.').slice(-2).join('.') : window.location.hostname;
} catch (e) {}
function checkState() {
  if (typeof playerStorage.playerState === 'undefined') return;
  if (playerStorage.playerState.adManager.playingAnAd !== playingAnAd) {
    if (playerStorage.playerState.adManager.playingAnAd) {
      var metadata = {
        ns_st_cl: 0
      };
      if (typeof c3 === 'string' && c3.length) metadata.c3 = c3;
      if (!comScoreStopped) {
        comScoreStopped = true;
        if (comScore) comScore.stop();
        comScore = undefined;
      }
      comScore = new ns_.ReducedRequirementsStreamingAnalytics({
        publisherId: comScoreID
      });
      comScore.playVideoAdvertisement(metadata, ns_.ReducedRequirementsStreamingAnalytics.AdType.LinearOnDemandPreRoll);
      comScoreStopped = false;
      playingContent = false;
    } else if (!comScoreStopped) {
      comScoreStopped = true;
      comScore.stop();
      comScore = undefined;
    }
    playingAnAd = playerStorage.playerState.adManager.playingAnAd;
    return;
  }
  if (playingAnAd) return;
  if (playerStorage.playerState.playingVidCo !== playingContent) {
    if (playerStorage.playerState.playingVidCo) {
      var currentVideo;
      try {
        var playlist = playerStorage.player.playlist();
        var currentIndex = playerStorage.player.playlist.currentItem();
        currentVideo = playlist[currentIndex];
      } catch (e) {}
      var _metadata = {
        ns_st_ci: currentVideo ? currentVideo.description_url : 0,
        ns_st_cl: currentVideo ? currentVideo.duration * 1000 : 0,
        ns_st_pr: 'Ampliffy',
        ns_st_ge: '*null',
        ns_st_ia: '0',
        ns_st_ce: '0',
        ns_st_ddt: '*null',
        ns_st_tdt: '*null',
        ns_st_ep: currentVideo ? currentVideo.name : 0
      };
      if (typeof c3 === 'string' && c3.length) _metadata.c3 = c3;
      if (!comScoreStopped) {
        comScoreStopped = true;
        if (comScore) comScore.stop();
        comScore = undefined;
      }
      comScore = new ns_.ReducedRequirementsStreamingAnalytics({
        publisherId: comScoreID
      });
      comScore.playVideoContentPart(_metadata, ns_.ReducedRequirementsStreamingAnalytics.ContentType.ShortFormOnDemand);
      comScoreStopped = false;
      playingAnAd = false;
    } else if (!comScoreStopped) {
      comScoreStopped = true;
      comScore.stop();
      comScore = undefined;
    }
    playingContent = playerStorage.playerState.playingVidCo;
    // noinspection UnnecessaryReturnStatementJS
    return;
  }
}

},{"../log/log":62}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCoords = getCoords;
function getCoords(elem) {
  var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  // crossbrowser version
  var box = elem.getBoundingClientRect();
  var body = doc.body;
  var docEl = doc.documentElement;
  var win = doc.defaultView;
  var scrollTop = win.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = win.pageXOffset || docEl.scrollLeft || body.scrollLeft;
  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  return {
    top: Math.round(top),
    left: Math.round(left)
  };
}

},{}],48:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCookie = getCookie;
exports.getTopCookie = getTopCookie;
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
function getTopCookie(name) {
  var value = "; " + top.document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

},{}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDeviceSizeOrientationAware = getDeviceSizeOrientationAware;
var _orientation = require("./orientation");
function getDeviceSizeOrientationAware() {
  var orientation = (0, _orientation.getOrientation)();
  var screenWidth, screenHeight;
  if (orientation === "landscape-primary" || orientation === "landscape-secondary") {
    if (screen.width > screen.height) {
      screenWidth = screen.width;
      screenHeight = screen.height;
    } else {
      screenWidth = screen.height;
      screenHeight = screen.width;
    }
  } else if (orientation === "portrait-secondary" || orientation === "portrait-primary") {
    if (screen.width > screen.height) {
      screenWidth = screen.height;
      screenHeight = screen.width;
    } else {
      screenWidth = screen.width;
      screenHeight = screen.height;
    }
  } else if (orientation === undefined) {
    screenWidth = screen.width;
    screenHeight = screen.height;
  }
  return {
    screenWidth: screenWidth,
    screenHeight: screenHeight
  };
}

},{"./orientation":50}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOrientation = getOrientation;
function getOrientation() {
  var orientationByAPI = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
  if (!orientationByAPI && window.orientation) {
    switch (window.orientation) {
      case 0:
        return 'portrait-primary';
      case 90:
        return 'landscape-primary';
      case -90:
        return 'portrait-secondary';
      case 180:
        return 'landscape-secondary';
    }
    return orientationByAPI;
  }
}

},{}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseQuery = parseQuery;
exports.parseQueryString = parseQueryString;
exports.removeDuplicateURLParameters = removeDuplicateURLParameters;
exports.serializeQueryString = serializeQueryString;
function parseQuery(queryString, returnObject) {
  var query = returnObject || {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}
function parseQueryString(str) {
  // parse will split the string along the &
  // and loop over the result

  var keyValues, len, parts, key, value, result;
  result = {};
  var sepToken = '&';
  keyValues = str.split(sepToken);
  len = keyValues.length;
  for (var i = 0; i < len; i++) {
    var el = keyValues[i];
    if (!el.length) continue;
    parts = el.split('=', 2);
    key = parts[0];
    value = parts[1];

    // this will replace any duplicate param
    // with the last value found
    result[key] = value;
  }
  return result;
}
function serializeQueryString(data) {
  // serialize simply loops over the data and constructs a new string

  var prop, result, value;
  result = [];
  for (prop in data) {
    if (data.hasOwnProperty(prop)) {
      value = data[prop];

      // push each serialized key value into an array
      if (value === undefined) result.push(prop);else result.push(prop + '=' + value);
    }
  }

  // return the resulting array joined on &
  return result.join("&");
}
function removeDuplicateURLParameters(url) {
  var hashParts = url.split('#', 2);
  if (hashParts[0].indexOf('?') < 0) return url;
  var parts = hashParts[0].split('?');
  var queryStr = parts[1]; // get only the query
  var data = parseQueryString(queryStr);
  var returnUrl = parts[0] + '?' + serializeQueryString(data);
  if (hashParts.length > 1) returnUrl += "#" + hashParts[1];
  return returnUrl;
}

},{}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isShadowDOMAvailable = isShadowDOMAvailable;
var _version = require("./version");
function isShadowDOMAvailable() {
  // TODO: Change this when finished testing, to use the most used technology whenever we can.
  var chromeVersion = (0, _version.getChromeVersion)();
  return !document.head.createShadowRoot && document.head.attachShadow;
  return !document.head.createShadowRoot && document.head.attachShadow && (chromeVersion >= 85 || document.location && document.location.hostname && document.location.hostname.match(/asivaespana.com$/));
}

},{"./version":53}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChromeVersion = getChromeVersion;
function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

},{}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showNonPersonalizedAds = showNonPersonalizedAds;
/* TODO: There is a task to be done later, to really grab the User Consent. This is a placeholder, which
         currently represents what Google Ads Manager (GPT) does right now
 */
function showNonPersonalizedAds() {
  return false;
}

},{}],55:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FluidObserver = void 0;
var _device = require("../browser/device");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var FluidObserver = /*#__PURE__*/function () {
  function FluidObserver() {
    var elementToWatch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var ratio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5625;
    _classCallCheck(this, FluidObserver);
    this.elementToWatch = elementToWatch;
    if (ratio <= 0) throw "Invalid ratio " + ratio;
    this.containerRatio = ratio;
    this.fluidObservers = [];
  }
  _createClass(FluidObserver, [{
    key: "installFluidIntervalChecker",
    value: function installFluidIntervalChecker() {
      var intervalMS = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1500;
      if (this.intervalChecker) clearInterval(this.intervalChecker);
      this.intervalChecker = setInterval(this.fixFluidViaJS.bind(this), intervalMS);
    }
  }, {
    key: "fixFluidViaJS",
    value: function fixFluidViaJS() {
      if (!this.containerRatio) return false;
      var elementToWatch = this.elementToWatch;
      var _getDeviceSizeOrienta = (0, _device.getDeviceSizeOrientationAware)(),
        screenWidth = _getDeviceSizeOrienta.screenWidth,
        screenHeight = _getDeviceSizeOrienta.screenHeight;
      var windowWidth = top.innerWidth > 0 ? Math.min(top.innerWidth, screenWidth) : screenWidth;
      var windowHeight = top.innerHeight > 0 ? Math.min(top.innerHeight, screenHeight) : screenHeight;
      var w = Math.min(elementToWatch.offsetWidth, windowWidth),
        h = Math.min(elementToWatch.offsetHeight, windowHeight);
      var calcW = Math.floor(Math.min(elementToWatch.offsetWidth, h / this.containerRatio)),
        calcH = Math.floor(Math.min(elementToWatch.offsetHeight, w * this.containerRatio + 0.9));
      var finalW, finalH;
      if (calcW >= w) {
        // The width limits
        finalW = w;
        finalH = calcH;
      } else {
        finalW = calcW;
        finalH = h;
      }
      finalW = Math.round(finalW);
      finalH = Math.round(finalH);
      if (finalW < 100 || finalH < 70) return; // When we enter fullscreen, finalW == finalH == 0

      if (typeof finalW !== 'number' || typeof finalH !== 'number') return;
      if (isNaN(finalH) || isNaN(finalW)) return;
      if (isNaN(this.lastHeight) || isNaN(this.lastWidth)) {
        this.lastWidth = finalW;
        this.lastHeight = finalH;
      }
      if (this.lastWidth === finalW && this.lastHeight === finalH) return;
      this.lastWidth = finalW;
      this.lastHeight = finalH;
      this.fluidObservers.forEach(function (x) {
        return x();
      });
      return true;
    }
  }, {
    key: "addFluidObserver",
    value: function addFluidObserver(observer) {
      if (this.fluidObservers.find(function (x) {
        return x === observer;
      })) return false;
      this.fluidObservers.push(observer);
      return true;
    }

    // noinspection JSUnusedGlobalSymbols
  }, {
    key: "removeFluidObserver",
    value: function removeFluidObserver(observer) {
      this.fluidObservers = this.fluidObservers.filter(function (x) {
        return x !== observer;
      });
      return true;
    }
  }]);
  return FluidObserver;
}();
exports.FluidObserver = FluidObserver;

},{"../browser/device":49}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SizeRegistry = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var SizeRegistry = /*#__PURE__*/function () {
  function SizeRegistry() {
    _classCallCheck(this, SizeRegistry);
    _defineProperty(this, "registry", {});
    _defineProperty(this, "type", "");
    _defineProperty(this, "playerResize", function () {});
    _defineProperty(this, "interval", undefined);
  }
  _createClass(SizeRegistry, [{
    key: "getSize",
    value: function getSize() {
      return this.registry[this.type];
    }
  }, {
    key: "setSizeByType",
    value: function setSizeByType(type, width, height) {
      this.registry[type] = {
        width: width,
        height: height
      };
    }
  }, {
    key: "getSizeByType",
    value: function getSizeByType(type) {
      return this.registry[type];
    }
  }, {
    key: "setType",
    value: function setType(newType) {
      this.type = newType;
    }
  }, {
    key: "getType",
    value: function getType() {
      return this.type;
    }
  }, {
    key: "getRegistry",
    value: function getRegistry() {
      return this.registry;
    }
  }, {
    key: "setPlayerResize",
    value: function setPlayerResize(callback) {
      this.playerResize = callback;
    }
  }, {
    key: "getPlayerResize",
    value: function getPlayerResize() {
      return this.playerResize;
    }
  }, {
    key: "doResize",
    value: function doResize() {
      var _this$registry$this$t = this.registry[this.type],
        width = _this$registry$this$t.width,
        height = _this$registry$this$t.height;
      this.playerResize(width, height);
    }
  }, {
    key: "startResize",
    value: function startResize() {
      var _this = this;
      var _this$registry$this$t2 = this.registry[this.type],
        width = _this$registry$this$t2.width,
        height = _this$registry$this$t2.height;
      console.log('startResize', width, height, top.ampRegistryTest);
      this.playerResize(width, height);
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(function () {
        return _this.doResize();
      }, 500);
    }
  }, {
    key: "stopResize",
    value: function stopResize() {
      if (this.interval) clearInterval(this.interval);
      this.interval = null;
    }
  }]);
  return SizeRegistry;
}();
exports.SizeRegistry = SizeRegistry;

},{}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addStyles = addStyles;
function addStyles(jsStyles, rootElement) {
  var anchor = rootElement || document;
  var head = anchor.head || anchor.querySelector('head'),
    style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = jsStyles;
  } else {
    style.appendChild(document.createTextNode(jsStyles));
  }
  head.appendChild(style);
  return style;
}

},{}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeHtml = decodeHtml;
exports.escapeHtml = escapeHtml;
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

},{}],59:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IsMobile = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var IsMobile = /*#__PURE__*/function () {
  function IsMobile(viewPortWidth, viewPortHeight) {
    _classCallCheck(this, IsMobile);
    this.viewPortWidth = viewPortWidth;
    this.viewPortHeight = viewPortHeight;
  }
  _createClass(IsMobile, [{
    key: "isMobile",
    value: function isMobile() {
      return this.viewPortWidth < 460 || this.viewPortHeight < 460 || this.isIOS() || this.isAndroid();
    }
  }, {
    key: "isIOS",
    value: function isIOS() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
  }, {
    key: "isAndroid",
    value: function isAndroid() {
      return /Android/i.test(navigator.userAgent);
    }
  }, {
    key: "isSafari",
    value: function isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
  }]);
  return IsMobile;
}();
exports.IsMobile = IsMobile;

},{}],60:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTopViewPortSize = getTopViewPortSize;
exports.getViewPortSize = getViewPortSize;
function getViewPortSize() {
  var viewPortSize = [0, 0];
  try {
    // $FlowFixMe
    var validDocumentSize = document.documentElement && document.documentElement.clientHeight < 1.5 * window.innerHeight;
    // $FlowFixMe
    viewPortSize[0] = Math.max(validDocumentSize ? document.documentElement.clientWidth : 0, window.innerWidth || 0);
    // $FlowFixMe
    viewPortSize[1] = Math.max(validDocumentSize ? document.documentElement.clientHeight : 0, window.innerHeight || 0);
  } catch (e) {
    console.log("Unable to grab current viewport dimensions");
  }
  return viewPortSize;
}
function getTopViewPortSize() {
  var viewPortSize = [0, 0];
  try {
    // $FlowFixMe
    var validDocumentSize = document.documentElement && document.documentElement.clientHeight < 1.5 * window.innerHeight;
    // $FlowFixMe
    viewPortSize[0] = Math.max(validDocumentSize ? document.documentElement.clientWidth : 0, window.innerWidth || 0);
    // $FlowFixMe
    viewPortSize[1] = Math.max(validDocumentSize ? document.documentElement.clientHeight : 0, window.innerHeight || 0);
  } catch (e) {
    console.log("Unable to grab current viewport dimensions");
  }
  try {
    // $FlowFixMe
    var _validDocumentSize = top.document.documentElement && top.document.documentElement.clientHeight < 1.5 * top.innerHeight;
    viewPortSize[0] = Math.max(_validDocumentSize ? top.document.documentElement.clientWidth : 0, top.innerWidth || 0);
    viewPortSize[1] = Math.max(_validDocumentSize ? top.document.documentElement.clientHeight : 0, top.innerHeight || 0);
  } catch (e) {}
  return viewPortSize;
}

},{}],61:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gamestryAdUnits = exports.Gamestry = void 0;
var _log = require("./log/log");
var _viewport = require("./dom/viewport");
var _isMobile = require("./dom/isMobile");
var _vast = require("./vidCo/vast");
var _consent = require("./consent/consent");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } // https://gamestry.com/course-player/5fbe73ef7f0ed10003b8e7b3?amp_dev=1
var gamestryAdUnits = {
  'DEFAULT': 'Gamestryesports_Gamestry',
  '5fad36622596e50004c00f18': 'Gamestryesports_Trolerotutos',
  '5fad32932596e50004c00c5d': 'Gamestryesports_Hardyluski',
  '5fadb0c9e5ca22000313983a': 'Gamestryesports_ElCHiNORB',
  '5f9c1c46b62f4e000442a262': 'Gamestryesports_Manucraft',
  '5f95d474df5fb20004bf1614': 'Gamestryesports_Inachete',
  '5efc595a21492f0004e69740': 'Gamestryesports_DrekzeNN',
  '5f678ebe978af50004cad35a': 'Gamestryesports_BENIJU',
  '5fa5bf31aebcde00044ca004': 'Gamestryesports_WhiteZunder',
  '5d4b67165377640004963390': 'Gamestryesports_YoSoyRick',
  '5fa6c9a38c4c6f0004b63680': 'Gamestryesports_RiusPlay',
  '5f624b054e8a46000402a653': 'Gamestryesports_Late',
  '5f9b3eed5db2e00004425625': 'Gamestryesports_HiipoHD',
  '5f6510d3c7d3870004af34b7': 'Gamestryesports_KManuS88',
  '5fa299f5d51e5d0004d26890': 'Gamestryesports_GuitarHeroStyles',
  '5f9b40935db2e000044256ce': 'Gamestryesports_Nonigamer',
  '5f9193804d22c20004ac99ab': 'Gamestryesports_Dagar64',
  '5f9bff045db2e00004426bac': 'Gamestryesports_Thekhornar',
  '5f9b5c035db2e00004425c49': 'Gamestryesports_NickSaurus',
  '5be59731ae722e0004574a3c': 'Gamestryesports_Malcaide',
  '5fa1a1b8d51e5d0004d1f793': 'Gamestryesports_Themarzy',
  '5e7df4ea22244c0004ce6a54': 'Gamestryesports_Regue',
  '5e84f9b18e940000047c5c9f': 'Gamestryesports_AdrianPiedra',
  '5fa884629345630004a483ee': 'Gamestryesports_Massi',
  '5f7fc79e1b96bb0003b49da4': 'Gamestryesports_CloudyOhio',
  '5f71e8f29cbef30004ed12fc': 'Gamestryesports_Soking',
  '5f7d18451edcdf0003804529': 'Gamestryesports_Haru',
  '5f832899749cf5000399b64c': 'Gamestryesports_Neburix',
  '5f7cc7141edcdf000380371d': 'Gamestryesports_BySmash',
  '5ed435ec7c68c800040f337d': 'Gamestryesports_RoyalFlush',
  '5fa5978faebcde00044c854f': 'Gamestryesports_CarlosCastle',
  '5fa594c5aebcde00044c8356': 'Gamestryesports_RedstoneCanarias',
  '5f6244b44e8a46000402a5ff': 'Gamestryesports_YersonCz',
  '5eda486cf828f100041e4215': 'Gamestryesports_Hanuari',
  '5f3d991e134bb8000498e73e': 'Gamestryesports_Kodigo',
  '5f5a67733d14670004039605': 'Gamestryesports_BaleGG',
  '5f059f66ba3a851b9a544660': 'Gamestryesports_IAmJP',
  '5e7a2cfce7cd990004c0071f': 'Gamestryesports_AleReyesYT',
  '5ec7cacc8659ae00046df837': 'Gamestryesports_HITBOXKING',
  '5fab226da3d24700048c0777': 'Gamestryesports_DualView',
  '5f61fb554e8a46000402a3bc': 'Gamestryesports_MaRCeU',
  '5fba0ef5c344d100037f8377': 'Gamestryesports_TheNino',
  '5fb767de14e280000375f2ba': 'Gamestryesports_PopperCraft',
  '5fd8f866ecf3780003e5f91a': 'Gamestryesports_Exi',
  '5fce4e2bb9368a000340ba22': 'Gamestryesports_DaniGamerOficial',
  '5fc61e2e4c805a0003e3e53e': 'Gamestryesports_dedreviil',
  '5fc52928184ce90003f81cd8': 'Gamestryesports_Rovi23',
  '5fa596efaebcde00044c84c9': 'Gamestryesports_soyivax',
  '5fafc4fd536ae600036658dd': 'Gamestryesports_ChicoGamerr',
  '5fce0f08b9368a0003406d61': 'Gamestryesports_LeonPicaron',
  '5fb171f61c4e1c00037b8a77': 'Gamestryesports_BPancri',
  '5fbc08a0ab87e600035dc2d1': 'Gamestryesports_MORTIS',
  '5fcce3c5f06c250003626da1': 'Gamestryesports_PokeR988TV',
  '5fa988887be3350004bd23cd': 'Gamestryesports_ZEROZONE',
  '5fb2e465b6741f0003727663': 'Gamestryesports_Blackelespanolito',
  '5fbefe8885c43400032006e9': 'Gamestryesports_SoyLeodany',
  '5e56b661005b42000444103d': 'Gamestryesports_Janghy',
  '5faf7664ed146900037e553c': 'Gamestryesports_yimmymi'
};
exports.gamestryAdUnits = gamestryAdUnits;
var Gamestry = /*#__PURE__*/function () {
  function Gamestry(playerStorage) {
    _classCallCheck(this, Gamestry);
    this.playerStorage = playerStorage;
    this._adUnits = {};
    this.playerStorage.options.openwrapAccountId = 159460;
    this.playerStorage.options.openwrapProfileId = 3380;
    this.playerStorage.options.openwrapDelayVidAdUntilOwResponse = false;
    this.playerStorage.options.openwrapMinCachedBids = 2;
    this.pendingInitialization = true;
    this.needsPlayForUnmute = true;
    this.adShownToVimeoVideo = false;
    this.vidAdTryToResumeVidCo = false;
    this.adsError = false;
    this.allowToRequestAds = false;
    this.lastVimeoPlays = [];
    if (!this.originalVidAd) this.originalVidAd = this.playerStorage.options.vastURL;
    var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
    if (isMobile.isIOS()) {
      this.playerStorage.options.muted = true;
      this.mutedUntilFirstAd = true;
      var vid = document.body.querySelector('video');
      if (vid) {
        vid.setAttribute('muted', 'muted');
      }
    }
    if (!this.originalVidCo) this.originalVidCo = this.playerStorage.options.vidCoAdUnit;
    this.playerStorage.options.vastURL = undefined;
    this.playerStorage.options.vidCoAllowRepeatSameVideo = true;
    this.playerStorage.options.adBreakOnlyPrerolls = true;
    if (isMobile.isIOS()) this.playerStorage.options.adBreakOnlyPrerolls = false;
    this.playerStorage.options.vidCoTitleHidden = true;
    this.documentLocationHref = top.location.href;
    this.minimumVideoTime = 6;
    this.urlToCreator = {};
    this.newURLProcessed = false;
    this.hideVimeoLayer = false;
    this.resizeObservers = [];
    this.newURLTimestamp = performance.now() + 5000;
    this.resizeObservers.push(this.onResizeDoResizePlayer.bind(this));
    this.adsLaunched = 0;
    this.installHideVimeoLayer();
    this.installEventHandler();
  }
  _createClass(Gamestry, [{
    key: "adUnits",
    get: function get() {
      return this._adUnits;
    },
    set: function set(value) {
      this._adUnits = value;
    }
  }, {
    key: "getBaseAdUnit",
    value: function getBaseAdUnit(dataLayer) {
      var baseAdUnit = typeof gamestryAdUnits['DEFAULT'] !== 'undefined' ? gamestryAdUnits['DEFAULT'] : undefined;
      if (!dataLayer) return baseAdUnit;
      var coach;
      for (var i = 0; i < dataLayer.length; i++) {
        if (typeof dataLayer[i].creatorId === 'undefined') continue;
        coach = dataLayer[i].creatorId;
      }
      if (!coach || typeof gamestryAdUnits[coach] === 'undefined') return baseAdUnit;
      return gamestryAdUnits[coach];
    }
  }, {
    key: "onError",
    value: function onError() {
      var player = this.playerStorage.data.player;
      if (typeof player.dispose !== 'function') return;
      if (typeof player.error === 'function' && !player.error()) {
        return;
      }
      try {
        try {
          if (typeof player.error === 'function' && player.error()) {
            this.playerStorage.errors = this.playerStorage.errors ? this.playerStorage.errors + 1 : 1;
            if (this.playerStorage.errors > 5) this.playerStorage.ignoreByErrors = true;
          }
        } catch (e) {
          (0, _log.cLog)("Memory Reducing Error with player", e);
          this.playerStorage.errors = this.playerStorage.errors ? this.playerStorage.errors + 1 : 1;
        }
        this.playerStorage.disposed = true;
        this.playerStorage.soundInitialized = false;
        try {
          this.playerStorage.playerCurrentTime = player.currentTime();
        } catch (e) {
          (0, _log.cLog)("Unable to get currentTime for id ", id);
        }
        if (this.playerStorage.playerStorage.data && this.playerStorage.playerStorage.data.dispose) this.playerStorage.playerStorage.data.dispose();
        var disposePlayer = function (player, rootDocument) {
          top.ampTV.rootDocument = rootDocument;
          player.dispose();
        }.bind(window, player, this.playerStorage.playerStorage.rootDocument);
        if (useShadowRoot) setTimeout(disposePlayer, 1000); // Dispose player later on to allow finishing internal timeouts.
        else disposePlayer(); // Dispose player now as it will be removed from the DOM
        if (this.playerStorage.onDispose && this.playerStorage.onDispose.length) {
          this.playerStorage.onDispose.forEach(function (x) {
            return x();
          });
          this.playerStorage.onDispose.splice(0);
        }
        top.ampTV.deleteConfigById(id);
        delete this.playerStorage.playerStorage;
      } catch (e) {
        (0, _log.cLog)("Memory Reducing Error: ", e, id);
      }
    }
  }, {
    key: "searchForVimeoVideo",
    value: function searchForVimeoVideo() {
      if (!this.documentLocationHref.match(/course-player\/[a-z0-9]/)) {
        (0, _log.cLog)("AMP: Non Vimeo URL: Destroying Overlay, if it exists");
        this.removeOverlay(false);
        return;
      }
      if (!this.intervalParsedVimeoVideo) this.intervalParsedVimeoVideo = setInterval(this.searchForVimeoVideo.bind(this), 1000);
      this.launchVidAd();
    }
  }, {
    key: "launchVidAd",
    value: function launchVidAd() {
      var placeholder = top.document.querySelector('#videoContainer');
      if (!placeholder) {
        return;
      }
      this.vimeoPlaceholder = placeholder;
      this.resizePlayer(this.vimeoPlaceholder);
      if (this.newURLProcessed) return;
      this.controlHideVimeoLayer(true);
      // Control to avoid hiding contents too much time
      if (this.controlHideVimeoLayerTimer) {
        clearTimeout(this.controlHideVimeoLayerTimer);
      }
      this.controlHideVimeoLayerTimer = setTimeout(this.controlHideVimeoLayer.bind(this, false), 10000);
      (0, _log.cLog)("AMP: Launch VidAd!");
      this.newURLProcessed = true;
      this.allowShowingVimeoLayer = true;
      this.adRequestedToVimeoVideo = false;
      this.adShownToVimeoVideo = false;
      this.adsError = false;
      this.allowToRequestAds = false; // Only when we allow it
      this.vimeoWantsToPlay = false; // We will detect later
      this.pendingInitialization = false;
      this.vimeoPlayerAppearsObserver();
      (0, _log.cLog)("AMP: Launch VidAd HERE!");
      this.playerATVAppearsObserver();
    }
  }, {
    key: "vimeoPlayerAppearsObserver",
    value: function vimeoPlayerAppearsObserver() {
      var _this = this;
      var placeholder = this.vimeoPlaceholder;
      var iframe = placeholder.querySelector('iframe');
      if (!iframe) {
        return setTimeout(this.vimeoPlayerAppearsObserver.bind(this, placeholder), 200);
      }
      if (typeof top.Vimeo === 'undefined') {
        return setTimeout(this.vimeoPlayerAppearsObserver.bind(this, placeholder), 200);
      }
      if (iframe === this.parsedVimeoVideo) {
        return setTimeout(this.vimeoPlayerAppearsObserver.bind(this, placeholder), 200);
      }
      (0, _log.cLog)("AMP: New Vimeo Player", iframe);
      this.parsedVimeoVideo = iframe;
      var vimeoPlayer = new top.Vimeo.Player(iframe);
      vimeoPlayer.ready().then(function () {
        return _this.newVimeoPlayerDetected(vimeoPlayer);
      });
      vimeoPlayer.getVideoTitle().then(function (title) {
        (0, _log.cLog)('AMP: Vimeo Title:', title);
      });
    }
  }, {
    key: "playerATVAppearsObserver",
    value: function playerATVAppearsObserver() {
      var _this2 = this;
      if (!this.playerStorage.player) return setTimeout(this.playerATVAppearsObserver.bind(this), 200);
      if (this.wasInAdsMode) {
        (0, _log.cLog)("AMP: Was in Ads Mode");
        this.wasInAdsMode = false;
        this.adsError = true;
        this.allowShowingVimeoLayer = true;
        this.controlHideVimeoLayer(false);
        try {
          var placeholder = this.playerStorage.getVideoElementPlaceholder();
          if (placeholder.querySelector('.vjs-ad-playing')) {
            (0, _log.cLog)("AMP: About to remove vjs-ad-playing ");
            placeholder.querySelector('.vjs-ad-playing').classList.remove('vjs-ad-playing');
          }
          var _player = this.playerStorage.player;
          if (_player.ads && typeof _player.ads.isInAdMode === 'function' && _player.ads.isInAdMode()) {
            _player.ads.reset();
          }
        } catch (e) {
          (0, _log.cLog)("AMP: Failed removing vjs-ad-playing" + e);
        }
        return;
      }
      this.setPlayerTime(this.playerStorage.player, 0);
      // Meanwhile Show Ad
      var myThis = this;

      // Annotate VastURLtoUse to avoid first preroll when trying autoplay
      if (!this.playerStorage.options.vastURL) {
        (0, _log.cLog)("AMP: no VastURL, getting the default");
        this.playerStorage.options.vastURL = this.originalVidAd;
        (0, _log.cLog)("AMP: VastURL", this.playerStorage.options.vastURL);
      }
      var vastURLtoUse = this.playerStorage.options.vastURL;
      (0, _log.cLog)("AMP: VastURL to Use", this.playerStorage.options.vastURL);
      this.playerStorage.options.vastURL = undefined;
      var launchVidAd = function launchVidAd() {
        (0, _log.cLog)("AMP: prepareOverlayOnAd");
        myThis.adsLaunched++;
        myThis.prepareOverlayOnAd(function () {
          if (!myThis.adShownToVimeoVideo) {
            try {
              (0, _log.cLog)("AMP: Show ads");
              (0, _log.cLog)("AMP: About to request Ads");
              if (!myThis.adRequestedToVimeoVideo) {
                myThis.adRequestedToVimeoVideo = true;
                _this2.playerStorage.options.vastURL = vastURLtoUse;
                myThis.requestAndShowAds(0);
              }
            } catch (e) {}
          }
        });
      };
      (0, _log.cLog)("AMP: About to check if playing and pause it");
      try {
        if (!this.playerStorage.player.paused()) this.playerStorage.player.pause();
      } catch (e) {}
      try {
        this.playerStorage.player.currentTime(0);
      } catch (e) {}
      if (this.mutedUntilFirstAd) {
        try {
          (0, _log.cLog)("AMP: About to force the mute state");
          this.playerStorage.player.muted(true);
          (0, _log.cLog)("AMP: Forced the mute state");
          this.setAdsManagerVolume('muted');
          (0, _log.cLog)("AMP: Forced the adsManager unmute state");
        } catch (e) {
          (0, _log.cLog)("AMP: error trying to Mute: " + e);
        }
        this.needsPlayForUnmute = true;
      } else {
        try {
          (0, _log.cLog)("AMP: About to force the unmute state");
          this.playerStorage.player.muted(false);
          (0, _log.cLog)("AMP: Forced the unmute state");
          this.setAdsManagerVolume('unmuted');
          (0, _log.cLog)("AMP: Forced the adsManager unmute state");
        } catch (e) {
          (0, _log.cLog)("AMP: error trying to unMute: " + e);
        }
        this.needsPlayForUnmute = false;
      }
      var cbOk = launchVidAd.bind(this);
      (0, _log.cLog)("AMP: tryToAutoPlay");
      this.tryAutoPlay(function () {
        (0, _log.cLog)('AMP: tryToAutoPlay Played the video, trying muted');
        _this2.playerStorage.player.muted(true);
        _this2.setAdsManagerVolume('muted');
        _this2.needsPlayForUnmute = true;
        _this2.tryAutoPlay(function () {
          _this2.adsError = true;
          (0, _log.cLog)("tryToAutoPlay => abortOverlay()");
          _this2.abortOverlay();
        }, cbOk);
      }, cbOk);

      //this.showAsOverlay()
      //setTimeout(this.removeOverlay.bind(this),4000);
    }
  }, {
    key: "isInAdsMode",
    value: function isInAdsMode() {
      var inAdsMode = false;
      var player = this.playerStorage.player;
      if (!player) return inAdsMode;
      try {
        var placeholder = this.playerStorage.getVideoElementPlaceholder();
        if (placeholder.querySelector('.vjs-ad-playing')) {
          (0, _log.cLog)("AMP: isInAdsMode true due to vjs-ad-playing ");
          inAdsMode = true;
        }
      } catch (e) {}

      // Abort any previous Ads. This will generate an adend if an Ad was already Playing
      if (!inAdsMode && player.ads && typeof player.ads.isInAdMode === 'function' && player.ads.isInAdMode()) {
        (0, _log.cLog)("AMP: isInAdsMode true due to player.ads.isInAdMode");
        inAdsMode = true;
      }
      return inAdsMode;
    }
  }, {
    key: "resizePlayer",
    value: function resizePlayer(placeHolder) {
      if (!placeHolder) return;
      var placeHolderW = Math.round(placeHolder.offsetWidth);
      // noinspection JSSuspiciousNameCombination
      var placeHolderH = Math.round(placeHolder.offsetHeight);
      var ampOverlay = top.document.querySelector('.amp-overlay');
      if (!ampOverlay) return;
      var w = Math.round(ampOverlay.offsetWidth);
      // noinspection JSSuspiciousNameCombination
      var h = Math.round(ampOverlay.offsetHeight);
      if (placeHolderW !== w || placeHolderH !== h) {
        (0, _log.cLog)("AMP: Resizing", placeHolderW, placeHolderH, w, h);
        this.resizeObservers.forEach(function (f) {
          try {
            f(placeHolderW, placeHolderH);
          } catch (e) {}
        });
      }
    }
  }, {
    key: "onResizeDoResizePlayer",
    value: function onResizeDoResizePlayer(w, h) {
      try {
        var ampOverlay = top.document.querySelector('.amp-overlay');
        if (ampOverlay) {
          ampOverlay.style.width = '' + w + 'px';
          ampOverlay.style.height = '' + h + 'px';
        }
      } catch (e) {}
      try {
        var _player2 = this.playerStorage.player;
        _player2.width(w);
        _player2.height(h);
      } catch (e) {}
      try {
        var rootElement = this.playerStorage.getElementToFloat();
        if (rootElement && rootElement.nodeName.toLowerCase() === 'iframe') {
          rootElement.width = w;
          rootElement.height = h;
        }
      } catch (e) {}
    }
  }, {
    key: "newVimeoPlayerDetected",
    value: function newVimeoPlayerDetected(vimeoPlayer) {
      // possibilities:
      // 1.- Vimeo is autoplaying => try to autoplay the Ad unmuted. If we can't, try to autoplay muted.
      // 2.- Vimeo is paused => detect the play and use it to launch our player.
      // Common: Hide our player until we know there is an Ad, and then show it
      var myThis = this;
      vimeoPlayer.getPaused().then(function (paused) {
        (0, _log.cLog)("AMP: paused:", paused);
        try {
          if (paused) {
            var onVimeoPlayEventHandler = myThis.onVimeoPlay.bind(myThis,
            // cleanup
            function () {
              return vimeoPlayer.off('play', onVimeoPlayEventHandler);
            });
            vimeoPlayer.on('play', onVimeoPlayEventHandler);
          } else {
            myThis.onVimeoPlay();
          }
        } catch (e) {}
        (0, _log.cLog)("AMP: Ads", myThis.playerStorage.player);
      });
      var timeUpdate = function timeUpdate(event) {
        (0, _log.cLog)("AMP: Vimeo Time ", event.seconds, event.duration);
        if (event.seconds > 0.2) myThis.controlHideVimeoLayer(false);
        if (event.seconds < myThis.minimumVideoTime) return;
        if (event.seconds > myThis.minimumVideoTime + 10) {
          vimeoPlayer.off("timeupdate", timeUpdate);
        }
        if (myThis.adsError) return;
        (0, _log.cLog)("AMP: About to abort overlay due to time ", event.seconds, myThis.minimumVideoTime);
        myThis.controlHideVimeoLayer(false);
        (0, _log.cLog)("AMP: Time => abortOverlay()");
        myThis.abortOverlay(false);
      };
      vimeoPlayer.on("timeupdate", timeUpdate);
    }
  }, {
    key: "prepareOverlayOnAd",
    value: function prepareOverlayOnAd(cb) {
      var _this3 = this;
      if (this.adsError) return;
      this.controlHideVimeoLayer(true);
      var player = this.playerStorage.player;
      if (player && !this.isFullScreen()) {
        (0, _log.cLog)("AMP: INSTALLED HANDLERS");
        player.one('adstart', this.showAsOverlay.bind(this));
        player.one('adend', function () {
          if (_this3.allowShowingVimeoLayer) _this3.controlHideVimeoLayer(false);
          (0, _log.cLog)("AMP: Remove Overlay due to adend", player);
          _this3.mutedUntilFirstAd = false;
          _this3.removeOverlay();
        });
        player.one('adserror', function () {
          if (_this3.adRequestedToVimeoVideo) {
            if (_this3.allowShowingVimeoLayer) _this3.controlHideVimeoLayer(false);
            _this3.adsError = true;
            (0, _log.cLog)("AMP: Remove Overlay due to adserror", player);
            _this3.removeOverlay();
          }
        });
        this.watchDog();
        if (cb) cb();
      } else return setTimeout(this.prepareOverlayOnAd.bind(this), 1000);
    }
  }, {
    key: "watchDog",
    value: function watchDog() {
      var _this4 = this;
      if (!this.watchDogInterval) this.watchDogInterval = setInterval(this.watchDog.bind(this), 1000);
      this.isFullScreen();
      if (this.overlayShown) {
        if (this.parsedVimeoVideo && !top.document.body.contains(this.parsedVimeoVideo)) {
          (0, _log.cLog)("AMP: Abort Overlay due to parsedVimeoVideo not in document", this.parsedVimeoVideo);
          return this.abortOverlay();
        }
        var _player3 = this.playerStorage.player;
        if (!_player3.ads.isInAdMode() && !_player3.paused()) {
          _player3.pause();
          (0, _log.cLog)("AMP: Remove Overlay due to overlayShown and player not in ads mode", _player3);
          this.abortOverlay(false);
          if (this.watchDogInterval) clearInterval(this.watchDogInterval);
          this.watchDogInterval = undefined;
        }
      } else {
        var _player4 = this.playerStorage.player;
        (0, _log.cLog)("AMP: WatchDog: adShown", this.adShownToVimeoVideo, this.adsError, "AdsMode:", _player4.ads.isInAdMode(), "Paused:", _player4.paused());
        if ((this.adShownToVimeoVideo || this.adsError) && !_player4.ads.isInAdMode() && !_player4.paused()) {
          _player4.pause();
          if (this.vimeoWantsToPlay && this.parsedVimeoVideo) {
            var vimeoPlayer = new top.Vimeo.Player(this.parsedVimeoVideo);
            vimeoPlayer.ready().then(function () {
              var vimeoPlayer = new top.Vimeo.Player(_this4.parsedVimeoVideo);
              vimeoPlayer.getPaused().then(function (paused) {
                if (paused) vimeoPlayer.play();
              });
            });
          }
        } else if (!this.adShownToVimeoVideo && performance.now() - this.newURLTimestamp > 10000) try {
          var placeholder = this.playerStorage.getVideoElementPlaceholder();
          if (placeholder.querySelector('.vjs-ad-playing')) {
            (0, _log.cLog)("AMP: About to abort overlay due to vjs-ad-playing ");
            this.abortOverlay();
          }
        } catch (e) {}
      }
    }
  }, {
    key: "isFullScreen",
    value: function isFullScreen() {
      var fullScreen;
      try {
        fullScreen = top.document.fullscreenElement || top.document.fullscreen || top.document.webkitIsFullScreen || top.document.mozFullScreen;
      } catch (e) {
        try {
          fullScreen = document.fullscreenElement || document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
        } catch (e) {
          (0, _log.cLog)("AMP: Error retrieving full screen info");
        }
      }
      try {
        var _player5 = this.playerStorage.player;
        (0, _log.cLog)("AMP: Fullscreen", fullScreen, _player5.isFullscreen());
      } catch (e) {}
      if (fullScreen) {
        this.adsError = true;
        (0, _log.cLog)("AMP: About to abort overlay due to fullScreen ");
        this.abortOverlay(false);
        return true;
        /*
        if(player.isFullscreen()) {
            player.exitFullscreen()
        } else {
            try {
                const exitCancelFullScreen = document.exitFullscreen || document.webkitCancelFullScreen || document.webkitExitFullscreen;
                exitCancelFullScreen()
            } catch(e) {
                cLog("AMP: ExitFullScreen",e);
            }
            this.parsedVimeoVideo.requestFullscreen();
        }
         */
      }

      return false;
    }
  }, {
    key: "tooManyRecentVimeoPlays",
    value: function tooManyRecentVimeoPlays(now) {
      var recentItems = 0;
      this.lastVimeoPlays.forEach(function (x) {
        if (x > now - 3000) ++recentItems;
      });
      this.lastVimeoPlays.push(now);
      return recentItems > 1;
    }
  }, {
    key: "onVimeoPlay",
    value: function onVimeoPlay(cb) {
      (0, _log.cLog)('AMP: Played the video');
      if (!this.adRequestedToVimeoVideo && !this.adShownToVimeoVideo && !this.adsError || !this.adShownToVimeoVideo && !this.adsError || this.overlayShown) {
        var now = performance.now();
        if (this.tooManyRecentVimeoPlays(now)) {
          this.vimeoWantsToPlay = false;
          if (cb) cb();
          return;
        }
        var vimeoPlayer = new top.Vimeo.Player(this.parsedVimeoVideo);
        vimeoPlayer.pause();
        this.vimeoWantsToPlay = true;
        return;
      }
      this.vimeoWantsToPlay = false;
      if (cb) cb();
    }
  }, {
    key: "onURLChange",
    value: function onURLChange() {
      if (top.location.href === this.documentLocationHref) return;
      this.documentLocationHref = top.location.href;
      this.newURLProcessed = false;
      this.newURLTimestamp = performance.now();
      (0, _log.cLog)("AMP: onURLChange", arguments);
      this.playerStorage.options.vastURL = undefined;
      this.wasInAdsMode = this.isInAdsMode();
      this.abortOverlay(false);
      this.lastVimeoPlays.splice(0);
      this.searchForVimeoVideo();
    }
  }, {
    key: "abortOverlay",
    value: function abortOverlay(resumePlay) {
      (0, _log.cLog)("AMP: Abort overlay", resumePlay);
      this.removeOverlay(resumePlay);
      try {
        var adsManagerIMA = typeof this.playerStorage.adsManagerIMA !== 'undefined' ? this.playerStorage.adsManagerIMA : player.ima.getAdsManager();
        if (adsManagerIMA) adsManagerIMA.stop();else (0, _log.cLog)("Unable to find AdsManager");
      } catch (e) {
        (0, _log.cLog)("AMP:", e);
      }
      try {
        var _player6 = this.playerStorage.player;
        _player6.pause();
        _player6.ads.endLinearAdMode();
      } catch (e) {
        (0, _log.cLog)("AMP:", e);
      }
      if (this.prepareAdTagDelayer) {
        clearTimeout(this.prepareAdTagDelayer);
        this.prepareAdTagDelayer = undefined;
      }
      this.prepareAdTagDelayer = setTimeout(this.prepareAdTag.bind(this), 2000);
    }
  }, {
    key: "installEventHandler",
    value: function installEventHandler() {
      var _this5 = this;
      if (this.locationChangeInterval) {
        clearInterval(this.locationChangeInterval);
        this.locationChangeInterval = undefined;
      }
      this.locationChangeInterval = setInterval(function () {
        return top.location.href !== _this5.documentLocationHref && _this5.onURLChange();
      }, 100);
      var pushState = top.history.pushState;
      var myThis = this;
      top.history.pushState = function () {
        pushState.apply(top.history, arguments);
        myThis.onURLChange(arguments); // Some event-handling function
      };

      var popState = top.history.popState;
      top.history.popState = function () {
        popState.apply(top.history, arguments);
        myThis.onURLChange(arguments); // Some event-handling function
      };

      top.addEventListener('popstate', this.onURLChange.bind(this));
      var dataLayerListener = function dataLayerListener() {
        if (typeof top.dataLayer === 'undefined' || typeof top.dataLayer.push !== 'function') return setTimeout(dataLayerListener, 500);
        (0, _log.cLog)("AMP: DataLayer Listener Installed", top.dataLayer);
        var oldPush = top.dataLayer.push.bind(top.dataLayer);
        top.dataLayer.push = function () {
          var args = arguments;
          try {
            oldPush.apply(top.dataLayer, args);
          } catch (e) {}
          try {
            myThis.dataLayerEventProcessor(args);
          } catch (e) {}
        };
        myThis.dataLayerEventProcessor(top.dataLayer);
      };
      dataLayerListener();
    }
  }, {
    key: "dataLayerEventProcessor",
    value: function dataLayerEventProcessor(args) {
      (0, _log.cLog)("AMP: dataLayer Args: ", JSON.parse(JSON.stringify(args)));
      var creatorArg;
      for (var i = 0; i < args.length; i++) {
        if (typeof args[i].creatorId !== 'undefined') creatorArg = args[i];
      }
      if (creatorArg) {
        this.urlToCreator[top.location.href] = creatorArg.creatorId;
        var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
        if (typeof args.forEach === 'function' || !isMobile.isIOS()) this.newCoach(args);
      }
    }
  }, {
    key: "calculateVastURL",
    value: function calculateVastURL(args) {
      var adUnit = this.getBaseAdUnit(args);
      return this.originalVidAd.replace(new RegExp(gamestryAdUnits['DEFAULT'], 'ig'), adUnit);
    }
  }, {
    key: "newCoach",
    value: function newCoach(args) {
      if (args) {
        var adUnit = this.getBaseAdUnit(args);
        this.playerStorage.options.vastURL = this.originalVidAd.replace(new RegExp(gamestryAdUnits['DEFAULT'], 'ig'), adUnit);
        (0, _log.cLog)("AMP: New VastURL to Use: ", this.playerStorage.options.vastURL);
        this.playerStorage.options.vidCoAdUnit = this.originalVidCo.replace(new RegExp(gamestryAdUnits['DEFAULT'], 'ig'), adUnit);
        this.coachDetected = true;
        this.launchVidAd();
      }
    }
  }, {
    key: "tryAutoPlay",
    value: function tryAutoPlay(cbFailure, cbOk) {
      // This example script hides the "Big Play Button" (a.k.a. BPB),
      // which may be useful to prevent it flashing and presenting a
      // playable UI

      var player = this.playerStorage.player;
      var bpb = player.getChild('bigPlayButton');
      if (!bpb || !player.ima || !this.playerStorage.playerState || !this.playerStorage.playerState.adManager || !this.playerStorage.playerState.adManager.adManagerPrepared) return setTimeout(this.tryAutoPlay.bind(this, cbFailure, cbOk), 100);

      // It's always a good idea to verify that a component exists before
      // doing things with it.
      if (bpb) {
        // Hide the BPB as early as possible, before the player is ready.
        bpb.hide();
      }
      (0, _log.cLog)("AMP: AutoPlay: Waiting for Player Ready");
      player.ready(function () {
        (0, _log.cLog)("AMP: AutoPlay: About to Play");
        player.pause();
        var promise = player.play();
        var aborted = false;

        // If no promise is returned, show the BPB immediately.
        if (promise === undefined) {
          (0, _log.cLog)("AMP: AutoPlay: No promise");
          if (bpb) bpb.show();
          if (cbFailure) cbFailure();

          // If a promise is returned, wait until it either succeeds or
          // fails to show the BPB.
        } else {
          (0, _log.cLog)("AMP: AutoPlay: Here a promise", player, promise);
          var timeout = setTimeout(function () {
            (0, _log.cLog)("AMP: AutoPlay: Aborting promise due to timeout");
            timeout = undefined;
            aborted = true;
            player.pause();
            cbFailure();
          }, 1000);
          promise.then(function () {
            if (timeout) clearTimeout(timeout);else return;
            (0, _log.cLog)("AMP: AutoPlay: Promise Ok!", aborted);
            if (aborted) return;
            if (bpb) bpb.show();
            if (cbOk) cbOk();
          })["catch"](function (reason) {
            if (timeout) clearTimeout(timeout);else return;
            player.pause();
            (0, _log.cLog)("AMP: AutoPlay: Promise KO!", reason, aborted);
            if (aborted) return;
            if (bpb) bpb.show();
            if (cbFailure) cbFailure();
          });
        }
      });
    }
  }, {
    key: "showAsOverlay",
    value: function showAsOverlay() {
      var _this6 = this;
      var adShown = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      (0, _log.cLog)("AMP: showAsOverlay");
      if (this.isFullScreen()) return;
      this.adShownToVimeoVideo = adShown;
      this.overlayShown = true;
      var ampOverlay = top.document.querySelector('.amp-overlay');
      if (!ampOverlay) return;
      var trackPosition = this.trackPosition.bind(this, function () {
        return ampOverlay;
      }, function () {
        return _this6.vimeoPlaceholder;
      });
      trackPosition();
      if (this.trackPositionInterval) clearInterval(this.trackPositionInterval);
      this.trackPositionInterval = setInterval(trackPosition, 500);
      var vimeoIframe = this.parsedVimeoVideo;
      if (vimeoIframe) {
        var vimeoPlayer = new top.Vimeo.Player(vimeoIframe);
        vimeoPlayer.pause();
      }
    }
  }, {
    key: "trackPosition",
    value: function trackPosition(ampOverlayFn, vimeoPlaceholderFn) {
      var zIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000000;
      var ampOverlay = ampOverlayFn();
      var vimeoPlaceholder = vimeoPlaceholderFn();
      if (vimeoPlaceholder.style.display === 'none' || !top.document.body.contains(vimeoPlaceholder)) return;
      var positionFromViewport = vimeoPlaceholder.getBoundingClientRect();
      //this.divLog('ampPosition','PX:'+top.pageXOffset+' PY:'+top.pageYOffset+' PL:'+positionFromViewport.left+' PT:'+positionFromViewport.top);
      //cLog('AMP: ampPosition','PX:'+top.pageXOffset+' PY:'+top.pageYOffset+' PL:'+positionFromViewport.left+' PT:'+positionFromViewport.top);
      var x = positionFromViewport.left + top.pageXOffset;
      var y = positionFromViewport.top + top.pageYOffset;
      ampOverlay.style.position = 'absolute';
      ampOverlay.style.left = x + 'px';
      ampOverlay.style.top = y + 'px';
      ampOverlay.style.right = '';
      ampOverlay.style.bottom = '';
      ampOverlay.style.zIndex = zIndex;
      ampOverlay.style.display = '';
    }
  }, {
    key: "divLog",
    value: function divLog(name, message) {
      try {
        var div = document.getElementById(name);
        if (!div) {
          var newDiv = document.createElement('div');
          newDiv.id = name;
          newDiv.style.position = 'fixed';
          newDiv.style.left = 0;
          newDiv.style.bottom = 0;
          newDiv.style.width = 'auto';
          newDiv.style.height = 'auto';
          newDiv.style.background = 'grey';
          top.document.body.appendChild(newDiv);
          return newDiv.innerHTML = message;
        }
        return div.innerHTML = message;
      } catch (e) {}
    }
  }, {
    key: "removeOverlay",
    value: function removeOverlay() {
      var resumePlay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      (0, _log.cLog)("AMP: removeOverlay");
      if (this.trackPositionInterval) {
        clearInterval(this.trackPositionInterval);
        this.trackPositionInterval = undefined;
      }
      this.overlayShown = false;
      var vimeoIframe = this.parsedVimeoVideo;
      if (!vimeoIframe) return;
      var ampOverlay = top.document.querySelector('.amp-overlay');
      if (!ampOverlay) return;
      ampOverlay.style.display = 'none';
      ampOverlay.style.position = 'fixed';
      ampOverlay.style.top = '';
      ampOverlay.style.left = '';
      ampOverlay.style.right = 0;
      ampOverlay.style.bottom = 0;
      ampOverlay.style.zIndex = -1;
      if (!top.Vimeo || !top.Vimeo.Player) return;
      var vimeoPlayer = new top.Vimeo.Player(vimeoIframe);
      var myThis = this;
      vimeoPlayer.getPaused().then(function (paused) {
        if (paused) {
          try {
            var _player7 = myThis.playerStorage.player;
            _player7.pause();
          } catch (e) {}
          (0, _log.cLog)("AMP: Resume Play:", resumePlay, vimeoPlayer);
          if (resumePlay) vimeoPlayer.play();
        }
      });
      var player = this.playerStorage.player;
      setTimeout(player.pause.bind(player), 50);
      setTimeout(player.pause.bind(player), 100);
      setTimeout(player.pause.bind(player), 250);
      setTimeout(player.pause.bind(player), 500);
      setTimeout(player.pause.bind(player), 750);
      setTimeout(player.pause.bind(player), 1000);
      player.pause();
    }
  }, {
    key: "start",
    value: function start() {
      this.searchForVimeoVideo();
      if (!this.parsedVimeoVideo) return setTimeout(this.start.bind(this), 1000);
    }
  }, {
    key: "prepareAdTag",
    value: function prepareAdTag() {
      if (this.playerStorage.vidAdQueue) {
        try {
          this.playerStorage.vidAdQueue.prepareAdTag(false);
        } catch (e) {
          (0, _log.cLog)("AMP: Error Preparing Ad Tag: " + e);
        }
      } else return setTimeout(this.prepareAdTag.bind(this), 150);
    }
  }, {
    key: "requestAndShowAds",
    value: function requestAndShowAds() {
      var _this7 = this;
      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5500;
      this.allowToRequestAds = true;
      var playerState = this.playerStorage.playerState;
      if (!playerState || typeof playerState.adManager === 'undefined' || typeof playerState.adManager.requestAnAd !== 'function' || !playerState.adManager.adManagerPrepared) return setTimeout(this.requestAndShowAds.bind(this), 1000);
      playerState.adManager.requestAnAd();
      (0, _log.cLog)("AMP: Ads Requested");
      var tryToShowAd = function tryToShowAd() {
        var player = _this7.playerStorage.player;
        if (player.paused()) player.play();
        try {
          if (!playerState.adManager.showRequestedAd()) return setTimeout(tryToShowAd, 500);
          _this7.allowToRequestAds = false;
        } catch (e) {
          return setTimeout(tryToShowAd, 1000);
        }
      };
      setTimeout(tryToShowAd, delay);
    }
  }, {
    key: "installHideVimeoLayer",
    value: function installHideVimeoLayer() {
      var _this8 = this;
      if (!this.spinner) {
        this.spinner = this.createSpinner();
      }
      var ampSpinnerDiv = 'ampSpinnerDiv';
      var spinnerHolderDiv = top.document.createElement('div');
      spinnerHolderDiv.id = ampSpinnerDiv;
      spinnerHolderDiv.style.background = 'black none repeat scroll 0% 0%';
      spinnerHolderDiv.innerHTML = '<div class="spinner-container" style="position: absolute;\n' + '  left: 50%;\n' + '  top: 50%;\n' + '  -webkit-transform: translate(-50%, -50%);\n' + '  transform: translate(-50%, -50%);">\n' + '      <div class="ispinner white ispinner-large animating">\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '        <div class="ispinner-blade"></div>\n' + '      </div>\n' + '    </div>';
      top.document.body.insertBefore(spinnerHolderDiv, top.document.body.firstElementChild);
      this.hideVimeoLayerHolder = spinnerHolderDiv;
      this.resizeObservers.push(function (w, h) {
        _this8.hideVimeoLayerHolder.style.width = '' + w + 'px';
        _this8.hideVimeoLayerHolder.style.height = '' + h + 'px';
      });
    }
  }, {
    key: "controlHideVimeoLayer",
    value: function controlHideVimeoLayer(hideVimeoLayer) {
      var _this9 = this;
      if (hideVimeoLayer !== undefined) {
        this.hideVimeoLayer = hideVimeoLayer;
      }
      if (!this.vimeoPlaceholder) {
        return setTimeout(this.controlHideVimeoLayer.bind(this), 300);
      }
      if (this.hideVimeoLayer) {
        (0, _log.cLog)("AMP: Hide VimeoLayer");
        var ampOverlay = top.document.querySelector('.amp-overlay');
        if (!ampOverlay) return setTimeout(this.controlHideVimeoLayer.bind(this), 300);
        this.vimeoPlaceholder.style.opacity = 0;
        var trackPosition = this.trackPosition.bind(this, function () {
          return _this9.hideVimeoLayerHolder;
        }, function () {
          return _this9.vimeoPlaceholder;
        }, 5000);
        trackPosition();
        if (this.trackSpinnerPositionInterval) clearInterval(this.trackSpinnerPositionInterval);
        this.trackSpinnerPositionInterval = setInterval(trackPosition, 500);
        this.hideVimeoLayerHolder.style.display = '';
      } else {
        (0, _log.cLog)("AMP: Show VimeoLayer");
        this.vimeoPlaceholder.style.opacity = '';
        if (this.trackSpinnerPositionInterval) {
          clearInterval(this.trackSpinnerPositionInterval);
          this.trackSpinnerPositionInterval = undefined;
        }
        if (this.hideVimeoLayerHolder) {
          this.hideVimeoLayerHolder.style.display = 'none';
        }
      }
    }
  }, {
    key: "createSpinner",
    value: function createSpinner() {
      var spinner = '.ispinner {\n' + '  position: relative;\n' + '  width: 20px;\n' + '  height: 20px; }\n' + '  .ispinner .ispinner-blade {\n' + '    position: absolute;\n' + '    top: 6.5px;\n' + '    left: 8.5px;\n' + '    width: 2.5px;\n' + '    height: 6.5px;\n' + '    background-color: #8e8e93;\n' + '    border-radius: 1.25px;\n' + '    animation: iSpinnerBlade 1s linear infinite;\n' + '    will-change: opacity; }\n' + '    .ispinner .ispinner-blade:nth-child(1) {\n' + '      transform: rotate(45deg) translateY(-6.5px);\n' + '      animation-delay: -1.625s; }\n' + '    .ispinner .ispinner-blade:nth-child(2) {\n' + '      transform: rotate(90deg) translateY(-6.5px);\n' + '      animation-delay: -1.5s; }\n' + '    .ispinner .ispinner-blade:nth-child(3) {\n' + '      transform: rotate(135deg) translateY(-6.5px);\n' + '      animation-delay: -1.375s; }\n' + '    .ispinner .ispinner-blade:nth-child(4) {\n' + '      transform: rotate(180deg) translateY(-6.5px);\n' + '      animation-delay: -1.25s; }\n' + '    .ispinner .ispinner-blade:nth-child(5) {\n' + '      transform: rotate(225deg) translateY(-6.5px);\n' + '      animation-delay: -1.125s; }\n' + '    .ispinner .ispinner-blade:nth-child(6) {\n' + '      transform: rotate(270deg) translateY(-6.5px);\n' + '      animation-delay: -1s; }\n' + '    .ispinner .ispinner-blade:nth-child(7) {\n' + '      transform: rotate(315deg) translateY(-6.5px);\n' + '      animation-delay: -0.875s; }\n' + '    .ispinner .ispinner-blade:nth-child(8) {\n' + '      transform: rotate(360deg) translateY(-6.5px);\n' + '      animation-delay: -0.75s; }\n' + '  .ispinner.ispinner-large {\n' + '    width: 35px;\n' + '    height: 35px; }\n' + '    .ispinner.ispinner-large .ispinner-blade {\n' + '      top: 11.5px;\n' + '      left: 15px;\n' + '      width: 5px;\n' + '      height: 12px;\n' + '      border-radius: 2.5px; }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(1) {\n' + '        transform: rotate(45deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(2) {\n' + '        transform: rotate(90deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(3) {\n' + '        transform: rotate(135deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(4) {\n' + '        transform: rotate(180deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(5) {\n' + '        transform: rotate(225deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(6) {\n' + '        transform: rotate(270deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(7) {\n' + '        transform: rotate(315deg) translateY(-11.5px); }\n' + '      .ispinner.ispinner-large .ispinner-blade:nth-child(8) {\n' + '        transform: rotate(360deg) translateY(-11.5px); }\n' + '\n' + '@keyframes iSpinnerBlade {\n' + '  0% {\n' + '    opacity: 0.85; }\n' + '  50% {\n' + '    opacity: 0.25; }\n' + '  100% {\n' + '    opacity: 0.25; } }\n';
      var cssElement = top.document.createElement('style');
      cssElement.type = 'text/css';
      cssElement.innerHTML = spinner;
      top.document.querySelector('head').appendChild(cssElement);
      return cssElement;
    }
  }, {
    key: "setPlayerTime",
    value: function setPlayerTime(player, seconds) {
      var initDone = false;
      try {
        player.ready(function () {
          if (typeof top.doneWithTestsAmp !== 'undefined') return;
          this.on('timeupdate', function () {
            (0, _log.cLog)("AMP: vJS Player Time: ", this.currentTime());
          });
          top.doneWithTestsAmp = true;
        });
        // wait for video metadata to load, then set time
        player.one("play", function () {
          player.currentTime(seconds);
        });
        player.one("loadedmetadata", function () {
          player.currentTime(seconds);
        });

        // iPhone/iPad need to play first, then set the time
        // events: https://www.w3.org/TR/html5/embedded-content-0.html#mediaevents
        player.one("canplaythrough", function () {
          if (!initDone) {
            player.currentTime(seconds);
            initDone = true;
          }
        });
        player.currentTime(seconds);
      } catch (e) {
        (0, _log.cLog)("AMP: Error setting player time: " + e);
      }
    }
  }, {
    key: "setAdsManagerVolume",
    value: function setAdsManagerVolume(muted) {
      var player = this.playerStorage.player;
      if (!player) return;
      try {
        var adsManagerIMA = typeof this.playerStorage.adsManagerIMA !== 'undefined' ? this.playerStorage.adsManagerIMA : player.ima.getAdsManager();
        if (adsManagerIMA) {
          if (muted === 'muted') {
            this.oldAdsManagerVolume = adsManagerIMA.getVolume();
            adsManagerIMA.setVolume(0);
          } else {
            if (this.oldAdsManagerVolume) adsManagerIMA.setVolume(this.oldAdsManagerVolume);else {
              this.oldAdsManagerVolume = 1;
              adsManagerIMA.setVolume(this.oldAdsManagerVolume);
            }
          }
          (0, _log.cLog)("AMP: Volume: " + adsManagerIMA.getVolume());
        }
      } catch (e) {
        (0, _log.cLog)("AMP: IMA SetVolume error" + e);
      }
    }
  }, {
    key: "openWrapOnInit",
    value: function openWrapOnInit(openWrap) {
      openWrap.prefetchPreHook = this.openWrapPrefetchHook.bind(this);
      openWrap.sampleVastURL = (0, _vast.resolveVidAdURL)(this.calculateVastURL([]), this.playerStorage.options.dev, false, this.playerStorage.options, undefined, (0, _consent.showNonPersonalizedAds)(), this.playerStorage.options.size);
      (0, _log.cLog)("SampleVAST", openWrap.sampleVastURL);
    }
  }, {
    key: "openWrapPrefetchHook",
    value: function openWrapPrefetchHook(prefetch) {
      (0, _log.cLog)('OpenWrap: prefetch.iu', prefetch.iu);
      var iu = prefetch.iu.match(/(\/Gamestryesports_[^_]*)/);
      if (iu) {
        prefetch.iu = prefetch.iu.replace(/\/Gamestryesports_[^_]*/g, '/Gamestryesports_Gamestry');
        return function (url) {
          return url.replace(/\/Gamestryesports_[^_]*/g, iu[1]);
        };
      } else {
        return function (url) {
          (0, _log.cLog)("OpenWrap: AMP: UNABLE TO FIND GAMESTRY AdUnit in " + url);
          return url;
        };
      }
    }
  }]);
  return Gamestry;
}();
exports.Gamestry = Gamestry;

},{"./consent/consent":54,"./dom/isMobile":59,"./dom/viewport":60,"./log/log":62,"./vidCo/vast":87}],62:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cLog = cLog;
exports.imgLog = imgLog;
exports.log = log;
exports.logLevel = logLevel;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var urlDebugParameter, urlRemoteDebugParameter;
try {
  urlDebugParameter = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
  urlRemoteDebugParameter = window.location.search && window.location.search.match(/[?&]amp_deb=1/);
} catch (e) {}
function logLevel(level) {
  try {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (top && _typeof(top.ampTV) === 'object' && _typeof(top.ampTV.options) === 'object' && top.ampTV.options.logLevel && top.ampTV.options.logLevel >= level) console.log.apply(this, args);else if (urlDebugParameter) console.log.apply(this, args);
  } catch (e) {}
}
function log() {
  logLevel(1, arguments);
}
function cLog() {
  logLevel(1, arguments);
  try {
    if (urlRemoteDebugParameter) navigator.sendBeacon('https://securepubads.g.doubleclick.net/ads?log=' + encodeURIComponent(JSON.stringify(arguments)), {});
  } catch (e) {}
}
function imgLog(url, done, fail) {
  var img = new Image();
  if (done) img.onload = done;
  if (fail) img.onerror = fail;
  img.src = url;
}

},{}],63:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Intersection = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Intersection = /*#__PURE__*/function () {
  function Intersection(statuses) {
    _classCallCheck(this, Intersection);
    this.statuses = statuses;
  }
  _createClass(Intersection, [{
    key: "setup",
    value: function setup(containerDomElement) {
      this.observer = new top.IntersectionObserver(this.configuredProcessChanges.bind(this), {
        threshold: [0].concat(_toConsumableArray(this.statuses.map(function (x) {
          return x.threshold;
        })), [1])
      });
      // noinspection JSUnusedGlobalSymbols
      //top.IntersectionObserver.prototype.POLL_INTERVAL = 100;
      this.tsSetup = performance.now();

      //noinspection JSUndefinedPropertyAssignment $FlowFixMe
      //this.observer.POLL_INTERVAL = 100;
      this.observer.observe(containerDomElement);
    }
  }, {
    key: "configuredProcessChanges",
    value: function configuredProcessChanges(changes, observer) {
      var _this = this;
      changes.forEach(function (entry) {
        _this.statuses.forEach(function (status) {
          if (entry.intersectionRatio >= status.threshold) {
            if (!status.viewable) {
              status.viewable = true;
              status.tsPreviousTransition = status.tsLastTransition;
              status.tsLastTransition = entry.time;
              if (status.observer) status.observer.forEach(function (x) {
                return x(status);
              });
            }
          } else if (entry.intersectionRatio < status.threshold) {
            if (status.viewable || typeof status.viewable === 'undefined') {
              status.viewable = false;
              status.tsPreviousTransition = status.tsLastTransition;
              status.tsLastTransition = entry.time;
              if (status.observer) status.observer.forEach(function (x) {
                return x(status);
              });
            }
          }
        });
      });
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.observer.disconnect();
    }
  }]);
  return Intersection;
}();
exports.Intersection = Intersection;

},{}],64:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aboveScrollingPosition = aboveScrollingPosition;
exports.getOffset = getOffset;
exports.isInViewport = isInViewport;
exports.isVidAfInViewport = isVidAfInViewport;
var _log = require("../log/log");
function isVidAfInViewport() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'content_video';
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  context = context || document;
  if (window.frameElement && !window.useShadowRoot) return isInViewport(window.frameElement);else return isInViewport(context.getElementById(id));
}
function isInViewport(elem) {
  var bounding = elem.getBoundingClientRect();
  var doc = elem.ownerDocument,
    win = doc.defaultView;
  return bounding.top >= 0 && bounding.left >= 0 && bounding.bottom <= (win.innerHeight || doc.documentElement.clientHeight) && bounding.right <= (win.innerWidth || doc.documentElement.clientWidth);
}
function aboveScrollingPosition() {
  var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'content_video';
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var pageYOffset, elem;
  context = context || document;
  pageYOffset = top.pageYOffset;
  elem = (window.useShadowRoot ? undefined : window.frameElement) || context.getElementById(id);
  var elemYOffset = getOffset(elem).top;
  (0, _log.cLog)("aboveScrollingPosition: ", pageYOffset, elemYOffset + 0.4 * elem.clientHeight, pageYOffset > elemYOffset + 0.4 * elem.clientHeight);
  return pageYOffset > elemYOffset + 0.4 * elem.clientHeight;
}
function getOffset(el) {
  var _x = 0;
  var _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return {
    top: _y,
    left: _x
  };
}

},{"../log/log":62}],65:[function(require,module,exports){
"use strict";

var _publisher = require("./publisher");
var _vidCo = require("./vidCo/vidCo");
var _comScore2VideoJS = require("./analytics/comScore2VideoJS");
var _isMobile = require("./dom/isMobile");
var _viewport = require("./dom/viewport");
var _shadowDOM = require("./browser/shadowDOM");
var _gamestry = require("./gamestry");
var _log = require("./log/log");
var _openWrap = require("./vidAd/openWrap");
var _queue = require("./vidAd/queue");
var _amazonHeaderBidder = require("./vidAd/amazonHeaderBidder");
var _absolutePosition = require("./browser/absolutePosition");
var _playerSize = require("./container/playerSize");
var _domainWhitelist = require("./player/domainWhitelist");
var _phase = require("./phase-2");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// Polyfill for NodeElement.prototype.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
// End of polyfill for NodeElement.prototype.forEach

var useShadowRoot = window.useShadowRoot = (0, _shadowDOM.isShadowDOMAvailable)();
var gamestryProcessed = false;
var dispatch_check_low_power = function dispatch_check_low_power() {
  var dom_video = document.createElement("video");
  var dom_popup = document.createElement("div");
  var dom_popup_window = document.createElement("div");
  var dom_wrapper = parent.document.querySelector("body");
  var popup_text = "Tu dispositivo tiene el modo de ahorro de energía activo, para reproducir el video presiona en <strong>reproducir</strong>, de lo contrario presiona en el botón de <strong>ignorar</strong>.";
  var popup_styles = {
    "background": "rgba(0, 0, 0, 0.7)",
    "bottom": "0",
    "left": "0",
    "margin": "0",
    "padding": "0",
    "opacity": "1",
    "position": "fixed",
    "right": "0",
    "transition": "opacity 0.5s linear",
    "top": "0",
    "visibility": "visible",
    "zIndex": "10000"
  };
  var popup_styles_fade_out = {
    "opacity": "0",
    "transition": "visibility 0s 0.5s, opacity 0.5s linear",
    "visibility": "hidden"
  };
  var popup_window_styles = {
    "background": "rgb(245, 245, 245)",
    "border": "1px solid rgb(5, 104, 123)",
    "borderRadius": "5px",
    "boxSizing": "border-box",
    "color": "rgb(0, 0, 0)",
    "fontFamily": "Arial, sans-serif",
    "fontSize": "14px",
    "height": "150px",
    "left": "50%",
    "lineHeight": "1.4",
    "margin-left": "-200px",
    "margin-top": "-75px",
    "padding": "15px",
    "position": "absolute",
    "textAlign": "center",
    "top": "50%",
    "width": "400px",
    "z-index": "1"
  };
  dom_video.id = "zxcvBNMasdf-video-test";
  dom_video.muted = true;
  dom_video.playsInline = true;
  dom_video.style.display = "none";
  dom_video.src = "https://www.w3schools.com/html/mov_bbb.mp4"; // Video in own server needed

  dom_popup.id = "zxcvBNMasdf-video-test-popup";
  dom_popup_window.innerHTML = "\n        <p style=\"margin: 0; padding: 0;\">".concat(popup_text, "</p>\n        <div style=\"clear: both; margin-top: 30px;\">\n            <button id=\"zxcvBNMasdf-video-test-btn-left\" style=\"float: left; border-radius: 0; font-weight: 700; border: 1px solid rgba(34, 34, 34, 0.2); color: rgb(68, 68, 68); cursor: pointer; width: 49%; background-color: rgb(238, 238, 238); padding: 5px 0;\">Ignorar</button>\n            <button id=\"zxcvBNMasdf-video-test-btn-right\" style=\"float: right; border-radius: 0; font-weight: 700; border: 1px solid rgba(5, 104, 123, 0.3); color: rgb(255, 255, 255); cursor: pointer; width: 49%; background-color: rgb(5, 104, 123); padding: 5px 0;\">Reproducir</button>\n        </div>        \n    ");
  dom_popup.appendChild(dom_popup_window);
  var set_mass_style = function set_mass_style(element, props) {
    for (var _prop in props) {
      element.style[_prop] = props[_prop];
    }
  };
  var event_popup_close = function event_popup_close() {
    return set_mass_style(dom_wrapper.querySelector("#zxcvBNMasdf-video-test-popup"), popup_styles_fade_out);
  };
  if (!!dom_wrapper) {
    set_mass_style(dom_popup, popup_styles);
    set_mass_style(dom_popup_window, popup_window_styles);
    dom_wrapper.appendChild(dom_video);
    dom_wrapper.appendChild(dom_popup);
    dom_wrapper.querySelector("#zxcvBNMasdf-video-test-btn-left").addEventListener("click", function () {
      return event_popup_close();
    });
    dom_wrapper.querySelector("#zxcvBNMasdf-video-test-btn-right").addEventListener("click", function () {
      event_popup_close();
      if (!!top.ampTV && !!top.ampTV.videojs && !!top.ampTV.videojs.players) {
        top.ampTV.videojs.players[Object.keys(top.ampTV.videojs.players)[0]].play();
      }
    });
  }
  var video_promise = dom_wrapper.querySelector("#zxcvBNMasdf-video-test").play();
  if (typeof video_promise !== "undefined") {
    video_promise.then(function (res) {})["catch"](function (error) {
      //if (error.includes("NotAllowedError")) {
      (0, _log.cLog)("[event:dispatch_check_low_power] low_power_or_error_with_video");
      //}                     
    });
  }
};

function addPhase2Script(configID, shadowRoot, src) {
  var sr = document.createElement('script');
  sr.async = 'async';
  sr.className = 'phase-2';
  if (configID !== 0) {
    sr.onload = function (configID) {
      (0, _log.cLog)("window", window);
      (0, _log.cLog)("top", top);
      if (!top) debugger;
      if (!top.ampTV.ampPhase2 && top.ampTV.ampPhase2Setup) top.ampTV.ampPhase2Setup();
      top.ampTV.ampPhase2(configID);
      //console.log("Loaded! ampPhase2 executed");
    }.bind(window, configID);
  }
  sr.src = src;
  //console.log("Loaded! Phase2 about to be appended", shadowRoot);
  (shadowRoot.querySelector('body') || shadowRoot).appendChild(sr);
  //console.log("Loaded! Phase2 appended", shadowRoot);
}

var ampPhase1 = function ampPhase1(configID) {
  try {
    top.ampTV = top.ampTV || {};
    if (typeof top.ampTV.installPlayList === 'undefined') {
      top.ampTV.installPlayList = require("./AMPLIFFYPLAYER_INTEXT_IMA_05.JS").installPlayList;
    }
    if (typeof top.ampTV.getElementById === 'undefined') top.ampTV.getElementById = function (ampTV, id) {
      if (!id) return null;
      var configId = id.replace(/___/g, ',');
      var playerStorage = ampTV.getConfigById(configId);
      if (!playerStorage) {
        if (id.match(/^content_video-/)) {
          playerStorage = ampTV.getConfigById(configId.substr(14));
        }
      }
      if (!playerStorage) return null;
      return playerStorage.shadowRoot.querySelector('#' + id);
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.ampPhase1 === 'undefined') top.ampTV.ampPhase1 = ampPhase1;
    if (typeof top.ampTV.instances === 'undefined') top.ampTV.instances = [];
    if (typeof top.ampTV.addConfig === 'undefined') top.ampTV.addConfig = function (ampTV, anchorElement, data) {
      if (!anchorElement) return;
      if (!data) return;
      var useShadowRoot = (0, _shadowDOM.isShadowDOMAvailable)();
      var shadowRoot = useShadowRoot ? anchorElement.shadowRoot : anchorElement.contentDocument ? anchorElement.contentDocument : anchorElement;
      //console.log("Loaded! addConfig2",anchorElement,shadowRoot,data);
      var instance = {
        anchorElement: anchorElement,
        shadowRoot: shadowRoot,
        data: data,
        id: anchorElement.id
      };
      // We remove old instances
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.anchorElement !== anchorElement;
      });
      // And add the new instance
      ampTV.instances.push(instance);
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.getConfigByElement === 'undefined') top.ampTV.getConfigByElement = function (ampTV, anchorElement) {
      if (!anchorElement) return;
      var instance = ampTV.instances.find(function (x) {
        return x.anchorElement === anchorElement;
      });
      if (!instance) return;
      return instance;
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.getConfigById === 'undefined') top.ampTV.getConfigById = function (ampTV, id) {
      if (!id) return;
      var instance = ampTV.instances.find(function (x) {
        return x.id === id;
      });
      if (!instance) return;
      return instance;
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.deleteConfigByElement === 'undefined') top.ampTV.deleteConfigByElement = function (ampTV, anchorElement) {
      if (!anchorElement) return;
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.anchorElement !== anchorElement;
      });
    }.bind(top, top.ampTV);
    if (typeof top.ampTV.deleteConfigById === 'undefined') top.ampTV.deleteConfigById = function (ampTV, id) {
      if (!id) return;
      ampTV.instances = ampTV.instances.filter(function (x) {
        return x.id !== id;
      });
    }.bind(top, top.ampTV);
  } catch (e) {
    console.error("Cannot setup ATV", e);
  }
  var isDev, isVideoBlog;
  try {
    isDev = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
    if (typeof top.ampTV.phase1 === 'undefined') top.ampTV.phase1 = document.querySelector('script.phase-1') ? document.querySelector('script.phase-1').src || true : true;
    if (typeof top.ampliffyTVVideoBlog !== 'undefined' && (!frameElement || !frameElement.className || !frameElement.match(/vid-iframe-amp/)) && typeof top.ampTV.phase2 === 'undefined') isVideoBlog = top.ampliffyTVVideoBlog;
  } catch (e) {}
  var initialVideoWidth, initialVideoHeight;
  var playerStorage = {
    useShadowRoot: useShadowRoot,
    disposeCallback: [],
    playerSize: new _playerSize.SizeRegistry()
  };
  var onPhase2 = [];
  if (!isVideoBlog && frameElement && configID === frameElement) {
    if (useShadowRoot) {
      var topDivElementId = frameElement.id.replace(/\//g, '_') + '-div';
      var frameElementId = frameElement.id;
      var div = document.createElement('div');
      initialVideoWidth = frameElement.clientWidth;
      initialVideoHeight = frameElement.clientWidth * 9 / 16;
      div.id = topDivElementId;
      div.className = 'vid-shadowRoot-amp';
      frameElement.style.opacity = 0.05;
      frameElement.style.pointerEvents = 'none';
      div.style.position = 'absolute';
      div.style.overflow = 'hidden';
      div.style.opacity = 0.05;
      div.style.pointerEvents = 'none';
      playerStorage.playerSize.setType('nonAva');
      var initializationDone = false;
      var tracker = function tracker() {
        if (playerStorage.options && playerStorage.options.fluid) {
          frameElement.style.width = '100%';
          frameElement.style.height = '100%';
          frameElement.style.height = frameElement.clientWidth * 9 / 16 + 'px';
        }
        var coords = (0, _absolutePosition.getCoords)(frameElement, frameElement.ownerDocument);
        div.style.top = coords.top + 'px';
        div.style.left = coords.left + 'px';
        playerStorage.playerSize.setSizeByType('nonAva', frameElement.clientWidth, frameElement.clientHeight);
        div.style.width = frameElement.clientWidth + 'px';
        div.style.maxWidth = frameElement.clientWidth + 'px';
        div.style.height = frameElement.clientHeight + 'px';
        div.style.maxHeight = frameElement.clientHeight + 'px';
        if (!initializationDone && playerStorage.player && typeof playerStorage.player.ready === 'function' && div.style.opacity === '0.05') {
          initializationDone = true;
          playerStorage.player.ready(function () {
            if (playerStorage.options.fluid) {
              frameElement.style.width = '100%';
              frameElement.style.height = '100%';
            } else {
              frameElement.style.width = playerStorage.options.size[0] + 'px';
              frameElement.style.height = playerStorage.options.size[1] + 'px';
            }
            div.style.opacity = 1.0;
            div.style.pointerEvents = '';
            tracker();
          });
        }
      };
      tracker();
      setInterval(tracker, 500);
      playerStorage.playerSize.startResize();
      var position = frameElement.ownerDocument.body;
      position.insertBefore(div, null);
      // Remove the div when the iframe is removed
      try {
        var script = "\n    var div = document.getElementById('".concat(topDivElementId, "');\n    var iframe = document.getElementById('").concat(frameElementId, "');\n      console.log('The iframe to be removed', div, iframe);\n    var checkIframe = setInterval(function() {\n      if (!document.contains(iframe)) {\n      console.log('Doesnt contain The iframe to be removed', div, iframe);\n        try { div.remove(); } catch (e) {\n      console.log('Doesnt contain The iframe to be removed', e);\n        }\n        clearInterval(checkIframe);\n      }\n    }, 1000);\n    function iframeRemoved() {\n      console.log('The iframe has been removed!');\n    }\n  ");
        top.detectIframeRemoval = new top.Function(script);
        top.detectIframeRemoval();
      } catch (e) {
        console.log('WHERE: The iframe has been removed!', e);
      }
      configID = div;
    }
  }
  top.ampTV.addConfig(configID, playerStorage);
  var playerId = 'content_video-' + (configID ? configID.id : 'undefined').replace(/,/g, "___");
  if (typeof top.ampVideoBlogProcessed !== 'undefined' && useShadowRoot && configID) {
    initialVideoWidth = configID.parentElement.clientWidth;
    initialVideoHeight = configID.parentElement.clientWidth * 9 / 16;
  }
  playerStorage.dispose = function (playerStorage) {
    playerStorage.disposeCallback.forEach(function (x) {
      return x();
    });
    playerStorage.disposeCallback.splice(0);
  }.bind(window, playerStorage);
  playerStorage.getElementToObserveViewability = function (playerStorage) {
    if (useShadowRoot) return playerStorage.rootDocument.querySelector('.vid-iframe-amp');else return configID || playerStorage.rootDocument.defaultView.frameElement;
  }.bind(window, playerStorage);
  playerStorage.getElementToFloat = function (playerStorage) {
    if (useShadowRoot) return playerStorage.rootDocument.querySelector('.vid-iframe-amp');else return configID || playerStorage.rootDocument.defaultView.frameElement;
  }.bind(window, playerStorage);
  playerStorage.getElementToObtainSize = function (playerStorage) {
    if (useShadowRoot) return playerStorage.getElementToFloat().parentElement;else return playerStorage.getElementToFloat().parentElement;
  }.bind(window, playerStorage);
  playerStorage.getElementToSetSize = function (playerStorage) {
    if (useShadowRoot) return playerStorage.rootDocument.querySelector('.vid-iframe-amp .video-js');else return playerStorage.getElementToFloat();
  }.bind(window, playerStorage);
  playerStorage.getParentElementToFloat = function (playerStorage) {
    if (useShadowRoot) return playerStorage.getElementToFloat().parentElement;else return playerStorage.getElementToFloat().parentElement;
  }.bind(window, playerStorage);
  playerStorage.getVideoElementPlaceholder = function (playerStorage) {
    if (useShadowRoot) return playerStorage.rootDocument.querySelector('.vid-iframe-amp-inner');else return playerStorage.rootDocument.body;
  }.bind(window, playerStorage);
  var shadowRoot = typeof playerStorage.rootDocument !== 'undefined' ? playerStorage.rootDocument : null;
  if (!isVideoBlog) {
    // We need the shadowRoot BEFORE parsing options, as the options parser adds styles to the page and requires the shadowRoot anchor.
    if (!shadowRoot && configID) {
      if (!useShadowRoot) {
        shadowRoot = configID && configID.contentDocument ? configID.contentDocument : configID;
        var observedElement = (frameElement && frameElement.contentDocument && frameElement.contentDocument.querySelector('body') ? frameElement.contentDocument.querySelector('body') : frameElement) || configID;
        observedElement.setAttribute("data-observe-resizes", "data-observe-resizes");
      } else {
        if (configID.shadowRoot) shadowRoot = configID.shadowRoot;else {
          shadowRoot = configID.attachShadow({
            mode: 'open'
          });
          var itemAnchor = configID;
          var elementId = configID.id;
          var doc = document;
          var h = itemAnchor.shadowRoot.querySelector('html') || doc.createElement('html');
          var he = itemAnchor.shadowRoot.querySelector('head') || doc.createElement('head');
          if (!h.querySelector('head')) h.appendChild(he);
          var b = itemAnchor.shadowRoot.querySelector('body') || doc.createElement('body');
          if (!h.querySelector('body')) h.appendChild(b);
          if (!itemAnchor.shadowRoot.querySelector('html')) itemAnchor.shadowRoot.appendChild(h);
          var sup = doc.createElement('div');
          sup.id = 'super' + elementId;
          sup.className = 'vid-iframe-parent';
          b.appendChild(sup);
          var _div = doc.createElement('div');
          _div.id = 'parent' + elementId;
          _div.setAttribute("data-observe-resizes", "data-observe-resizes");
          sup.appendChild(_div);
          var iframe = doc.createElement('div');
          iframe.id = elementId;
          iframe.className = 'vid-iframe-amp';
          _div.appendChild(iframe);
          var iframeDiv = doc.createElement('div');
          iframeDiv.className = 'vid-iframe-amp-inner';
          iframeDiv.style.position = 'relative';
          iframe.appendChild(iframeDiv);
        }
      }
      playerStorage.rootDocument = shadowRoot;
    }

    // Only run if ResizeObserver is supported.
    if ('ResizeObserver' in self) {
      // Create a single ResizeObserver instance to handle all
      // container elements. The instance is created with a callback,
      // which is invoked as soon as an element is observed as well
      // as any time that element's size changes.
      var ro = new ResizeObserver(function (entries) {
        // Default breakpoints that should apply to all observed
        // elements that don't define their own custom breakpoints.
        var defaultBreakpoints = {
          DZERO: 0,
          D285: 285,
          D320: 320,
          D380: 380,
          D425: 425,
          D480: 480,
          D520: 520,
          D600: 600,
          D640: 640,
          D750: 750,
          D854: 854,
          D920: 920,
          D1280: 1280
        };
        entries.forEach(function (entry) {
          // If breakpoints are defined on the observed element,
          // use them. Otherwise use the defaults.
          var breakpoints = entry.target.dataset.breakpoints ? JSON.parse(entry.target.dataset.breakpoints) : defaultBreakpoints;

          // Update the matching breakpoints on the observed element.
          Object.keys(breakpoints).forEach(function (breakpoint) {
            var minWidth = breakpoints[breakpoint];
            if (entry.contentRect.width >= minWidth) {
              entry.target.classList.add('GT-W' + breakpoint);
            } else {
              entry.target.classList.remove('GT-W' + breakpoint);
            }
            if (entry.contentRect.height >= minWidth) {
              entry.target.classList.add('GT-H' + breakpoint);
            } else {
              entry.target.classList.remove('GT-H' + breakpoint);
            }
            if (entry.contentRect.width <= minWidth) {
              entry.target.classList.add('LT-W' + breakpoint);
            } else {
              entry.target.classList.remove('LT-W' + breakpoint);
            }
            if (entry.contentRect.height <= minWidth) {
              entry.target.classList.add('LT-H' + breakpoint);
            } else {
              entry.target.classList.remove('LT-H' + breakpoint);
            }
          });
          // We add an ONLY-BREAKPOINT class
          var minWidth = entry.contentRect.width,
            bestWidth = undefined;
          var minHeight = entry.contentRect.height,
            bestHeight = undefined;
          Object.keys(breakpoints).forEach(function (breakpoint) {
            var size = breakpoints[breakpoint];
            if (minWidth <= size) {
              if (bestWidth === undefined || breakpoints[bestWidth] < minWidth) bestWidth = breakpoint;
            }
            if (minHeight <= size) {
              if (bestHeight === undefined || breakpoints[bestHeight] < minHeight) bestHeight = breakpoint;
            }
          });
          Object.keys(breakpoints).forEach(function (breakpoint) {
            if (breakpoint === bestWidth) entry.target.classList.add('EQ-W' + breakpoint);else entry.target.classList.remove('EQ-W' + breakpoint);
            if (breakpoint === bestHeight) entry.target.classList.add('EQ-H' + breakpoint);else entry.target.classList.remove('EQ-H' + breakpoint);
          });
        });
      });

      // Find all elements with the `data-observe-resizes` attribute
      // and start observing them.
      var elements = shadowRoot.querySelectorAll('[data-observe-resizes]');
      var element,
        i = 0;
      for (; element = elements[i]; i++) {
        ro.observe(element);
      }
    }
    (0, _phase.phase2Install)();
  }
  function setupOptions(defaultOptions, options) {
    var optionsMerged = _objectSpread(_objectSpread({}, defaultOptions), options);
    if (!options.avaSize) optionsMerged.avaSize = defaultOptions.avaSize;
    return optionsMerged;
  }
  var defaultOptions = {
    styles: '',
    size: [],
    fluid: false,
    autoPlay: false,
    muted: false,
    useBandwidthFromLocalStorage: false,
    limitRenditionByPlayerDimensions: true,
    poster: undefined,
    ytVideo: undefined,
    videoTitle: '',
    vidCoTitleHidden: false,
    videoDescriptionURL: '',
    videoDescription: '',
    vidCoAdUnit: '',
    proxy: undefined,
    playList: [],
    playListKWs: undefined,
    playListUserInterface: 'shown if CTP',
    allowPlayListOverride: false,
    playListPreloadNum: 2,
    delayPhase2: 0,
    viewability: {
      vidCo: 0.6,
      vidAd: 0.99,
      ignoreViewabilityIfAboveScrollingPosition: true,
      forceFirstPrerollEvenIfMissingVidAdViewability: false,
      firstVidAdMilliseconds: 2000,
      minMillisecondsBetweenVidAds: 60000
    },
    vastURL: '',
    vidAdSpecial: '',
    vidAdTryToResumeVidCo: true,
    vidAdOnFirstPreroll: true,
    openwrapAccountId: 0,
    openwrapProfileId: 0,
    openwrapDelayVidAdUntilOwResponse: false,
    openwrapMinCachedBids: 0,
    amazonHeaderBidderAccountId: '',
    amazonHeaderBidderSlotIDs: '',
    adBreakOnlyPrerolls: true,
    ava: false,
    avaOnlyOnVidAd: false,
    avaSize: {
      desktop: {
        width: 534,
        height: 300
      },
      mobile: {
        percentage: 21
      }
    },
    avaForceStartOnLoad: false,
    avaForceFloatedOnVidad: false,
    avaCloseDelayOnVidAd: -1,
    avaCloseSize: undefined,
    vidCoImpressions: true,
    vidCoAllowRepeatSameVideo: false,
    closeVidCo: false,
    closeVidCoSize: 20,
    closeVidCoDelayedMS: false,
    closeVidCoOnEnd: false,
    closeVidCoOnAdEnd: false,
    closeVidCoIfNoAd: false,
    closeVidCoIfNoAdTimeoutMS: 0,
    observers: {},
    enforceWhitelist: false,
    whitelistedDomains: [],
    comScoreID: 0,
    context: {},
    dev: false,
    logLevel: 3
  };
  var location = window.location || document.location;
  var options = setupOptions(defaultOptions, (0, _publisher.checkAmpAffiliate)(false, location, configID, playerStorage));

  //console.log("Loaded! PHASE1 document.currentScript", document.currentScript, !!document.currentScript);
  playerStorage.options = options;
  var openWrapOnInit;
  var whitelistedDomainsExpanded = (0, _domainWhitelist.expandDomains)(options.whitelistedDomains);
  if (!(0, _domainWhitelist.isWhitelistedDomain)(location.host, options.enforceWhitelist, whitelistedDomainsExpanded)) {
    try {
      var topLocation = top.location;
      if (!(0, _domainWhitelist.isWhitelistedDomain)(topLocation.host, options.enforceWhitelist, whitelistedDomainsExpanded)) {
        console.error('Ampliffy TV: Domain not whitelisted. Ask your sales contact in Ampliffy to add this domain to your Account:', topLocation.host, window.host);
        return;
      }
    } catch (e) {
      // ignore
      console.error('Ampliffy TV: Domain not whitelisted. Ask your sales contact in Ampliffy to add this domain to your Account:', window.location.host);
      return;
    }
  }
  if (window.location.host.match(/gamestry.com$/)) {
    if (!gamestryProcessed) {
      gamestryProcessed = true;
      var gamestry = new _gamestry.Gamestry(playerStorage);
      gamestry.adUnits = _gamestry.gamestryAdUnits;
      gamestry.start();
      openWrapOnInit = gamestry.openWrapOnInit.bind(gamestry);
    }
  }
  top.ampTV.addConfig(configID, playerStorage);
  var devURL = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA';
  if (!top.ampTV.css && window.css && window.css !== true) top.ampTV.css = window.css;
  if (!top.ampTV.phase2 && window.phase2 && window.phase2 !== true) top.ampTV.phase2 = window.phase2;
  if (!top.ampTV.phase3 && window.phase3 && window.phase3 !== true) top.ampTV.phase3 = window.phase3;
  try {
    if (isDev) {
      css = devURL + '.css?%%CACHEBUSTER%%';
      window.phase2 = top.ampTV.phase2 = devURL + '_FASE2.js?%%CACHEBUSTER%%';
      window.phase3 = top.ampTV.phase3 = devURL + '_FASE3.js?%%CACHEBUSTER%%';
    }
  } catch (e) {}
  if (isDev && isVideoBlog) {
    var _devURL = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA';
    var _videoBlogURL = _devURL + '_VIDEO_BLOG.js';
    var sr = document.createElement('script');
    sr.async = 'async';
    sr.className = 'phase-video-blog';
    sr.src = _videoBlogURL;
    document.body.appendChild(sr);
    top.ampTV.ampPhase1 = ampPhase1;
    if (0 && !useShadowRoot) {
      window.configID = 0;
      addPhase2Script(0, shadowRoot || document, top.ampTV.phase2 || window.phase2);
    }
  } else if (isVideoBlog) {
    var _sr = document.createElement('script');
    _sr.async = 'async';
    _sr.className = 'phase-video-blog';
    _sr.src = videoBlogURL;
    document.body.appendChild(_sr);
    top.ampTV.ampPhase1 = ampPhase1;
    if (0 && !useShadowRoot) {
      window.configID = 0;
      addPhase2Script(0, shadowRoot || document, top.ampTV.phase2 || window.phase2);
    }
  } else {
    console.log('options', options);
    playerStorage.options = options;
    var vidCoObj = new _vidCo.vidCo(playerStorage.options, playerStorage);
    if (options.proxy) vidCoObj.proxy = options.proxy;else {
      var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
      if (isMobile.isIOS() || isMobile.isSafari()) {
        console.warn("Activating VidCo Cookies Counter-measures");
        vidCoObj.proxy = 'https://ads.ampliffy.com/gampad/no.php';
      }
    }
    playerStorage.vidCoObj = vidCoObj;

    //        const amazonHeaderBidderHostWhitelisted = window.location.host.match(/videos.memedeportes.com$/) || window.location.host.match(/\.vayagif\.com$/) || window.location.host.match(/\.ascodevida\.com$/);
    var amazonHeaderBidderActive = options.amazonHeaderBidderAccountId && options.amazonHeaderBidderAccountId.length > 5;
    var amazonHeaderPrefetchBids = amazonHeaderBidderActive ? 1 : options.openwrapMinCachedBids;
    console.log("Amazon Active: ", amazonHeaderBidderActive, window.location.host, options.amazonHeaderBidderAccountId);
    var amazonHeaderBidderSlotIDs = options.amazonHeaderBidderSlotIDs && options.amazonHeaderBidderSlotIDs.length ? options.amazonHeaderBidderSlotIDs : '{}';
    playerStorage.amazonHeaderBidder = new _amazonHeaderBidder.AmazonHeaderBidder(top, amazonHeaderBidderActive ? options.amazonHeaderBidderAccountId : 0, _amazonHeaderBidder.AmazonHeaderBidder.parseSlotIds(amazonHeaderBidderSlotIDs), options.autoPlay, options.muted, options.openwrapDelayVidAdUntilOwResponse, amazonHeaderPrefetchBids);
    playerStorage.amazonHeaderBidder.setup();
    var openWrap = new _openWrap.OpenWrap(top, -1980, options.openwrapDelayVidAdUntilOwResponse, options.openwrapMinCachedBids);
    if (openWrapOnInit) openWrapOnInit(openWrap);
    openWrap.install(options.openwrapAccountId, options.openwrapProfileId);
    playerStorage.openWrap = openWrap;
    playerStorage.vidAdQueue = new _queue.VidAdQueue(playerStorage, vidCoObj);
    playerStorage.vidAdQueue.observers.push(function (immediate) {
      if (playerStorage.openWrap.minBidQueueLength <= 0) {
        if (immediate && !playerStorage.openWrap.delay_vidad_until_ow_response) {
          (0, _log.cLog)("AMP: OpenWrap: Avoiding to Delay VidAd");
          return;
        }
        (0, _log.cLog)("AMP: OpenWrap: About to prefetch a new VidAd:", JSON.parse(JSON.stringify(playerStorage.vidAdQueue.queue)));
        var _queueElement = playerStorage.vidAdQueue.queue.pop();
        playerStorage.openWrap.prefetch(_queueElement, function (x) {
          return playerStorage.vidAdQueue.queue.push(x);
        });
        return;
      }
      if (playerStorage.vidAdQueue.queue.length <= 0) {
        (0, _log.cLog)("AMP: OpenWrap: Cannot apply prefetched to new VidAd: empty queue");
        return;
      }
      (0, _log.cLog)("AMP: OpenWrap: Applying already prefetched to new VidAd:", playerStorage.openWrap.minBidQueueLength, JSON.parse(JSON.stringify(playerStorage.vidAdQueue.queue)));
      var queueElement = playerStorage.vidAdQueue.queue.pop();
      if (queueElement && queueElement.length) playerStorage.openWrap.sampleVastURL = queueElement;
      playerStorage.vidAdQueue.queue.push(playerStorage.openWrap.applyBestBid(queueElement));
    });
    if (amazonHeaderBidderActive) {
      playerStorage.vidAdQueue.observers.push(function (immediate) {
        if (playerStorage.amazonHeaderBidder.minBidQueueLength <= 0) {
          if (immediate && !playerStorage.amazonHeaderBidder.delay_vidad_until_ow_response) {
            (0, _log.cLog)("AMP: amazonHeaderBidder: Avoiding to Delay VidAd");
            return;
          }
          (0, _log.cLog)("AMP: amazonHeaderBidder: About to prefetch a new VidAd:", JSON.parse(JSON.stringify(playerStorage.vidAdQueue.queue)));
          var _queueElement2 = playerStorage.vidAdQueue.queue.pop();
          playerStorage.amazonHeaderBidder.fetch(function () {
            var vast = playerStorage.amazonHeaderBidder.applyBid(_queueElement2);
            playerStorage.vidAdQueue.queue.push(vast);
          });
          return;
        }
        if (playerStorage.vidAdQueue.queue.length <= 0) {
          (0, _log.cLog)("AMP: amazonHeaderBidder: Cannot apply prefetched to new VidAd: empty queue");
          return;
        }
        (0, _log.cLog)("AMP: amazonHeaderBidder: Applying already prefetched to new VidAd:", playerStorage.amazonHeaderBidder.minBidQueueLength, JSON.parse(JSON.stringify(playerStorage.vidAdQueue.queue)));
        var queueElement = playerStorage.vidAdQueue.queue.pop();
        var appliedBid = playerStorage.amazonHeaderBidder.applyBid(queueElement);
        playerStorage.vidAdQueue.queue.push(appliedBid);
      });
    }
    playerStorage.openWrap.startBidQueueFiller();
    var executePhase2 = function executePhase2() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      //console.log("Loaded: executePhase2.delayPhase2", options.delayPhase2);
      if (!force && typeof options.delayPhase2 === 'number' && options.delayPhase2 > 0) return setTimeout(executePhase2.bind(null, true), options.delayPhase2);
      if (!force && typeof options.delayPhase2 === 'function' && options.delayPhase2()) return setTimeout(executePhase2, options.delayPhase2());

      //console.log("Loaded: executePhase2", options);

      var phase2Exec;
      try {
        if (typeof top.ampTV.ampPhase2 !== 'undefined') {
          top.ampTV.ampPhase2(configID);
          phase2Exec = true;
        }
      } catch (e) {}
      if (!phase2Exec) {
        addPhase2Script(configID, shadowRoot, top.ampTV.phase2 || window.phase2);
      }
      // pop all onPhase2 callbacks and execute them with try/catch
      while (onPhase2.length) try {
        onPhase2.shift()();
      } catch (e) {
        console.error(e);
      }
      (0, _comScore2VideoJS.prepareComScore)(options.comScoreID, playerStorage);
    };
    var inserted = false;
    var insert = function insert(thumbnailURL, shortMP4URL) {
      var doPhase2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (!inserted) {
        inserted = true;
        var d = document,
          v = d.createElement('video');
        v.setAttribute('preload', 'preload');
        v.setAttribute('playsinline', 'playsinline');
        if (options.autoPlay) v.setAttribute('autoplay', 'autoplay');
        if (options.muted) v.setAttribute('muted', 'muted');
        v.setAttribute('poster', thumbnailURL);
        var videoWidth = options.fluid && initialVideoWidth && initialVideoHeight ? initialVideoWidth : options.size[0];
        var videoHeight = options.fluid && initialVideoWidth && initialVideoHeight ? initialVideoHeight : options.size[1];
        v.setAttribute('width', videoWidth);
        v.setAttribute('height', videoHeight);
        v.width = videoWidth;
        v.height = videoHeight;
        v.id = playerId;
        v.className = "video-js vjs-default-skin vjs-big-play-centered content_video-dimensions content_video-" + playerId + "-dimensions vjs-controls-enabled vjs-workinghover vjs-v7 vjs-playlist-enabled vjs-user-inactive";
        v.poster = thumbnailURL;
        v.innerHTML = '<source src="' + shortMP4URL + '" type="video/mp4">';
        //v.src = options.playList.items[0].sources.first15;
        playerStorage.getVideoElementPlaceholder(playerStorage).appendChild(v);
        var lk = document.createElement('link');
        lk.rel = 'stylesheet';
        lk.href = css;
        lk.className = 'phase-css';
        (shadowRoot.querySelector('head') || shadowRoot).appendChild(lk);
        var stb = document.createElement('style');
        stb.innerHTML = 'body { margin: 0 }';
        (shadowRoot.querySelector('head') || shadowRoot).appendChild(stb);
        // Workaround Chrome bug:
        var st = document.createElement('style');
        st.innerHTML = '@font-face {\n' + '    font-family: AMPVideoJS;\n' + '    src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAABBIAAsAAAAAGoQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPgAAAFZRiV3RY21hcAAAAYQAAADQAAADIjn098ZnbHlmAAACVAAACv4AABEIAwnSw2hlYWQAAA1UAAAAKgAAADYUHzoRaGhlYQAADYAAAAAbAAAAJA4DByFobXR4AAANnAAAAA8AAACE4AAAAGxvY2EAAA2sAAAARAAAAEQ9NEHGbWF4cAAADfAAAAAfAAAAIAEyAIFuYW1lAAAOEAAAASUAAAIK1cf1oHBvc3QAAA84AAABDwAAAZ5AAl/0eJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQ7xTiBgZWBgaWQ5RkDA8MvCM0cwxDOeI6BgYmBlZkBKwhIc01hcPjI+FGBHcRdyA4RZgQRAC4HCwEAAHic7dFprsIgAEXhg8U61XmeWcBb1FuQP4w7ZQXK5boMm3yclFDSANAHmuKviBBeBPQ8ymyo8w3jOh/5r2ui5nN6v8sYNJb3WMdeWRvLji0DhozKdxM6psyYs2DJijUbtuzYc+DIiTMXrty4k8oGLb+n0xCe37ekM7Z66j1DbUy3l6PpHnLfdLO5NdSBoQ4NdWSoY9ON54mhdqa/y1NDnRnq3FAXhro01JWhrg11Y6hbQ90Z6t5QD4Z6NNSToZ4N9WKoV0O9GerdUJORPqkhTd54nJ1YDXBU1RV+576/JBs2bPYPkrDZt5vsJrv53V/I5mclhGDCTwgGBQQSTEji4hCkYIAGd4TGIWFAhV0RQTpWmQp1xv6hA4OTOlNr2zFANbHUYbq2OtNCpViRqsk+e+7bTQAhzti8vPfuPffcc88959zznbcMMPjHD/KDDGEY0ABpYX384NhlomIYlo4JISGEY9mMh2FSidYiqkEUphtNYDSY/dXg9023l4DdxlqUl0chuZRhncJKrsCQHIwcGuwfnhMIzBnuH4Sym+1D2zaGjheXlhYfD238z80mKYMmvJ5XeOTzd8z9eujbMxJNhu4C9xPE/bCMiDuSNIWgkTQwBE55hLSAE7ZwhrHLnAHZOGV/kmBGTiNjZxzI77Hb7Hqjz68TjT6vh+5JT/cCIkqS0D6CqPf5jX4Qjdx5j6vlDfZM4aZFdbVXIxtOlJaP/WottMnH6CJQ3bTiue3PrY23HjnChtuamxwvvzFjxkPrNj3z0tG9T561HDYf6OgmRWvlY3JQHoQb8ltV2Yet7YfWctEjR1AtxS/cSX6U4alf6NJEBQ7YKg9wrXQKd0IeZCb2ux75Uhh1Un+Nz+9LTOE7PK777nN5xqdTneTBhCbx446mZrhnUkrCz2YhA9dSMxaG0SYmT8hi9ZPu1E94PJYQSH6LRmhxec7Q7ZeXntgQuVpbh+a4qWNsckVyTdn0P7o7DpgPW84+uRcq0BITflBikGdUjAZ9wYBVI3mtrNvr9kpg1UsaK6t3690aoorC1lg0GpMH2HAMtkZjsSi5Ig9ESVosOh7GQfLjKNLvKpMKkLSKNFAka710GdgSi8oDMSoNhqjkKBXTgn3swtaxyzGkUzIzae9RtLdWkSlZ1KDX6EzgllzV4NV4SoDFSOGD4+HCeQUF8wrZ5Hs8zIb5EaVxy8DYFTbMCJPnLIWZxugZE2NlivC0gc1qEQUR8jEKgZcAXeH18BiCgl5nlHh0CrjB4Hb5fX4gb0J7c9PuHVsfgkx2n/vTY/JV8kn8PGxf7faOZ8qX8JVByuIf4whk9sqXli2hvPJV9hrp0hY7l8r2x37ydaVsb4xvXv/47v2NjfCl8m5oRDJclFMoE1yk0Uh1Te4/m8lFXe9qBZD0EkheicebXvzI2PLCuoKCukLuhPIeKwaHPEouxw3kMqaIUXDQ1p0mip+MyCORSCQaoUsnY1VZ38nUTrG21WvVo4f1OsEJFhvSfAFwGfT8VHRMeAVUpwLOoLzjT/REIj3O3FhuURE+nERF+0pTId5Fyxv5sfwGyg4O+my4vZv0sZm7oeQlFZORiB+tG0MweVNraeitl7yxiPIHTk4/diVxs94o5lEYishB2iAtkchEnsActoEpx44Fo8XnsQMaA22BlqC20RmhBKzYojZyYaxg+JggMc4HHY2m+L9EkWSYljirOisrO7d3VorxzyZ6Vc4lJqITAu1b2wOBdrLElAP+bFc2eGaZFVbkmJktv5uT6Jlz5D/MnBFor6ig/JPnRViBsV3LNKGGqB1ChJ0tgQywlVLFJIuQgTFttwkiKxhyQdAZMdMYtSaoAewqfvXVYPAbDT6/1mez85YS8FSDywQ6NfAnef6FNEGMilnppyvn5rB6tTyq1pOceRWnp2WJEZFXHeX5oyoem1nTTgdqc4heDY7bOeKz63vnz+/dRx+s31Ht2JGanQ5seirfWJL9tjozU/12TnEjn5oux9OzU3ckGbBzBwNOyk69JykKH0n/0LM9A72tuwM3zQpIRu4AxiToseEpgPOmbROyFe9/X2yeUvoUsCyEvjcgs7fpWP3/aKlFN0+6HFUe6D9HFz/XPwBlN9tTqNyZjFJ8UO2RUT5/h4CptCctEyeisnOyXjALEp7dXKaQKf6O7IMnGjNNACRMLxqdYJX8eMLvmmd68D+ayBLyKKYZwYxDt/GNhzETDJ05Qxlyi3pi3/Z93ndYVSumgj0V/KkIFlO6+1K3fF2+3g0q+YtuSIf0bvmLqV09nnobI6hwcjIP8aPCKayjsF5JBY3LaKAeRLSyYB1h81oTwe9SlPMkXB7G0mfL9q71gaqqwPqu67QRKS1+ObTx+sbQy9QV2OQHEScGkdFBeT7v7qisqqrs6N52i78/R+6S0qQONVj26agOVoswCyQWIV5D86vH53bxNUeXV0K+XZaHv/nm/KsHhOvylwsWnJX/HE8l/4WCv5x+l5n08z6UU8bUMa3MBpSmM7F63AxntdC9eBCKEZW9Hr+ABNqtxgAQrSbMtmrW7lKQuoSgBhSrTazWVU2QAKWY8wiiuhqFmQgWJBgoXiuWIm42N7hqZbBsgXz52O5P5uSvaNgFGnOuvsRw8I8Laha91wMvDuxqWFheN7/8GVtTltdS83DQsXRmqc5ZtcJXEVrlV2doTWk5+Yunm71dG5f55m/qY0MjI93vv9/NfpxXV9sUXrxy2fbNy1or65cOlDRnOoKFeeXcbw42H/bNDT5Qs3flgs31gWC1lD1nfUV/X7NdCnSUdHY2e8afzfKsqZ5ZljfDqjLOmk3UebNXB+aHArPYDRs+/HDDxeT5DiP+sFg7OpRaVQMGBV89PpeBdj22hCE0Uub0UqwLrNWsG0cuyadgLXTeR5rbO4+3c/vl15cur2nRq+TXCQDcS3SO+s6ak+e5/eMS+1dw3btu3YG2tvFL8XdIZvdjdW6TO/4B7IdrZWVPmctm5/59AgsPItTSbCiIBr2OqIGzmu20SMKAS7yqwGBUfGfgjDYlLLDeF0SfcLB2LSx8flT+08/kzz6yOj96rft4rpTjdPQcmLd47uKibbDq7ZSz/XtbH2nN717Nd62rU+c8Icevvv7I09wA6WvjVcafb+FsbNG+ZQ80Rn6ZZsvrP7teP2dzTdoETvNhjCmsr8FID2sJ69VYvdUcxk4AzYRlKcaE38eXNRlfW9H1as9i6acLHp1XpuNB5K7DIvkX08y1ZYvh3KfWaiCzH+ztrSDmD7LuX73x/mJelB8Yj39t8nhNQJJ2CAthpoFGLsGgtSOCJooCGoaJAMTjSWHVZ08YAa1Fg9lPI5U6DOsGVjDasJeZZ+YyhfCwfOzCxlBA69M9XLXtza7H/rav+9Tjq5xNi0wpKQIRNO4Lrzz7yp5QVYM6Jd/oc1Uvn/mQhhuWh6ENXoS2YTZ8QT42bF5d/559zp5r0Uff2VnR2tdf2/WCOd2cO0Mw6qpWPnvxpV0nrt5fZd2yItc199GWe8vlNfNDq+CH/7yAAnB9hn7T4QO4c1g9ScxsZgmzntnE/IDGndtHMw69lFwoCnYsMGx+rBp8JSBqdLzBr9QRPq/PbhWMWFtQZp1xguy/haw3TEHm3TWAnxFWQQWgt7M5OV0lCz1VRYucpWliy7z6Zd4urwPIyeZQqli2Lgg7szJV09PysATbOQtYIrB2YzbkJYkGgJ0m4AjPUap1pvYu1K9qr97z0Yl3p332b2LYB78ncYIlRkau/8GObSsOlZancACE5d5ily+c2+7h5Yj4lqhVmXXB+iXLfvdqSgqfKtQvfHDV0OnvQR1qhw42XS/vkvsh/hXcrDFP0a+SJNIomEfD1nsrYGO+1bgTOJhM8Hv6ek+7vVglxuSRwoKn17S937bm6YJCeSSG0Op1n+7tE37tcZ/p7dsTv4EUrGpDbWueKigsLHhqTVsoEj+JU0kaSjnj9tz8/gryQWwJ9BcJXBC/7smO+I/IFURJetFPrdt5WcoL6DbEJaygI8CTHfQTjf40ofD+DwalTqIAAHicY2BkYGAA4uByr8R4fpuvDNzsDCBw7f/3LmSanREszsHABKIAKi0J7gAAeJxjYGRgYGcAARD5/z87IwMjAypQBAAtgwI4AHicY2BgYGAfYAwAOkQA4QAAAAAAAA4AaAB+AMwA4AECAUIBbAGYAcICGAJYArQC4AMwA7AD3gQwBJYE3AUkBWYFigYgBmYGtAbqB1gIEghYCG4IhHicY2BkYGBQZChlYGcAASYg5gJCBob/YD4DABfTAbQAeJxdkE1qg0AYhl8Tk9AIoVDaVSmzahcF87PMARLIMoFAl0ZHY1BHdBJIT9AT9AQ9RQ9Qeqy+yteNMzDzfM+88w0K4BY/cNAMB6N2bUaPPBLukybCLvleeAAPj8JD+hfhMV7hC3u4wxs7OO4NzQSZcI/8Ltwnfwi75E/hAR7wJTyk/xYeY49fYQ/PztM+jbTZ7LY6OWdBJdX/pqs6NYWa+zMxa13oKrA6Uoerqi/JwtpYxZXJ1coUVmeZUWVlTjq0/tHacjmdxuL90OR8O0UEDYMNdtiSEpz5XQGqzlm30kzUdAYFFOb8R7NOZk0q2lwAyz1i7oAr1xoXvrOgtYhZx8wY5KRV269JZ5yGpmzPTjQhvY9je6vEElPOuJP3mWKnP5M3V+YAAAB4nG2PyXLCMBBE3YCNDWEL2ffk7o8S8oCnkCVHC5C/jzBQlUP6IHVPzYyekl5y0iL5X5/ooY8BUmQYIkeBEca4wgRTzDDHAtdY4ga3uMM9HvCIJzzjBa94wzs+8ImvZNAq8TM+HqVkKxWlrQiOxjujQkNlEzyNzl6Z/cU2XF06at7U83VQyklLpEvSnuzsb+HAPnPfQVgaupa1Jlu4sPLsFblcitaz0dHU0ZF1qatjZ1+aTXYCmp6u0gSvWNPyHLtFZ+ZeXWVSaEkqs3T8S74WklbGbNNNq4LL4+CWKtZDv2cfX8l8aFbKFhEnJnJ+IULFpqwoQnNHlHaVQtPBl+ypmbSWdmyC61KS/AKZC3Y+AA==) format("woff");\n' + '    font-weight: 400;\n' + '    font-style: normal\n' + '}\n';
        top.document.head.appendChild(st);
      }
      if (doPhase2) executePhase2();
    };

    // Objective: Insert the video with a thumbnail and a short 15 seconds video
    if (options.playList.items && options.playList.items.length) vidCoObj.addItemsToPlaylist(playerStorage.options.playList.items, false);
    var checkValues = function checkValues() {
      var tryNum = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var thumbnailURL = false,
        shortMP4URL = false;
      vidCoObj.playList.forEach(function (x) {
        if (x.thumbnail && x.thumbnail.length && x.thumbnail[0].src && x.sources && x.sources.first15) {
          thumbnailURL = x.thumbnail[0].src;
          shortMP4URL = x.sources.first15;
        }
      });
      if (thumbnailURL && shortMP4URL) {
        insert(thumbnailURL, shortMP4URL, false);
        if (tryNum === 0) {
          // We try once to resolve it (tryNum=0). If there is an error, on the second try (tryNum=1), we will not retry and launch the Phase2.
          var resolving = vidCoObj.resolveMissing(options.size, function (x) {
            //console.log("AFTER ADDITEM", JSON.parse(JSON.stringify(x), JSON.parse(JSON.stringify(vidCoObj.playList))));
            executePhase2();
          }, function () {
            return setTimeout(function () {
              return checkValues(1);
            }, 1000);
          }, 1);
          if (!resolving) executePhase2();
        } else executePhase2();
      } else {
        if (options.playListKWs) {
          var _resolving = vidCoObj.resolveMissing(options.size, function (x) {
            //console.log("AFTER ADDITEM", JSON.parse(JSON.stringify(x), JSON.parse(JSON.stringify(vidCoObj.playList))));
            checkValues(1);
          }, function () {
            return setTimeout(checkValues, 1000);
          }, 1);
          if (!_resolving) vidCoObj.addNewItemBasedOnKeywords(options.vidCoAdUnit, options.size, options.playListKWs, function () {
            return checkValues(1);
          }, function () {
            return setTimeout(checkValues, 1000);
          });
          // resolveOrAddItemToPlaylist(vidCoObj,options,checkValues,() => setTimeout(checkValues, 1000));
        } else insert(thumbnailURL, shortMP4URL); // It will fail, but we need to execute the failure handlers, if there are one
      }
    };

    checkValues();
  }
};
var goAheadPhase1 = true;
try {
  var isDev = window.location.search && window.location.search.match(/[?&]amp_dev=1/);
  if (isDev && !document.querySelector('script.phase-1-dev')) {
    var devURL = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA';
    var phase1DevURL = devURL + '_FASE1.js?%%CACHEBUSTER%%';
    var sr = document.createElement('script');
    sr.className = 'phase-1-dev';
    sr.src = phase1DevURL;
    document.body.appendChild(sr);
    goAheadPhase1 = false;
  }
} catch (e) {
  console.log("Error " + e);
}
if (goAheadPhase1) {
  var phase1Exec,
    configID = frameElement ? frameElement : document.currentScript ? document.currentScript : null;
  if (configID && configID === frameElement) configID.id = configID.id.replace(/\//g, '_');
  try {
    if (typeof top.ampTV.ampPhase1 === 'undefined') top.ampTV.ampPhase1 = ampPhase1;
    if (configID) top.ampTV.ampPhase1(configID);
    phase1Exec = true;
  } catch (e) {}
  if (configID && !phase1Exec) ampPhase1(configID);
  var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
  if (isMobile.isIOS() || isMobile.isAndroid()) {
    dispatch_check_low_power();
  }
}

/* ORIGINAL

<style type="text/css">.vjs-remaining-time {display:none} </style>
<script>
   var d=document,v=d.createElement('video');
   v.setAttribute('preload','preload');
   v.setAttribute('playsinline','playsinline');
</script>
<video autoplay muted preload playsinline width="640" height="360" id="content_video" class="video-js vjs-default-skin vjs-big-play-centered content_video-dimensions vjs-controls-enabled vjs-workinghover vjs-v7 vjs-playlist-enabled vjs-user-inactive" poster="https://i.ytimg.com/vi/SVulT2F9hYU/hqdefault.jpg">
   <source src="https://tpc.googlesyndication.com/pagead/imgad?id=CICAgKDbgM7eChABGAEoATIItwgt8ZF_-1xA6YXJ3QU" type="video/mp4" />
 </video>
 <link rel="stylesheet" href="%%FILE:CSS1%%">
<script>window.phase3='%%FILE:JS2%%';var phase2='%%FILE:JS1%%'; try { if(location.search && location.search.match(/[?&]dev=1/)) phase2='https://intranet.local.smilethink.com/videotpl/AMPLIFFYPLAYER_INTEXT_IMA_FASE2.js'; } catch(e){}var sr=document.createElement('script');sr.async='async';sr.src=phase2;document.body.appendChild(sr);</script>
 <!--link rel="stylesheet" href="https://intranet.local.smilethink.com/videotpl/AMPLIFFYPLAYER_INTEXT_IMA.css">
 <script async="async" src="https://intranet.local.smilethink.com/videotpl/AMPLIFFYPLAYER_INTEXT_IMA_FASE2.js"-->

 */

},{"./AMPLIFFYPLAYER_INTEXT_IMA_05.JS":45,"./analytics/comScore2VideoJS":46,"./browser/absolutePosition":47,"./browser/shadowDOM":52,"./container/playerSize":56,"./dom/isMobile":59,"./dom/viewport":60,"./gamestry":61,"./log/log":62,"./phase-2":66,"./player/domainWhitelist":69,"./publisher":76,"./vidAd/amazonHeaderBidder":80,"./vidAd/openWrap":81,"./vidAd/queue":82,"./vidCo/vidCo":88}],66:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.phase2Install = phase2Install;
var _playlist = require("./vidCo/playlist15");
var _title = require("./vidCo/title");
var _timePlaying = require("./timer/timePlaying");
var _viewability = require("./viewability/viewability");
var _playStateObserver = require("./player/playStateObserver");
var _playListEnded = require("./player/playListEnded");
var _adsManager = require("./player/adsManager");
var _trackAdRequestDone = require("./player/trackAdRequestDone");
var _playlistHidden = require("./vidCo/playlistHidden");
var _fluid = require("./container/fluid");
var _vidAdCoSizes = require("./player/vidAdCoSizes");
var _visible = require("./observer/visible");
var _viewabilityState = require("./viewability/viewabilityState");
var _timeOutFirstAd = require("./vidAd/timeOutFirstAd");
var _log = require("./log/log");
function addPhase3Script(configID, phase3src, rootDocument) {
  var sr = document.createElement('script');
  sr.id = 'phase3';
  if (!document.getElementById(sr.id)) {
    sr.async = 'async';
    sr.className = 'phase-3';
    if (configID !== 0) {
      sr.onload = function (configID) {
        top.ampTV.ampPhase3(configID);
      }.bind(window, configID);
    }
    sr.src = phase3src;
    (rootDocument.querySelector('body') || rootDocument.body || rootDocument).appendChild(sr);
  }
}
var ampPhase2 = function ampPhase2(configID) {
  top.ampTV = top.ampTV || {};
  top.ampTV.ampPhase2 = ampPhase2;
  var playerConfig = top.ampTV.getConfigByElement(configID);
  var playerStorage = playerConfig.data;
  var playerId = 'content_video-' + configID.id.replace(/,/g, "___");

  //console.log("Loaded! PHASE 2",configID,playerStorage);

  //console.log('options', playerStorage.options);

  var videoEl = playerStorage.rootDocument.querySelector('video');
  //console.log("Loaded", playerStorage.rootDocument, videoEl);
  playerStorage.videoEl = videoEl;

  //console.log('videojs before require');
  if (frameElement && !window.useShadowRoot) top.ampTV.rootDocument = undefined;else top.ampTV.rootDocument = playerStorage.rootDocument;
  var videojs = top.ampTV.videojs;
  var vPlayList = (0, _playlist.getFirst15)(playerStorage.vidCoObj.playList);
  var installPlayList = top.ampTV.installPlayList;
  var autoplay = typeof playerStorage.options.autoPlay !== 'undefined' ? playerStorage.options.autoPlay : typeof playerStorage.autoplay === 'undefined' ? true : !!playerStorage.autoplay;
  var start_in_autoplay = autoplay;
  playerStorage.force_ava = playerStorage.options.avaForceStartOnLoad;
  if (autoplay) {
    if ((0, _visible.aboveScrollingPosition)(playerId, playerStorage.rootDocument) && playerStorage.options.viewability.ignoreViewabilityIfAboveScrollingPosition) {
      // It's ok to autoplay. This option has it's full usage with AVA active
    } else if (!(0, _visible.isVidAfInViewport)(playerId, playerStorage.rootDocument)) start_in_autoplay = false;
    if (!start_in_autoplay) {
      var el = playerStorage.rootDocument.getElementById(playerId);
      //el.pause();
      el.removeAttribute('autoplay');
    }
    if (playerStorage.options.ava && playerStorage.options.ava !== 'disabled' && playerStorage.options.viewability.ignoreViewabilityIfAboveScrollingPosition && (0, _visible.aboveScrollingPosition)(playerId, playerStorage.rootDocument) && start_in_autoplay) playerStorage.force_ava = true;
  }

  //console.log("start_in_autoplay:", start_in_autoplay);
  //console.log("force_ava=>", playerStorage.force_ava);

  //console.log('videojs after require', playerStorage.snapshot);
  playerStorage.videojs = videojs;
  var videoJSOptions = {
    controls: true,
    autoplay: start_in_autoplay,
    duration: 112,
    src: videoEl.src,
    poster: videoEl.poster,
    html5: {
      hls: {
        limitRenditionByPlayerDimensions: playerStorage.options.limitRenditionByPlayerDimensions,
        //overrideNative: true,
        useDevicePixelRatio: true,
        handlePartialData: true,
        overrideNative: false,
        useBandwidthFromLocalStorage: playerStorage.options.useBandwidthFromLocalStorage
      },
      vhs: {
        limitRenditionByPlayerDimensions: playerStorage.options.limitRenditionByPlayerDimensions,
        //overrideNative: true,
        useDevicePixelRatio: true,
        handlePartialData: true,
        overrideNative: false,
        useBandwidthFromLocalStorage: playerStorage.options.useBandwidthFromLocalStorage
      }
    }
  };
  //console.log("VideoJSOptions",videoJSOptions);
  if (configID.nodeName === 'IFRAME' && !window.useShadowRoot) top.ampTV.rootDocument = configID.contentDocument;else top.ampTV.rootDocument = playerStorage.rootDocument;
  //console.log("Creating Player with ID",playerId, configID);
  playerStorage.player = videojs(playerId, videoJSOptions);
  try {
    playerStorage.player.qualityLevels();
  } catch (e) {
    console.log("Error in qualityLevels", e);
  }
  playerStorage.amazonHeaderBidder.setPlayer(function () {
    return playerStorage.player.autoplay();
  }, function () {
    return playerStorage.player.muted();
  });
  playerStorage.playerSize.setPlayerResize(function (w, h) {
    if (!playerStorage.player) return;
    var doResizeIma = false;
    if (Math.abs(playerStorage.player.width() - w) >= 2 || Math.abs(playerStorage.player.height() - h) >= 2) {
      playerStorage.player.width(w);
      playerStorage.player.height(h);
      doResizeIma = true;
    }
    if (!doResizeIma && typeof playerStorage.getElementToObtainSize === 'function') {
      var elementToObtainSize = playerStorage.getElementToObtainSize();
      var videoElement = elementToObtainSize.querySelector && elementToObtainSize.querySelector('.video-js');
      if (videoElement && videoElement.style.width !== '' && Math.abs(parseInt(videoElement.style.width) - h) > 20) {
        videoElement.style.width = w + 'px';
        videoElement.style.height = h + 'px';
        doResizeIma = true;
      }
    }
    if (doResizeIma) {
      try {
        var adsManager = playerStorage.player.ima.getAdsManager();
        adsManager.resize(w, h, 'NORMAL');
      } catch (e) {
        (0, _log.cLog)("AdsManager not set", e);
      }
    }
  });

  // TODO: Create a Class which encapsulates the size, to allow different players to work with the same functions.
  //setActualVidAdCoSize(playerStorage.options.size);
  playerStorage.getActualVidAdCoSize = function () {
    return playerStorage.options.size;
  };
  var prepareFirstAd = function prepareFirstAd() {
    setTimeout(function () {
      try {
        playerStorage.vidAdQueue.prepareAdTag(false);
      } catch (e) {
        (0, _log.cLog)("AMP: OpenWrap: Error prefetching:" + e);
        debugger;
      }
    }, 10);
    playerStorage.vidCoObj.observers = playerStorage.vidCoObj.observers.filter(function (x) {
      return x !== prepareFirstAd;
    });
  };
  if (playerStorage.vidCoObj.playList.length) prepareFirstAd();else playerStorage.vidCoObj.observers.push(prepareFirstAd);
  var fluidObserver;
  if (playerStorage.options.fluid) {
    var parentElementToObtainSize = playerStorage.getElementToObtainSize();
    var resizer = document.createElement('div');
    resizer.style.position = 'absolute';
    resizer.style.width = '100%';
    resizer.style.height = '100%';
    resizer.style.top = '0';
    resizer.style.left = '0';
    resizer.style.right = '0';
    resizer.style.bottom = '0';
    resizer.style.maxHeight = '500px';
    resizer.style.pointerEvents = 'none';
    parentElementToObtainSize.appendChild(resizer);
    if (!playerStorage.useShadowRoot) {
      fluidObserver = new _fluid.FluidObserver(resizer);
      fluidObserver.addFluidObserver(function () {
        var elementToFloat = playerStorage.getElementToSetSize();
        (0, _log.cLog)("RESIZE: ", playerStorage.player.id(), "lastWidth:", fluidObserver.lastWidth, "lastHeight:", fluidObserver.lastHeight, " Now:", playerStorage.player.width(), "x", playerStorage.player.height());
        playerStorage.player.width(fluidObserver.lastWidth);
        playerStorage.player.height(fluidObserver.lastHeight);
        if (elementToFloat.nodeName === 'IFRAME') {
          elementToFloat.width = fluidObserver.lastWidth;
          elementToFloat.height = fluidObserver.lastHeight;
        } else {
          elementToFloat.style.width = fluidObserver.lastWidth + 'px';
          elementToFloat.style.height = fluidObserver.lastHeight + 'px';
        }
      }.bind(this));
      fluidObserver.addFluidObserver(_vidAdCoSizes.checkVidAdCoSizes.bind(this, function () {
        return [fluidObserver.lastWidth, fluidObserver.lastHeight];
      }, playerStorage.getActualVidAdCoSize));
      fluidObserver.fixFluidViaJS();
      fluidObserver.installFluidIntervalChecker();
    }
  }

  // Hide the duration until we know the real duration
  var timeControls,
    timeControlsHidden = true;
  var updateTimeControls = function updateTimeControls() {
    if (!timeControls) timeControls = document.querySelector('.vjs-duration');
    if (timeControls) timeControls.style.display = timeControlsHidden ? 'none' : 'inherit';
  };
  updateTimeControls();
  setTimeout(updateTimeControls, 1);

  // Try to play: Sometimes instantiating videojs too late pauses the video.
  try {
    if (start_in_autoplay) videoEl.play();
    //videoEl.currentTime = playerStorage.snapshot.currentTime;
  } catch (e) {}
  playerStorage.playerState = new _playStateObserver.playStateObserver(playerStorage.options.autoPlay, playerStorage.options.muted, playerStorage.options.observers);
  playerStorage.playerState.adManager = new _adsManager.AdsManager(playerStorage.player, playerStorage, function () {
    throw "Calling getAdTag too soon";
  }, _trackAdRequestDone.trackAdRequestDoneFactory.bind(this, playerStorage.player, playerStorage.playerState), playerStorage.options.observers);
  if (autoplay && !start_in_autoplay) playerStorage.playerState.shouldBePlaying = true;
  (0, _viewabilityState.install)(playerStorage.playerState, playerStorage.options, configID.id, playerStorage.rootDocument, function () {
    return playerStorage.player.paused();
  });
  if (playerStorage.options.closeVidCoIfNoAdTimeoutMS > 0) (0, _timeOutFirstAd.installFirstAdTimeout)(playerStorage.options.closeVidCoIfNoAdTimeoutMS, playerStorage.playerState.adManager, playerStorage.playerState);
  (0, _playListEnded.install)(playerStorage.player, playerStorage.playerState);
  var viewabilityControls = new _viewability.Viewability();
  viewabilityControls.setupViewabilityControls(playerStorage);
  playerStorage.player.on('volumechange', function () {
    playerStorage.playerState.muted = playerStorage.player.muted();
  });
  playerStorage.player.on('useractive', function () {
    //console.log("UserActive");
    if (playerStorage.playerState.playingVidCo && playerStorage.player.paused()) ;
    playerStorage.playerState.userActive = true;
  });
  playerStorage.player.on('userinactive', function () {
    //console.log("UserInActive");
    playerStorage.playerState.userActive = false;
  });
  playerStorage.playerState.observe('playListEnded', function () {
    //console.log("PlayList Ended");
  });

  // closeVidCoOnEnd
  if (playerStorage.options.closeVidCoOnEnd) {
    playerStorage.playerState.observe('playListEnded', function () {
      playerStorage.playerState.signalObservers('closedVidCo');
      /*DEPRECATED, ONLY USED BY Minijuegos*/
      playerStorage.playerState.signalObservers('closeVidCo'); /*END DEPRECATED*/
    });
  }

  playerStorage.timePlaying = new _timePlaying.TimePlaying(playerStorage.player);
  var playListOptions = {
    hideOnStart: playerStorage.options.playListUserInterface === 'hidden' || playerStorage.options.playListUserInterface === 'collapsed'
  };
  if (playerStorage.options.playListUserInterface === 'hidden') {
    (0, _playlistHidden.hide)(playerStorage.rootDocument);
  }
  installPlayList(vPlayList, videojs, playerStorage.player, playerStorage, playListOptions, playerStorage.rootDocument, top);

  // Show the title hovering over the video
  if (playerStorage.options.vidCoTitleHidden !== true) (0, _title.title)(playerStorage.rootDocument, playerStorage.rootDocument.getElementById(playerStorage.player.id()), playerStorage.player);

  //player.playlist(vPlayList);
  //player.playlistUi();

  // Hack the duration to allow the 15 seconds preview videos to show the full length duration
  playerStorage.onTimeUpdate = function () {
    //this.currentTime;
    var i = this.playlist.currentItem();
    if (vPlayList && i < vPlayList.length && vPlayList[i] && vPlayList[i].duration && this.duration() < 16 && vPlayList[i].duration > 15 && Math.round(this.duration()) !== Math.round(vPlayList[i].duration)) this.duration(vPlayList[i].duration);
    timeControlsHidden = false;
    updateTimeControls();
  };
  playerStorage.player.on('timeupdate', playerStorage.onTimeUpdate);

  // Init the ads plugin. This early initialization requires a hack in the IMA3 plugin to avoid double initialization
  playerStorage.player.ready(function () {
    (0, _log.cLog)("Init ads", this.ads);
    if (typeof this.ads === 'function') this.ads();else if (!this.ads && top.ampTV.videojs.getPlugin('ads')) top.ampTV.videojs.getPlugin('ads').call(this);
  });

  // Load Viewability Metrics: Pause VidCo if it's not visible on screen
  if (start_in_autoplay) playerStorage.player.one('playing', function () {
    return viewabilityControls.install(playerStorage.getElementToObserveViewability(), playerStorage.disposeCallback, playerStorage.player, playerStorage.options, playerStorage.playerState, playerStorage.options.viewability.vidCo, playerStorage.options.viewability.vidAd);
  });else viewabilityControls.install(playerStorage.getElementToObserveViewability() || document.body, playerStorage.disposeCallback, playerStorage.player, playerStorage.options, playerStorage.playerState, playerStorage.options.viewability.vidCo, playerStorage.options.viewability.vidAd, playerStorage.options.viewability.firstVidAdMilliseconds, playerStorage.options.viewability.minMillisecondsBetweenVidAds);

  // Load the Phase III - Ads
  var phase3Exec;
  try {
    if (typeof top.ampTV.ampPhase3 !== 'undefined') {
      top.ampTV.ampPhase3(configID);
      phase3Exec = true;
    }
  } catch (e) {}
  if (!phase3Exec) {
    var phase3src = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA_FASE3.js';
    if (!playerStorage.options.dev) {
      if (typeof playerStorage.phase3 === 'string') phase3src = playerStorage.phase3;else if (typeof top.ampTV.phase3 === 'string') phase3src = top.ampTV.phase3;else if (typeof window.phase3 === 'string') phase3src = window.phase3;
    }
    addPhase3Script(configID, phase3src, playerStorage.rootDocument);
  }

  // Allow to customize the player UI (and more)
  try {
    if (typeof top.ampVidAfCustomize === 'function') {
      if (typeof playerStorage.rootDocument.createElement === 'undefined') playerStorage.rootDocument.createElement = document.createElement.bind(document);
      playerStorage.rootDocument.createTextNode = document.createTextNode.bind(document);
      top.ampVidAfCustomize(playerStorage.rootDocument, playerStorage, playerStorage.options);
    }
  } catch (e) {
    (0, _log.cLog)("Amp.VidAf.UI.style ERROR", e);
  }

  // Test
  if (playerStorage.options.dev) {
    var sr = document.createElement('script');
    sr.id = 'amp-dev';
    if (!document.getElementById(sr.id)) {
      sr.async = true;
      sr.className = 'phase-2-dev';
      sr.src = 'https://gtm2.local.ampliffy.com/tests/AMPLIFFYPLAYER_INTEXT_IMA_FASE2DEV.js';
      (playerStorage.rootDocument.querySelector('body') || playerStorage.rootDocument.body || playerStorage.rootDocument).appendChild(sr);
    }
  }
};
function phase2Setup() {
  var phase2Exec,
    configID = frameElement && window.configID !== undefined ? window.configID : undefined;
  try {
    top.ampTV = top.ampTV || {};
    top.ampTV.ampPhase2 = ampPhase2;
    if (configID) {
      top.ampTV.ampPhase2(configID);
      phase2Exec = true;
    }
  } catch (e) {}
  if (configID && !phase2Exec) ampPhase2(configID);
  if (configID === 0 && !phase2Exec) {
    top.ampTV.ampPhase2 = ampPhase2;
    var videojs = top.ampTV.videojs;
    var d = document.createElement('video');
    d.id = 'p990';
    document.body.appendChild(d);
    if (frameElement && !window.useShadowRoot) top.ampTV.rootDocument = undefined;else top.ampTV.rootDocument = document;
    window.player = videojs(d.id, null, function (x) {
      (0, _log.cLog)("Init ads", window.player.ads);
      if (typeof window.player.ads === 'function') window.player.ads();else if (!window.player.ads && top.ampTV.videojs.getPlugin('ads')) {
        top.ampTV.videojs.getPlugin('ads').call(window.player);
      }
    });
    addPhase3Script(0, window.phase3, document);
  }
}
function phase2Install() {
  top.ampTV = top.ampTV || {};
  top.ampTV.ampPhase2Setup = phase2Setup;
}

},{"./container/fluid":55,"./log/log":62,"./observer/visible":64,"./player/adsManager":67,"./player/playListEnded":71,"./player/playStateObserver":73,"./player/trackAdRequestDone":74,"./player/vidAdCoSizes":75,"./timer/timePlaying":78,"./vidAd/timeOutFirstAd":83,"./vidCo/playlist15":84,"./vidCo/playlistHidden":85,"./vidCo/title":86,"./viewability/viewability":90,"./viewability/viewabilityState":91}],67:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observables = exports.AdsManager = void 0;
var _log = require("../log/log");
var _bringGoogleIMAObjectsToThisWindow = require("./bringGoogleIMAObjectsToThisWindow");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var observables = {
  adManagerReady: [],
  errorVidAd: [],
  noVidAd: [],
  loadedVidAd: [],
  startedVidAd: [],
  endedVidAd: [],
  userClosedVidAd: [],
  wantingToPlayFirstPreroll: [],
  wantingToPlayAnAd: []
};
exports.observables = observables;
/**
 * Ads Serializer
 */
var AdsManager = /*#__PURE__*/function () {
  // Whether the IMA3 adManager accepts new adRequests

  // Facts about User intervention

  function AdsManager(player, playerStorage, getAdTag, trackerFactory) {
    var _this = this;
    var observers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    _classCallCheck(this, AdsManager);
    this.player = player;
    this.playerStorage = playerStorage;
    this.getAdTag = getAdTag;
    this.tracker = trackerFactory;
    this._adManagerPrepared = false;
    this._adManagerPluginInstalled = false;
    this.adPrepared = false;
    this.wantingToPlayAnAd = false;
    this.wantingToPlayFirstPreroll = false;
    this.playingAnAd = false;
    this._userClosedVidAd = false;
    this.observers = observers;
    this.player.on('adserror', function (e) {
      return _this.errorVidAd(e);
    });
    this.player.on('adstart', function (e) {
      return _this.startedVidAd(e);
    });
    this.player.on('adend', function (e) {
      return _this.endedVidAd(e);
    });
    this.player.on('adsready', function (e) {
      return _this.loadedVidAd(e);
    });

    // Detect if IMA3 adManager is ready
    player.one('adsready', function () {
      _this.adManagerPrepared = true;
      (0, _log.cLog)("AdsManager Ready");
    });
    setInterval(this.checkBugFix, 1000);
  }
  _createClass(AdsManager, [{
    key: "prepareToLaunchFirstPreroll",
    value: function prepareToLaunchFirstPreroll(options) {
      // This is done on initialization of player.ima
      if (!this.wantingToPlayAnAd) this.signalObservers("wantingToPlayAnAd");
      this.wantingToPlayAnAd = true;
      if (!this.wantingToPlayFirstPreroll) this.signalObservers("wantingToPlayFirstPreroll");
      this.wantingToPlayFirstPreroll = true;
      if (typeof options.adsResponse !== 'undefined') delete options.adsResponse;
      options.adTagUrl = this.getAdTag();
      this.tsLastAdLaunched = performance.now();
      return options;
    }
  }, {
    key: "setupAdsOnNextPreroll",
    value: function setupAdsOnNextPreroll() {
      var _this2 = this;
      // request ads whenever there's new video content
      if (!this.wantingToPlayAnAd) this.signalObservers("wantingToPlayAnAd");
      this.wantingToPlayAnAd = true;
      this.player.one('contentchanged', function (e) {
        (0, _log.cLog)("contentchanged", e);
        _this2.showRequestedAd();
      });
    }
  }, {
    key: "requestAnAd",
    value: function requestAnAd() {
      if (!this._adManagerPrepared) return false;
      this.updateMuteAutoPlay();
      this.player.ima.changeAdTag(this.getAdTag());
      this.adPrepared = true;
      return true;
    }
  }, {
    key: "updateMuteAutoPlay",
    value: function updateMuteAutoPlay() {
      var muted = this.player.muted();
      var volume = this.player.volume();
      var ec = '';
      try {
        var settings = this.player.ima.getSettings();
        settings.adsWillPlayMuted = volume === 0 || muted;
        settings.adsWillAutoplay = this.player.options().autoplay;
        (0, _log.cLog)("IMA settings: adsWillPlayMuted=>", settings.adsWillPlayMuted, " adsWillAutoplay=>", settings.adsWillAutoplay);
      } catch (e) {
        (0, _log.cLog)("Error in updateMuteAutoPlay: " + e);
        ec = e;
      }
    }
  }, {
    key: "showRequestedAd",
    value: function showRequestedAd() {
      if (!this.adPrepared) if (!this.requestAnAd()) return false;
      (0, _log.cLog)("showRequestedAd()");
      if (!this.wantingToPlayAnAd) this.signalObservers("wantingToPlayAnAd");
      this.wantingToPlayAnAd = true;
      this.player.ima.requestAds();
      this.tsLastAdLaunched = performance.now();
      return true;
    }
  }, {
    key: "errorVidAd",
    value: function errorVidAd(e) {
      // adserror Event
      (0, _log.cLog)('noVidAd', e);
      this.adPrepared = false;
      (0, _bringGoogleIMAObjectsToThisWindow.bringGoogleIMAObjectsToThisWindow)();
      // HACK: On first Ad we may feed an empty VAST
      if (!this._adManagerPrepared && e.data.AdError.getErrorCode() === window.google.ima.AdError.ErrorCode.VAST_EMPTY_RESPONSE) {
        this.adManagerPrepared = true;
        (0, _log.cLog)("Hack: AdsManager Ready");
        if (typeof this.playerStorage.options.adsResponse === 'undefined') this.tsLastAdEnded = performance.now();
      } else this.tsLastAdEnded = performance.now();
      if (this.tsLastAdLaunched) {
        // We must have requested an Ad prior. If we haven't, it's just a setup artifact for
        // avoiding the first preroll. In case you need all of them, then just observe through player.on('aderror',()=>{});
        this.signalObservers('errorVidAd');
        this.signalObservers('noVidAd');
      }
      this.wantingToPlayAnAd = false;
    }
  }, {
    key: "loadedVidAd",
    value: function loadedVidAd(e) {
      // adsready Event
      (0, _log.cLog)('loadedVidAd', e);
      this.signalObservers('loadedVidAd');
    }
  }, {
    key: "startedVidAd",
    value: function startedVidAd(e) {
      // adstart Event
      (0, _log.cLog)('startedVidAd', e);
      this.playingAnAd = true;
      this.wantingToPlayAnAd = false;
      this.adPrepared = false;
      // This may be the first Ad shown. Update some
      if (!this._adManagerPrepared) this.adManagerPrepared = true;
      if (!this.tsLastAdLaunched)
        // A preroll may not have been registered
        this.tsLastAdLaunched = performance.now();
      this.signalObservers('startedVidAd');
    }
  }, {
    key: "endedVidAd",
    value: function endedVidAd(e) {
      // adend event
      (0, _log.cLog)('endedVidAd', e);
      this.tsLastAdEnded = performance.now();
      this.playingAnAd = false;
      if (!this.adPrepared) this.requestAnAd();
      this.signalObservers('endedVidAd');
    }
  }, {
    key: "checkBugFix",
    value: function checkBugFix() {
      // Bugfix
      if (this._adManagerPrepared && this.player.ads.isInAdMode() && this.player.ads.isWaitingForAdBreak()) {
        (0, _log.cLog)("LAUNCHING BUGFIX");
        this.player.ima.changeAdTag(null);
        this.player.ima.requestAds();
        if (this.wantingToPlayAnAd) this.showRequestedAd();
      }
    }
  }, {
    key: "adManagerPrepared",
    get: function get() {
      return this._adManagerPrepared;
    },
    set: function set(value) {
      var modified = this._adManagerPrepared !== value;
      this._adManagerPrepared = value;
      if (modified && value) this.signalObservers('adManagerReady');
    }

    // Facts about User intervention
  }, {
    key: "userClosedVidAd",
    get: function get() {
      return this._userClosedVidAd;
    },
    set: function set(value) {
      var modified = this._userClosedVidAd !== value;
      this._userClosedVidAd = value;
      if (modified) this.signalObservers('userClosedVidAd');
    }
  }, {
    key: "observe",
    value: function observe(type, observer) {
      if (!this.observers[type]) this.observers[type] = [];
      this.observers[type].push(observer);
    }
  }, {
    key: "signalObservers",
    value: function signalObservers(type) {
      (0, _log.cLog)("Signal ad observers: ", type);
      if (!this.observers[type]) return;
      this.observers[type].forEach(function (x) {
        return x();
      });
    }
  }]);
  return AdsManager;
}();
exports.AdsManager = AdsManager;

},{"../log/log":62,"./bringGoogleIMAObjectsToThisWindow":68}],68:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bringGoogleIMAObjectsToThisWindow = bringGoogleIMAObjectsToThisWindow;
var _log = require("../log/log");
function bringGoogleIMAObjectsToThisWindow() {
  try {
    var loaded = false;
    if (typeof window.google === 'undefined' && typeof top.google !== 'undefined') {
      window.google = top.google;
      loaded = true;
    }
    if (!loaded && (typeof window.google === 'undefined' || typeof window.google.ima === 'undefined') && typeof top.google !== 'undefined' && typeof top.google.ima !== 'undefined') {
      window.google = top.google;
      loaded = true;
    }
  } catch (e) {
    (0, _log.cLog)("Error in errorVidAd: " + e);
  }
}

},{"../log/log":62}],69:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expandDomains = expandDomains;
exports.isWhitelistedDomain = isWhitelistedDomain;
// Check if the player has been included in a page from a whitelisted domain, making sure the last part of the domain matches the whitelist.
function isWhitelistedDomain(hostname, enforceWhitelist, whitelist) {
  if (!enforceWhitelist) {
    return true;
  }

  // Check if the hostname is exactly in the whitelist
  if (whitelist.indexOf(hostname) !== -1) {
    return true;
  }

  // Check if the whitelist matches the hostname, being careful it includes a dot
  return !!whitelist.some(function (item) {
    return hostname.endsWith('.' + item);
  });
}
function expandDomains(whitelist) {
  var expandedWhitelist = [];
  for (var i = 0; i < whitelist.length; i++) {
    var domain = whitelist[i];
    if (domain.indexOf('www.') === 0) {
      expandedWhitelist.push(domain.substr(4));
      expandedWhitelist.push(domain);
    } else if (domain.indexOf('m.') === 0) {
      expandedWhitelist.push(domain.substr(2));
      expandedWhitelist.push(domain);
    } else {
      expandedWhitelist.push(domain);
    }
  }
  return expandedWhitelist;
}

},{}],70:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isFullyPaused = isFullyPaused;
exports.isPlayingAnAd = isPlayingAnAd;
function isFullyPaused(player) {
  if (!player.paused()) return false;
  return !isPlayingAnAd(player);
}
function isPlayingAnAd(player) {
  //try {
  //console.log("VAST AVA: " + top.frameElementVideo.id + " isPlayingAnAd: Player Play=>", !player.paused(), "isInAdMode=>", window.player.ads.isInAdMode(), " Not waiting for AdBreak", !window.player.ads.isWaitingForAdBreak())
  //} catch (e) {}
  //if(!player.paused()) return false;
  return player.ads.isInAdMode() && player.ads.isAdPlaying() && !player.ads.isWaitingForAdBreak();
}

},{}],71:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
var _log = require("../log/log");
function install(player, playerState) {
  var millisecondsToWaitForEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8000;
  // Register that the playList has ended

  var timeOutWaitingForNextStart;
  var resetTimeOut = function resetTimeOut() {
    player.off(['adstart', 'adsstart', 'play', 'playing'], resetTimeOut);
    if (timeOutWaitingForNextStart) {
      clearTimeout(timeOutWaitingForNextStart);
      timeOutWaitingForNextStart = undefined;
    }
  };
  var playListEnded = false;
  var checkEnded = function checkEnded(e) {
    var exec = function exec() {
      // If there are elements pending in a playlist, we have not ended
      if (player && typeof player.playlist === 'function') {
        var playList = player.playlist();
        var current = player.playlist.currentIndex();
        if (current < 0 && (!playList || !playList.length)) {
          playListEnded = true;
          (0, _log.cLog)("Mark PlayListEnded => the playlist is empty", playerState);
        } else if (current >= playList.length - 1) {
          playListEnded = true;
          (0, _log.cLog)("Mark PlayListEnded => playlist end reached", playerState, playList, current);
        }
      } else {
        // If there is no playlist, we assume that there is just the first video
        playListEnded = true;
        (0, _log.cLog)("Mark PlayListEnded => there was just one video", playerState);
      }
      if (playListEnded) {
        playerState.playListEnded = true;
        (0, _log.cLog)("Mark PlayListEnded", playerState);
        player.off('ended', checkEnded);
        player.one('playing', install.bind(null, player, playerState, millisecondsToWaitForEnd));
      } else {
        // We should not be at the end, but if the next content delays too much, then we mark it as ended
        resetTimeOut();
        player.one(['adstart', 'adsstart', 'play', 'playing'], resetTimeOut);
        timeOutWaitingForNextStart = setTimeout(function () {
          playerState.playListEnded = true;
          (0, _log.cLog)("Mark PlayListEnded due to timeout", playerState);
        }, millisecondsToWaitForEnd);
      }
    };
    if (!!e) {
      if (e.type === "error") {
        var _error = player.error();
        if (_error.code === 2) {
          (0, _log.cLog)("NETWORK_ERROR. Fallback: Play next video on playlist", player);
          player.error(null);
          player.currentTime(0);
          player.playlist.next();
          exec();
        }
      } else {
        exec();
      }
    }
  };
  player.on(['ended', 'error'], checkEnded);
}

},{"../log/log":62}],72:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.playState = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var playState = /*#__PURE__*/function () {
  // Initial Intentions

  // Facts about having played at least once

  // Facts about current playing state

  // Facts about AutoPlay Capabilities

  // Facts about User intervention

  // Facts about automated play/pause -> If the player is not visible, we may pause the player and annotate that it should be playing.

  // Facts about Ad State

  // State about Viewability

  function playState(autoPlay, muted) {
    _classCallCheck(this, playState);
    // Initial Intentions
    this.autoPlay = autoPlay;
    this._muted = muted;

    // Facts about having played at least once
    this.hasPlayedAtLeastOnce = false;

    // Facts about current playing state
    this._playingVidCo = false;
    this._playingVidAd = false;
    this._playListEnded = false;

    // Facts about AutoPlay Capabilities
    this.autoPlayDetectionCanAutoPlayWithSoundAnalysisDone = false;
    this.autoPlayDetectionCanAutoPlayWithSoundAnalysisResult = false;
    this.autoPlayDetectionCanAutoPlayMutedAnalysisDone = false;
    this.autoPlayDetectionCanAutoPlayMutedAnalysisResult = false;

    // Facts about User intervention
    this.userWantsMuted = undefined;
    this.userWantsUnMuted = undefined;
    this._userClosedVidCo = false;
    this.userActive = false;
    this._adManagerPluginInstalled = false;
  }
  _createClass(playState, [{
    key: "isMissingAutoPlay",
    value: function isMissingAutoPlay() {
      // If we didn't need to autoPlay
      if (this.autoPlay === false) return false;
      // If we have started playing, then we don't need to autoPlay
      if (this.hasPlayedAtLeastOnce) return false;
      // If we have detected that we can AutoPlay with Sound, then go ahead and start autoPlay
      if (this.autoPlayDetectionCanAutoPlayWithSoundAnalysisDone && this.autoPlayDetectionCanAutoPlayWithSoundAnalysisResult) return true;
      // If we have detected that we can AutoPlay without Sound, then go ahead and start autoPlay
      if (this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return true;
      // If we have made all the analysis of autoPlays, and we cannot autoPlay, then report it so
      // In case we wanted muted autoplay, then we can avoid some checks
      if (this._muted && this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && !this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return false;
      // If we have made all the analysis of autoPlays, and we cannot autoPlay, then report it so
      if (this.autoPlayDetectionCanAutoPlayWithSoundAnalysisDone && this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && !this.autoPlayDetectionCanAutoPlayWithSoundAnalysisResult && !this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return false;
      // If some analysis is missing, report undefined
      return undefined;
    }
  }, {
    key: "getMustBeMuted",
    value: function getMustBeMuted() {
      // We must obey the user
      if (this.userWantsMuted === true) return true;
      if (this.userWantsUnMuted === true) return false;
      // if we have played at least once, and there is no user preference, then get the initial preference
      if (this.hasPlayedAtLeastOnce) return this._muted;
      // if we are in Click To Play, then return the initial preference
      if (!this.autoPlay) return this._muted;

      // So, we are in autoPlay and we haven't started yet. Let's get the analysis of autoPlay
      // If we have detected that we can AutoPlay with Sound, then go ahead and start autoPlay
      if (this.autoPlayDetectionCanAutoPlayWithSoundAnalysisDone && this.autoPlayDetectionCanAutoPlayWithSoundAnalysisResult) return false;
      // If we have detected that we can AutoPlay without Sound, then go ahead and start autoPlay
      if (this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return true;
      // If we have made all the analysis of autoPlays, and we cannot autoPlay, then report the initial mute intentions
      // In case we wanted muted autoplay, then we can avoid some checks
      if (this._muted && this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && !this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return this._muted;
      // If we have made all the analysis of autoPlays, and we cannot autoPlay, then report the initial mute intentions
      if (this.autoPlayDetectionCanAutoPlayWithSoundAnalysisDone && this.autoPlayDetectionCanAutoPlayMutedAnalysisDone && !this.autoPlayDetectionCanAutoPlayWithSoundAnalysisResult && !this.autoPlayDetectionCanAutoPlayMutedAnalysisResult) return this._muted;
      // If some analysis is missing, report undefined
      return undefined;
    }
  }, {
    key: "setHasPlayed",
    value: function setHasPlayed() {
      this.hasPlayedAtLeastOnce = true;
    }

    // Getters and Setters (just to be overriden)
    // Facts about Ad State
  }, {
    key: "adManagerPluginInstalled",
    get: function get() {
      return this._adManagerPluginInstalled;
    },
    set: function set(value) {
      this._adManagerPluginInstalled = value;
    }

    // Facts about current playing state
  }, {
    key: "playingVidCo",
    get: function get() {
      return this._playingVidCo;
    },
    set: function set(value) {
      this._playingVidCo = value;
    }
  }, {
    key: "playingVidAd",
    get: function get() {
      return this._playingVidAd;
    },
    set: function set(value) {
      this._playingVidAd = value;
    }
  }, {
    key: "playListEnded",
    get: function get() {
      return this._playListEnded;
    },
    set: function set(value) {
      this._playListEnded = value;
    }
  }, {
    key: "muted",
    get: function get() {
      return this._muted;
    },
    set: function set(value) {
      this._muted = value;
    }

    // Facts about User intervention
  }, {
    key: "userClosedVidCo",
    get: function get() {
      return this._userClosedVidCo;
    },
    set: function set(value) {
      this._userClosedVidCo = value;
    }
  }]);
  return playState;
}();
exports.playState = playState;

},{}],73:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.playStateObserver = exports.observables = void 0;
var _playState2 = require("./playState");
var _log = require("../log/log");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var observables = {
  init: [],
  ready: [],
  playListEnded: [],
  endedVidCo: [],
  startVidCo: [],
  userClosedVidCo: [],
  /*DEPRECATED, ONLY USED BY Minijuegos*/closeVidCo: [] /*END DEPRECATED*/,
  closedVidCo: [],
  muted: [],
  unmute: []
};

// noinspection JSUnusedGlobalSymbols
exports.observables = observables;
var playStateObserver = /*#__PURE__*/function (_playState) {
  _inherits(playStateObserver, _playState);
  var _super = _createSuper(playStateObserver);
  function playStateObserver(autoPlay, muted, observers) {
    var _this;
    _classCallCheck(this, playStateObserver);
    _this = _super.call(this, autoPlay, muted);
    _this.observers = observers || {};
    _this.signalObservers('init');
    return _this;
  }

  // Facts about Ad State
  _createClass(playStateObserver, [{
    key: "adManagerPluginInstalled",
    get: function get() {
      return this._adManagerPluginInstalled;
    },
    set: function set(value) {
      var modified = this._adManagerPluginInstalled !== value;
      this._adManagerPluginInstalled = value;
      if (modified && value) this.signalObservers('ready');
    }

    // Facts about current playing state
  }, {
    key: "playingVidCo",
    get: function get() {
      return this._playingVidCo;
    },
    set: function set(value) {
      var modified = this._playingVidCo !== value;
      this._playingVidCo = value;
      if (modified && value && !this.playingVidAd) this.signalObservers('startVidCo');
      if (modified && value && !this.playingVidAd) this.playListEnded = false;
      if (modified && !value && !this.playingVidAd) this.signalObservers('endedVidCo');
    }
  }, {
    key: "playListEnded",
    get: function get() {
      return this._playListEnded;
    },
    set: function set(value) {
      var modified = this._playListEnded !== value;
      this._playListEnded = value;
      if (modified && value) this.signalObservers('playListEnded');
    }
  }, {
    key: "muted",
    get: function get() {
      return this._muted;
    },
    set: function set(value) {
      var modified = this._muted !== value;
      this._muted = value;
      if (modified && value) this.signalObservers('muted');
      if (modified && !value) this.signalObservers('unmute');
    }

    // Facts about User intervention
  }, {
    key: "userClosedVidCo",
    get: function get() {
      return this._userClosedVidCo;
    },
    set: function set(value) {
      var modified = this._userClosedVidCo !== value;
      this._userClosedVidCo = value;
      if (modified) this.signalObservers('userClosedVidCo');
      if (modified) this.signalObservers('closedVidCo');
      if (modified) this.signalObservers('closeVidCo'); // DEPRECATED, Only used by Minijuegos
    }
  }, {
    key: "observe",
    value: function observe(type, observer) {
      if (!this.observers[type]) this.observers[type] = [];
      this.observers[type].push(observer);
    }
  }, {
    key: "signalObservers",
    value: function signalObservers(type) {
      (0, _log.cLog)("Signal observers: ", type);
      if (!this.observers[type]) return;
      this.observers[type].forEach(function (x) {
        return x();
      });
    }
  }]);
  return playStateObserver;
}(_playState2.playState);
exports.playStateObserver = playStateObserver;

},{"../log/log":62,"./playState":72}],74:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrackAdRequestDone = void 0;
exports.trackAdRequestDoneFactory = trackAdRequestDoneFactory;
var _log = require("../log/log");
var _bringGoogleIMAObjectsToThisWindow = require("./bringGoogleIMAObjectsToThisWindow");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function trackAdRequestDoneFactory(player, playerState, relaunchAd, cbAdStarted, cbAdError) {
  var millisecondsMaxWait = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 6000;
  var numRetries = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 3;
  var millisecondsBetweenRetries = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1000;
  return new TrackAdRequestDone(player, playerState, relaunchAd, cbAdStarted, cbAdError, millisecondsMaxWait, numRetries, millisecondsBetweenRetries);
}
var TrackAdRequestDone = /*#__PURE__*/function () {
  function TrackAdRequestDone(player, playerState, relaunchAd, cbAdStarted, cbAdError) {
    var millisecondsMaxWait = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 6000;
    var numRetries = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 3;
    var millisecondsBetweenRetries = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1000;
    _classCallCheck(this, TrackAdRequestDone);
    // We prepare the notifications before launching the Ad

    this.player = player;
    this.playerState = playerState;
    this.relaunchAd = relaunchAd;
    this.cbAdStarted = cbAdStarted;
    this.cbAdError = cbAdError;
    this.numTries = 0;
    this.numRetries = numRetries;
    this.millisecondsBetweenRetries = millisecondsBetweenRetries;

    // We wait for feedback
    this.waitForFeedBackBinded = this.waitForFeedback.bind(this);
    this.player.one(['adstart', 'adserror', 'playing'], this.waitForFeedBackBinded);
    var timeOutHandler = function timeOutHandler(myThis) {
      myThis.player.off(['adstart', 'adserror', 'playing'], myThis.waitForFeedBackBinded);
      myThis.timeOutWaiting = undefined;
      return myThis.feedback(false);
    };
    if (millisecondsMaxWait) this.timeOutWaiting = setTimeout(timeOutHandler.bind(this, this), millisecondsMaxWait);
  }
  _createClass(TrackAdRequestDone, [{
    key: "feedback",
    value: function feedback(ok) {
      if (this.timeOutWaiting) {
        clearTimeout(this.timeOutWaiting);
        this.timeOutWaiting = undefined;
      }
      return ok ? this.cbAdStarted() : this.cbAdError();
    }
  }, {
    key: "waitForFeedback",
    value: function waitForFeedback(e) {
      if (!e) return this.feedback(false);
      if (e.type === 'adstart') {
        if (this.timeOutRelaunch) {
          clearTimeout(this.timeOutRelaunch);
          this.timeOutRelaunch = undefined;
        }
        return this.feedback(true);
      }
      if (++this.numTries > this.numRetries) return this.feedback(false);
      if (e.type === 'play' || e.type === 'playing') {
        (0, _log.cLog)("Last try due to content playing");
        return;
        this.numTries = this.numRetries;
        this.player.one(['adstart', 'adserror', 'playing'], this.waitForFeedBackBinded);
        return this.timeOutRelaunch = setTimeout(this.relaunchAd, this.millisecondsBetweenRetries);
      }
      // event = adserror
      (0, _bringGoogleIMAObjectsToThisWindow.bringGoogleIMAObjectsToThisWindow)();
      if (e.data && e.data.AdError && e.data.AdError.getErrorCode() === window.google.ima.AdError.ErrorCode.UNKNOWN_AD_RESPONSE) {
        // 1010 IMA3 error: malformed, but also when requesting an Ad too soon, or requesting two Ads very near.
        // Retryable error => relaunch Ad and wait again
        this.player.one(['adstart', 'adserror', 'playing'], this.waitForFeedBackBinded);
        return this.timeOutRelaunch = setTimeout(this.relaunchAd, this.millisecondsBetweenRetries);
      } else return this.feedback(false);
    }
  }]);
  return TrackAdRequestDone;
}();
exports.TrackAdRequestDone = TrackAdRequestDone;

},{"../log/log":62,"./bringGoogleIMAObjectsToThisWindow":68}],75:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkVidAdCoSizes = checkVidAdCoSizes;
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var allSizesMobile = [[300, 168], [320, 180]];
var allSizesDesktop = [[426, 240], [640, 360], [854, 480], [1280, 720], [1920, 1080]];
function checkVidAdCoSizes(getActualContainerSize, getActualVidAdCoSize) {
  var margin = 2;
  var _getActualContainerSi = getActualContainerSize(),
    _getActualContainerSi2 = _slicedToArray(_getActualContainerSi, 2),
    w = _getActualContainerSi2[0],
    h = _getActualContainerSi2[1];
  var actualVidAdCoSize = getActualVidAdCoSize();
  var allSizes;
  if (allSizesMobile.find(function (x) {
    return x[0] === actualVidAdCoSize[0] && x[1] === actualVidAdCoSize[1];
  })) allSizes = allSizesMobile;else if (allSizesDesktop.find(function (x) {
    return x[0] === actualVidAdCoSize[0] && x[1] === actualVidAdCoSize[1];
  })) allSizes = allSizesDesktop;else throw "Invalid size " + actualVidAdCoSize[0] + "x" + actualVidAdCoSize[1] + " => not Mobile nor Desktop";
  var finalSize = allSizes[0];
  allSizes.forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      wT = _ref2[0],
      hT = _ref2[1];
    if (wT <= w + margin && hT <= h + margin) {
      finalSize = [wT, hT];
    }
  });
  actualVidAdCoSize[0] = finalSize[0];
  actualVidAdCoSize[1] = finalSize[1];
}

},{}],76:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkAmpAffiliate = checkAmpAffiliate;
exports.fillPlayList = fillPlayList;
exports.playList = exports.jsStyles = void 0;
var _playStateObserver = require("./player/playStateObserver");
var _adsManager = require("./player/adsManager");
var _log = require("./log/log");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var jsStyles, playList;

/* Start Amp Affiliate */
exports.playList = playList;
exports.jsStyles = jsStyles;
function checkAmpAffiliate() {
  var polluteWindowSpace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var location = arguments.length > 1 ? arguments[1] : undefined;
  var configID = arguments.length > 2 ? arguments[2] : undefined;
  var playerStorage = arguments.length > 3 ? arguments[3] : undefined;
  var result = {};
  try {
    var ampAffConfig = top.ampAffiliate.getConfig(window, configID),
      configurables = [['autoPlay', 'player_autoplay'], ['autoPlay', 'player_hide_before_autoplay'], ['muted', 'start_muted'], ['muted', 'ytMuted'], ['limitRenditionByPlayerDimensions', 'limitRenditionByPlayerDimensions'], ['useBandwidthFromLocalStorage', 'useBandwidthFromLocalStorage'], ['poster', 'videothumb'], ['ytVideo', 'ytVideoId'], ['videoTitle', 'title'], ['vidCoTitleHidden', 'vidCoTitleHidden'], ['videoDescriptionURL', 'video_description_url'], ['videoDescription', 'video_description'], ['videoDescription', 'evt_label'], ['styles', 'jsStyles'], ['vastURL', 'adTagUrlOrig'], ['vidCoAdUnit', 'vidCoAdUnit'], ['proxy', 'proxy'], ['playList', 'playList'], ['vidAdNonLinearAdMaxWidth', 'vidAdNonLinearAdMaxWidth'], ['vidAdNonLinearAdMaxHeight', 'vidAdNonLinearAdMaxHeight'], ['vidAdTryToResumeVidCo', 'vidAdTryToResumeVidCo'], ['vidAdOnFirstPreroll', 'vidAdOnFirstPreroll'], ['openwrapAccountId', 'openwrapAccountId'], ['openwrapProfileId', 'openwrapProfileId'], ['openwrapDelayVidAdUntilOwResponse', 'openwrapDelayVidAdUntilOwResponse'], ['openwrapMinCachedBids', 'openwrapMinCachedBids'], ['amazonHeaderBidderAccountId', 'amazonHeaderBidderAccountId'], ['amazonHeaderBidderSlotIDs', 'amazonHeaderBidderSlotIDs'], ['playListKWs', 'playListKWs'], ['playListUserInterface', 'playListUserInterface'], ['playListPreloadNum', 'playListPreloadNum'], ['delayPhase2', 'delayPhase2'], ['allowPlayListOverride', 'allowPlayListOverride'], ['size', 'size'], ['fluid', 'fluid'], ['logLevel', 'logLevel'], ['viewability', 'viewability'], ['ava', 'ava'], ['avaOnlyOnVidAd', 'avaOnlyOnVidAd'], ['avaSize', 'avaSize'], ['avaForceStartOnLoad', 'avaForceStartOnLoad'], ['avaForceFloatedOnVidad', 'avaForceFloatedOnVidad'], ['avaCloseDelayOnVidAd', 'avaCloseDelayOnVidAd'], ['avaCloseSize', 'avaCloseSize'], ['avaAvoidCLS', 'avaAvoidCLS'], ['dev', 'dev'], ['vidCoImpressions', 'vidCoImpressions'], ['vidCoAllowRepeatSameVideo', 'vidCoAllowRepeatSameVideo'], ['closeVidCo', 'closeVidCo'], ['closeVidCoSize', 'closeVidCoSize'], ['closeVidCoDelayedMS', 'closeVidCoDelayedMS'], ['closeVidCoIfNoAd', 'closeVidCoIfNoAd'], ['closeVidCoIfNoAdTimeoutMS', 'closeVidCoIfNoAdTimeoutMS'], ['closeVidCoOnAdEnd', 'closeVidCoOnAdEnd'], ['closeVidCoOnEnd', 'closeVidCoOnEnd'], ['observers', 'observers'], ['enforceWhitelist', 'enforceWhitelist'], ['whitelistedDomains', 'whitelistedDomains'], ['comScoreID', 'comScoreID'], ['context', 'context'], ['userOptions', 'userOptions']];
    console.log("Loaded! ampAffConfig", ampAffConfig);
    if (typeof ampAffConfig.vidAf !== 'undefined') {
      mergeOptions(ampAffConfig.vidAf, result);
      for (var i = 0; i < configurables.length; i++) if (typeof ampAffConfig.vidAf[configurables[i][0]] !== 'undefined') {
        if (polluteWindowSpace) window[configurables[i][1]] = ampAffConfig.vidAf[configurables[i][0]];
        result[configurables[i][0]] = ampAffConfig.vidAf[configurables[i][0]];
      }
    }
    if (typeof result.styles !== 'undefined') {
      var head = playerStorage.rootDocument.querySelector('head') || playerStorage.rootDocument.getElementsByTagName('head')[0],
        style = document.createElement('style');
      style.type = 'text/css';
      //$FlowFixMe
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = result.styles;
      } else {
        style.appendChild(document.createTextNode(result.styles));
      }
      head.appendChild(style);
    }
  } catch (e) {
    console.log("ConfigErr", e);
  }
  try {
    if (location) {
      var url = new URL(location.href);
      var dev = url.searchParams.get("amp_dev");
      result.dev = Number(dev);
    }
  } catch (e) {
    (0, _log.cLog)(e);
  }
  //    result.autoPlay = true;
  //    result.muted = true;
  //    result.ava = "bottom-right";
  //    result.amazonHeaderBidderSlotIDs = "{}";
  //    result.amazonHeaderBidderAccountId = "";
  //    result.openwrapAccountId = 0;
  //    result.playListUserInterface = 'flange';
  return result;
}

// noinspection JSUnusedLocalSymbols
function processContext(result, context, options) {
  if (typeof context.section === 'string') {
    if (typeof result.keywordsToAdd === 'undefined') result.keywordsToAdd = [];
    result.keywordsToAdd.push(context.section);
  } else if (_typeof(context.section) === 'object' && Array.isArray(context.section)) {
    if (typeof result.keywordsToAdd === 'undefined') result.keywordsToAdd = [];
    result.keywordsToAdd.concat(context.section);
  }
}
function mergeOptions(options, result) {
  var recipient = options;
  if (_typeof(options.context) === 'object') processContext(result, options.context, options);
  if (_typeof(options.userOptions) === 'object' && _typeof(options.userOptions.context) === 'object') processContext(result, options.userOptions.context, options);
  if (!options.userOptions) return;

  // Merge observers TODO: handle each merge in a more generic way or with plugins handled by each class
  var observers = options.userOptions.observers;
  if (observers) {
    if (!recipient.observers) recipient.observers = {};
    var mergeObservables = function mergeObservables(x) {
      if (observers[x]) {
        if (typeof observers[x] === 'function') observers[x] = [observers[x]];
        if (!recipient.observers[x]) recipient.observers[x] = [];
        recipient.observers[x] = [].concat(_toConsumableArray(observers[x]), _toConsumableArray(recipient.observers[x]));
      }
    };
    // Get unique keys for each observer. Beware! It's not good to have the same observer twice!
    var observables = _toConsumableArray(new Set([].concat(_toConsumableArray(Object.keys(_playStateObserver.observables)), _toConsumableArray(Object.keys(_adsManager.observables)), ['avaClose'])));
    observables.forEach(mergeObservables);
  }

  // Custom Playlist
  if (options.allowPlayListOverride && options.userOptions.playList) {
    if (options.playList && options.playList.items && options.playList.items[0] && options.playList.items[0].sources) {
      var sources = options.playList.items[0].sources;
      options.userOptions.playList.items.forEach(function (item) {
        item.sources.vidCoAdUnit = sources.vidCoAdUnit;
        if (sources.proxy) item.sources.proxy = sources.proxy;
        item.description_url = top.location.toString();
      });
    }
    (0, _log.cLog)("Before:", options.playList, "After:", options.userOptions.playList);
    options.playList = options.userOptions.playList;
    try {
      fillPlayList(options);
    } catch (e) {
      (0, _log.cLog)(e);
    }
    (0, _log.cLog)("Finally:", options);
  }
}
function fillPlayList(vidAf) {
  if (typeof vidAf === 'undefined' || !vidAf.playList) return vidAf;
  var playList = vidAf.playList;
  if (typeof playList.items === 'undefined' || typeof playList.items.length === 'undefined' || playList.items.length < 1) return vidAf;
  var firstPlayListItem = playList.items[0];
  vidAf.poster = firstPlayListItem.thumbnail[0].src;
  vidAf.ytVideo = firstPlayListItem.sources.ytVideo;
  vidAf.videoDescriptionURL = firstPlayListItem.description_url;
  vidAf.videoDescription = firstPlayListItem.name;
  if (firstPlayListItem.sources.proxy) vidAf.proxy = firstPlayListItem.sources.proxy;
  vidAf.vidCoAdUnit = firstPlayListItem.sources.vidCoAdUnit;
  return vidAf;
}
/* End Amp Affiliate */

},{"./log/log":62,"./player/adsManager":67,"./player/playStateObserver":73}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocumentVisibility = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var DocumentVisibility = /*#__PURE__*/function () {
  function DocumentVisibility() {
    _classCallCheck(this, DocumentVisibility);
  }
  _createClass(DocumentVisibility, null, [{
    key: "setup",
    value: function setup() {
      document.addEventListener("visibilitychange", DocumentVisibility.handleVisibilityChange, false);
    }
  }, {
    key: "handleVisibilityChange",
    value: function handleVisibilityChange() {
      if (document.hidden) DocumentVisibility.stopVisibilityObservers.forEach(function (x) {
        return x();
      });else DocumentVisibility.startVisibilityObservers.forEach(function (x) {
        return x();
      });
    }
  }]);
  return DocumentVisibility;
}();
exports.DocumentVisibility = DocumentVisibility;
_defineProperty(DocumentVisibility, "startVisibilityObservers", []);
_defineProperty(DocumentVisibility, "stopVisibilityObservers", []);

},{}],78:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimePlaying = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*
    Track the time the player has been:
    - playing content
    - showing an ad
    - since last ad
 */
var TimePlaying = /*#__PURE__*/function () {
  function TimePlaying(player) {
    _classCallCheck(this, TimePlaying);
    this.tsSetup = performance.now();
    this.tsStartContent = undefined;
    this.tsLastStartContent = undefined;
    this.tsLastStartAd = undefined;
    this.timePlayingContent = 0;
    this.timePlayingAds = 0;
    player.on('playing', this.handlePlayingEvent.bind(this));
    player.on('pause', this.handleEndedEvent.bind(this));
    player.on('ended', this.handleEndedEvent.bind(this));
    player.on('adplaying', this.handleAdPlayingEvent.bind(this));
    player.on('adpause', this.handleAdEndedEvent.bind(this));
    player.on('adended', this.handleAdEndedEvent.bind(this));
  }
  _createClass(TimePlaying, [{
    key: "handlePlayingEvent",
    value: function handlePlayingEvent() {
      if (!this.tsStartContent) this.tsStartContent = performance.now();
      this.tsLastStartContent = performance.now();
    }
  }, {
    key: "handleEndedEvent",
    value: function handleEndedEvent() {
      if (!this.tsLastStartContent) return;
      this.timePlayingContent += performance.now() - this.tsLastStartContent;
    }
  }, {
    key: "handleAdPlayingEvent",
    value: function handleAdPlayingEvent() {
      this.tsLastStartAd = performance.now();
    }
  }, {
    key: "handleAdEndedEvent",
    value: function handleAdEndedEvent() {
      if (!this.tsLastStartAd) return;
      this.timePlayingAds += performance.now() - this.tsLastStartAd;
    }
  }]);
  return TimePlaying;
}();
exports.TimePlaying = TimePlaying;

},{}],79:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Timer = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Timer = /*#__PURE__*/function () {
  // Don't count time

  /** @var tsLastTransition Performance Time in Milliseconds since last transition */
  // Value in Milliseconds

  /** @var timeOn Milliseconds in On State */

  /** @var timeOff Milliseconds in On State */

  function Timer() {
    var on = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    var ts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    _classCallCheck(this, Timer);
    this.on = on;
    this.tsLastTransition = typeof ts !== 'undefined' ? ts : performance.now();
    this.timeOn = 0;
    this.timeOff = 0;
    this.observers = [];
  }
  _createClass(Timer, [{
    key: "switchOn",
    value: function switchOn() {
      var _this = this;
      if (this.on) return;
      // Transition from Off to On
      if (!this.paused) this.timePassesAsOff();
      this.on = true;
      if (!this.paused) this.observers.forEach(function (x) {
        return x(_this);
      });
    }
  }, {
    key: "switchOff",
    value: function switchOff() {
      var _this2 = this;
      if (!this.on && typeof this.on !== 'undefined') return;
      if (!this.paused) this.timePassesAsOn();
      this.on = false;
      if (!this.paused) this.observers.forEach(function (x) {
        return x(_this2);
      });
    }
  }, {
    key: "timePassesAsOn",
    value: function timePassesAsOn() {
      var now = performance.now();
      if (typeof this.on !== 'undefined') {
        // Transition from On to Off
        this.timeOn += now - this.tsLastTransition;
      }
      this.tsLastTransition = now;
    }
  }, {
    key: "timePassesAsOff",
    value: function timePassesAsOff() {
      var now = performance.now();
      if (typeof this.on !== 'undefined') {
        this.timeOff += now - this.tsLastTransition;
      }
      this.tsLastTransition = now;
    }
  }, {
    key: "timePassesAsUndefined",
    value: function timePassesAsUndefined() {
      var now = performance.now();
      this.tsLastTransition = now;
    }
  }, {
    key: "resetTime",
    value: function resetTime() {
      var now = performance.now();
      this.tsLastTransition = now;
      this.timeOff = 0;
      this.timeOn = 0;
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.paused) return;
      this.paused = true;
      this.stateWhenPaused = this.on;
      if (typeof this.on === 'undefined') {
        this.timePassesAsUndefined();
      } else if (this.on) {
        // Paused when On => we count as On the time until now
        this.timePassesAsOn();
      } else {
        // Paused when Off => we count as Off the time until now
        this.timePassesAsOff();
      }
    }
  }, {
    key: "unpause",
    value: function unpause() {
      var _this3 = this;
      if (!this.paused) return;
      this.paused = false;
      this.timePassesAsUndefined();
      if (this.on !== this.stateWhenPaused) this.observers.forEach(function (x) {
        return x(_this3);
      });
    }
  }, {
    key: "getTimeOn",
    value: function getTimeOn() {
      if (!this.on) return this.timeOn;
      // We are currently On
      var now = performance.now();
      return this.timeOn + now - this.tsLastTransition;
    }
  }, {
    key: "getTimeOff",
    value: function getTimeOff() {
      if (this.on) return this.timeOff;
      // We are currently Off
      var now = performance.now();
      return this.timeOff + now - this.tsLastTransition;
    }
  }]);
  return Timer;
}();
exports.Timer = Timer;

},{}],80:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AmazonHeaderBidder = void 0;
var _queryString = require("../browser/queryString");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var AmazonHeaderBidder = /*#__PURE__*/function () {
  function AmazonHeaderBidder(windowHandle) {
    var uniqId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var SlotIDs = arguments.length > 2 ? arguments[2] : undefined;
    var autoPlay = arguments.length > 3 ? arguments[3] : undefined;
    var muted = arguments.length > 4 ? arguments[4] : undefined;
    var delay_vidad_until_ow_response = arguments.length > 5 ? arguments[5] : undefined;
    var minBidQueueLength = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 2;
    _classCallCheck(this, AmazonHeaderBidder);
    this.windowHandle = windowHandle;
    this.uniqId = uniqId;
    this.SlotIDs = SlotIDs;
    this.defaultSlot = this.getSlotName(autoPlay, muted);
    this.queue = [];
    this.maxTimeInQueue = 29000; // 29 seconds (just about 30 seconds)
    this.delay_vidad_until_ow_response = delay_vidad_until_ow_response;
    this.installed = false;
    this.requestInFlight = false;
    this.minBidQueueLength = minBidQueueLength;
    this.player = undefined;
  }
  _createClass(AmazonHeaderBidder, [{
    key: "getSlotName",
    value: function getSlotName(autoPlay, muted) {
      if (!autoPlay) return 'clickToPlay';else if (muted) return 'autoPlayWithNoSound';else return 'autoPlayWithSound';
    }
  }, {
    key: "getEffectiveSlotName",
    value: function getEffectiveSlotName() {
      if (typeof this.autoPlay === 'undefined' || typeof this.muted === 'undefined') return this.defaultSlot;
      return this.getSlotName(this.autoPlay(), this.muted());
    }
  }, {
    key: "getEffectiveSlot",
    value: function getEffectiveSlot() {
      var slotName = this.getEffectiveSlotName();
      return this.SlotIDs[slotName];
    }
  }, {
    key: "setPlayer",
    value: function setPlayer(autoPlay, muted) {
      this.autoPlay = autoPlay;
      this.muted = muted;
    }
  }, {
    key: "setup",
    value: function setup() {
      if (this.uniqId) {
        if (typeof this.windowHandle.apstag === 'undefined') {
          //Load the APS JavaScript Library
          !function (a9, a, p, s, t, A, g) {
            if (a[a9]) return;
            function q(c, r) {
              a[a9]._Q.push([c, r]);
            }
            a[a9] = {
              init: function init() {
                q("i", arguments);
              },
              fetchBids: function fetchBids() {
                q("f", arguments);
              },
              setDisplayBids: function setDisplayBids() {},
              targetingKeys: function targetingKeys() {
                return [];
              },
              _Q: []
            };
            A = p.createElement(s);
            A.async = !0;
            A.src = t;
            g = p.getElementsByTagName(s)[0];
            g.parentNode.insertBefore(A, g);
          }("apstag", this.windowHandle, this.windowHandle.document, "script", "//c.amazon-adsystem.com/aax2/apstag.js");
          this.windowHandle.apstag.init({
            pubID: this.uniqId,
            //enter your pub ID here as shown above, it must within quotes
            videoAdServer: 'DFP'
          });
        }
        if (this.minBidQueueLength) this.queueFiller = setInterval(this.checkBids.bind(this), 30000);
        this.checkBids();
      }
    }
  }, {
    key: "checkBids",
    value: function checkBids() {
      var _this = this;
      if (this.requestInFlight) return;
      var tooOld = performance.now() - this.maxTimeInQueue;
      var queue = this.queue.filter(function (x) {
        return x.ts > tooOld;
      });
      if (queue.length < this.minBidQueueLength) {
        this.requestInFlight = true;
        this.fetch(function () {
          _this.requestInFlight = false;
          _this.queue = _this.queue.filter(function (x) {
            return x.ts > tooOld;
          });
          if (_this.queueFiller) {
            console.log("Amazon: Cleaning Queue Filler");
            clearInterval(_this.queueFiller);
            _this.queueFiller = undefined;
          }
        });
      }
    }
  }, {
    key: "fetch",
    value: function fetch(cb) {
      var myThis = this;
      var configuration = {
        slots: [{
          slotID: this.getEffectiveSlot(),
          //Slot name created in the portal, aligns to individual request for this bid
          mediaType: 'video'
        }]
      };
      console.log("Amazon Header Bidder Bids Requested:", JSON.parse(JSON.stringify(configuration)));
      this.windowHandle.apstag.fetchBids(configuration, function (bids) {
        //Pass bids into the function that will append the key values onto the VAST tag
        myThis.handleVideoBids(bids);
        cb();
      });
    }
  }, {
    key: "handleVideoBids",
    value: function handleVideoBids(bids) {
      var myThis = this;
      if (bids.length > 0) {
        //If we have received any bids back
        console.log("Amazon Header Bidder Bids Received:", JSON.parse(JSON.stringify(bids)));
        bids.forEach(function (x) {
          var bid = {
            url: x.encodedQsParams,
            cpm: 0,
            ts: performance.now()
          };
          myThis.queue.push(bid); //Append the APS key-value pairs to the GAM VAST tag (append to the cust_params query string key)
        });
      }
    }

    // "//pubads.g.doubleclick.net/gampad/ads?sz=320x180
    // &iu=/43606300,78059382/Memondo_Cuantarazon_Dir_Mob_VidAd_Lis_MC_AUTO
    // &ciu_szs
    // &impl=s
    // &gdfp_req=1
    // &env=vp
    // &output=xml_vast3
    // &unviewed_position_start=1
    // &url=https%3A%2F%2Fm.cuantarazon.com%2Fultimos%2Fp%2F1%3Famp_dev%3D1
    // &description_url=http%3A%2F%2Fes.ampliffy.com%2F2018%2F11%2Feste-panda-gigante-recibe-con-alegria.html&correlator=1627381325568
    // &cust_params=txa%3DAMPP---000010%26txc%3DAMPP---000051%26vch%3DH--001%26keyword%3Dampvidvidaf%2CAMPP---000010%2CAMPP---000051%2CH--001%26title%3DEste%20panda%20gigante%20recibe%20con%20alegr%C3%ADa%20la%20nieve%26description%3D__item-description__%26file%3D__item-file__
    // &npa=0
    // &vpos=preroll
    // &max_ad_duration=300000
    // &vid_t=Este%20panda%20gigante%20recibe%20con%20alegr%C3%ADa%20la%20nieve
    // &vid_d=54
    // %26amzniid%3DIvm30G8bX6UZ4giq12-ubi4AAAF653xpMAMAAAJYBBXP8Ew%26amznp%3Dydoagw%26amznbid%3Dv_hbd9fk"
  }, {
    key: "applyBid",
    value: function applyBid(vastURL) {
      console.log("Amazon Header Bidder: Apply Bid called:", this.queue.length);
      if (this.queue.length <= 0) return vastURL;
      console.log("Amazon Header Bidder: VAST URL:", vastURL);
      var bid = this.queue.pop();
      if (typeof vastURL === 'function') vastURL = vastURL();
      var parts = vastURL.split('?', 2);
      if (parts.length < 1) return vastURL;
      var url = parts[0],
        querystring = parts[1];
      var qs = (0, _queryString.parseQueryString)(querystring);
      if (typeof qs['cust_params'] === 'undefined') return vastURL;
      qs['cust_params'] += bid.url;
      var newVastURL = url + '?' + (0, _queryString.serializeQueryString)(qs);
      console.log("Amazon Header Bidder: NEW VAST URL:", newVastURL);
      return newVastURL;
    }
  }], [{
    key: "parseSlotIds",
    value: function parseSlotIds(amazonHeaderBidderSlotIDs) {
      try {
        return JSON.parse(amazonHeaderBidderSlotIDs);
      } catch (e) {
        console.log("Amazon Header: error parsing '" + amazonHeaderBidderSlotIDs + "'");
        return null;
      }
    }
  }]);
  return AmazonHeaderBidder;
}();
exports.AmazonHeaderBidder = AmazonHeaderBidder;

},{"../browser/queryString":51}],81:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenWrap = void 0;
var _log = require("../log/log");
var _queryString = require("../browser/queryString");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var OpenWrap = /*#__PURE__*/function () {
  function OpenWrap(windowHandle) {
    var uniqId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1980;
    var delay_vidad_until_ow_response = arguments.length > 2 ? arguments[2] : undefined;
    var minBidQueueLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;
    _classCallCheck(this, OpenWrap);
    this.windowHandle = windowHandle;
    this.uniqId = uniqId;
    this.adUnits = [];
    this.queue = [];
    this.delay_vidad_until_ow_response = delay_vidad_until_ow_response;
    this.installed = false;
    this.minBidQueueLength = minBidQueueLength;
  }
  _createClass(OpenWrap, [{
    key: "startBidQueueFiller",
    value: function startBidQueueFiller() {
      if (this.queueFiller) clearInterval(this.queueFiller);else this.keepPrefetchQueueFilled();
      this.queueFiller = setInterval(this.keepPrefetchQueueFilled.bind(this), 2200);
    }
  }, {
    key: "addAdUnit",
    value: function addAdUnit(adUnitId) {
      var w = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 640;
      var h = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 360;
      var found = this.adUnits.find(function (x) {
        return x.adUnitId === adUnitId;
      });
      if (found) {
        found.mediaTypes.banner.sizes = [[w, h]];
        found.sizes = [[w, h]];
        return found;
      }
      var adUnit = {
        adUnitId: adUnitId,
        adUnitIndex: "0",
        code: "div-gpt-ad-" + this.uniqId + "-0",
        divId: "div-gpt-ad-" + this.uniqId + "-0",
        mediaTypes: {
          banner: {
            sizes: [[w, h]]
          }
        },
        sizes: [[w, h]]
      };
      this.adUnits.push(adUnit);
      ++this.uniqId;
      return adUnit;
    }
  }, {
    key: "install",
    value: function install(account, profile) {
      if (!account || !profile) return;
      this.installed = true;
      if (_typeof(this.windowHandle.PWT) === 'object') return this.openWrapLoaded();
      this.windowHandle.PWT = {};
      this.windowHandle.PWT.jsLoaded = this.openWrapLoaded.bind(this);
      var purl = this.windowHandle.location.href;
      var url = '//ads.pubmatic.com/AdServer/js/pwt/' + account + '/' + profile;
      var profileVersionId = '';
      if (purl.indexOf('pwtv=') > 0) {
        var regexp = /pwtv=(.*?)(&|$)/g;
        var matches = regexp.exec(purl);
        if (matches.length >= 2 && matches[1].length > 0) {
          profileVersionId = '/' + matches[1];
        }
      }
      var wtads = this.windowHandle.document.createElement('script');
      wtads.async = true;
      wtads.type = 'text/javascript';
      wtads.src = url + profileVersionId + '/pwt.js';
      var node = this.windowHandle.document.getElementsByTagName('script')[0];
      node.parentNode.insertBefore(wtads, node);
    }
  }, {
    key: "openWrapLoaded",
    value: function openWrapLoaded() {
      var oldHook = this.windowHandle.PWT && this.windowHandle.PWT.HookForPrebidRequestBids ? this.windowHandle.PWT.HookForPrebidRequestBids : null;
      var myThis = this;
      (0, _log.cLog)("AMP: OpenWrap: Installed", oldHook);
      if (!top.location.host.match(/ahorradororata\.com/)) this.windowHandle.PWT.HookForPrebidRequestBids = function (adUnitsWithBids) {
        if (!oldHook) return;
        var skipOld;
        adUnitsWithBids.forEach(function (adUnit) {
          if (adUnit && adUnit.divID && myThis.adUnits.find(function (x) {
            return x.divId === adUnit.divID;
          })) {
            (0, _log.cLog)("AMP: OpenWrap: AdUnit", adUnit);
            skipOld = true;
          }
        });
        if (skipOld) return;
        return oldHook(adUnitsWithBids);
      };
      if (this.windowHandle.owpbjs && this.windowHandle.owpbjs.adServers && this.windowHandle.owpbjs.adServers.dfp && this.windowHandle.owpbjs.adServers.dfp.buildVideoUrl) {
        var oldBuildUrl = this.windowHandle.owpbjs.adServers.dfp.buildVideoUrl;
        this.windowHandle.owpbjs.adServers.dfp.buildVideoUrl = function () {
          (0, _log.cLog)("AMP: OpenWrap Video: ", arguments);
          if (!arguments.length || !arguments[0] || !arguments[0].params || !arguments[0].params.cust_params || !arguments[0].params.cust_params.ampliffyURL) {
            (0, _log.cLog)("AMP: OpenWrap Video: Calling oldBuildUrl", arguments, oldBuildUrl);
            return oldBuildUrl.apply(myThis.windowHandle.owpbjs.adServers.dfp, arguments);
          }
          arguments[0].url = arguments[0].params.cust_params.ampliffyURL;
          delete arguments[0].params.cust_params.ampliffyURL;
          var custParams = arguments[0].url.match(/cust_params=([^&]*)/);
          if (custParams.length > 1) {
            var payload = decodeURIComponent(custParams[1]);
            (0, _queryString.parseQuery)(payload, arguments[0].params.cust_params);
            delete arguments[0].params.cust_params.ampliffyURL;
          }
          var sz = arguments[0].url.match(/sz=([0-9x]*)/);
          if (sz[1]) arguments[0].params.sz = sz[1];
          (0, _log.cLog)("AMP: OpenWrap Video: Calling oldBuildUrl (2)", arguments, oldBuildUrl);
          return oldBuildUrl.apply(myThis.windowHandle.owpbjs.adServers.dfp, arguments);
        };
      }
    }
  }, {
    key: "keepPrefetchQueueFilled",
    value: function keepPrefetchQueueFilled() {
      if (this.queue.length < this.minBidQueueLength && this.sampleVastURL && this.sampleVastURL.length) {
        this.prefetchAndStore(this.sampleVastURL);
      }
    }
  }, {
    key: "prefetch",
    value: function prefetch(vidAdURL, cb) {
      if (!this.installed) return cb(vidAdURL);
      if (!this.windowHandle.PWT || typeof this.windowHandle.PWT.requestBids !== 'function') return setTimeout(this.prefetch.bind(this, vidAdURL, cb), 200);
      (0, _log.cLog)("AMP: OpenWrap: Prefetch", vidAdURL);
      var prefetchData = {};
      var iu = vidAdURL.match(/[&?]iu=([^&]*)/);
      if (!iu) return;
      prefetchData.iu = iu[1];
      var sz = vidAdURL.match(/sz=([0-9x#WH]*)/);
      if (!sz) return;
      var size = sz[1].split('x');
      prefetchData.w = parseInt(size[0]);
      prefetchData.h = parseInt(size[1]);
      (0, _log.cLog)("AMP: OpenWrap: Size", sz, prefetchData.w, prefetchData.h);
      var prefetchPostHook;
      if (this.prefetchPreHook) {
        prefetchPostHook = this.prefetchPreHook(prefetchData);
        (0, _log.cLog)("AMP: OpenWrap: Size", sz, prefetchData.w, prefetchData.h);
      }
      var adUnit = this.addAdUnit(prefetchData.iu, prefetchData.w > 320 ? 640 : 300, prefetchData.w > 320 ? 360 : 168);
      var myThis = this;
      var thisAmpliffyURL = typeof vidAdURL === 'function' ? vidAdURL() : vidAdURL;
      this.sampleVastURL = thisAmpliffyURL;
      this.windowHandle.PWT.requestBids([adUnit], function (adUnitsArray) {
        (0, _log.cLog)("AMP: OpenWrap: AdUnitsArray", adUnitsArray);
        var videoUrl = myThis.windowHandle.PWT.generateDFPURL(adUnit, {
          ampliffyURL: thisAmpliffyURL
        });
        (0, _log.cLog)("AMP: OpenWrap: VAST URL:", videoUrl);
        if (prefetchPostHook) {
          videoUrl = prefetchPostHook(videoUrl);
          (0, _log.cLog)("AMP: OpenWrap: PostHook: VAST URL:", videoUrl);
        }
        cb(videoUrl, adUnitsArray);
      });
      return true;
    }
  }, {
    key: "prefetchAndStore",
    value: function prefetchAndStore(vidAdURL) {
      var _this = this;
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      this.prefetch(vidAdURL, function (url, adUnitsArray) {
        var cpm = adUnitsArray && adUnitsArray[0] && adUnitsArray[0].bid && adUnitsArray[0].bid.netEcpm ? adUnitsArray[0].bid.netEcpm : 0;
        _this.queue.push({
          url: url,
          cpm: cpm
        });
        if (cb) cb();
      });
    }
  }, {
    key: "applyBestBid",
    value: function applyBestBid(vidAdURL) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!force && vidAdURL.match(/pwtecp/) && vidAdURL.match(/pwtplt/))
        // The URL already has Prebid added
        return vidAdURL;
      var bestBid = undefined;
      this.queue.forEach(function (x) {
        if (!bestBid) bestBid = x;
        if (bestBid.cpm < x.cpm) bestBid = x;
      });
      if (bestBid) this.queue = this.queue.filter(function (x) {
        return x !== bestBid && x.cpm > 0;
      });
      return this.applyBid(bestBid, vidAdURL);
    }
  }, {
    key: "applyBid",
    value: function applyBid(bid, vidAdURL) {
      if (!bid) return vidAdURL;
      if (!bid.url) return vidAdURL;
      var workInProgressCustParams = {};
      var custParamsBid = bid.url.match(/cust_params=([^&]*)/);
      if (custParamsBid.length > 1) {
        var payloadBid = decodeURIComponent(custParamsBid[1]);
        (0, _queryString.parseQuery)(payloadBid, workInProgressCustParams);
      }
      var custParamsVidAd = vidAdURL.match(/cust_params=([^&]*)/);
      if (custParamsVidAd.length > 1) {
        var payloadVidAd = decodeURIComponent(custParamsVidAd[1]);
        (0, _queryString.parseQuery)(payloadVidAd, workInProgressCustParams);
      }
      var resultVidAdURL = vidAdURL;
      var custParams = (0, _queryString.serializeQueryString)(workInProgressCustParams) === '' ? '' : 'cust_params=' + encodeURIComponent((0, _queryString.serializeQueryString)(workInProgressCustParams));
      if (custParamsVidAd.length > 1) resultVidAdURL = vidAdURL.replace(/cust_params=[^&]*/, custParams);else if (custParams !== '') {
        var chunkToAdd = (vidAdURL.indexOf('?') < 0 ? '?' : '&') + custParams;
        resultVidAdURL = vidAdURL + chunkToAdd;
      }
      return resultVidAdURL;
    }
  }]);
  return OpenWrap;
}();
exports.OpenWrap = OpenWrap;

},{"../browser/queryString":51,"../log/log":62}],82:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VidAdQueue = void 0;
var _vast = require("../vidCo/vast");
var _consent = require("../consent/consent");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var VidAdQueue = /*#__PURE__*/function () {
  function VidAdQueue(playerStorage, vidCoObj) {
    _classCallCheck(this, VidAdQueue);
    this.queue = [];
    this.playerStorage = playerStorage;
    this.vidCoObj = vidCoObj;
    this.observers = [];
  }
  _createClass(VidAdQueue, [{
    key: "prepareAdTag",
    value: function prepareAdTag() {
      var immediate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var vastURLforced = arguments.length > 1 ? arguments[1] : undefined;
      //console.log("Current Playlist Item: ", vidCoObj.currentPlayListItem(this.playerStorage.player));
      var vastURL = vastURLforced || this.playerStorage.options.vastURL;
      if (typeof vastURL === 'function') vastURL = vastURL();
      if (vastURL) {
        vastURL = (0, _vast.resolveVidAdURL)(vastURL, this.playerStorage.options.dev, false, this.playerStorage.options, this.vidCoObj.currentPlayListItem(this.playerStorage.player) || this.vidCoObj.playList[0], (0, _consent.showNonPersonalizedAds)(), this.playerStorage.getActualVidAdCoSize());
        this.queue.push(vastURL);
        this.observers.forEach(function (x) {
          return x(immediate);
        });
      }
    }
  }, {
    key: "getAdTag",
    value: function getAdTag() {
      //console.log("Current Playlist Item: ", vidCoObj.currentPlayListItem(this.playerStorage.player));
      if (!this.queue.length) this.prepareAdTag(true);else this.observers.forEach(function (x) {
        return x(true);
      });
      var vastURL;
      if (this.queue.length) vastURL = this.queue.shift();
      if (typeof vastURL === 'function') vastURL = vastURL();
      if (!vastURL) return 'data:application/xml,' + encodeURIComponent('<VAST version="3.0"/>');
      this.lastVastURL = (0, _vast.resolveVidAdURL)(vastURL, this.playerStorage.options.dev, false, this.playerStorage.options, this.vidCoObj.currentPlayListItem(this.playerStorage.player) || this.vidCoObj.playList[0], (0, _consent.showNonPersonalizedAds)(), this.playerStorage.getActualVidAdCoSize());
      return this.lastVastURL;
    }
  }]);
  return VidAdQueue;
}();
exports.VidAdQueue = VidAdQueue;

},{"../consent/consent":54,"../vidCo/vast":87}],83:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installFirstAdTimeout = installFirstAdTimeout;
var _log = require("../log/log");
var cleared = false;
var timeoutFirstAd;
function timeoutFn(playerState) {
  playerState.signalObservers('closedVidCo');
  (0, _log.cLog)("TO: First Ad");
}
function installFirstAdTimeout(timeout, adManager, playerState) {
  var _this = this;
  adManager.observe("wantingToPlayAnAd", function () {
    (0, _log.cLog)("TO: wantingToPlayAnAd");
    if (!timeoutFirstAd) timeoutFirstAd = setTimeout(timeoutFn.bind(_this, playerState), timeout);
  });
  var clearTimeout = function clearTimeout() {
    (0, _log.cLog)("TO: wanting to clear timeout\n", cleared, timeoutFirstAd);
    return !cleared && timeoutFirstAd && (cleared = true) && clearTimeout(timeoutFirstAd);
  };
  adManager.observe("noVidAd", clearTimeout);
  adManager.observe("errorVidAd", clearTimeout);
  adManager.observe("startedVidAd", clearTimeout);
}

},{"../log/log":62}],84:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFirst15 = getFirst15;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// The playList has in the sources key, a description of the sources. Within it, an mp4 with the first 15 seconds.
function getFirst15(playList) {
  var res = [];
  playList.forEach(function (x) {
    var item = _objectSpread({}, x);
    item.sources = [{
      src: item.sources.first15,
      type: 'video/mp4'
    }];
    res.push(item);
  });
  return res;
}

},{}],85:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hide = hide;
exports.show = show;
var _addStyles = require("../dom/addStyles");
var style;
function hide(rootElement) {
  if (style) return;
  style = (0, _addStyles.addStyles)(".vjs-playlist-sidebar {display: none;}", rootElement);
}
function show() {
  if (!style) return;
  style.remove();
  style = undefined;
}

},{"../dom/addStyles":57}],86:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.title = title;
var _addStyles = require("../dom/addStyles");
var _log = require("../log/log");
function title(root, parent, player) {
  var keepTitle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6000;
  (0, _log.cLog)("Title:", parent, player);
  var div = document.createElement('div');
  div.className = 'title';
  div.innerHTML = 'Este título';
  parent.appendChild(div);
  (0, _addStyles.addStyles)(".video-js .title a {color: inherit; text-decoration: inherit}\n", root);
  (0, _addStyles.addStyles)(".video-js .title {position: absolute;\n" + "    top: 1em;\n" + "    left: 1em;\n" + "    font-size: 1.25em;\n" + "    max-width: 80%;\n" + "    -webkit-transition: visibility 1s,opacity 1s;\n" + "    -moz-transition: visibility 1s,opacity 1s;\n" + "    -ms-transition: visibility 1s,opacity 1s;\n" + "    -o-transition: visibility 1s,opacity 1s;\n" + "    transition: visibility 1s,opacity 1s;\n" + "    text-overflow: ellipsis;}", root);
  (0, _addStyles.addStyles)(".vjs-user-active-title .title {visibility: visible;\n" + "    opacity: 1;\n" + "}", root);
  (0, _addStyles.addStyles)(".vjs-user-inactive-title.vjs-has-started .title {visibility: visible;\n" + "    opacity: 0;\n" + "}}", root);
  var lastUserActive = performance.now(),
    clearUserActive;
  var wantsTitleInactive = function wantsTitleInactive(e) {
    var sinceLastUserActive = performance.now() - lastUserActive;
    if (clearUserActive) {
      clearTimeout(clearUserActive);
      clearUserActive = undefined;
    }
    if (lastUserActive > 0 && sinceLastUserActive >= 5900) {
      if (parent.classList.contains('vjs-user-active-title')) parent.classList.remove('vjs-user-active-title');
      if (!parent.classList.contains('vjs-user-inactive-title')) parent.classList.add('vjs-user-inactive-title');
    } else {
      var timeout = keepTitle;
      if (sinceLastUserActive > -2000) timeout = Math.min(timeout, keepTitle - sinceLastUserActive);else lastUserActive = performance.now() - 100;
      timeout = Math.max(250, timeout);
      clearUserActive = setTimeout(wantsTitleInactive, timeout);
    }
  };
  var wantsTitleActive = function wantsTitleActive(e) {
    lastUserActive = performance.now();
    if (!parent.classList.contains('vjs-user-active-title')) parent.classList.add('vjs-user-active-title');
    if (parent.classList.contains('vjs-user-inactive-title')) parent.classList.remove('vjs-user-inactive-title');
    if (clearUserActive) {
      clearTimeout(clearUserActive);
      clearUserActive = undefined;
    }
    player.one(['userinactive'], wantsTitleInactive);
  };
  player.on(['useractive'], wantsTitleActive);
  player.one(['userinactive'], wantsTitleInactive);
  player.on(['play', 'duringplaylistchange', 'playlistitem'], function (e) {
    var itemIndex, name, linkTo;
    (0, _log.cLog)(e);
    if (e && typeof e.nextIndex !== 'undefined') {
      itemIndex = e.nextIndex;
      if (itemIndex < 0) return;
      name = e.nextPlaylist[itemIndex].name;
      if (typeof e.nextPlaylist[itemIndex].linkTo !== 'undefined') linkTo = e.nextPlaylist[itemIndex].linkTo;
    } else {
      itemIndex = this.playlist.currentItem();
      if (itemIndex < 0) {
        return;
      }
      var playlist = this.playlist();
      name = playlist[itemIndex].name;
      if (typeof playlist[itemIndex].linkTo !== 'undefined') linkTo = playlist[itemIndex].linkTo;
    }
    if (linkTo) {
      var a = document.createElement('a');
      a.href = linkTo;
      a.innerHTML = name;
      a.setAttribute('target', '_top');
      div.innerHTML = '';
      div.appendChild(a);
    } else div.innerHTML = name;
    wantsTitleActive();
    clearUserActive = setTimeout(wantsTitleInactive, keepTitle);
  });
}

},{"../dom/addStyles":57,"../log/log":62}],87:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adTagUrlReplacements = adTagUrlReplacements;
exports.replaceSize = replaceSize;
exports.resolveVidAdURL = resolveVidAdURL;
var _log = require("../log/log");
var _queryString = require("../browser/queryString");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function resolveVidAdURL(adTagUrl, dev, newCacheBuster, options) {
  var playListItem = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
  var npa = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var actualSize = arguments.length > 6 ? arguments[6] : undefined;
  var finalAdTagUrl = (!dev || typeof top.origVAST === 'number' && top.origVAST || _typeof(top.location) === 'object' && top.location.search && top.location.search.match && top.location.search.match(/amp_org=1/)) && typeof adTagUrl === 'string' ? adTagUrl : 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinearvpaid2js&correlator=';
  //const finalAdTagUrl = !dev && typeof adTagUrl === 'string' ? adTagUrl : 'https://www.youtube.com/watch?v=YQWt6wdAZMU';
  playListItem.description_url = '' + top.location;
  var urlReplacements = adTagUrlReplacements(finalAdTagUrl, actualSize, newCacheBuster, options, playListItem, npa);
  var videoUrl = (0, _queryString.removeDuplicateURLParameters)(urlReplacements);
  (0, _log.cLog)("AMP: VAST URL DupRemov:", urlReplacements, videoUrl);
  return videoUrl;
}

/**
 * Replace the AdTagURL size
 * @param adTagUrl string containing an URL
 * @param size [width,height]
 * @returns {string}
 */
function replaceSize(adTagUrl, size) {
  if (!size || !size.length || !size[0] || !size[1]) return adTagUrl;
  adTagUrl = adTagUrl.replace(/#WxH#/g, size[0] + 'x' + size[1]);
  return adTagUrl;
}
var mridx = 0;
function adTagUrlReplacements(adTagUrl, actualSize, newCacheBuster, options) {
  var playListItem = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
  var npa = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var vpos = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : "preroll";
  (0, _log.cLog)("1", adTagUrl, newCacheBuster);
  if (!newCacheBuster) {
    if ("%%CACHEBUSTER%%".substring(2) !== "CACHEBUSTER%" + "%") adTagUrl = adTagUrl.replace(/__timestamp__/g, encodeURIComponent("%%CACHEBUSTER%%"));else adTagUrl = adTagUrl.replace(/__timestamp__/g, '' + new Date().getTime());
    (0, _log.cLog)("2", adTagUrl);
  } else adTagUrl = adTagUrl.replace(/__timestamp__/g, '' + new Date().getTime());
  (0, _log.cLog)("F", adTagUrl);
  var topurl = '';
  try {
    topurl = document.location.toString();
  } catch (e) {}
  adTagUrl = replaceSize(adTagUrl, actualSize);
  if (topurl.length) adTagUrl = adTagUrl.replace(/__page-url__/g, encodeURIComponent(topurl));
  if (typeof options.evt_label !== 'undefined' && options.evt_label.length) adTagUrl = adTagUrl.replace(/__item-title__/g, encodeURIComponent(options.evt_label));else if (playListItem && typeof playListItem.name !== 'undefined' && playListItem.name.length) adTagUrl = adTagUrl.replace(/__item-title__/g, encodeURIComponent(playListItem.name));
  if (typeof options.ytVideoId !== 'undefined') adTagUrl = adTagUrl.replace(/__item-file__/g, encodeURIComponent(options.ytVideoId));
  if (playListItem && typeof playListItem.description_url !== 'undefined' && playListItem.description_url.length) adTagUrl = adTagUrl.replace(/description_url%3D__item-description__/g, 'description_url%3D' + encodeURIComponent(playListItem.description_url));
  if (playListItem && typeof playListItem.description_url !== 'undefined' && playListItem.description_url.length) adTagUrl = adTagUrl.replace(/description_url=__item-description__/g, 'description_url=' + encodeURIComponent(playListItem.description_url));
  if (typeof options.video_description_url !== 'undefined' && options.video_description_url.length) adTagUrl = adTagUrl.replace(/description_url%3D__item-description__/g, 'description_url%3D' + encodeURIComponent(options.video_description_url));
  if (typeof options.video_description_url !== 'undefined' && options.video_description_url.length) adTagUrl = adTagUrl.replace(/description_url=__item-description__/g, 'description_url=' + options.video_description_url);
  if (typeof options.video_description !== 'undefined' && options.video_description.length) adTagUrl = adTagUrl.replace(/__item-description__/g, encodeURIComponent(options.video_description));else if (playListItem && typeof playListItem.description !== 'undefined' && playListItem.description.length) adTagUrl = adTagUrl.replace(/__item-description__/g, encodeURIComponent(playListItem.description));
  var taxonomy = [],
    taxonomyCustomParams = [];
  if (playListItem && typeof playListItem.taxonomyAmpliffy !== 'undefined' && playListItem.taxonomyAmpliffy.length) {
    taxonomy.push(playListItem.taxonomyAmpliffy);
    taxonomyCustomParams.push('txa=' + playListItem.taxonomyAmpliffy);
  }
  if (options.dev && playListItem && (typeof playListItem.taxonomyCreator === 'undefined' || !playListItem.taxonomyCreator.length)) playListItem.taxonomyCreator = Math.random() < 0.5 ? 'AMPP---000050' : 'AMPP---000051';
  if (playListItem && typeof playListItem.taxonomyCreator !== 'undefined' && playListItem.taxonomyCreator.length) {
    taxonomy.push(playListItem.taxonomyCreator);
    taxonomyCustomParams.push('txc=' + playListItem.taxonomyCreator);
  }
  if (playListItem && typeof playListItem.vidCoHash !== 'undefined' && playListItem.vidCoHash.length) {
    taxonomy.push(playListItem.vidCoHash);
    taxonomyCustomParams.push('vch=' + playListItem.vidCoHash);
  }
  adTagUrl = adTagUrl.replace(/__item-category__/g, encodeURIComponent(taxonomy.reduce(function (i, x) {
    return (i.length ? i + ',' : '') + x;
  }, '')));
  if (adTagUrl.match(/cust_params=/) && !adTagUrl.match(/cust_params=([^&]*%26|)txa%3[dD]/)) adTagUrl = adTagUrl.replace(/cust_params=/g, 'cust_params=' + encodeURIComponent(taxonomyCustomParams.reduce(function (i, x) {
    return (i.length ? i + '&' : '') + x;
  }, '') + '&'));
  if (options.continueVideoJSContentWhenAdDone) adTagUrl = adTagUrl.replace(/__fbfan__/g, '%2Cfbfan');else adTagUrl = adTagUrl.replace(/__fbfan__/g, '');
  if (typeof options.keywordsToAdd !== 'undefined' && options.keywordsToAdd.length) {
    if (adTagUrl.match(/cust_params=/)) {
      if (adTagUrl.match(/cust_params=[^&]*keyword%3[dD]/)) adTagUrl = adTagUrl.replace(/cust_params=([^&]*)keyword%3[dD]/g, "cust_params=$1keyword%3D" + encodeURIComponent(options.keywordsToAdd.join(',') + ','));else adTagUrl = adTagUrl.replace(/cust_params=/g, "cust_params=keyword%3D" + encodeURIComponent(options.keywordsToAdd.join(',') + '%26'));
    } else adTagUrl += "&cust_params=keyword%3D" + encodeURIComponent(options.keywordsToAdd.join(','));
  }
  if (typeof npa !== 'undefined') adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "npa=" + (npa ? '1' : '0');
  adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "vpos=" + vpos;
  adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "ad_type=audio_video";
  if (vpos === 'midroll') adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "mridx=" + ++mridx;
  //adTagUrl += (adTagUrl.indexOf('?')<0?'?':'&')+"videoad_start_delay=6000";
  adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "max_ad_duration=300000";
  if (playListItem && typeof playListItem.name !== 'undefined' && playListItem.name.length) adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "vid_t=" + encodeURIComponent(playListItem.name);
  if (playListItem && typeof playListItem.duration === 'number' && playListItem.duration > 0) adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "vid_d=" + playListItem.duration;
  if (playListItem && typeof playListItem.description !== 'undefined' && playListItem.description.length) adTagUrl += (adTagUrl.indexOf('?') < 0 ? '?' : '&') + "vid_kw=" + encodeURIComponent(playListItem.description);
  return adTagUrl;
}

},{"../browser/queryString":51,"../log/log":62}],88:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vidCo = void 0;
var _vastClient = require("vast-client");
var _htmlEntities = require("../dom/htmlEntities");
var _isMobile = require("../dom/isMobile");
var _cookies = require("../browser/cookies.js");
var _viewport = require("../dom/viewport");
var _version = require("../browser/version");
var _log = require("../log/log");
var _queryString = require("../browser/queryString");
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var vidCo = /*#__PURE__*/function () {
  function vidCo(options, playerStorage) {
    _classCallCheck(this, vidCo);
    this.vastClient = new _vastClient.VASTClient();
    this.playList = [];
    this.videoTester = document.createElement('video');
    this.correlator = 0;
    this.pendingCookieInitialization = true;
    this.options = options;
    this.playerStorage = playerStorage;
    this.observers = [];
  }
  _createClass(vidCo, [{
    key: "addItemToPlaylist",
    value: function addItemToPlaylist(item) {
      var allowDuplicates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (allowDuplicates || !item.sources || this.options.vidCoAllowRepeatSameVideo || !this.playList.find(function (x) {
        return x === item;
      }) && !this.contains(item.sources) && !this.containsName(item.name)) this.playList.push(item);
    }
  }, {
    key: "addItemsToPlaylist",
    value: function addItemsToPlaylist(items) {
      var _this = this;
      var allowDuplicates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      items.forEach(function (x) {
        return _this.addItemToPlaylist(x, allowDuplicates);
      });
    }
  }, {
    key: "getPlaylistWithPlayableItems",
    value: function getPlaylistWithPlayableItems() {
      return this.playList.filter(function (x) {
        return x.sources.resolved;
      }).map(vidCo.convertToPlayListItem);
    }
  }, {
    key: "resolveMissing",
    value: function resolveMissing(mobileOrSize, cb, cberr) {
      var _this2 = this;
      var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var resolveMissing = [];

      //console.log("CHECK MISSING RESOLVE:",JSON.parse(JSON.stringify(this.playList)));
      this.playList.forEach(function (x) {
        if (limit && resolveMissing.length >= limit) return;
        if (x.sources && (x.sources.resolved || x.sources.tries)) return;
        //console.log("IT'S MISSING RESOLVE:",JSON.parse(JSON.stringify(x)),x.sources,x&&x.sources?x.sources.resolved:null,x&&x.sources?x.sources.tries:null);
        resolveMissing.push(new Promise(function (resolve) {
          return _this2.loadOne(mobileOrSize, x, resolve);
        }));
      });
      if (resolveMissing.length) Promise.all(resolveMissing).then(function (value) {
        if (cb) cb(value);
      }, function (reason) {
        if (cberr) cberr(reason);
      });
      return resolveMissing.length;
    }
  }, {
    key: "notifyObservers",
    value: function notifyObservers() {
      this.observers.forEach(function (x) {
        return x();
      });
    }
  }, {
    key: "resolveOneMissing",
    value: function resolveOneMissing(item, mobileOrSize, cb) {
      var _this3 = this;
      var resolveMissing = [];
      (0, _log.cLog)("CHECK MISSING RESOLVE:", JSON.parse(JSON.stringify(this.playList)));
      if (item.sources && (item.sources.resolved || item.sources.tries)) return;
      (0, _log.cLog)("IT'S MISSING RESOLVE:", JSON.parse(JSON.stringify(item)), item.sources, item && item.sources ? item.sources.resolved : null, item && item.sources ? item.sources.tries : null);
      resolveMissing.push(new Promise(function (resolve) {
        return _this3.loadOne(mobileOrSize, item, resolve);
      }));
      Promise.all(resolveMissing).then(function (value) {
        if (cb) cb(value);
      });
      return resolveMissing.length;
    }
  }, {
    key: "addNewItemBasedOnKeywords",
    value: function addNewItemBasedOnKeywords(vidCoAdUnit, size, playListKWs, callBackAccept, callBackReject) {
      var _this4 = this;
      var playListItem = {
        vidCoAdUnit: vidCoAdUnit,
        sources: {}
      };
      this.loadOne(size, playListItem, function (x) {
        if (x) (0, _log.cLog)("addNewItemBasedOnKeywords loadOne: ", x, x.name, _this4.playList, _this4.playList.find(function (y) {
          return x.name === y.name;
        }));
        if (x && _this4.playList && (!x.name || _this4.options.vidCoAllowRepeatSameVideo || !_this4.playList.find(function (y) {
          return x.name === y.name;
        }))) {
          _this4.playList.push(x);
          if (callBackAccept) callBackAccept(x);
        } else if (callBackReject) callBackReject();
      }, playListKWs, false);
    }
  }, {
    key: "loadOne",
    value: function loadOne(mobileOrSize, playListItem, resolve) {
      var keywords = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
      var keepCorrelator = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var myThis = this;
      var size;
      if (_typeof(mobileOrSize) === 'object') size = mobileOrSize[0] + 'x' + mobileOrSize[1];else size = mobileOrSize ? '320x180' : '640x360';
      var keywordParameter = 'keyword=' + (keywords ? keywords : [playListItem.sources.ytVideoId]).reduce(function (i, x) {
        return (i.length ? i + ',' : '') + x;
      }, '');
      var baseUrl = playListItem.sources && playListItem.sources.proxy ? playListItem.sources.proxy + '?sz=' : this.proxy ? this.proxy + '?ciu_szs=1x1&unviewed_position_start=1&sz=' : 'https://securepubads.g.doubleclick.net/gampad/ads?ciu_szs=1x1&unviewed_position_start=1&sz=';
      var vidCoAdUnit = playListItem.sources && playListItem.sources.vidCoAdUnit ? playListItem.sources.vidCoAdUnit : playListItem.vidCoAdUnit;
      var correlator = keepCorrelator ? '123456' + this.correlator : ++this.correlator + '' + new Date().getTime();
      var isMobile = _construct(_isMobile.IsMobile, _toConsumableArray((0, _viewport.getTopViewPortSize)()));
      var url = baseUrl + size + '&iu=' + encodeURIComponent(vidCoAdUnit) + '&gdfp_req=1&env=vp&output=xml_vast3&correlator=' + correlator + '&cust_params=' + encodeURIComponent(keywordParameter);
      try {
        var cookie = (0, _cookies.getCookie)('__gads');
        if (cookie) url += "&cookie=" + encodeURIComponent(cookie);
      } catch (e) {}
      if (isMobile.isIOS()) {
        if (0 && this.pendingCookieInitialization) {
          top.document.body.innerHTML += "<div style='width: 320px;color:black;background: lightgrey;word-wrap: break-word;position:absolute;top:1400px;left:0px;z-index:10000'>" + document.cookie + "</div>";
        }
        var gads = (0, _cookies.getCookie)("__gads");
        if (gads && this.pendingCookieInitialization) url += '&cookie=' + encodeURIComponent(gads);else url += '&cookie_enabled=1';
      }
      this.pendingCookieInitialization = false;
      this.vastClient.get(url, {
        withCredentials: true
      })["catch"](function () {
        return (playListItem.sources.tries = 1) && resolve(undefined);
      }).then(function (playListItem, response) {
        (0, _log.cLog)(response);
        if (!response || !response.ads || !response.ads.length || !response.ads[0].creatives || !response.ads[0].creatives.length) {
          playListItem.sources.tries = 1;
          resolve(undefined);
          return;
        }
        var sources = [];
        var ad = response.ads[0];
        var creative = ad.creatives[0];
        (0, _log.cLog)(creative);
        playListItem.vastTracker = vidCo.getTracker(ad, creative);
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        var debug = [];
        creative.mediaFiles.forEach(function (x) {
          if (!x.mimeType) return;
          if (x.mimeType === 'application/x-mpegURL' && myThis.options && myThis.options.reducedBandwidth) {
            (0, _log.cLog)("Intervention Reduce Bandwidth, removing", x);
            return;
          }
          //if(!x.mimeType || x.mimeType.match(/3gpp/) || x.mimeType.match(/x-mpeg/) || x.mimeType.match(/webm/)) return;
          //x.fileURL = x.fileURL.replace(/.mp4/,".myt");
          //sources.push({type: x.mimeType, src: x.fileURL, "res": x.height});
          if ((0, _version.getChromeVersion)() > 0 && (x.bitrate > 2000 || x.bitrate <= 0)) {
            return;
          }
          if ((iOS || isSafari) && x.mimeType === 'application/x-mpegURL') {
            // Doesn't work on iOS nor Desktop Safari
            return;
          }
          if (myThis.videoTester.canPlayType(x.mimeType) === 'maybe' || myThis.videoTester.canPlayType(x.mimeType) === 'probably') {
            sources.push({
              type: x.mimeType,
              src: x.fileURL,
              "res": x.height,
              "bitrate": x.bitrate
            });
            debug.push(myThis.videoTester.canPlayType(x.mimeType) + ' (' + x.height + ') => ' + x.mimeType);
          }
          if ( /*!iOS && */x.mimeType === 'application/dash+xml') {
            sources.unshift({
              type: x.mimeType,
              src: x.fileURL,
              "res": x.height,
              "bitrate": x.bitrate
            });
            debug.unshift(myThis.videoTester.canPlayType(x.mimeType) + ' (' + x.height + ') => ' + x.mimeType);
          }
          if ((0, _version.getChromeVersion)() > 0 && x.mimeType === 'video/webm') {
            sources.unshift({
              type: x.mimeType,
              src: x.fileURL,
              "res": x.height,
              "bitrate": x.bitrate
            });
            debug.unshift(myThis.videoTester.canPlayType(x.mimeType) + ' (' + x.height + ') => ' + x.mimeType);
          }
        });
        if (creative.duration) playListItem.duration = creative.duration;
        (0, _log.cLog)("Sources:", JSON.parse(JSON.stringify(sources)));
        //console.log("Sources:", JSON.parse(JSON.stringify(sources)));
        playListItem.geoData = {};
        if (ad.creatives.length && ad.creatives[0] && ad.creatives[0].videoClickThroughURLTemplate) {
          var clickURL = ad.creatives[0].videoClickThroughURLTemplate;
          var adURLraw = clickURL.split(/&adurl=/)[1];
          if (adURLraw) {
            var adURL = decodeURIComponent(adURLraw);
            if (adURL.match(/\?.*geoData/)) {
              var adURLParts = {};
              // "https://es.ampliffy.com/?geoData&ct=ES&st=&city=0&dma=0&zp=08192&bw=4"
              var queryString = adURL.split('?', 2)[1];
              if (queryString) (0, _queryString.parseQuery)(queryString, adURLParts);
              if (adURLParts.ct) playListItem.geoData.country = adURLParts.ct;
              if (adURLParts.city) playListItem.geoData.city = adURLParts.city;
              if (adURLParts.zp) playListItem.geoData.zip = adURLParts.zp;
              if (adURLParts.bw) playListItem.geoData.bandWidth = adURLParts.bw;
            }
          }
        }
        if (ad.creatives.length > 1 && ad.creatives[1].type === 'companion' && ad.creatives[1].variations && ad.creatives[1].variations.length && ad.creatives[1].variations[0] && ad.creatives[1].variations[0].htmlResource) {
          var html = ad.creatives[1].variations[0].htmlResource;
          if (ad.id) {
            playListItem.id = ad.id;
            playListItem.vidCoHash = 'H--' + ("000" + parseInt(ad.id) % 200).slice(-3);
          }
          var extractPoster = html.match(/data-poster\s*=\s*["']([^"']*)["']/);
          if (extractPoster && extractPoster[1]) {
            (0, _log.cLog)("Poster:", extractPoster[1]);
            if (!playListItem.thumbnail) playListItem.thumbnail = [];
            if (!playListItem.thumbnail[0]) playListItem.thumbnail[0] = {};
            playListItem.thumbnail[0].src = extractPoster[1];
          }
          var extractShortMP4 = html.match(/data-video\s*=\s*["']([^"']*)["']/);
          if (extractShortMP4 && extractShortMP4[1]) {
            (0, _log.cLog)("extractShortMP4:", extractShortMP4[1]);
            playListItem.sources.first15 = extractShortMP4[1];
          }
          var extractTitle = html.match(/data-title\s*=\s*["']([^"']*)["']/);
          if (extractTitle && extractTitle[1]) {
            (0, _log.cLog)("extractTitle:", extractTitle[1]);
            playListItem.name = (0, _htmlEntities.decodeHtml)(extractTitle[1]);
          }
          var extractDestinationUrl = html.match(/data-destination-url\s*=\s*["']([^"']*)["']/);
          if (extractDestinationUrl && extractDestinationUrl[1]) {
            (0, _log.cLog)("extractDestinationUrl:", extractDestinationUrl[1]);
            playListItem.description_url = (0, _htmlEntities.decodeHtml)(extractDestinationUrl[1]);
          }
          var extractVidCoMetrics = html.match(/data-vidco-metrics\s*=\s*["']([^"']*)["']/);
          if (extractVidCoMetrics && extractVidCoMetrics[1]) {
            (0, _log.cLog)("extractVidCoMetrics:", extractVidCoMetrics[1]);
            playListItem.vidco_metrics = parseInt((0, _htmlEntities.decodeHtml)(extractVidCoMetrics[1]));
          }
          var extractTaxonomyAmpliffy = html.match(/data-taxonomy-ampliffy\s*=\s*["']([^"']*)["']/);
          if (extractTaxonomyAmpliffy && extractTaxonomyAmpliffy[1]) {
            (0, _log.cLog)("extractTaxonomyAmpliffy:", extractTaxonomyAmpliffy[1]);
            playListItem.taxonomyAmpliffy = (0, _htmlEntities.decodeHtml)(extractTaxonomyAmpliffy[1]);
          }
          var extractTaxonomyCreator = html.match(/data-taxonomy-creator\s*=\s*["']([^"']*)["']/);
          if (extractTaxonomyCreator && extractTaxonomyCreator[1]) {
            (0, _log.cLog)("extractTaxonomyCreator:", extractTaxonomyCreator[1]);
            playListItem.taxonomyCreator = (0, _htmlEntities.decodeHtml)(extractTaxonomyCreator[1]);
          }
        }
        if (!playListItem.name) playListItem.name = '';
        playListItem.sources.resolved = sources;
        // console.log("RESOLVED:",JSON.parse(JSON.stringify(playListItem.sources)));
        resolve(playListItem);
        myThis.notifyObservers();
      }.bind(this, playListItem));
    }
  }, {
    key: "switchPlaylist",
    value: function switchPlaylist(player) {
      var allowChangeCurrent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var validPlayList = this.getPlaylistWithPlayableItems();
      var currentItem = player.playlist.currentItem();
      var currentTime = player.currentTime();
      var paused = player.paused();
      var currentPlaylist = player.playlist();
      var matching = currentPlaylist && currentPlaylist.length && currentItem >= 0 ? this.contains(currentPlaylist[currentItem].sources) : false;
      player.playlist(validPlayList, allowChangeCurrent && matching ? currentItem : -1);
      if (!matching) return;
      var index = player.playlist.indexOf(matching.sources.resolved);
      if (index < 0) return;
      if (allowChangeCurrent) {
        player.playlist.currentItem(index);
        player.currentTime(currentTime);
      }
      this.setPoster(player, validPlayList[index].thumbnail);
      if (!paused && player.paused()) player.play();
    }

    // noinspection JSMethodCanBeStatic
  }, {
    key: "getQueueDepth",
    value: function getQueueDepth(player) {
      var playList = player.playlist();
      var currentItem = player.playlist.currentItem();
      return playList.length - currentItem - 1;
    }
  }, {
    key: "compare",
    value: function compare(sources1, sources2) {
      if (!sources1 || typeof sources1 === 'number' || !sources2 || typeof sources2 === 'number') return false;
      var sources1Array = [],
        sources2Array = [];
      if (typeof sources1 === 'string') sources1Array.push({
        src: sources1
      });else sources1Array = sources1;
      if (typeof sources2 === 'string') sources2Array.push({
        src: sources2
      });else sources2Array = sources2;
      if (typeof sources1Array.find !== 'function') return false;
      var res = sources1Array.find(function (x) {
        return sources2Array.find(function (y) {
          return x.src && y.src && x.src === y.src;
        });
      });
      return !!res;
    }
  }, {
    key: "contains",
    value: function contains(sources) {
      var _this5 = this;
      return this.playList.find(function (x) {
        return _this5.compare(sources, vidCo.getValidSource(x));
      });
    }
  }, {
    key: "containsName",
    value: function containsName(name) {
      if (!name) return false;
      return this.playList.find(function (x) {
        return x.name && x.name === name;
      });
    }
  }, {
    key: "trackRemotely",
    value: function trackRemotely(item, event, vidAd) {
      var params = {};
      params.event = event;
      params.vidCoCreativeId = item.id;
      params.vidCoAdUnit = this.options.vidCoAdUnit;
      params.vidCoHash = item.vidCoHash;
      params.country = item.geoData.country;
      params.city = item.geoData.city;
      params.zip = item.geoData.zip;
      params.bandWidth = item.geoData.bandWidth;
      params.taxonomyAmpliffy = item.taxonomyAmpliffy;
      params.taxonomyCreator = item.taxonomyCreator;
      if (vidAd && typeof vidAd.getCurrentAd === 'function') {
        var ad = vidAd.getCurrentAd();
        params.vidAdSystem = ad.getAdSystem();
        params.vidAdAdUnit = this.playerStorage.vidAdQueue.lastVastURL.match(/iu=([^&]*)/)[1];
        params.vidAdLineItemId = ad.getAdId();
        params.vidAdCreativeId = ad.getCreativeId();
      }
      (0, _log.imgLog)('https://stats.ampliffy.com/atv/event?' + (0, _queryString.serializeQueryString)(params), {});
    }
  }, {
    key: "hookPlayer",
    value: function hookPlayer(player) {
      var onPlay = function (player) {
        var _this6 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && (!_this6.options || _this6.options.vidCoImpressions || x.vidco_metrics) && x.vastTracker.setPaused(false);
        });
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this6.trackRemotely(x, 'PLAY');
        });
      }.bind(this, player);
      if (!player.paused()) try {
        onPlay(player);
      } catch (e) {}
      player.on('play', onPlay);
      player.on('pause', function (player) {
        var _this7 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && (!_this7.options || _this7.options.vidCoImpressions || x.vidco_metrics) && x.vastTracker.setPaused(true);
        });
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this7.trackRemotely(x, 'PAUSE');
        });
      }.bind(this, player));
      player.on('canplay', function (player) {
        var _this8 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && (!_this8.options || _this8.options.vidCoImpressions || x.vidco_metrics) && x.vastTracker.trackImpression();
        });
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this8.trackRemotely(x, 'IMPRESSION');
        });
      }.bind(this, player));
      player.on('timeupdate', function (player) {
        var _this9 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && (!_this9.options || _this9.options.vidCoImpressions || x.vidco_metrics) && x.vastTracker.setProgress(player.currentTime());
        });
      }.bind(this, player));
      player.on('ended', function (player) {
        var _this10 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && (!_this10.options || _this10.options.vidCoImpressions || x.vidco_metrics) && x.vastTracker.complete();
        });
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this10.trackRemotely(x, 'COMPLETE');
        });
      }.bind(this, player));
      player.on('adstart', function (player) {
        var _this11 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this11.trackRemotely(x, 'ADSTART', player.ima.getAdsManager());
        });
      }.bind(this, player));
      window.addEventListener('beforeunload', function () {
        var _this12 = this;
        // noinspection JSPotentiallyInvalidUsageOfClassThis
        this.playList.forEach(function (playListItem) {
          return playListItem && playListItem.vastTracker && playListItem.vastTracker.close();
        });
        this.currentPlayListItem(player, function (x) {
          return x && x.vastTracker && _this12.trackRemotely(x, 'CLOSE');
        });
      }.bind(this));
    }
  }, {
    key: "currentPlayListItem",
    value: function currentPlayListItem(player) {
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      var currentIndex = player.playlist.currentItem();
      if (currentIndex < 0) return undefined;
      var playListItem = player.playlist()[currentIndex];
      var internalItem = this.contains(playListItem.sources);
      if (!internalItem) return undefined;
      if (!cb) return internalItem;
      return cb(internalItem);
    }
  }, {
    key: "setPoster",
    value: function setPoster(player, thumbnail) {
      if (typeof thumbnail === 'undefined' || typeof thumbnail === 'number' || typeof thumbnail === 'boolean') return player.poster('');
      if (typeof thumbnail === 'string') return player.poster(thumbnail);
      if (thumbnail.src) return player.poster(thumbnail.src);
      if (thumbnail.length) return this.setPoster(player, thumbnail[0]);
      return player.poster('');
    }
  }], [{
    key: "convertToPlayListItem",
    value: function convertToPlayListItem(x) {
      if (!x.sources.resolved) return undefined;
      var ret = Object.assign({}, x);
      ret.sources = ret.sources.resolved;
      return ret;
    }
  }, {
    key: "getTracker",
    value: function getTracker(ad, creative) {
      return new _vastClient.VASTTracker(null, ad, creative);
    }
  }, {
    key: "getValidSource",
    value: function getValidSource(item) {
      if (item.sources.length) return item.sources;
      var ret = [];
      if (item.sources.first15) ret.push({
        src: item.sources.first15
      });
      if (item.sources.resolved) ret.push.apply(ret, _toConsumableArray(item.sources.resolved));
      if (ret.length) return ret;
      throw "Invalid source for item";
    }
  }]);
  return vidCo;
}();
exports.vidCo = vidCo;

},{"../browser/cookies.js":48,"../browser/queryString":51,"../browser/version":53,"../dom/htmlEntities":58,"../dom/isMobile":59,"../dom/viewport":60,"../log/log":62,"vast-client":40}],89:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vidCoVidAdViewabilityController = void 0;
var _timer = require("../timer/timer");
var _log = require("../log/log");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var vidCoVidAdViewabilityController = /*#__PURE__*/function () {
  function vidCoVidAdViewabilityController() {
    var firstVidAdMilliseconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6000;
    var minMillisecondsBetweenVidAds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 60000;
    var vidCoTimer = arguments.length > 2 ? arguments[2] : undefined;
    var vidCo90Timer = arguments.length > 3 ? arguments[3] : undefined;
    var vidCoRunningTimer = arguments.length > 4 ? arguments[4] : undefined;
    var vidAdRunningTimer = arguments.length > 5 ? arguments[5] : undefined;
    var playerState = arguments.length > 6 ? arguments[6] : undefined;
    var options = arguments.length > 7 ? arguments[7] : undefined;
    var isMuted = arguments.length > 8 ? arguments[8] : undefined;
    var isPaused = arguments.length > 9 ? arguments[9] : undefined;
    var play = arguments.length > 10 ? arguments[10] : undefined;
    var pause = arguments.length > 11 ? arguments[11] : undefined;
    var launchAnAd = arguments.length > 12 ? arguments[12] : undefined;
    var avaConfigured = arguments.length > 13 ? arguments[13] : undefined;
    _classCallCheck(this, vidCoVidAdViewabilityController);
    //
    this.firstVidAdMilliseconds = firstVidAdMilliseconds;
    this.minMillisecondsBetweenVidAds = minMillisecondsBetweenVidAds;
    this.vidCoViewabilityTimer = vidCoTimer;
    this.vidCo90ViewabilityTimer = vidCo90Timer;
    this.vidCoRunningTimer = vidCoRunningTimer;
    this.vidAdRunningTimer = vidAdRunningTimer;
    this.playerState = playerState;
    this.options = options;
    this.avaConfigured = avaConfigured;
    this.isMuted = isMuted;
    this.isPaused = isPaused;
    this.play = play;
    this.pause = pause;
    this.launchAd = launchAnAd;
    this.vidCoFirst6Seconds90ViewDone = false;
    this.vidCoFirst6SecondsHandlerInstalled = false;
    this.vidCoViewabilityTimer.observers.push(this.vidCoViewabilityChange.bind(this));
    this.vidCo90ViewabilityTimer.observers.push(this.vidCo90ViewabilityChange.bind(this));
    this.timer = setInterval(this.timeIntervalCheck.bind(this), 1000);
  }
  _createClass(vidCoVidAdViewabilityController, [{
    key: "dispose",
    value: function dispose() {
      if (this.timer) clearInterval(this.timer);
      this.timer = 0;
    }

    /*
        If it's playing muted AND stops being visible, we pause the player until it is visible again.
     */
  }, {
    key: "vidCoViewabilityChange",
    value: function vidCoViewabilityChange(vidCoTimer) {
      //if(!this.playerState.autoPlay) return; // Whenever it's CTP, we don't mess with viewability.
      //console.log("vidCoViewabilityChange",vidCoTimer);
      if (this.avaConfigured) {
        // With AVA, we only want to check if we are trying to autoplay, but we can't because we aren't visible
        if (vidCoTimer.on && this.playerState.autoPlay && !this.playerState.hasPlayedAtLeastOnce && this.isPaused()) {
          (0, _log.cLog)("VidCoTimer.on && autoplay && !hasPlayedAtLeastOnce && isPaused");
          this.play();
        }
        return; // With AVA, any further logic doesn't have any sense
      }

      if (vidCoTimer.on) {
        // Now it's visible
        //console.log("this.isPaused",this.isPaused);
        //console.log("this.isPaused()",this.isPaused());
        if (this.playerState.shouldBePlaying && this.isPaused()) {
          this.playerState.shouldBePlaying = false;
          (0, _log.cLog)("this.play", this.play);
          this.play();
          (0, _log.cLog)("this.play done");
        }
      } else {
        // It has been visible sometime, but now it's not visible, and it's muted: there is no reason to keep playing
        //console.log("this.isPaused",this.isPaused);
        //console.log("!this.isPaused()",!this.isPaused());
        //console.log("this.isMuted",this.isMuted);
        //console.log("this.isMuted()",this.isMuted());
        if (!this.isPaused() && this.isMuted()) {
          this.playerState.shouldBePlaying = true;
          (0, _log.cLog)("this.pause", this.pause);
          this.pause();
          (0, _log.cLog)("this.pause done");
        }
      }
      (0, _log.cLog)("vidCoViewabilityChange done");
    }

    /*
        Launch the first VidAd when the player has been 90% visible for at least 6 seconds
     */
  }, {
    key: "vidCo90ViewabilityChange",
    value: function vidCo90ViewabilityChange() {
      if (this.playerState.adManager.adManagerPrepared && !this.playerState.adManager.wantingToPlayAnAd && !this.vidCoFirst6Seconds90ViewDone && this.vidCo90ViewabilityTimer.on && this.vidCo90ViewabilityTimer.getTimeOn() > this.firstVidAdMilliseconds && this.vidCoRunningTimer.on && this.vidCoRunningTimer.getTimeOn() > this.firstVidAdMilliseconds) {
        //console.log("vidCo90ViewabilityChange:",this.vidCo90ViewabilityTimer.on, this.vidCo90ViewabilityTimer.getTimeOn());
        // Launch the first VidAd
        this.vidCoFirst6Seconds90ViewDone = true;
        if (!this.playerState.adManager.tsLastAdLaunched) {
          (0, _log.cLog)("VidCo90 Launch Ad");
          this.launchAd();
        }
      }
    }
  }, {
    key: "timeIntervalCheck",
    value: function timeIntervalCheck() {
      if (this.vidAdRunningTimer.on) {
        // In an Ad
        this.playerState.playingVidAd = true;
        this.playerState.playingVidCo = false;
        return;
      }
      this.playerState.playingVidAd = false;
      var paused = this.isPaused();
      this.playerState.playingVidCo = !paused;
      if (!this.vidCoFirst6Seconds90ViewDone) return this.vidCo90ViewabilityChange();
      if (this.vidCoRunningTimer.getTimeOn() < this.minMillisecondsBetweenVidAds) return; // At least 60 seconds between Ads
      if (this.vidAdRunningTimer.getTimeOn() > this.vidCoRunningTimer.getTimeOn()) return; // Too much time viewing Ads
      if (!this.vidCo90ViewabilityTimer.on) return; // It must be at least 90% viewable (or the value configured for that)
      if (paused) return; // It must be playing
      if (!this.playerState.adManager.adManagerPrepared) return; // AdsManager must be Ready
      var tsLastAdLaunched = this.playerState.adManager.tsLastAdLaunched;
      if (!tsLastAdLaunched) return;
      var now = performance.now();
      if (now - tsLastAdLaunched < 5000) return; // We wait at least 5 seconds between Ad launches
      (0, _log.cLog)("Launch Ad");
      if (this.options.adBreakOnlyPrerolls) {
        this.playerState.adManager.setupAdsOnNextPreroll();
      } else {
        this.launchAd();
      }
      this.vidCoRunningTimer.resetTime();
      this.vidAdRunningTimer.resetTime();
    }
  }, {
    key: "isPrerollMandatory",
    value: function isPrerollMandatory() {
      // We must force a Preroll
      if (this.options.viewability.forceFirstPrerollEvenIfMissingVidAdViewability) return true;
      // If we don't want a Preroll because we configure the first Ad to be launched further away
      if (!this.options.adBreakOnlyPrerolls || this.options.viewability.firstVidAdMilliseconds > 150) return false;
      // If we do want a Preroll, but it's not mandatory and we don't have enough viewability, we postpone it
      // noinspection RedundantIfStatementJS
      if (this.vidCo90ViewabilityTimer.on && this.playerState.autoPlay && !this.playerState.hasPlayedAtLeastOnce && this.isPaused()) return true;
      return false;
    }
  }]);
  return vidCoVidAdViewabilityController;
}();
exports.vidCoVidAdViewabilityController = vidCoVidAdViewabilityController;

},{"../log/log":62,"../timer/timer":79}],90:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Viewability = void 0;
var _vidCoVidAdViewabilityController = require("./vidCoVidAdViewabilityController");
var _timer = require("../timer/timer");
var _documentVisibility = require("../timer/documentVisibility");
var _intersection = require("../observer/intersection");
var _paused = require("../player/paused");
var _log = require("../log/log");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Viewability = /*#__PURE__*/function () {
  function Viewability() {
    _classCallCheck(this, Viewability);
    _defineProperty(this, "firstVidAdMilliseconds", 6000);
    _defineProperty(this, "minMillisecondsBetweenVidAds", 60000);
    this.pollForceViewability = undefined;
    this.intersectionObserver = undefined;
    this.statusViewableVidCo = {
      threshold: 0.6,
      viewable: undefined,
      tsLastTransition: undefined,
      tsPreviousTransition: undefined,
      observer: []
    };
    this.statusViewableVidCo90 = {
      threshold: 0.9,
      viewable: undefined,
      tsLastTransition: undefined,
      tsPreviousTransition: undefined,
      observer: []
    };
    this.statusViewableVidAd = {
      threshold: 0.9,
      viewable: undefined,
      tsLastTransition: undefined,
      tsPreviousTransition: undefined,
      observer: []
    };
    this.statuses = [this.statusViewableVidCo, this.statusViewableVidCo90, this.statusViewableVidAd];
  }
  _createClass(Viewability, [{
    key: "setupViewabilityControls",
    value: function setupViewabilityControls(playerStorage) {
      var _this = this;
      playerStorage.statusViewableVidCo = this.statusViewableVidCo;
      playerStorage.pollForceViewability = function (x) {
        return _this.pollForceViewability = x;
      };
      playerStorage.setForceViewabilityCheck = function () {
        return _this.statuses.forEach(function (s) {
          return s.observer.forEach(function (o) {
            return o(s);
          });
        });
      };
    }
  }, {
    key: "install",
    value: function install(domElementToObserve, disposeCallbacks, player, options, playerState, viewabilityThresholdVidCo, viewabilityThresholdVidAd) {
      var _this2 = this;
      var firstVidAdMilliseconds = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 6000;
      var minMillisecondsBetweenVidAds = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 60000;
      this.domElementToObserve = domElementToObserve;
      this.disposeCallbacks = disposeCallbacks;
      this.player = player;
      this.options = options;
      this.playerState = playerState;
      this.viewabilityThresholdVidCo = viewabilityThresholdVidCo;
      this.viewabilityThresholdVidAd = viewabilityThresholdVidAd;
      this.firstVidAdMilliseconds = firstVidAdMilliseconds;
      this.minMillisecondsBetweenVidAds = minMillisecondsBetweenVidAds;

      // We start recording if the current Tab is visible
      _documentVisibility.DocumentVisibility.setup();
      if (viewabilityThresholdVidCo) this.statusViewableVidCo.threshold = viewabilityThresholdVidCo;
      if (viewabilityThresholdVidAd) this.statusViewableVidCo90.threshold = viewabilityThresholdVidAd;
      if (viewabilityThresholdVidAd) this.statusViewableVidAd.threshold = viewabilityThresholdVidAd;

      // Timers for each type of Video
      var vidCoTimer = new _timer.Timer(undefined);
      var vidCo90Timer = new _timer.Timer(undefined);
      var vidCoRunningTimer = new _timer.Timer(undefined);
      var vidAdRunningTimer = new _timer.Timer(undefined);
      var myThis = this;

      // Setup the status objects where the viewabilityTimer Object will keep track.
      this.statusViewableVidCo.observer.push(function (state) {
        state.viewable || typeof myThis.pollForceViewability === 'function' && myThis.pollForceViewability() ? vidCoTimer.switchOn() : vidCoTimer.switchOff();
      });
      this.statusViewableVidCo90.observer.push(function (state) {
        state.viewable || typeof myThis.pollForceViewability === 'function' && myThis.pollForceViewability() ? vidCo90Timer.switchOn() : vidCo90Timer.switchOff();
      });
      _documentVisibility.DocumentVisibility.startVisibilityObservers.push(function () {
        vidCoTimer.unpause();
        vidCo90Timer.unpause();
      });
      _documentVisibility.DocumentVisibility.stopVisibilityObservers.push(function () {
        vidCoTimer.pause();
        vidCo90Timer.pause();
      });
      player.on(['playing', 'play'], function (e) {
        vidCoTimer.unpause();
        vidCo90Timer.unpause();
        vidCoRunningTimer.switchOn();
        vidAdRunningTimer.switchOff();
        (0, _log.cLog)('viewability', e.type);
      });
      player.on('ended', function (e) {
        vidCoTimer.pause();
        vidCo90Timer.pause();
        vidCoRunningTimer.switchOff();
        vidAdRunningTimer.switchOff();
        (0, _log.cLog)('viewability', e.type);
      });
      player.on(['adsplaying', 'adplaying'], function (e) {
        vidCoTimer.pause();
        vidCo90Timer.pause();
        vidCoRunningTimer.switchOff();
        vidAdRunningTimer.switchOn();
        (0, _log.cLog)('viewability', e.type);
      });
      player.on(['adended', 'adserror'], function (e) {
        vidCoTimer.unpause();
        vidCo90Timer.unpause();
        vidCoRunningTimer.switchOff();
        vidAdRunningTimer.switchOff();
        (0, _log.cLog)('viewability', e.type);
      });
      var timeAdjust = false;
      var intervalID = setInterval(function () {
        if (typeof player.ads === 'undefined') return;
        if (typeof player.ads.isInAdMode !== 'function') return;
        if ((0, _paused.isPlayingAnAd)(player)) {
          vidCoTimer.pause();
          vidCo90Timer.pause();
          vidCoRunningTimer.switchOff();
          vidAdRunningTimer.switchOn();
          (0, _log.cLog)('viewability inAdMode');
          if (!timeAdjust && typeof player.ads.snapshot !== 'undefined') {
            (0, _log.cLog)('timeAdjust', player.ads.snapshot, player.ads.snapshot.currentTime);
            timeAdjust = true;
            if (player.ads.snapshot.currentTime > 5.0) player.ads.snapshot.currentTime -= 5.0;else player.ads.snapshot.currentTime = 0.0;
          }
        } else {
          vidCoTimer.unpause();
          vidCo90Timer.unpause();
          if (player.paused()) vidCoRunningTimer.switchOff();else vidCoRunningTimer.switchOn();
          vidAdRunningTimer.switchOff();
          //console.log('viewability not inAdMode');
          timeAdjust = false;
        }
      }, 1000);
      disposeCallbacks.push(function (x) {
        return clearInterval(intervalID);
      });
      var controller = new _vidCoVidAdViewabilityController.vidCoVidAdViewabilityController(firstVidAdMilliseconds, minMillisecondsBetweenVidAds, vidCoTimer, vidCo90Timer, vidCoRunningTimer, vidAdRunningTimer, playerState, options, function () {
        return player.muted();
      }, function () {
        return player.paused();
      }, function () {
        return player.play();
      }, function () {
        return player.pause();
      }, function () {
        //player.ima.changeAdTag(resolveVidAdURL(options.vastURL, options.dev, false, options));
        //player.ima.requestAds()
        playerState.adManager.showRequestedAd();
      }, !!options.ava);
      disposeCallbacks.push(function (x) {
        return controller.dispose();
      });
      this.intersectionObserver = new _intersection.Intersection(this.statuses);
      this.intersectionObserver.setup(domElementToObserve);
      disposeCallbacks.push(function (x) {
        return _this2.intersectionObserver.dispose();
      });

      //controller.checkVidCoViewability();

      playerState.viewabilityState.viewabilityController = controller;
    }
  }]);
  return Viewability;
}();
exports.Viewability = Viewability;

},{"../log/log":62,"../observer/intersection":63,"../player/paused":70,"../timer/documentVisibility":77,"../timer/timer":79,"./vidCoVidAdViewabilityController":89}],91:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
exports.viewabilityState = void 0;
var _visible = require("../observer/visible");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function install(recipient, options, id, rootDocument, isPaused, vidCoVidAdViewabilityController) {
  recipient.viewabilityState = new viewabilityState(recipient, options, id, rootDocument, isPaused, vidCoVidAdViewabilityController);
}
var viewabilityState = /*#__PURE__*/function () {
  function viewabilityState(playerState, options, id, rootDocument, isPaused, viewabilityController) {
    _classCallCheck(this, viewabilityState);
    this.playerState = playerState;
    this.options = options;
    this.id = id;
    this.rootDocument = rootDocument;
    this.isPaused = isPaused;
    this.viewabilityController = viewabilityController;
  }
  _createClass(viewabilityState, [{
    key: "isPrerollMandatory",
    value: function isPrerollMandatory() {
      // We must force a Preroll
      if (this.options.viewability.forceFirstPrerollEvenIfMissingVidAdViewability) return true;
      // If we don't want a Preroll because we configure the first Ad to be launched further away
      if (!this.options.adBreakOnlyPrerolls || this.options.viewability.firstVidAdMilliseconds > 150) return false;
      // If we do want a Preroll, but it's not mandatory and we don't have enough viewability, we postpone it
      // noinspection RedundantIfStatementJS
      var visible;
      if (!this.viewabilityController) visible = (0, _visible.isVidAfInViewport)(this.id, this.rootDocument);else visible = this.viewabilityController.vidCo90ViewabilityTimer.on;
      return !!(visible && this.playerState.autoPlay && !this.playerState.hasPlayedAtLeastOnce && this.isPaused());
    }
  }]);
  return viewabilityState;
}();
exports.viewabilityState = viewabilityState;

},{"../observer/visible":64}]},{},[65]);

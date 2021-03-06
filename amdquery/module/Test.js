aQuery.define( "module/Test", [ "base/typed", "base/ready", "base/Promise", "base/config", "base/extend", "main/event", "main/dom", "main/css", "html5/css3", "animation/animate", "html5/css3.transition.animate" ], function( $, typed, ready, Promise, config, utilExtend, event, dom, css, css3 ) {
	"use strict";
	this.describe( "Test Module" );
	var TestEventType = "test.report";
	var logger, error, info, debug;
	if ( window.console && window.console.log.bind && !config.module.testLogByHTML ) {
		logger = $.logger;
		error = $.error;
		info = $.info;
		debug = $.debug;
	} else {
		var margin = 5;
		var wrapper = $.createEle( "div" );
		wrapper.style.cssText = "position:absolute;width:610px;height:200px;overflow-y:hidden;overflow-x:hidden;z-index:1000000;";
		wrapper.style.right = margin + "px";
		wrapper.style.bottom = margin + "px";
		css3.css3( wrapper, "border-radius", "10px" );
		var hide = $.createEle( "div" );
		hide.style.cssText = "width:10px;height:615px;float:left;cursor:pointer;background-color:#bdbdbd";

		$( hide ).toggle( function() {
			$( wrapper ).stopAnimation().animate( {
				right: ( -600 ) + "px"
			}, {
				duration: 300,
				easing: "easeOut"
			} );
		}, function() {
			$( wrapper ).stopAnimation().animate( {
				right: ( margin ) + "px"
			}, {
				duration: 300,
				easing: "easeOut"
			} );
		} );

		var dialog = $.createEle( "pre" );

		dialog.style.cssText = "display:block;width:600px;height:200px;overflow-y:scroll;overflow-x:hidden;background-color:black;float:left;";

		wrapper.appendChild( hide );
		wrapper.appendChild( dialog );

		ready( function() {
			document.body.appendChild( wrapper );
			dialog.scrollTop = dialog.scrollHeight;
		} );

		var colorMap = {
			log: {
				backgroundColor1: "#62c462",
				backgroundColor2: "#57a957"
			},
			error: {
				backgroundColor1: "#ee5f5b",
				backgroundColor2: "#c43c35"
			},
			info: {
				backgroundColor1: "#5bc0de",
				backgroundColor2: "#339bb9"
			},
			debug: {
				backgroundColor1: "#5bc0de",
				backgroundColor2: "#339bb9"
			}
		};

		var input = function( type, arg ) {
			var $p = $( dom.parseHTML( '<p>' + "<strong>" + type + ":<strong>" + arg.join( " " ) + '</p>' ) );
			var colors = colorMap[ type ];
			$p.css( {
				display: "block",
				color: "white",
				borderTop: "1px solid rgba(0, 0, 0, 0.098)",
				borderBottom: "1px solid rgba(0, 0, 0, 0.24)",
				width: "594px",
				fontSize: "14px",
				padding: "3px",
				wordWrap: "break-word",
				whiteSpace: "normal",
			} ).css3( {
				borderRadius: "3px",
				linearGradient: {
					defaultColor: colors.backgroundColor2,
					orientation: "bottom",
					colorStops: [
						{
							stop: 0,
							color: colors.backgroundColor1
						},
						{
							stop: 1,
							color: colors.backgroundColor2
						} ]
				}
			} );
			dialog.appendChild( $p[ 0 ] );
			dialog.scrollTop = dialog.scrollHeight;
		};

		logger = function() {
			input( "log", $.util.argToArray( arguments ) );
		};

		error = function() {
			input( "error", $.util.argToArray( arguments ) );
		};

		info = function() {
			input( "info", $.util.argToArray( arguments ) );
		};

		debug = function() {
			input( "debug", $.util.argToArray( arguments ) );
		};

	}
	/**
	 * Event reporting that a test has been trigger.
	 * @event aQuery#"test.report"
	 * @param {String} name  - Test name.
	 * @param {Number} count - Test count.
	 * @param {Number} fail  - fail count.
	 * @param {Array<String>} failInfoList  - List of fail information.
	 */

	/**
	 * You can see Test.html.
	 * @public
	 * @module module/Test
	 * @requires module:base/Promise
	 * @requires module:base/config
	 */

	/**
	 * Test Module.
	 * @constructor
	 * @param {String} - Name of the test.
	 * @param {Function=} - The complete function of resoving all promise.
	 * @parma {String=} - Description to this test, will log when test begin.
	 * @alias module:module/Test
	 */
	function Test( name, complete, description ) {
		this.name = "[" + name + "]";
		this.complete = complete || function() {};
		this.promise = new Promise( function( preResult ) {
			description && info( description );
			info( this.name, "User Agent:", navigator.userAgent );
			return preResult;
		} ).withContext( this );
		this.count = 0;
		this.fail = 0;
		this.failInfoList = [];
		this.timeConsuming = null;
	}

	/**
	 * console.log or log in html.
	 * @method logger
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.logger = logger;
	/**
	 * console.error or error in html.
	 * @method error
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.error = error;
	/**
	 * console.info or info in html.
	 * @method info
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.info = info;
	/**
	 * console.debug or debug in html.
	 * @method debug
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.debug = debug;
	/**
	 *{undefined|DOMElement}
	 * @memberOf module:module/Test
	 */
	Test.dialog = dialog;

	var ssuccess = "√",
		sfail = "X";

	Test.prototype = /** @lends module:module/Test.prototype */ {
		constructor: Test,

		_fail: function() {
			this.fail++;
			var describe = $.util.argToArray( arguments ).join( " " )
			this.failInfoList.push( describe );
			error( describe );
		},
		_isEqual: function( describe, result, value, not ) {
			this.count++;
			var bol = typed.isEqual( result, value );
			if ( not ) {
				bol = !bol;
			}
			if ( bol ) {
				logger( describe, ssuccess );
			} else {
				this._fail( describe, sfail );
			}
		},
		_beCall: function( describe, todoFn, isThrow ) {
			this.count++;
			var err = null,
				bol = false;
			try {
				todoFn();
			} catch ( e ) {
				err = e;
				bol = true;
			}

			if ( isThrow ) {
				bol = !bol;
				if ( !err ) {
					error = "";
				}
			}

			if ( bol ) {
				this._fail( describe, sfail, err );
			} else {
				logger( describe, ssuccess );
			}

		},
		/**
		 * Create a task for testing.
		 * @param {String} - The describe of this test.
		 * @param {Function} - The function of this test.
		 * @param {Promise=} - If get a Promise instance then this test will be async.
		 * @returns {this}
		 * @example
		 * var testTest = new Test("TestTest", function(preResult){
		 *   // complete
		 * })
		 * .describe("Test a", function(preResult, expect, logger){
		 *  var testTarget = {
		 *
		 *  };
		 *  expect(testTarget, "testTarget").be.an("object");
		 *
		 *  var myName = "Jarray";
		 *  expect(myName, "My name").be.a("string");
		 *  var promise = new Promise;
		 *
		 *  setTimeout(function(){
		 *    promise.resolve(preResult)
		 *  }, 3000)
		 *
		 *  return promise;
		 * })
		 * .describe("Test a", function(preResult, expect, logger){
		 *  //expect().be.a
		 *  //expect().be.an
		 *  //expect().be.greater.than
		 *  //expect().be.less.than
		 *  //expect().be.instance.of
		 *  //expect().be.greater.than.or
		 *  //expect().be.less.than.or
		 *  //expect().equal
		 *  //expect().have.length
		 *  //expect().have.property
		 *  //expect().have.index
		 *  //expect().exists
		 *  //expect().not.equal
		 *  //expect().not.exists
		 *  //expect().not.Throw
		 *  //expect().Throw
		 *  //expect().be.elementCollection
		 *  //expect().not.be.elementCollection
		 *  //expect().be.event
		 *  //expect().not.be.event
		 *  //expect().be.arguments
		 *  //expect().not.be.arguments
		 *  //expect().be.array
		 *  //expect().not.be.array
		 *  //expect().be.arraylike
		 *  //expect().not.be.arraylike
		 *  //expect().be.boolean
		 *  //expect().not.be.boolean
		 *  //expect().be.date
		 *  //expect().not.be.date
		 *  //expect().be.document
		 *  //expect().not.be.document
		 *  //expect().be.element
		 *  //expect().not.be.element
		 *  //expect().be.empty
		 *  //expect().not.be.empty
		 *  //expect().be.emptyObject
		 *  //expect().not.be.emptyObject
		 *  //expect().be.emptyObject
		 *  //expect().not.be.emptyObject
		 *  //expect().be.error
		 *  //expect().not.be.error
		 *  //expect().be.finite
		 *  //expect().not.be.finite
		 *  //expect().be.function
		 *  //expect().not.be.function
		 *  //expect().be.nativeJSON
		 *  //expect().not.be.nativeJSON
		 *  //expect().be.NaN
		 *  //expect().not.be.NaN
		 *  //expect().be.number
		 *  //expect().not.be.number
		 *  //expect().be.numeric
		 *  //expect().not.be.numeric
		 *  //expect().be.nul
		 *  //expect().not.be.nul
		 *  //expect().be.node
		 *  //expect().not.be.node
		 *  //expect().be.object
		 *  //expect().not.be.object
		 *  //expect().be.plainObject
		 *  //expect().not.be.plainObject
		 *  //expect().be.RegExp
		 *  //expect().not.be.RegExp
		 *  //expect().be.string
		 *  //expect().not.be.string
		 *  //expect().be.string
		 *  //expect().not.be.string
		 *  //expect().be.XML
		 *  //expect().not.be.XML
		 *  //expect().be.window
		 *  //expect().not.be.window
		 *  //expect().be.$
		 *  //expect().not.be.$
		 * })
		 * .start();
		 */
		describe: function( describe, fn ) {
			var self = this;

			function expectWrapper( target, describe ) {
				return new Expect( target, describe || "", self );
			}

			this.promise = this.promise.then( function( preResult ) {
				info( this.name, describe );
				try {
					return fn( preResult, expectWrapper, info );
				} catch ( e ) {
					error( e );
					throw e;
					return;
				}
			} );

			return this;
		},
		/**
		 * Start test
		 * @param {*} - The first result.
		 * @returns {this}
		 */
		start: function( firstResult ) {
			var beginTime = new Date;
			this.promise.done( function() {
				this.timeConsuming = ( new Date() - beginTime ) / 1000;
				info( "time-consuming:", this.timeConsuming, "seconds" );
				Test[ this.fail == 0 ? "logger" : "error" ]( this.name, "Test stop", "Test:" + this.count, "Success" + ( this.count - this.fail ), "Fail:" + this.fail );
				this.complete();
				this.report();
			} ).resolve( firstResult );
			return this;
		},
		/**
		 * If window.parent.aQuery is exists then trigger "test" event.
		 * @inner
		 * @fires aQuery#"test.report"
		 * @returns {this}
		 */
		report: function() {
			if ( window.parent && window.parent.aQuery && window.parent.aQuery.trigger ) {
				window.parent.aQuery.trigger( TestEventType, null, {
					type: TestEventType,
					name: this.name,
					count: this.count,
					fail: this.fail,
					failInfoList: this.failInfoList,
					timeConsuming: this.timeConsuming
				} );
			}
			return this;
		}
	};

	function Expect( target, describe, testObject ) {
		var expectWrapper = this;
		utilExtend.easyExtend( this, {
			be: {
				a: function( value ) {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "a", "'" + String( value ) + "'" ), typeof target, value );
					return expectWrapper;
				},
				an: function( value ) {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "an", "'" + String( value ) + "'" ), typeof target, value );
					return expectWrapper;
				},
				greater: {
					than: function( value ) {
						testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "greater", "than", "'" + String( value ) + "'" ), target > value, true );
						return expectWrapper;
					}
				},
				less: {
					than: function( value ) {
						testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "less", "than", "'" + String( value ) + "'" ), target < value, true );
						return expectWrapper;
					}
				},
				instance: {
					of: function( value ) {
						testObject._beCall( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "instance", "of", value.name || "'" + String( value ) + "'" ), target instanceof value, true );
						return expectWrapper;
					}
				}
			},
			equal: function( value ) {
				testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "equal", "'" + String( value ) + "'" ), target, value );
				return expectWrapper;
			},
			have: {
				length: function( value ) {
					if ( typeof target.length !== "number" ) {
						testObject.count++
						testObject._fail( describe, "target", "have", "not", "length", sfail );
						return expectWrapper;
					}
					if ( typeof value !== "number" ) {
						testObject.count++
						testObject._fail( describe, "parameter", "value is not a number", sfail );
						return expectWrapper;
					}
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "have", "length", "'" + String( value ) + "'" ), target.length, value );
					return expectWrapper;
				},
				property: function( name ) {
					var bol = target != null && name in target;
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "have", String( name ), "property" ), bol, true );
					if ( bol ) {
						expectWrapper = new Expect( target[ name ], "With property " + name, testObject );
						expectWrapper.with = expectWrapper;
					}
					return expectWrapper;
				},
				index: function( index ) {
					var bol = target != null && target[ index ] !== undefined;
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "have", "index", index ), bol, true );
					if ( bol ) {
						expectWrapper = new Expect( target[ index ], "With index " + index, testObject );
						expectWrapper.with = expectWrapper;
					}
					return expectWrapper;
				}
			},
			exists: function() {
				testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "exists" ), target !== undefined && target !== null, true );
				return expectWrapper;
			},
			not: {
				equal: function( value ) {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "not", "equal", "'" + String( value ) + "'" ), target, value, true );
					return expectWrapper;
				},
				exists: function() {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "not", "exists" ), target == null, true );
					return expectWrapper;
				},
				Throw: function() {
					testObject._beCall( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "not", "Throw" ), target );
					return expectWrapper;
				},
				be: {},
				have: {
					property: function( name ) {
						var bol = target == null || !( name in target );
						testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "not", "have", String( name ), "property" ), bol, true );
						return expectWrapper;
					},
				}
			},
			Throw: function() {
				testObject._beCall( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "Throw" ), target, true );
				return expectWrapper;
			}
		} );

		this.be.greater.than.or = {
			equal: function( value ) {
				testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "greater", "than", "or", "equal", "'" + String( value ) + "'" ), target >= value, true );
				return expectWrapper;
			}
		}
		this.be.less.than.or = {
			equal: function( value ) {
				testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", "less", "than", "or", "equal", "'" + String( value ) + "'" ), target <= value, true );
				return expectWrapper;
			}
		}

		var except = {
			"XML": 1,
			"NaN": 1,
			"RegExp": 1
		}, ignore = {
				"isEqual": 1,
				"isPrototypeProperty": 1,
				"isType": 1
			};

		$.each( typed, function( fn, name ) {
			if ( name.indexOf( "is" ) === 0 && name.length > 2 && !ignore[ name ] ) {
				var fnName = name.replace( "is", "" );

				if ( !except[ fnName ] ) {
					fnName = fnName[ 0 ].toLowerCase() + fnName.slice( 1 );
				}

				expectWrapper.be[ fnName ] = function( value ) {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "be", fnName ), typed[ name ]( target, value ), true );
					return expectWrapper;
				}

				expectWrapper.not.be[ fnName ] = function( value ) {
					testObject._isEqual( expectWrapper.combineString( describe, "expect", "'" + String( target ) + "'", "not", "be", fnName ), typed[ name ]( target, value ), false );
					return expectWrapper;
				}
			}
		} );

	}

	Expect.prototype.combineString = function() {
		return $.util.argToArray( arguments ).join( " " );
	}

	return Test;
} );
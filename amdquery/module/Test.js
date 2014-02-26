aQuery.define( "module/Test", [ "base/Promise", "base/config" ], function( $, Promise, config ) {
	"use strict";
	var logger, error, info, debug;
	if ( window.console && window.console.log.bind && !config.module.testLogByHTML ) {
		logger = $.logger;
		error = $.error;
		info = $.info;
		debug = $.debug;
	} else {
		var dialog = $.createEle( "pre" );

		dialog.style.cssText = "display:block;position:absolute;width:600px;height:200px;overflow:scroll;z-index:1000000;";
		dialog.style.right = "0px";
		dialog.style.top = "0px";
		document.body.appendChild( dialog );

		var colorMap = {
			log: "green",
			error: "red",
			info: "black",
			debug: "orange"
		};

		var input = function( type, arg ) {
			dialog.innerHTML = ( dialog.innerHTML + '<p style="color:' + colorMap[ type ] + '" >' + "<strong>" + type + ":<strong>" + arg.join( " " ) + '</p>' + "\n" );
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

	function Test( name, complete ) {
		this.name = "[" + name + "]";
		this.complete = complete || function() {};
		this.promise = new Promise( function( preResult ) {
			logger( this.name, "userAgent", navigator.userAgent );
			logger( this.name, "Test start", "Test:" + this.count );
			return preResult;
		} ).withContext( this );
		this.count = 0;
		this.fail = 0;
	}

	Test.logger = logger;
	Test.error = error;
	Test.info = info;
	Test.debug = debug;
	Test.dialog = dialog;

	var ssuccess = "√",
		sfail = "X";

	Test.prototype = {
		constructor: Test,
		execute: function( describe, executeFn, promise ) {
			this.count++;
			this.promise = this.promise.then( function( preResult ) {
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						this._execute( describe, executeFn, preResult );
					} ).withContext( this );
					return promise;
				} else {
					this._execute( describe, executeFn, preResult );
					return preResult;
				}
			} );
			return this;
		},
		_execute: function( describe, executeFn, preResult ) {
			try {
				executeFn( preResult );
				logger( this.name, describe, ssuccess );
			} catch ( e ) {
				this.fail++;
				error( this.name, describe, sfail, e );
				this.report();
				throw e;
			}
		},
		equal: function( describe, value, resultBackFn, promise ) {
			this.count++;
			this.promise = this.promise.then( function( preResult ) {
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						return this._equal( describe, value, resultBackFn, preResult );
					} ).withContext( this );
					return promise;
				} else {
					return this._equal( describe, value, resultBackFn, preResult );
				}
			} );
			return this;
		},
		_equal: function( describe, value, resultBackFn, preResult ) {
			try {
				var result = resultBackFn( preResult );
			} catch ( e ) {
				this.fail++;
				error( this.name, describe, sfail, e );
				this.report();
				throw e;
			}
			if ( result === value ) {
				logger( this.name, describe, ssuccess );
			} else {
				this.fail++;
				error( this.name, describe, sfail );
				this.report();
			}
			return result;
		},
		start: function( firstResult ) {
			this.promise.then( function() {
				Test[ this.fail == 0 ? "logger" : "error" ]( this.name, "Test stop", "Test:" + this.count, "Success" + ( this.count - this.fail ), "Fail:" + this.fail );
				this.complete();
				this.report();
			} );
			this.promise.root().resolve( firstResult );
			return this;
		},
		report: function() {
			if ( window.parent && window.parent.aQuery && window.parent.aQuery.trigger ) {
				window.parent.aQuery.trigger( "test", null, this.name, this.count, this.fail );
			}
		}
	};

	return Test;
} );
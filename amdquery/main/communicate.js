﻿aQuery.define( "main/communicate", [ "base/typed", "base/extend", "main/event", "main/parse" ], function( $, typed, utilExtend, parse, undefined ) {
	"use strict";
	/**
	 * Export network requests.
	 * <br /> JSONP or AJAX.
	 * @exports main/communicate
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:main/event
	 * @requires module:main/parse
	 */
	var communicate = {
		/**
		 * @param options {Object}
		 * @param [options.type="GET"] {String} - "GET" or "POST"
		 * @param options.url {String}
		 * @param [options.data=""] {String|Object<String,String>|Array<Object<String,String>>} - See {@link module:main/communicate.getURLParam}
		 * @param [options.async=true] {Boolean}
		 * @param [options.complete] {Function}
		 * @param [options.header] {Object<String,String>}
		 * @param [options.isRandom] {Boolean}
		 * @param [options.timeout=10000] {Number}
		 * @param [options.routing=""] {String}
		 * @param [options.timeoutFun] {Function} - Timeout handler.
		 * @param [options.dataType="text"] {String} - "json"|"xml"|"text"|"html"
		 * @param [options.contentType="application/x-www-form-urlencoded"] {String}
		 * @param [options.context=null] {Object} - Complete context.
		 * @returns {this}
		 */
		ajax: function( options ) {
			var _ajax, _timeId, o;
			if ( options ) {
				_ajax = communicate.getXhrObject();

				if ( _ajax ) {

					o = utilExtend.extend( {}, communicate.ajaxSetting, options );

					o.data = communicate.getURLParam( o.data );

					if ( o.isRandom == true && o.type == "get" ) {
						o.data += "&random=" + $.now();
					}
					o.url += o.routing;
					switch ( o.type ) {
						case "get":
							if ( o.data ) {
								o.url += "?" + o.data;
							}
							break;
						case "post":
							break;
					}

					if ( o.username ) {
						_ajax.open( o.type, o.url, o.async, o.username, o.password );
					} else {
						_ajax.open( o.type, o.url, o.async );
					}

					try {
						for ( var item in o.header ) {
							_ajax.setRequestHeader( item, o.header[ item ] );
						}
						_ajax.setRequestHeader( "Accept", o.dataType && o.accepts[ o.dataType ] ? o.accepts[ o.dataType ] + ", */*" : o.accepts._default );

					} catch ( e ) {}
					if ( o.data || options ) {
						_ajax.setRequestHeader( "Content-Type", o.contentType );
					}
					//_ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					//type == "post" && _ajax.setRequestHeader("Content-type", "");
					_ajax.onreadystatechange = function() {
						if ( ( _ajax.readyState == 4 || _ajax.readyState == 0 ) && ( ( _ajax.status >= 200 && _ajax.status < 300 ) || _ajax.status == 304 ) ) {
							var response;
							clearTimeout( _timeId );
							$.trigger( "ajaxStop", _ajax, o );
							switch ( o.dataType ) {
								case "json":
									response = parse.JSON( "(" + _ajax.responseText + ")" );
									break;
								case "xml":
									response = _ajax.responseXML;
									if ( !response ) {
										try {
											response = parse.parseXML( _ajax.responseText );
										} catch ( e ) {}
									}
									break;
								default:
								case "text":
									response = _ajax.responseText;
									break;
							}
							try {
								o.complete && o.complete.call( o.context || _ajax, response );
							} finally {
								o = null;
								_ajax = null;
							}
						}
					};
					if ( o.timeout ) {
						_timeId = setTimeout( function() {
							_ajax && _ajax.abort();
							$.trigger( "ajaxTimeout", _ajax, o );
							o.timeoutFun.call( _ajax, o );
							o = null;
							_ajax = null;
						}, o.timeout );
					}
					$.trigger( "ajaxStart", _ajax, o );
					_ajax.send( o.type == "get" ? "NULL" : ( o.data || "NULL" ) );
				}
			}
			return this;
		},
		/**
		 * @deprecated
		 */
		ajaxByFinal: function( list, complete, context ) {
			var sum = list.length,
				count = 0;
			return $.each( list, function( item ) {
				item._complete = item.complete;
				item.complete = function() {
					count++;
					item._complete && item._complete.apply( this, arguments );
					if ( count == sum ) {
						complete && complete.apply( window, context );
						count = null;
						sum = null;
					}
				};
				communicate.ajax( item );
			} );
		},

		ajaxSetting:
		/**
		 * @name ajaxSetting
		 * @memberOf module:main/communicate
		 * @property {Object}   ajaxSetting                     - AJAX default setting.
		 * @property {String}   ajaxSetting.url
		 * @property {String}   ajaxSetting.dataType            - "text".
		 * @property {String}   ajaxSetting.type                - "GET".
		 * @property {String}   ajaxSetting.contentType         - "application/x-www-form-urlencoded".
		 * @property {Object}   ajaxSetting.context             - Complete context.
		 * @property {Number}   ajaxSetting.timeout             - 10000 millisecond.
		 * @property {Function} ajaxSetting.timeoutFun          - Timeout handler.
		 * @property {String}   ajaxSetting.routing             - "".
		 * @property {null}     ajaxSetting.header
		 * @property {Boolean}  ajaxSetting.isRandom            - False.
		 * @property {Object}   ajaxSetting.accepts
		 * @property {String}   ajaxSetting.accepts.xml         - "application/xml, text/xml".
		 * @property {String}   ajaxSetting.accepts.html        - "text/html".
		 * @property {String}   ajaxSetting.accepts.json        - "application/json, text/javascript".
		 * @property {String}   ajaxSetting.accepts.text        - "text/plain".
		 */
		{
			url: location.href,
			dataType: "text",
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			context: null,
			async: true,
			timeout: 10000,
			timeoutFun: function( o ) {
				$.logger( "aQuery.ajax", o.url + "of ajax is timeout:" + ( o.timeout / 1000 ) + "second" );
			},
			routing: "",
			header: null,
			isRandom: false,
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},
		/**
		 * @param options {Object}
		 * @param options.url {String}
		 * @param [options.charset="GBK"] {String}
		 * @param [options.complete] {Function}
     * @param [options.error] {Function} - Error handler
		 * @param [options.isDelete=true] {Boolean} - Does delete the script.
		 * @param [options.context=null] {Object} - Complete context.
		 * @param [options.isRandom=false] {Boolean}
		 * @param [options.checkString=""] {String} - Then JSONP back string.
     * @param [options.timeout=10000] {Number}
     * @param [options.timeoutFun] {Function} - Timeout handler.
		 * @param [options.routing=""] {String}
		 * @param [options.JSONP] {String|Boolean} - True is aQuery. String is JSONP.
		 * @returns {this}
		 */
		jsonp: function( options ) {
			var _scripts = document.createElement( "script" ),
				_head = document.getElementsByTagName( "HEAD" ).item( 0 ),
				o = utilExtend.extend( {}, communicate.jsonpSetting, options ),
				_data = "",
				_timeId, random = "";
			//            , _checkString = o.checkString
			//            , isDelete = options.isDelete || false;

			_data = communicate.getURLParam( o.data );


			if ( o.JSONP ) {
				random = ( "aQuery" + $.now() ) + parseInt( Math.random() * 10 );
				window[ random ] = function() {
					typed.isFun( o.complete ) && o.complete.apply( o.context || window, arguments );
				};
				//o.JSONP = random;
				_data += "&" + ( o.JSONP ) + "=" + random;
				//_data += "&complete=" + random;
			}
			//            if (typed.isStr(o.JSONP)) {
			//                _data += "&" + (o.JSONPKey) + "=" + o.JSONP;
			//            }

			o.isRandom == true && ( _data += "&random=" + $.now() );

			o.url += o.routing + ( _data == "" ? _data : "?" + _data );

			//IE和其他浏览器 不一样

			_scripts.onload = _scripts.onreadystatechange = function() {
				if ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) {
					clearTimeout( _timeId );
					$.trigger( "getJSStop", _scripts, o );
					var js = typeof window[ o.checkString ] != "undefined" ? window[ o.checkString ] : undefined;
					!o.JSONP && typed.isFun( o.complete ) && o.complete.call( o.context || this, js );
					//typed.isFun(o.complete) && o.complete.call(o.context || this, js);
					this.nodeName.toLowerCase() == "script" && o.isDelete == true && _head.removeChild( this );
					this.onerror = this.onload = o = _head = null;
					if ( window[ random ] ) {
						window[ random ] = undefined;
						random = null;
					}
				}
			};

			_scripts.onerror = o.error;

			o.timeout && ( _timeId = setTimeout( function() {
				$.trigger( "getJSTimeout", _scripts, o );
				o.timeoutFun.call( this, o );
				_scripts = _scripts.onerror = _scripts.onload = o.error = _head = null;
				if ( window[ random ] ) {
					window[ random ] = undefined;
					random = null;
				}
			}, o.timeout ) );

			_scripts.setAttribute( "src", o.url );
			o.charset && _scripts.setAttribute( "charset", o.charset );
			_scripts.setAttribute( "type", "text/javascript" );
			_scripts.setAttribute( "language", "javascript" );

			$.trigger( "getJSStart", _scripts, o );
			_head.insertBefore( _scripts, _head.firstChild );
			return this;
		},
		jsonpSetting:
		/**
		 * @name ajaxSetting
		 * @memberOf module:main/communicate
		 * @property {Object}         jsonpSetting                    - JSONP default setting.
		 * @property {String}         ajaxSetting.url                 - "".
		 * @property {String}         ajaxSetting.charset             - "GBK".
		 * @property {String}         ajaxSetting.checkString         - "".
		 * @property {Function}       ajaxSetting.error
		 * @property {Boolean}        ajaxSetting.isDelete            - true.
		 * @property {Boolean}        ajaxSetting.isRandom            - false.
		 * @property {String|Boolean} ajaxSetting.JSONP               - false.
		 * @property {String}         ajaxSetting.routing             - "".
		 * @property {Number}         ajaxSetting.timeout             - 10000 millisecond.
     * @property {Function}       ajaxSetting.timeoutFun          - Timeout handler.
		 */
		{
			charset: "GBK",
			checkString: "",
			error: function() {
				$.logger( "aQuery.jsonp", ( this.src || "(empty)" ) + " of javascript getting error" );
			},
			isDelete: true,
			isRandom: false,
			JSONP: false,
			routing: "",
			timeout: 10000,
			timeoutFun: function( o ) {
				$.logger( aQuery.jsonp, ( o.url || "(empty)" ) + "of ajax is timeout:" + ( o.timeout / 1000 ) + "second" );
			},
			url: ""
		},
		/**
		 * @deprecated
		 */
		jsonpsByFinal: function( list, complete, context ) {
			/// <summary>加载几段script，当他们都加载完毕触发个事件
			/// </summary>
			/// <param name="list" type="Array:[options]">包含获取js配置的数组，参考jsonp</param>
			/// <param name="complete" type="Function">complete</param>
			/// <param name="context" type="Object">作用域</param>
			/// <returns type="self" />
			var sum = list.length,
				count = 0;
			$.each( list, function( item ) {
				item._complete = item.complete;
				item.complete = function() {
					count++;
					item._complete && item._complete.apply( this, arguments );
					if ( count == sum ) {
						complete && complete.apply( window, context );
						count = null;
						sum = null;
					}
				};
				communicate.jsonp( item );
			} );
			return this;
		},
		/**
		 * @example
		 * communicate.getURLParam( {
		 *   id: "00001",
		 *   name: "Jarry"
		 * } );
		 * communicate.getURLParam( [
		 *   {
		 *     name: "id",
		 *     value: "000001"
		 *   },
		 *   {
		 *     name: "name",
		 *     value: "Jarry"
		 *   }
		 * ] );
		 * // output: "id=00001&name=Jarry"
		 * @param {String|Object<String, String>|Array<Object<String,String>>}
		 * @returns {String}
		 */
		getURLParam: function( content ) {
			var list = [];
			if ( typed.isObj( content ) ) {
				$.each( content, function( value, name ) {
					value = typed.isFun( value ) ? value() : value;
					!typed.isNul( value ) && list.push( encodeURIComponent( name ) + "=" + encodeURIComponent( value ) );
				} );
				content = list.join( "&" );
			} else if ( typed.isArr( content ) ) {
				$.each( content, function( item ) {
					!typed.isNul( item.value ) && list.push( encodeURIComponent( item.name ) + "=" + encodeURIComponent( item.value ) );
				} );
				content = list.join( "&" );
			} else if ( !typed.isStr( content ) ) {
				content = "";
			}
			return content;
		},
		/**
		 * If return null means it does not support XMLHttpRequest.
		 * @returns {?XMLHttpRequest}
		 */
		getXhrObject: function() {
			var xhr = null;
			if ( window.ActiveXObject ) {
				$.each( [ "Microsoft.XMLHttp", "MSXML2.XMLHttp", "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0" ], function( value ) {
					try {
						xhr = new ActiveXObject( value );
						return xhr;
					} catch ( e ) {

					}
				}, this );
			} else {
				try {
					xhr = new XMLHttpRequest();
				} catch ( e ) {}
			}
			if ( !xhr ) {
				$.logger( "getXhrObject", "broswer no support AJAX" );
			}

			return xhr;
		}
	};

	return communicate;
} );
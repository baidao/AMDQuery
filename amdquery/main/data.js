﻿aQuery.define( "main/data", [ "base/extend", "base/typed", "base/support" ], function( $, utilExtend, typed, support, undefined ) {
	"use strict";

	// checks a cache object for emptiness

	function isEmptyDataObject( obj ) {
		var name;
		for ( name in obj ) {

			// if the public data object is empty, the private is still empty
			if ( name === "data" && typed.isEmptyObject( obj[ name ] ) ) {
				continue;
			}
			if ( name !== "toJSON" ) {
				return false;
			}
		}

		return true;
	}

	var
	expando = "aQuery" + $.now(),
		uuid = 0,
		windowData = {}, emptyObject = {};
	/**
	 * @pubilc
	 * @exports main/data
	 * @requires module:main/data
	 */
	var exports = {
		/**
		 * @type Array
		 */
		cache: [],
		/**
		 * Quote from jQuery-1.4.1 .
		 * @deprecated
		 */
		data: function( ele, name, data ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return this;

			ele = ele == window ?
				windowData :
				ele;

			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( !name && !id )
				return this;

			if ( !id )
				id = ++uuid;

			if ( typed.isPlainObject( name ) ) {
				ele[ expando ] = id;
				thisCache = cache[ id ] = utilExtend.extend( true, {}, name );
			} else if ( cache[ id ] ) {
				thisCache = cache[ id ];
			} else if ( data === undefined ) {
				thisCache = emptyObject;
			} else {
				thisCache = cache[ id ] = {};
			}

			if ( data !== undefined ) {
				ele[ expando ] = id;
				thisCache[ name ] = data;
			}

			return typed.isString( name ) ? thisCache[ name ] : thisCache;
		},

		_getTarget: function( ele ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return null;
			return ele == window ?
				windowData :
				ele;
		},
		/**
		 * Get Data.It maybe return undefined.
		 * @param {Element|window}
		 * @param {String} [name] - If name is undefined then return whole cache.
		 * @returns {undefined|*}
		 */
		get: function( ele, name ) {
			ele = exports._getTarget( ele );
			if ( !ele ) {
				return undefined;
			}
			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( id && cache[ id ] ) {
				return name ? cache[ id ][ name ] : cache[ id ];
			} else {
				return undefined;
			}
		},
		/**
		 * Set Data.
		 * @param {Element|window}
		 * @param {String} name
		 * @param {*|Object} - If data is an plain object, then add all properties to cache.
		 * @returns {this}
		 */
		set: function( ele, name, data ) {
			ele = exports._getTarget( ele );
			if ( !ele ) {
				return this;
			}
			var id = ele[ expando ],
				cache = exports.cache,
				thisCache;

			if ( !name && !id )
				return this;

			if ( !id )
				id = ++uuid;

			if ( typed.isPlainObject( name ) ) {
				ele[ expando ] = id;
				thisCache = cache[ id ] = utilExtend.extend( true, {}, name );
			} else if ( cache[ id ] ) {
				thisCache = cache[ id ];
			} else if ( data === undefined ) {
				thisCache = emptyObject;
			} else {
				thisCache = cache[ id ] = {};
			}

			if ( data !== undefined ) {
				ele[ expando ] = id;
				thisCache[ name ] = data;
			}

			return this;
		},
		/** @constant */
		expando: expando,
		/** A hash of Element which does not support data. */
		noData: {
			"embed": true,
			"object": true,
			"applet": true
		},
		/**
		 * Remove Data.
		 * @param {Element|window}
		 * @param {String} [name] - If name is undefined then remove all.
		 * @returns {this}
		 */
		removeData: function( ele, name ) {
			if ( !ele || ( ele.nodeName && exports.noData[ ele.nodeName.toLowerCase() ] ) )
				return this;

			ele = ele == window ?
				windowData :
				ele;

			var id = ele[ expando ],
				cache = exports.cache,
				thisCache = cache[ id ];

			if ( name ) {
				if ( thisCache ) {
					delete thisCache[ name ];

					if ( typed.isEmptyObject( thisCache ) )
						exports.removeData( ele );

				}

			} else {
				if ( support.deleteExpando ) {
					delete ele[ expando ];
				} else if ( ele.removeAttribute ) {
					ele.removeAttribute( expando );
				} else {
					ele[ expando ] = null;
				}
				delete cache[ id ];
			}
			return this;
		},
		/**
		 * @param {Element|window}
		 * @returns {Boolean}
		 */
		hasData: function( ele ) {
			ele = ele.nodeType ? exports.cache[ ele[ exports.expando ] ] : ele[ exports.expando ];
			return !!ele && !isEmptyDataObject( ele );
		}
	};

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Get or set data.
		 * @param {String}
		 * @param {*|Object} [value] - If value is undefined then get data, else if value is plain object then add all properties to cache.
		 * @returns {this|*}
		 */
		data: function( key, value ) {
			if ( key === undefined && this.length ) {
				return exports.get( this[ 0 ] );
			} else if ( typed.isObject( key ) ) {
				return this.each( function( ele ) {
					exports.get( ele, key );
				} );
			}
			return value === undefined ? exports.get( this[ 0 ], key ) : this.each( function( ele ) {
				exports.set( ele, key, value );
			} );
		},
		/**
		 * Remove data.
		 * @param {String} - If key is undefined then remove all.
		 * @returns {this}
		 */
		removeData: function( key ) {
			return this.each( function( ele ) {
				exports.removeData( ele, key );
			} );
		},
		/**
		 * @returns {Boolean}
		 */
		hasData: function() {
			return this[ 0 ] && exports.hasData( this[ 0 ] );
		}
	} );

	return exports;
} );
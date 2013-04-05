﻿/// <reference path="../myquery.js" />

myQuery.define("main/CustomEvent", function ($, undefined) {
    "use strict"; //启用严格模式

    var proto = {
        constructor: CustomEvent
        , init: function () {
            this.handlers = {};
            this._handlerMap = {};
            return this;
        }
        , addHandler: function (type, handler) {
            /// <summary>添加自定义事件</summary>
            /// <para>例:"do undo"</para>
            /// <param name="type" type="String">方法类型</param>
            /// <param name="handler" type="Function">方法</param>
            /// <returns type="self" />
            var types = type.split(" "), i = types.length - 1;
            for (; i >= 0; i--) {
                this._addHandler(types[i], handler);
            };
            return this;
        }
        , _addHandler: function(type, handler){
            /// <summary>添加自定义事件</summary>
            /// <param name="type" type="String">方法类型</param>
            /// <param name="handler" type="Function">方法</param>
            /// <returns type="self" />
            var handlers = this._nameSpace(type);
            this.hasHandler(type, handler, handlers) == -1 && handlers.push(handler);
            return this;
        }
        , clearHandlers: function (type) {
            /// <summary>清楚所有自定义事件</summary>
            /// <returns type="self" />
            if (type) {
                var types = type.split(" "), i = types.length - 1, item;
                for (; i >= 0; i--) {
                    item = types[i];
                    this._nameSpace(item, true);
                    delete this._handlerMap[item];
                    delete this.handlers[item];
                } 
            }
            else {
                this.handlers = {};
            }
            return this;
        }
        , hasHandler: function (type, handler, handlers) {
            /// <summary>是否有这个事件</summary>
            /// <para>返回序号 -1表示没有</para>
            /// <param name="type" type="String">方法类型</param>
            /// <param name="handler" type="Function">方法</param>
            /// <param name="handlers" type="Array/undefinded">已有的事件集</param>
            /// <returns type="Number" />
            var handlers = handlers || this._nameSpace(type), i = 0, j = -1, len;
            if (handlers instanceof Array && handlers.length) {
                for (len = handlers.length; i < len; i++) {
                    if (handlers[i] === handler) {
                        j = i;
                        break;
                    }
                }
            }
            return j;
        }
        , trigger: function (type, target, obj) {
            /// <summary>配置自定义事件</summary>
            /// <param name="target" type="Object">当前对象</param>
            /// <param name="obj" type="Object">作用域</param>
            /// <returns type="self" />
            var handlers = this._nameSpace(type);
            if (handlers instanceof Array && handlers.length) {
                for (var i = 0, len = handlers.length, arg = $.util.argToArray(arguments, 2); i < len; i++)
                    handlers[i].apply(target, arg);
            }
            return this;
        }
        , removeHandler: function(type, handler){
            /// <summary>移除自定义事件</summary>
            /// <para>例:"do undo"</para>
            /// <param name="type" type="String">方法类型</param>
            /// <param name="handler" type="Function">方法</param>
            /// <returns type="self" />
            var types = type.split(" "), i = types.length - 1;
            for (; i >= 0; i--) {
                this._removeHandler(types[i], handler);
            };
            return this;
        }
        , _removeHandler: function (type, handler) {
            /// <summary>移除自定义事件</summary>
            /// <param name="type" type="String">方法类型</param>
            /// <param name="handler" type="Function">方法</param>
            /// <returns type="self" />
            var handlers = this._nameSpace(type), i = this.hasHandler(type, handler, handlers);
            if (i > -1) {
                handlers.splice(i, 1);
            }
            return this;            
        }
        , _nameSpace: function (type, re) {
            var nameList = type.split("."), result = this._initSpace(nameList, this.handlers, re);
            //, i = 0, nameSpace, name, result;
            //nameList.length > 2 && tools.error({ fn: "CustomEvent._nameSpace", msg: "nameSpace is too long" });

            this._handlerMap[type] || (this._handlerMap[type] = result);
            return result;
        }
        , _initSpace: function (nameList, nameSpace, re) {
            var name = nameList[0],
            result;
            //name = nameList[1];
            if (nameSpace) {
                result = nameSpace[name];
                if (!result || re) {
                    nameSpace[name] = {};
                }
                nameSpace = nameSpace[name];
                if (!nameSpace["__" + name]) {
                    nameSpace["__" + name] = [];
                }
                result = nameSpace["__" + name];
            }
            nameList.splice(0, 1);
            return nameList.length ? this._initSpace(nameList, nameSpace, re) : result;
        }
    };

    function CustomEvent() {
        /// <summary>自定义事件基类</summary>
        /// <returns type="CustomEvent" />
        //quote from written by Nicholas C.Zakas
        this.init.apply(this, arguments);
    }
    CustomEvent.prototype = proto;

    proto.on = proto.addHandler;
    proto.off = proto.removeHandler;
    proto.clear = proto.clearHandlers;

    return $.CustomEvent = CustomEvent;
});

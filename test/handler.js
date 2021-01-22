
function Ctor(){
    this.preinitialize.apply(this,arguments);
    this.initialize.apply(this,arguments);
};

Ctor.prototype.preinitialize = function(){
    /* Override */
};

Ctor.prototype.valueOf = function(){
        return this;
};

Ctor.prototype.initialize = function(){
    /* Override */
};

(function (global) {

    function _(object) {
        if (object instanceof _) return object;
        if (!(this instanceof _)) return new _(object);
    }

    global._ = _;

    var ObjProto = Object.prototype;
    var hasOwn = ObjProto.hasOwnProperty;
    var has = function (object, key) { return object != null && hasOwn.call(object, key); };
    var identity = function (object) { return object; };

    _.memoize = function (callback, address) {
        var cache = {}, key;
        address || (address = identity);
        return function () {
            key = address.apply(this, arguments);
            return has(cache, key) ? cache[key] : (cache[key] = callback.apply(this, arguments));
        };
    };

    _.prototype.valueOf = function () {
        return this;
    };

})(this);

(function (window) {

    'use strict';

    window.qs = function (selector, scope) {
        return (scope || document).querySelector(selector);
    };

    window.qsa = function (selector, scope) {
        return (scope || document).querySelectorAll(selector);
    };

    window.$on = function (target, type, callback, useCapture) {
        target.addEventListener(type, callback, !!useCapture);
    };

    window.$delegate = function (target, selector, type, handler) {
        function dispatchEvent(event) {
            var targetElement = event.target;
            var potentialElements = window.qsa(selector, target);
            var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;
            if (hasMatch) {
                handler.call(targetElement, event);
            }
        }
        var useCapture = type === 'blur' || type === 'focus';
        window.$on(target, type, dispatchEvent, useCapture);
    };

    window.$parent = function (element, tagName) {
        if (!element.parentNode) {
            return;
        }
        if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
            return element.parentNode;
        }
        return window.$parent(element.parentNode, tagName);
    };

    NodeList.prototype.forEach = Array.prototype.forEach;

})(window);

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
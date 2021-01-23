(function () {

    var requestAnimFrame = (function () {
        return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60)
        })
    })();
    
    function decouple(node, event, fn) {
        var eve, tracking = false;
        function captureEvent(e) {
            eve = e; track()
        }
        function track() {
            if (!tracking) { requestAnimFrame(update); tracking = true }
        }
        function update() {
            fn.call(node, eve);
            tracking = false
        }
        node.addEventListener(event, captureEvent, false);
        return captureEvent
    }
    
    var _classCallCheck = function (instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function")
        }
    };
    
    var Emitter = (function () {
        function Emitter() {
            _classCallCheck(this, Emitter)
        }
        Emitter.prototype.on = function on(event, listener) {
            this._eventCollection = this._eventCollection || {};
            this._eventCollection[event] = this._eventCollection[event] || [];
            this._eventCollection[event].push(listener);
            return this
        };
        Emitter.prototype.once = function once(event, listener) {
            var self = this;
            function fn() {
                self.off(event, fn);
                listener.apply(this, arguments)
            }
            fn.listener = listener;
            this.on(event, fn);
            return this
        };
        Emitter.prototype.off = function off(event, listener) {
            var listeners = undefined;
            if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
                return this
            }
            listeners.forEach(function (fn, i) {
                    if (fn === listener || fn.listener === listener) {
                        listeners.splice(i, 1)
                    }
                });
            if (listeners.length === 0) {
                delete this._eventCollection[event]
            }
            return this
        };
        Emitter.prototype.emit = function emit(event) {
            var _this = this;
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key += 1) {
                args[_key - 1] = arguments[_key]
            }
            var listeners = undefined;
            if (!this._eventCollection || !(listeners = this._eventCollection[event])) {
                return this
            }
            listeners = listeners.slice(0);
            listeners.forEach(function (fn) {
                return fn.apply(_this, args)
            });
            return this
        };
        return Emitter
    })();
    
    var scrollTimeout;
    var scrolling = false;
    var doc = window.document;
    var html = doc.documentElement;
    var msPointerSupported = window.navigator.msPointerEnabled;
    
    var touch = {
        start: msPointerSupported ? "MSPointerDown" : "touchstart",
        move: msPointerSupported ? "MSPointerMove" : "touchmove",
        end: msPointerSupported ? "MSPointerUp" : "touchend"
    };
    
    var prefix = (function prefix() {
        var regex = /^(Webkit|Khtml|Moz|ms|O)(?=[A-Z])/;
        var styleDeclaration = doc.getElementsByTagName("script")[0].style;
        for (var prop in styleDeclaration) {
            if (regex.test(prop)) {
                return "-" + prop.match(regex)[0].toLowerCase() + "-"
            }
        }
        if ("WebkitOpacity" in styleDeclaration) {
            return "-webkit-"
        }
        if ("KhtmlOpacity" in styleDeclaration) {
            return "-khtml-"
        }
        return ""
    })();
    
    function extend(destination, from) {
        for (var prop in from) {
            if (from[prop]) {
                destination[prop] = from[prop]
            }
        }
        return destination
    }
    
    function inherits(child, uber) {
        child.prototype = extend(child.prototype || {}, uber.prototype)
    }

  if (typeof window !== "undefined") {}

})();

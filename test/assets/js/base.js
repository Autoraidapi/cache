(function (factory) {
	var root = typeof self == 'object' && self.self === self && self ||
		typeof global == 'object' && global.global === global && global;
	if (typeof define === 'function' && define.amd) {
		define(['exports'], function (exports) {
			root.Base = factory(root, exports);
		});
	} else if (typeof exports !== 'undefined') {
		factory(root, exports);
	} else {
		root.Base = factory(root, {});
	}
})(function (root, Base) {

	var previousBase = root.Base;

	Base.VERSION = '0.0.1';

	Base.noConflict = function () {
		root.Base = previousBase;
		return this;
	};

	Base.emulateHTTP = false;
	Base.emulateJSON = false;

	function assign(keysCallback, undefinedOnly) {
		return function (object) {
			var length = arguments.length,
				index, i;
			if (length < 2 || object == null) return object;
			for (index = 1; index < length; index++) {
				var source = arguments[index];
				var keys = keysCallback(source),
					l = keys.length;
				for (i = 0; i < l; i++) {
					var key = keys[i];
					if (!undefinedOnly || object[key] === void 0) object[key] = source[key];
				}
			}
			return object;
		}
	}

	function names(obj) {
		var result = [];
		for (var key in obj) {
			result.push(key);
		}
		return result;
	};

	var extend = assign(names);

	function bindApi(){};
	
	function unbindApi(){};

	var Events = (Base.Events = {
		bind :function(){ this.events = bindApi(); },
		unbind : function(){ unbindApi(this.events); }
	});

	function Listening(listener, obj) {
		this.id = listener._listenId;
		this.listener = listener;
		this.obj = obj;
		this.interop = true;
		this.count = 0;
		this._events = void 0;
	};

	Listening.prototype.on = Events.bind;

	Listening.prototype.off = function () {};

	Listening.prototype.cleanup = function () {};

	extend(Base, Events);

	return Base;

});
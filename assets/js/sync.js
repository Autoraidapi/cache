define(function() {

	'use strict';

	function Sync(callback) {
		Ctor.call(this);
		this.callback = callback || function(){};
	};
	
	Sync.prototype = Object.create(Ctor.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Sync,
			writeable: true
		}
	});
	
	Sync.prototype.preinitialize = function () {
		
	};
	
	Sync.prototype.initialize = function () {
		
	};
	return Sync;
});


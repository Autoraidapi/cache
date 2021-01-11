define(function() {

	'use strict';

	function Model(sync) {
		Ctor.call(this);
		this.sync = sync;
	};
	
	Model.prototype = Object.create(Ctor.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Model,
			writeable: true
		}
	});
	
	Model.prototype.preinitialize = function () {
		
	};
	
	Model.prototype.initialize = function () {
		
	};

	return Model;
	
});


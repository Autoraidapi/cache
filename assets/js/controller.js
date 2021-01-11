define(function() {

	'use strict';

	function Controller(model,view) {
		Ctor.call(this);
		this.model = model;
		this.view = view;
	};
	
	Controller.prototype = Object.create(Object.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Controller,
			writeable: true
		}
	});
	
	Controller.prototype.preinitialize = function () {
		
	};
	
	Controller.prototype.initialize = function () {
		
	};

	return Controller;
	
});


define(function() {

	'use strict';

	function View(template) {
		Ctor.call(this);
		this.template = template;
	};
	
	View.prototype = Object.create(Object.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: View,
			writeable: true
		}
	});
	
	View.prototype.preinitialize = function () {
		
	};
	
	View.prototype.initialize = function () {
		
	};
	return View;
});


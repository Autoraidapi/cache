define(function() {

	'use strict';

	function Template() {
		Ctor.call(this);
	};
	
	Template.prototype = Object.create(Object.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Template,
			writeable: true
		}
	});
	
	Template.prototype.preinitialize = function () {
		
	};
	
	Template.prototype.initialize = function () {
		
	};
	return Template;
});


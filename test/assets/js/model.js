(function (window) {
	
	'use strict';
	
	function Model(storage) {
		Ctor.call(this);
		this.storage = storage;
	};

	Model.prototype = Object.create(Ctor.prototype, {
		constructor : {
			configurable : true,
			enumerable : true,	
			value : Model,
			writeable : true
		}
	});
	
	Model.prototype.preinitialize = function () {
		console.log(3)
	};

	Model.prototype.testPending = function (str) {
		
		var execute = this.storage.testPending(str)
		
		.then(function(res){
			console.log(res)
		})
		
		.catch(function(er){
			console.error(er)
		});

		// memoize and return on call

		return execute;
	};

	Model.prototype.initialize = function () {
		console.log(4)
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
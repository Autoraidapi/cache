(function (window) {
	
	'use strict';
	
	
	// handles model for the view
	function Controller(model, view) {
		Ctor.call(this, arguments);
		var self = this;
		self.model = model;
		self.view = view;

	}
	Controller.prototype = Object.create(Ctor.prototype, {
		constructor : {
			value : Controller,
			writeable : true,
			configurable : true,
			enumerable : true			
		}
	})
	
	Controller.prototype.preinitialize = function (options) {
		this.options = (options || {});
		console.log(9)
	};	
	
	Controller.prototype.setView = function () {};
	
	Controller.prototype.test = function(str){
		var self = this;
		// returns traceable 

		var x = _.memoize(function(){
			return {
				model : self.model.testPending(str),
				view : self.view.testPending(str)
			}
		})
		console.log(x.prototype)
		x();
	}

	Controller.prototype.initialize = function () {
		console.log(10)
	};
	
	window.app = window.app || {};
	window.app.Controller = Controller;

})(window);

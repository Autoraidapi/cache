/*global qs, qsa, $on, $parent, $delegate */

(function (window) {

	'use strict';

	function View(template) {
		Ctor.call(this);
		this.template = template;
		this.$header = qs('header');
		this.$main = qs('main');
		this.$article = qs('article');
		this.$footer = qs('footer');
	};

	View.prototype = Object.create(Ctor.prototype, {
		constructor : {
			value : View,
			writeable : true,
			configurable : true,
			enumerable : true			
		}
	})
	
	View.prototype.preinitialize = function () {
		console.log(7);
	};

	View.prototype.render = function () {

	};

	View.prototype.bind = function () {

	};
	View.prototype.testPending = function (str) {
		
		var execute = this.template.testPending(str)
		
		.then(function(res){
			console.log(res)
		})
		
		.catch(function(er){
			console.error(er)
		});

		// memoize and return on call

		return execute;
	};
	View.prototype.initialize = function () {
		console.log(8);
	};

	window.app = window.app || {};
	window.app.View = View;

}(window));
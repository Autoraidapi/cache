/*global qs, qsa, $on, $parent, $delegate */

(function (window) {

	'use strict';

	function View(template) {
		Ctor.call(this);
		this.template = template;
		this.$header = qs('header');
		this.$article = qs('article');
		this.$footer = qs('footer');
	}

	View.prototype = Object.create(Ctor.prototype, {
		constructor : {
			value : View,
			writeable : true,
			configurable : true,
			enumerable : true			
		}
	})
	
	View.prototype.preinitialize = function () {
		console.log(7)
	};

	View.prototype.render = function () {

	};

	View.prototype.bind = function () {

	};

	View.prototype.toggleEnvironment = function (className) {

		const main = this.$main;

		if (className === 'dev') {
			if (main.classList.contains('staging')) {
				main.classList.remove('staging');
			}
			if (main.classList.contains('qa')) {
				main.classList.remove('qa');
			}
			main.classList.add('dev');
		} else if (className === 'staging') {
			if (main.classList.contains('dev')) {
				main.classList.remove('dev');
			}
			if (main.classList.contains('qa')) {
				main.classList.remove('qa');
			}
			main.classList.add('staging');
		} else if (className === 'qa') {
			if (main.classList.contains('dev')) {
				main.classList.remove('dev');
			}
			if (main.classList.contains('staging')) {
				main.classList.remove('staging');
			}
			main.classList.add('qa');
		}

	}

	View.prototype.initialize = function () {
		console.log(8)
	};

	window.app = window.app || {};
	window.app.View = View;

}(window));
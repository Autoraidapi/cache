(function (window) {

	'use strict';

	function Template() {
		Ctor.call(this);
	}
	Template.prototype = Object.create(Ctor.prototype, {
		constructor : {
			value : Template,
			writeable : true,
			configurable : true,
			enumerable : true			
		}
	})
	
	Template.prototype.preinitialize = function () {
		console.log(5)
	};
	Template.prototype.testPending = function (str) {
		return new Promise(function(resolve, reject){
			if(str){
				resolve('Template: '+str);
			}
			else {
				reject('not enough arguments');
			}
		});
	};	
	Template.prototype.initialize = function () {
		console.log(6)
	};	
	window.app = window.app || {};
	window.app.Template = Template;

})(window);

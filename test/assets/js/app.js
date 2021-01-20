
(function () {

	'use strict';
	
	function Base(){};

	function Terminal(name) {
		
		this.preinitialize.apply(this,arguments);

		this.storage = new app.Store(name);
		
		this.model = new app.Model(this.storage);
		
		this.template = new app.Template();
		this.view = new app.View(this.template);
		
		this.controller = new app.Controller(this.model, this.view);
		this.initialize.apply(this,arguments);
	}

	Terminal.prototype = Object.create(Base.prototype, {
		constructor : {
			value : Terminal
		}
	});

	Terminal.prototype.preinitialize = function(){
		console.log('BEGIN');
	}
	
	Terminal.prototype.test = function(){
		this.controller.test(arguments[0]);
	}

	Terminal.prototype.initialize = function(){
		console.log('END');
	}	

	window.terminal = new Terminal('sandbox');

	function setView() {
		//terminal.controller.setView();
	}

	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);

})();

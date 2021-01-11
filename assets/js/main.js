define([
	'js/sync',
	'js/model',
	'js/template',
	'js/view',
	'js/controller'
], function(Sync,Model,Template,View,Controller) {
	'use strict';
	function Main(){
		this.preinitialize.apply(this,arguments);
		this.sync = new Sync();
		this.model = new Model(this.sync);
		this.template = new Template();
		this.view = new View(this.template);
		this.controller = new Controller(this.model,this.view);
		this.initialize.apply(this,arguments);
	};

	Main.prototype = Object.create(Ctor.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Main,
			writeable: true
		}
	});

	Main.prototype.preinitialize = function(){}

	Main.prototype.initialize = function(){
		console.log(JSON.stringify(this.valueOf(),null,2))
	}

	return Main;
});
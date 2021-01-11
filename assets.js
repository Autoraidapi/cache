(function (global) {
	global.Ctor = function () {
		this.preinitialize.apply(this, arguments);
		this.initialize.apply(this, arguments);
	};
	
	global.Ctor.prototype.preinitialize = function () {
		/* override */
	};
	global.Ctor.prototype.valueOf = function () {
		return this;
	};	
	global.Ctor.prototype.initialize = function () {
		/* override */
	};	
	requirejs.config({		
		baseUrl: "",
		paths : {
			js : 'assets/js'
		}
	});
	
	requirejs(['js/main'], function(Main){
		window.shell = new Main();
	});

})(this);

(function (global, modules) {
	
	requirejs.config({
		
		baseUrl: "",

		shim: {
			underscore: { exports: "_" },
			backbone: { deps: ["underscore", "jquery"], exports: "Backbone" }
		},

		paths: {
			assets: "assets",
			jquery: "https://assets.codepen.io/jquery.min",
			underscore: "https://assets.codepen.io/underscore.min",
			backbone: "https://assets.codepen.io/backbone.min"
		}
		
	});

	requirejs([], function () {
	
		modules["exports"] = function () {
			return {};
		};

		if (typeof global !== "undefined") {
			global.api = modules.exports();
		}
	
	});
	
})(this, {});

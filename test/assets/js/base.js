(function (factory) {

	var root = this; 

	root.Base = factory(root, {
		Debug : function(){}
	});

})(function (root, Base) {

	var previousBase = root.Base;

	Base.VERSION = '0.0.1';

	Base.noConflict = function () {
		root.Base = previousBase;
		return this;
	};




	return Base;

});
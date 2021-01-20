/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	// do not mix into view
	function Store(name, callback) {
		Ctor.call(this);
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage.getItem(name)) {
			var todos = [];

			localStorage.setItem(name, JSON.stringify(todos));
		}

		callback.call(this, JSON.parse(localStorage.getItem(name)));
	}

	Store.prototype = Object.create(Ctor.prototype, {
		constructor : {
			value : Store,
			writeable : true,
			configurable : true,
			enumerable : true
		}
	});
	
	Store.prototype = {    

        /** @return {string} */
        get name(){
            return this._dbName;
        },
    
        set name(x){
            this._dbName = x;
        }
    };
    	
	Store.prototype.preinitialize = function () {
		console.log(1)
	};

	Store.prototype.testPending = function (str) {
		return new Promise(function(resolve, reject){
			if(str){
				resolve('Store : '+str);
			}
			else {
				reject('not enough arguments');
			}
		});
	};


	Store.prototype.initialize = function () {
		console.log(2)
	};
	
	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
	
})(window);

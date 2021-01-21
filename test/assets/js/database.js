(function (global) {

	function Database(model, id, domain, name, version) {
		this._model = model;
		this._id = id;
		this._domain = domain;
		this._name = name;
		this._version = version;
	}

	Database.prototype = {

		/** @return {string} */
		get id() {
			return this._id;
		},

		/** @return {string} */
		get name() {
			return this._name;
		},

		set name(x) {
			this._name = x;
		},

		/** @return {string} */
		get version() {
			return this._version;
		},

		set version(x) {
			this._version = x;
		},

		/** @return {string} */
		get domain() {
			return this._domain;
		},

		set domain(x) {
			this._domain = x;
		}
	};

	function Generator() {
		this.preinitialize.apply(this, arguments);

		this.initialize.apply(this, arguments);
	};

	Generator.prototype = Object.creaate(Database.prototype, {
		constructor: {
			configurable: true,
			enumerable: true,
			value: Generator,
			writeable: true
		}
	});

	Generator.prototype.preinitialize = function () {

	};

	Generator.prototype.valueOf = function () {

	};

	Generator.prototype.toString = function () {

	};

	Generator.prototype.initialize = function () {

	};

	global.Generator = Generator;

})(this);
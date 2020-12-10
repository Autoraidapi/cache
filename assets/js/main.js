(function(global, modules){
	
	function toArray(args) {
		var array = [], i, length = args.length;
		for (i = 0; i < length; ++i) {
			array[i] = args[i];
		}
		return array;
	}
	
	function splitter(string) {
		return string.split(/\s+/);
	}

	function recurse(array){
		while (array.length > 0 && array[0] === "") {
			array = array.slice(1);
		}
		while (array.length > 0 && array[array.length - 1] === "") {
			array = array.slice(0, array.length - 1);
		}
		return array;
	}
	
  function hop(url, kvs) {
	  var url = url + "?";
	  for (var k in kvs) {
	    var v = kvs[k];
	    url += k + "=" + escape(v);
	  }
	  location = url;
	}	
	
	function feed(array){
		return toArray(array).join(' ');
	}	
	
	var Search = Backbone.Model.extend({
		preinitialize: function () {
			this.worker = new Worker(
				URL.createObjectURL(
					new Blob([document.getElementById("worker").textContent], {
						type: "text/javascript"
					})
				)
			);
		},
	
		initialize: function () {
			this.worker.addEventListener("message", this.message.bind(this), true);
		},
	
		defaults: {
			title: ""
		},
	
		sync: Backbone.localforage.sync("task"),
	
		post: function (message) {
			this.worker.postMessage(message);
		},
	
		close: function () {
			this.worker.terminate();
		},
	
		message: function (event) {
			alert(event.data.value);
		}	
	});
	
	var Model = Backbone.Model.extend({
		defaults : {
			title : ''
		},
		sync : Backbone.localforage.sync('model')
	});
	
	var Collection = Backbone.Collection.extend({
		model : Model,
		sync : Backbone.localforage.sync('collection')
	});
	
	var Form = Backbone.View.extend({
		model : new Search(),
		events : {
			'submit' : 'handler'
		},
		handler : function(event){
			var tokens = splitter(event.target.search.value);
			var array = recurse(tokens);
			var wrapper = this[_.first(tokens)];
			wrapper.apply(this, _.rest(array));
			event.preventDefault();
			event.target.reset();
		},
		wiki : function(){    
			hop("https://en.wikipedia.org/wiki/Special:Search", {
        search: feed(arguments)
      });
		},
		wolf : function(){
			hop("https://www.wolframalpha.com/input", {
        i: feed(arguments)
      });			
		},
		google : function(){
			hop("https://www.google.ca/search", {
        q : feed(arguments)
      });			
		},
		npm : function(){			   
			hop("https://www.npmjs.com/search", {
        q: feed(arguments)
      });
		},
    y_s: function () {
      hop("https://www.youtube.com/results", {
        search_query: feed(arguments)
      });
    },
    y_w: function () {
      hop("https://www.youtube.com/watch", {
        v: feed(arguments)
      });
    },	
		
    github: function () {
      hop("https://github.com/search", {
        q: feed(arguments)
      });
    },
		
		// Needs Work
    /* *** github() *** */
    gitzip: function () {
			var check = confirm('download zip?');
			if(check){
				window.open('https://github.com/'+feed(arguments)+'/archive/main.zip');
			}
    },
		
    debug: function () {
      hop("https://cdpn.io/RJLeyra/debug/" + toArray(arguments));
    },
    bug: function () {
      window.open(
        "https://cdpn.io/RJLeyra/debug/" + toArray(arguments),
        "_window" + Date.now(),
        "height=400,width=600"
      );
    },
    pen: function () {
      hop("https://codepen.io/search/pens", {
        q: feed(arguments)
      });
    },
    mdn: function () {
      hop("https://developer.mozilla.org/en-US/search", {
        q: feed(arguments)
      });
    },
		search : function(){
			window.location.hash = '#search/'.concat( feed(arguments) );
		}
	});
	
	var Container = Backbone.View.extend({
		
		el : $('#main'),

		initialize : function(){
			
			this.$form = this.$('#form');
			this.form = new Form({ el : this.$form });
			
			this.listenTo(this.collection, 'all', _.debounce(this.render, 0));
			
			this.collection.reset([{ title: "0" }, { title: "1" }, { title: "2" }]);
		
		},
		
		render : function(){}
		
	});
	
	var Router = Backbone.Router.extend({
		routes : {
			'' : '',
			//'*filter' : 'filter'
			'search(/:id)(/:src)' : 'search'
		},
		initialize : function(){
			this.collection = new Collection();
			this.container = new Container({ collection : this.collection });
			Backbone.history.start();
		},
		filter : function(url){
			console.log('FILTER');
			console.log(url);
		},
		search : function(id, src){		
			if(id){console.log(id);}
			if(src){console.log(src);}
		}
	});
	
	
	modules['exports'] = function(){
		return {
			
		}
	}
	
	if(typeof global !== 'undefined'){
		global.router = new Router();
	}
	
})(this, {});

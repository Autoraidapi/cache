function toArray(args) {
	var array = [], i, length = args.length; 
	for (i = 0; i < length; ++i) {	
		array[i] = args[i];		
	}
	return array;	
}

function feed(array) {
	return toArray(array).join(" ");
}

var consoleAlias = console.log;

function log() {
	consoleAlias.apply(console, arguments);
	const fragment = document.createDocumentFragment();
	const code = document.createElement('code');
	const node = document.querySelector("article pre");
    code.appendChild(document.createTextNode(feed(arguments)));	
    fragment.appendChild(document.createElement('br'));
	fragment.appendChild(code);
	node.insertBefore(fragment, node.childNodes[0]);
}

console.log = log;

window.app = window.app || {};

function loadScripts(){
    function success(){
        console.log(this);
    }
    function error(){
        console.log(this);
    }
    function load(src, onload, onerror){
        var script = document.createElement('script');
        script.onload = onload;
        script.onerror = onerror || onload;
        script.src = src;
        return document.head.appendChild(script);
    }
    [].slice.call(arguments).forEach(function(x){
        load(x, success, error);
    });
}

function Node(value) {
    this.value = value;
    this.next = null;
};

function Linked(){
    this.head = null;
    this.tail = null;
    this.length = 0;
};

Linked.prototype = {
    push : function(val){
		var newNode = new Node(val);
		if (!this.head) {
			this.head = newNode;
			this.tail = this.head;
		} else {
			this.tail.next = newNode;
			this.tail = newNode;
		}
		this.length++;
		return this;        
    },

    pop : function(){

        if (!this.head) return undefined;

        var current = this.head;
        var newTail = current;
    
        while (current.next) {
            newTail = current;
            current = current.next;
        }

        this.tail = newTail;
        this.tail.next = null;

        this.length--;

        if (this.length === 0) {
            this.head = null;
            this.tail = null;
        }

        return current;    
    
    },

    print : function(){
		var arr = [];
		var current = this.head;
		while (current) {
			arr.push(current.value);
			current = current.next;
		}
		return arr;  
    }
};
function printReverse(arr){
	for(var i = arr.length - 1; i >= 0; i--){
		loadScripts(arr[i]);
	}
}

var order = new Linked();
order.push('assets/js/app.js');
order.push('assets/js/controller.js');
order.push('assets/js/view.js');
order.push('assets/js/template.js');
order.push('assets/js/model.js');
order.push('assets/js/store.js');


printReverse(order.print());

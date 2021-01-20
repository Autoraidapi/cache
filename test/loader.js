function isBase64(input) {
    if (/^data:[^;]+;base64,/.test(input)) return true;
    return false;
};

function encodeString(string) {
    return 'data:application/octet-stream;base64,'.concat(btoa(string));
};

function base64ToUint8(url) {
    var dataView;
    if (isBase64(url)) {
        var data = atob(url.split(',')[1]);
        dataView = new Uint8Array(data.length);
        var i, length = data.length;
        for (i = 0; i < length; ++i) {
            dataView[i] = data.charCodeAt(i);
            console.log(dataView[i]);
        }
    }
    return dataView;
}

function testUint8(string){
	base64ToUint8(encodeString(string));
}

(function(global) {
    function toSource(func) { if (func != null) { try { return Function.prototype.toString.call(func); } catch (e) {} try { return func + ""; } catch (e) {} } return ""; }
    function toProps(obj) { var resultSet = {}; for (var o = obj; o; o = o.__proto__) { try { var names = Object.getOwnPropertyNames(o); for (var i = 0; i < names.length; ++i) resultSet[names[i]] = "[" + typeof obj[names[i]] + "]"; } catch (e) {} } return JSON.stringify(resultSet, null, 2); }
    function data(options) { options = options || {}; var prefix = '<data class="'; var suffix = '" value="' + options.value.length + '">'; var tail = "</data>"; return prefix .concat(options.class) .concat(suffix) .concat(options.value) .concat(tail); }
    global.evaluator = function(string) {  
      var result;    
      try {
        result = eval.call(this, string);
        if (typeof result == "function" || false) { result = data({ class: "function", value: toSource(result) }); } 
        else if (!!(result && result.test && result.exec && (result.ignoreCase || result.ignoreCase === false))) { result = data({ class: "regexp", value: new RegExp(result).toString() }); } 
        else if (!!(result && result.getTimezoneOffset && result.setUTCFullYear)) { result = data({ class: "date", value: "".concat(result) }); } 
        else if (typeof result === "object" || false) { result = data({ class: "object", value: toProps(result) }); } 
        else if (!!(result === "" || (result && result.charCodeAt && result.substr))) { result = data({ class: "string", value: "".concat(result) }); } 
        else if (!!(result === 0 || (result && result.toExponential && result.toFixed))) { result = data({ class: "number", value: "".concat(result) }); } 
        else if (result === true || result === false) { result = data({ class: "boolean", value: "".concat(result) }); } 
        else if (result === void 0) { result = data({ class: "undefined", value: "".concat(result) }); } 
        else if (result === null) { result = data({ class: "null", value: "".concat(result) }); } 
      }     
      catch (er) { 
        if (er instanceof TypeError) { result = data({ class: "type-error", value: "[[ Type ".concat("]] ", er.message) }).concat(er.message); } 
        else if (er instanceof SyntaxError) { result = data({ class: "syntax-error", value: "[[ Syntax ".concat("]] ") }).concat(er.message); } 
        else if (er instanceof ReferenceError) { result = data({ class: "reference-error", value: "[[ Reference ".concat("]] ") }).concat(er.message); } 
        else if (er instanceof RangeError) { result = data({ class: "range-error", value: "[[ Range ".concat("]] ") }).concat(er.message); } 
        else if (er instanceof EvalError) { result = data({ class: "eval-error", value: "[[ Eval ".concat("]] ") }).concat(er.message); } 
        else { result = String(er.stack).replace(/\\"/g, '"').replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); } 
      }    
      finally {    
        return result;      
      }    
    };    
})(this);

function toArray(args) {
    var array = [],
        i, length = args.length;
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

function executeCode() {
    const js = document.getElementById('js');
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = js.innerHTML;
    js.parentNode.insertBefore(script, js);
    js.parentNode.removeChild(script);
}

(function () {
    const ids = ["btnStart", "btnStop", "main"];

    ids.forEach(function (id) {
        window[id] = document.getElementById(id);
    });

    const taskrunner = {
        start: function () {
            // if the timerId exists, dont start another one
            if (this.timerId) {
                console.log("already running\n");
                return false;
            }
            // if timerId does not exist, start the interval
            else {
                this.timerId = setInterval(function () {
                    executeCode();
                    document.getElementById("logDisplay").innerHTML = new Date();

                }, 1000);
            }
        },
        stop: function () {
            clearInterval(this.timerId);
            console.log("taskrunner may have stopped\n");
            // clear the timerId so it can start again
            this.timerId = "";
        }
    };

    btnStart.addEventListener("click", function () {
        this.disabled = true;
        btnStop.disabled = false;
        taskrunner.start();
    });

    btnStop.addEventListener("click", function () {
        this.disabled = true;
        btnStart.disabled = false;
        taskrunner.stop();
    });


})();

/*
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

//var order = new Linked();
//order.push('assets/js/app.js');
//order.push('assets/js/controller.js');
//order.push('assets/js/view.js');
//order.push('assets/js/template.js');
//order.push('assets/js/model.js');
//order.push('assets/js/store.js');


//printReverse(order.print());
*/
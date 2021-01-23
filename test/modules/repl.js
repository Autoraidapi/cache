const main = document.getElementById('main');
const plugins = {};

(function (fragment) {

    function Mode() {
        this.isActive = false;
    };

    Mode.prototype = {
        on: function () {
            this.isActive = true;
            debug.log(this, 'mode is on', 1);
            return this;
        },
        off: function () {
            this.isActive = false;
            debug.log(this, 'mode is off', 1);
            return this;
        },
        check: function () {
            return this.isActive;
        },
        toggle: function () {
            return this.check() ? this.off() : this.on();
        }
    };

    const mode = new Mode();

    var parent, child, io;

    // listen for events [ keyup,  input, change, keypress, keydown, blur, focus ]
    function listen(object, events) {
        for (var event in events) {
            object.addEventListener(event, events[event], false);
        }
    }

    // better to use if only listening to 1 event 
    function on(target, event, listener) {
        return target.addEventListener(event, listener);
    }

    function off(target, event) {
        return target.removeEventListener(event, null);
    }

    function element(target, element, options) {
        options = (options || {});
        parent = document.createElement(element);
        if (options.class) {
            parent.className = options.class;
        }
        if (options.text) {
            child = document.createTextNode(options.text);
            parent.appendChild(child);
        } else if (options.html) {
            parent.innerHTML = options.html;
        }
        return target.appendChild(parent);
    }

    function input() {
        parent = element(fragment, 'ul', {
            class: 'prompt'
        });
        child = element(parent, 'li', {
            class: 'list'
        });
        io = element(child, 'input');
        on(io, 'keyup', handler);
        main.appendChild(fragment);
        if (document.querySelectorAll('input').length > 1) {
            io.focus();
        }
    }

    function info(string) {
        parent = element(fragment, 'ul', {
            class: 'info'
        });
        child = element(parent, 'li', {
            class: 'list'
        });
        io = element(child, 'pre', {
            text: string
        });
        main.appendChild(fragment);
    }

    function output(string) {
        parent = element(fragment, 'ul', {
            class: 'out'
        });
        child = element(parent, 'li', {
            class: 'list'
        });
        io = element(child, 'pre', {
            html: string
        });
        main.appendChild(fragment);
        input();
    }

    /* decouple the dom event */
    function handler(event) {

        const key = event.which;
        const value = event.target.value;

        if (key === 13 && value === 'clear') {
            main.innerHTML = '';
            input();
            return document.querySelector('input').focus();
        } else if (key === 13 && value === 'open') {
            event.target.value = '';
            window.open(location, 'X-WINDOW'.concat(Date.now()), 'height=400, width=600');
            return;
        } else if (key === 13 && value === 'exit') {
            return window.close(this);
        } else if (key === 13 && value === 'switch') {
            event.target.style.opacity = 0.5;
            event.target.disabled = true;
            mode.toggle();
            info(mode.check().toString());
            input();
            return document.querySelector('input').focus();
        } else if (key === 13 && value.indexOf('$') > -1) {
            event.target.style.opacity = 0.5;
            event.target.disabled = true;
            reparse(value.substring(2));
            input();
            return document.querySelector('input').focus();
        } else {
            switch (key) {

                case 13:
                    event.target.disabled = true;
                    event.target.style.opacity = 0.5;
                    output(evaluator(value));
                    off(event.target, 'keyup');
                    break;

                case 27:
                    event.target.blur();
                    break;
            }
        }
    }

    /* Evaluator & Utilities */
    function escaped(value) {
        return String(value)
            .replace(/\\"/g, '"')
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
    }

    function isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function toSource(func) {
        if (func != null) {
            try {
                return Function.prototype.toString.call(func);
            } catch (e) {}
            try {
                return (func + '');
            } catch (e) {}
        }
        return '';
    }

    function isRegExp(obj) {
        return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
    }

    function isDate(obj) {
        return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
    }

    function isObject(obj) {
        return obj === Object(obj);
    }

    function isString(obj) {
        return !!(obj === "" || (obj && obj.charCodeAt && obj.substr));
    }

    function isBoolean(obj) {
        return obj === true || obj === false;
    }

    function isNumber(obj) {
        return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
    }

    function isNull(obj) {
        return obj === null;
    }

    function isUndefined(obj) {
        return obj === void 0;
    }

    function parse(string) {
        if (isString(string)) {
            return string.split(/\s+/);
        } else {
            throw new Error('not a string');
        }
    }

    function proc(array) {
        while (array.length > 0 && array[0] === "") {
            array = array.slice(1);
        }
        while (array.length > 0 && array[array.length - 1] === "") {
            array = array.slice(0, array.length - 1);
        }
        return array;
    }

    function reparse(string) {
        var tokens = parse(string);
        var array = proc(tokens);
        var last = null,
            i,
            len = array.length;
        for (i = 0; i < len; ++i) {
            var callback = array.slice(0, i + 1).join("_");
            var parm = array.slice(0);
            if (plugins[callback] == undefined) {
                break;
            } else {
                last = i;
            }
        }
        if (last === null || array.length == 0) {
            alert('No such command "' + array[0] + '"');
            return;
        }
        var callback = array.slice(0, last + 1).join("_");
        var wrapper = plugins[callback];
        var restArguments = array.slice(last + 1);
        wrapper.apply(this, restArguments);
    }

    function span(options) {
        options = options || {};
        const prefix = '<span class="';
        const suffix = '">';
        const tail = "</span>";
        return prefix
            .concat(options.class)
            .concat(suffix)
            .concat(options.value)
            .concat(tail);
    }

    function evaluator(string) {
        
        var result;
        
        try {

            result = eval.call(this, string);

            if (isFunction(result)) {
                result = span({
                    class : 'function',
                    value : toSource(result)
                });
            }

            else if (isRegExp(result)) {
                result = span({
                    class : 'regexp',
                    value : new RegExp(result).toString()
                });
            }

            else if (isDate(result)) {
                result = spanc({
                    class : 'date',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isObject(result)) {
                result = span({
                    class : 'object',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isString(result)) {
                result = span({
                    class : 'string',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isNumber(result)) {
                result = span({
                    class : 'number',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isBoolean(result)) {
                result = span({
                    class : 'boolean',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isUndefined(result)) {
                result = span({
                    class : 'undefined',
                    value : ''.concat(result, '')
                });
            } 
            
            else if (isNull(result)) {
                result = span({
                    class : 'null',
                    value : ''.concat(result, '')
                })
            }
            
        }

        catch (er) {
            if (er instanceof TypeError) {
                result = span({
                    class: 'type-error',
                    value: '[[ Type '.concat(']] ', er.message)
                }).concat(er.message);
            } else if (er instanceof SyntaxError) {
                result = span({
                    class: 'syntax-error',
                    value: '[[ Syntax '.concat(']] ')
                }).concat(er.message);
            } else if (er instanceof ReferenceError) {
                result = span({
                    class: 'reference-error',
                    value: '[[ Reference '.concat(']] ')
                }).concat(er.message);
            } else if (er instanceof RangeError) {
                result = span({
                    class: 'range-error',
                    value: '[[ Range '.concat(']] ')
                }).concat(er.message);
            } else if (er instanceof EvalError) {
                result = span({
                    class: 'eval-error',
                    value: '[[ Eval '.concat(']] ')
                }).concat(er.message);
            } else {
                result = escaped(er.stack);
            }
        } finally {
            return result;
        }

    }

    setTimeout(input, 0);

})(new DocumentFragment());

const store = localforage.createInstance({
    name: "store"
});

plugins.loadScripts = function () {
    function scriptNode(src, onload, onerror) {
        var script = document.createElement('script');
        script.src = 'https://assets.codepen.io/1674766/' + src + '.js';
        script.onload = onload;
        script.onerror = onerror || onload;
        return document.head.appendChild(script);
    }

    function scriptLoad() {}

    function scriptError() {}
    [].slice.call(arguments).forEach(function (string) {
        scriptNode(string, scriptLoad, scriptError);
    });
}

function keys(obj) {
    return JSON.stringify(Object.keys(obj), null, 2);
}

plugins.loadScripts('bson.browser.umd');

function toArray(args) {
    var arr = [],
        i,
        len = args.length;
    for (i = 0; i < len; ++i) {
        arr[i] = args[i];
    }
    return arr;
}

plugins.test = function () {
    return alert(toArray(arguments).join(' '));
}

plugins.keys = function () {
    return JSON.stringify(Object.keys(this), null, 2);
};

plugins.cache = [];

plugins.drain = function () {
    while (plugins.cache.length) {
        plugins.cache.pop();
    }
}

plugins.execute = function () {
    const module = document.getElementById('module');
    const script = document.createElement('script');

    function blobToSource(string) {
        return URL.createObjectURL(
            new Blob([string], {
                type: 'text/javascript;charset=UTF-8'
            })
        );
    }
    script.src = blobToSource(toArray(arguments).join(' '));
    module.insertBefore(script, module.childNodes[0]);
    module.removeChild(script);
}

plugins.register = function () {
    navigator.registerProtocolHandler(
        "web+repl",
        "https://cdpn.io/RJLeyra/debug/ppdGLa/?repl=%s",
        "Repl handler"
    );
};

plugins.unregister = function () {
    navigator.unregisterProtocolHandler(
        "web+repl",
        "https://cdpn.io/RJLeyra/debug/ppdGLa/?repl=%s"
    );
};

plugins.check = function () {
    if ('isProtocolHandlerRegistered' in navigator) {
        alert(navigator.isProtocolHandlerRegistered(
            "web+repl",
            "https://cdpn.io/RJLeyra/debug/ppdGLa/?repl=%s"
        ));
    } else {
        return false;
    }
};

plugins.pending = function (string) {
    return new Promise(function (resolve, reject) {
        if (string) {
            resolve(string);
        } else {
            reject('');
        }
    });
}
/* 
plugins.pending('location.origin').then(function(result){  
	console.log(debug.log(this, ''.concat(eval(result)), 1));
}).catch(function(er){
	console.log(debug.log(this, 'Mode is off @ '.concat(eval(er)), 3));
});
*/
document.addEventListener('DOMContentLoaded', function (event) {

}, false);

window.addEventListener('hashchange', function (event) {

}, false)

window.addEventListener('load', function () {
    if ('isProtocolHandlerRegistered' in navigator) {

    }
}, false);
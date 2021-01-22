(function (global) {
    
    function Ctor(){
        this.preinitialize.apply(this,arguments);
        this.initialize.apply(this,arguments);
    };
    
    Ctor.prototype.preinitialize = function(){
        /* Override */
    };
    
    Ctor.prototype.valueOf = function(){
            return this;
    };
    
    Ctor.prototype.initialize = function(){
        /* Override */
    };

    function _(object) {
        if (object instanceof _) return object;
        if (!(this instanceof _)) return new _(object);
    }

    global.Ctor = Ctor;
    global._ = _;
    
    var ObjProto = Object.prototype;
    var hasOwn = ObjProto.hasOwnProperty;

    var has = function (object, key) {
        return object != null && hasOwn.call(object, key);
    };

    var identity = function (object) {
        return object;
    };

    _.memoize = function (callback, address) {
        var cache = {},
            key;
        address || (address = identity);
        return function () {
            key = address.apply(this, arguments);
            return has(cache, key) ? cache[key] : (cache[key] = callback.apply(this, arguments));
        };
    };

    _.defaults = function (object) {
        if (!object) {
            return object;
        }
        for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
            var iterable = arguments[argsIndex];
            if (iterable) {
                for (var key in iterable) {
                    if (object[key] == null) {
                        object[key] = iterable[key];
                    }
                }
            }
        }
        return object;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function (text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data, _);
        var template = function (data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;

    };

    _.prototype.valueOf = function () {
        return this;
    };

}.call(this));
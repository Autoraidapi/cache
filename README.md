# Cache

## Description

This is a deprecated api. Undesirable side effects may occur.

## Constructor

instance methods apply directly to the constructor, to benefit from this requires some trust

```javascript
function Constructor(){
    preinitialize.apply(this, arguments);
    initialize.apply(this, arguments);
};
```

serialization of circular references is possible if prototype methods are shared with a constructor function

```javascript
Constructor.prototype.valueOf = function(){
    return this;
};
function Sync(){};
Sync.prototype = Object.create(Constructor.prototype, {
    constructor : {
        configurable : true,
        enumerable : true, // 
        value : Sync,
        writeable : true
    }
});
var test = new Sync();
// test.constructor  Sync
// test.prototype  {}
```

### Control Flow Test

A console log proxy has been added to log messages to the Document.

- Store

instance method `testPending`

- Model

instance method `testPending` call to Store.testPending.then

- Template

instance method `testPending`

- View

instance method `testPending` call to Template.testPending.then

- Controller

instance method `test` resolves `Model.testPending` and `View.testPending` using Memoized `IIFE` which returns an object


- Main

instance method `test` linked to controller

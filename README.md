# Cache

## Description

This is a deprecated api. Undesirable side effects may occur.

How to serialize circular references for a json snapshot.

## Constructor

composition of instance methods apply directly to the constructor

```javascript
function Ctor(){
    preinitialize.apply(this, arguments);
    initialize.apply(this, arguments);
};
```

setup for serialization

```javascript
Ctor.prototype.valueOf = function(){
    return this;
};

function Sync(name){
    // Ctor.call(this); name  
    this.name = name;
};
Sync.prototype = Object.create(Ctor.prototype, {
    constructor : {
        configurable : true,
        enumerable : true, // 
        value : Sync,
        writeable : true
    }
});

function Model(sync){
    this.sync = sync;
};
Model.prototype = Object.create(Ctor.prototype, {
    constructor : {
        configurable : true,
        enumerable : true, // 
        value : Model,
        writeable : true
    }
});

function Controller(model){
    var self = this;
    // model shares this with view
    self.model = model;
};
Controller.prototype = Object.create(Ctor.prototype, {
    constructor : {
        configurable : true,
        enumerable : true, // 
        value : Controller,
        writeable : true
    }
});
```

application instance, circular references will serialize to JSON

```javascript
function Main(name){
    this.sync= new Sync(name);
    this.model = new Model(this.sync);
    this.controller = new Controller(this.model);
};
Main.prototype = Object.create(Ctor.prototype, {
    constructor : {
        configurable : true,
        enumerable : true, // 
        value : Main,
        writeable : true
    }
});

window.app = new Main('App');

console.log(JSON.stringify(app.valueOf(),null,2));

{
  "sync": {
    "name": "App"
  },
  "model": {
    "sync": {
      "name": "App"
    }
  },
  "controller": {
    "model": {
      "sync": {
        "name": "App"
      }
    }
  }
}
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

---

Next, deriving specific properties and serializing the rest for a whole image.



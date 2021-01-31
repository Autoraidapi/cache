
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({

    1 : [function(_dereq_,module,exports){ (function (global){
            'use strict';      
            var Mutation = global.MutationObserver || global.WebKitMutationObserver; var scheduleDrain;    
            {
                if (Mutation) { var called = 0; var observer = new Mutation(nextTick); var element = global.document.createTextNode(''); observer.observe(element, { characterData: true }); scheduleDrain = function () { element.data = (called = ++called % 2); }; } 
                else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') { var channel = new global.MessageChannel(); channel.port1.onmessage = nextTick; scheduleDrain = function () { channel.port2.postMessage(0); }; } 
                else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) { scheduleDrain = function () { var scriptEl = global.document.createElement('script'); scriptEl.onreadystatechange = function () { nextTick();     scriptEl.onreadystatechange = null; scriptEl.parentNode.removeChild(scriptEl); scriptEl = null; }; global.document.documentElement.appendChild(scriptEl); }; } 
                else { scheduleDrain = function () { setTimeout(nextTick, 0); }; }
            }    
            var draining; var queue = [];    
            function nextTick() { draining = true; var i, oldQueue; var len = queue.length; while (len) { oldQueue = queue; queue = []; i = -1; while (++i < len) { oldQueue[i](); } len = queue.length; } draining = false; } 
            module.exports = immediate; function immediate(task) { if (queue.push(task) === 1 && !draining) { scheduleDrain(); } }    
        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})},{}
    ],
 
    2:[function(_dereq_,module,exports){        
        'use strict';    
		var immediate = _dereq_(1);        
        function INTERNAL() {}  var handlers = {};  var REJECTED = ['REJECTED']; var FULFILLED = ['FULFILLED']; var PENDING = ['PENDING'];        
        module.exports = Promise;        
        function Promise(resolver) { if (typeof resolver !== 'function') { throw new TypeError('resolver must be a function'); } this.state = PENDING; this.queue = []; this.outcome = void 0; if (resolver !== INTERNAL) { safelyResolveThenable(this, resolver); } }     
        Promise.prototype["catch"] = function (onRejected) { return this.then(null, onRejected); };    
        Promise.prototype.then = function (onFulfilled, onRejected) { if (typeof onFulfilled !== 'function' && this.state === FULFILLED || typeof onRejected !== 'function' && this.state === REJECTED) { return this; } var promise = new this.constructor(INTERNAL); if (this.state !== PENDING) { var resolver = this.state === FULFILLED ? onFulfilled : onRejected; unwrap(promise, resolver, this.outcome); } else { this.queue.push(new QueueItem(promise, onFulfilled, onRejected)); }  return promise; }; 
		function QueueItem(promise, onFulfilled, onRejected) { this.promise = promise; if (typeof onFulfilled === 'function') { this.onFulfilled = onFulfilled; this.callFulfilled = this.otherCallFulfilled; } if (typeof onRejected === 'function') { this.onRejected = onRejected; this.callRejected = this.otherCallRejected; } } 
		QueueItem.prototype.callFulfilled = function (value) { handlers.resolve(this.promise, value); };    
        QueueItem.prototype.otherCallFulfilled = function (value) { unwrap(this.promise, this.onFulfilled, value); };    
        QueueItem.prototype.callRejected = function (value) { handlers.reject(this.promise, value); };    
        QueueItem.prototype.otherCallRejected = function (value) { unwrap(this.promise, this.onRejected, value); };    
        function unwrap(promise, func, value) { immediate(function () { var returnValue; try { returnValue = func(value); } catch (e) { return handlers.reject(promise, e); } if (returnValue === promise) { handlers.reject(promise, new TypeError('Cannot resolve promise with itself')); } else { handlers.resolve(promise, returnValue); } }); }        
        handlers.resolve = function (self, value) { var result = tryCatch(getThen, value); if (result.status === 'error') { return handlers.reject(self, result.value); } var thenable = result.value;  if (thenable) { safelyResolveThenable(self, thenable); } else { self.state = FULFILLED; self.outcome = value; var i = -1; var len = self.queue.length; while (++i < len) { self.queue[i].callFulfilled(value); } } return self; }; handlers.reject = function (self, error) { self.state = REJECTED; self.outcome = error; var i = -1; var len = self.queue.length; while (++i < len) { self.queue[i].callRejected(error); } return self; };    
        function getThen(obj) { var then = obj && obj.then; if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') { return function appyThen() { then.apply(obj, arguments); }; } }        
        function safelyResolveThenable(self, thenable) { var called = false; function onError(value) { if (called) { return; } called = true; handlers.reject(self, value); }  function onSuccess(value) { if (called) { return; } called = true; handlers.resolve(self, value); }  function tryToUnwrap() { thenable(onSuccess, onError); }  var result = tryCatch(tryToUnwrap); if (result.status === 'error') { onError(result.value); } }        
        function tryCatch(func, value) { var out = {}; try { out.value = func(value); out.status = 'success'; } catch (e) { out.status = 'error'; out.value = e; } return out; }     
        Promise.resolve = resolve;    
        function resolve(value) { if (value instanceof this) { return value; } return handlers.resolve(new this(INTERNAL), value); }        
        Promise.reject = reject;    
        function reject(reason) { var promise = new this(INTERNAL); return handlers.reject(promise, reason); }        
        Promise.all = all;    
        function all(iterable) { var self = this; if (Object.prototype.toString.call(iterable) !== '[object Array]') { return this.reject(new TypeError('must be an array')); }  var len = iterable.length; var called = false; if (!len) { return this.resolve([]); }  var values = new Array(len); var resolved = 0; var i = -1; var promise = new this(INTERNAL);  while (++i < len) { allResolver(iterable[i], i); } return promise; function allResolver(value, i) { self.resolve(value).then(resolveFromAll, function (error) { if (!called) { called = true; handlers.reject(promise, error); } });     
        function resolveFromAll(outValue) { values[i] = outValue; if (++resolved === len && !called) { called = true; handlers.resolve(promise, values); } } } }        
        Promise.race = race;        
        function race(iterable) { var self = this; if (Object.prototype.toString.call(iterable) !== '[object Array]') { return this.reject(new TypeError('must be an array')); }  var len = iterable.length; var called = false; if (!len) { return this.resolve([]); }  var i = -1; var promise = new this(INTERNAL);  while (++i < len) { resolver(iterable[i]); } return promise; function resolver(value) { self.resolve(value).then(function (response) { if (!called) { called = true; handlers.resolve(promise, response); } }, function (error) { if (!called) { called = true; handlers.reject(promise, error); } }); } } },{"1":1}
    ],

    3:[function(_dereq_,module,exports){ (function (global){ 'use strict'; if (typeof global.Promise !== 'function') { global.Promise = _dereq_(2); } }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}) },{"2":2}],
    4:[function(_dereq_,module,exports){

        'use strict';
    
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };    
    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }    
    function getIDB() { try { if (typeof indexedDB !== 'undefined') { return indexedDB; } if (typeof webkitIndexedDB !== 'undefined') { return webkitIndexedDB; } if (typeof mozIndexedDB !== 'undefined') { return mozIndexedDB; } if (typeof OIndexedDB !== 'undefined') { return OIndexedDB; } if (typeof msIndexedDB !== 'undefined') { return msIndexedDB; } } catch (e) { return; } } 
    var idb = getIDB();    
    function isIndexedDBValid() { try { if (!idb) { return false; } var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform); var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1; return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' && typeof IDBKeyRange !== 'undefined'; } catch (e) { return false; } }    
    function createBlob(parts, properties) {  parts = parts || []; properties = properties || {}; try { return new Blob(parts, properties); } catch (e) { if (e.name !== 'TypeError') { throw e; } var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder; var builder = new Builder(); for (var i = 0; i < parts.length; i += 1) { builder.append(parts[i]); } return builder.getBlob(properties.type); } }    
    if (typeof Promise === 'undefined') { _dereq_(3); };
    var Promise$1 = Promise;    
    function executeCallback(promise, callback) { if (callback) { promise.then(function (result) { callback(null, result); }, function (error) { callback(error); }); } }    
    function executeTwoCallbacks(promise, callback, errorCallback) { if (typeof callback === 'function') { promise.then(callback); }     if (typeof errorCallback === 'function') { promise["catch"](errorCallback); } }    
    function normalizeKey(key) { if (typeof key !== 'string') { console.warn(key + ' used as a key, but it is not a string.'); key = String(key); }  return key; }    
    function getCallback() { if (arguments.length && typeof arguments[arguments.length - 1] === 'function') { return arguments[arguments.length - 1]; } }    
    
    var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
    var supportsBlobs = void 0;
    var dbContexts = {};
    var toString = Object.prototype.toString;
    
    var READ_ONLY = 'readonly';
    var READ_WRITE = 'readwrite';
    
    function _binStringToArrayBuffer(bin) { var length = bin.length; var buf = new ArrayBuffer(length); var arr = new Uint8Array(buf); for (var i = 0; i < length; i++) { arr[i] = bin.charCodeAt(i); } return buf; }
    function _checkBlobSupportWithoutCaching(idb) { return new Promise$1(function (resolve) { var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE); var blob = createBlob(['']); txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key'); txn.onabort = function (e) { e.preventDefault(); e.stopPropagation(); resolve(false); }; txn.oncomplete = function () { var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/); var matchedEdge = navigator.userAgent.match(/Edge\//); resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43); }; })["catch"](function () { return false;  }); }    
    function _checkBlobSupport(idb) { if (typeof supportsBlobs === 'boolean') { return Promise$1.resolve(supportsBlobs); } return _checkBlobSupportWithoutCaching(idb).then(function (value) { supportsBlobs = value; return supportsBlobs; }); }    
    function _deferReadiness(dbInfo) { var dbContext = dbContexts[dbInfo.name];  var deferredOperation = {};  deferredOperation.promise = new Promise$1(function (resolve, reject) { deferredOperation.resolve = resolve; deferredOperation.reject = reject; });  dbContext.deferredOperations.push(deferredOperation); if (!dbContext.dbReady) { dbContext.dbReady = deferredOperation.promise; } else { dbContext.dbReady = dbContext.dbReady.then(function () { return deferredOperation.promise; }); } }    
    function _advanceReadiness(dbInfo) { var dbContext = dbContexts[dbInfo.name]; var deferredOperation = dbContext.deferredOperations.pop(); if (deferredOperation) { deferredOperation.resolve(); return deferredOperation.promise; } }    
    function _rejectReadiness(dbInfo, err) { var dbContext = dbContexts[dbInfo.name]; var deferredOperation = dbContext.deferredOperations.pop(); if (deferredOperation) { deferredOperation.reject(err); return deferredOperation.promise; } }    
    function _getConnection(dbInfo, upgradeNeeded) { return new Promise$1(function (resolve, reject) { dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();  if (dbInfo.db) { if (upgradeNeeded) { _deferReadiness(dbInfo); dbInfo.db.close(); } else { return resolve(dbInfo.db); } }  var dbArgs = [dbInfo.name];  if (upgradeNeeded) { dbArgs.push(dbInfo.version); }  var openreq = idb.open.apply(idb, dbArgs);  if (upgradeNeeded) { openreq.onupgradeneeded = function (e) { var db = openreq.result; try { db.createObjectStore(dbInfo.storeName); if (e.oldVersion <= 1) { db.createObjectStore(DETECT_BLOB_SUPPORT_STORE); } } catch (ex) { if (ex.name === 'ConstraintError') { console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.'); } else { throw ex; } } }; }  openreq.onerror = function (e) { e.preventDefault(); reject(openreq.error); };  openreq.onsuccess = function () { resolve(openreq.result); _advanceReadiness(dbInfo); }; }); } 
    function _getOriginalConnection(dbInfo) { return _getConnection(dbInfo, false); }    
    function _getUpgradedConnection(dbInfo) { return _getConnection(dbInfo, true); } 
    function _isUpgradeNeeded(dbInfo, defaultVersion) { if (!dbInfo.db) { return true; }  var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName); var isDowngrade = dbInfo.version < dbInfo.db.version; var isUpgrade = dbInfo.version > dbInfo.db.version;  if (isDowngrade) { if (dbInfo.version !== defaultVersion) { console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.'); } dbInfo.version = dbInfo.db.version; }  if (isUpgrade || isNewStore) { if (isNewStore) { var incVersion = dbInfo.db.version + 1; if (incVersion > dbInfo.version) { dbInfo.version = incVersion; } }  return true; }  return false; }    
    function _encodeBlob(blob) { return new Promise$1(function (resolve, reject) { var reader = new FileReader(); reader.onerror = reject; reader.onloadend = function (e) { var base64 = btoa(e.target.result || ''); resolve({ __local_forage_encoded_blob: true, data: base64, type: blob.type }); }; reader.readAsBinaryString(blob); }); }    
    function _decodeBlob(encodedBlob) { var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data)); return createBlob([arrayBuff], { type: encodedBlob.type }); }
    function _isEncodedBlob(value) { return value && value.__local_forage_encoded_blob; }    
    function _fullyReady(callback) { var self = this;  var promise = self._initReady().then(function () { var dbContext = dbContexts[self._dbInfo.name];  if (dbContext && dbContext.dbReady) { return dbContext.dbReady; } });  executeTwoCallbacks(promise, callback, callback); return promise; }    
    function _tryReconnect(dbInfo) { _deferReadiness(dbInfo);  var dbContext = dbContexts[dbInfo.name]; var forages = dbContext.forages;  for (var i = 0; i < forages.length; i++) { var forage = forages[i]; if (forage._dbInfo.db) { forage._dbInfo.db.close(); forage._dbInfo.db = null; } } dbInfo.db = null;  return _getOriginalConnection(dbInfo).then(function (db) { dbInfo.db = db; if (_isUpgradeNeeded(dbInfo)) { return _getUpgradedConnection(dbInfo); } return db; }).then(function (db) { dbInfo.db = dbContext.db = db; for (var i = 0; i < forages.length; i++) { forages[i]._dbInfo.db = db; } })["catch"](function (err) { _rejectReadiness(dbInfo, err); throw err; }); } 
    function createTransaction(dbInfo, mode, callback, retries) { if (retries === undefined) { retries = 1; }  try { var tx = dbInfo.db.transaction(dbInfo.storeName, mode); callback(null, tx); } catch (err) { if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) { return Promise$1.resolve().then(function () { if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {  if (dbInfo.db) { dbInfo.version = dbInfo.db.version + 1; }  return _getUpgradedConnection(dbInfo); } }).then(function () { return _tryReconnect(dbInfo).then(function () { createTransaction(dbInfo, mode, callback, retries - 1); }); })["catch"](callback); }  callback(err); } }
    
    function createDbContext() { return { forages: [], db: null, dbReady: null, deferredOperations: [] }; }
    
    function _initStorage(options) { var self = this; var dbInfo = { db: null };  if (options) { for (var i in options) { dbInfo[i] = options[i]; } }  var dbContext = dbContexts[dbInfo.name];  if (!dbContext) { dbContext = createDbContext(); dbContexts[dbInfo.name] = dbContext; }  dbContext.forages.push(self);  if (!self._initReady) { self._initReady = self.ready; self.ready = _fullyReady; }  var initPromises = [];  function ignoreErrors() { return Promise$1.resolve(); } for (var j = 0; j < dbContext.forages.length; j++) { var forage = dbContext.forages[j]; if (forage !== self) { initPromises.push(forage._initReady()["catch"](ignoreErrors)); } }  var forages = dbContext.forages.slice(0);  return Promise$1.all(initPromises).then(function () { dbInfo.db = dbContext.db;  return _getOriginalConnection(dbInfo); }).then(function (db) { dbInfo.db = db; if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {  return _getUpgradedConnection(dbInfo); } return db; }).then(function (db) { dbInfo.db = dbContext.db = db; self._dbInfo = dbInfo; for (var k = 0; k < forages.length; k++) { var forage = forages[k]; if (forage !== self) { forage._dbInfo.db = dbInfo.db; forage._dbInfo.version = dbInfo.version; } } }); }  function getItem(key, callback) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var req = store.get(key);  req.onsuccess = function () { var value = req.result; if (value === undefined) { value = null; } if (_isEncodedBlob(value)) { value = _decodeBlob(value); } resolve(value); };  req.onerror = function () { reject(req.error); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function iterate(iterator, callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var req = store.openCursor(); var iterationNumber = 1;  req.onsuccess = function () { var cursor = req.result;  if (cursor) { var value = cursor.value; if (_isEncodedBlob(value)) { value = _decodeBlob(value); } var result = iterator(value, cursor.key, iterationNumber++);  if (result !== void 0) { resolve(result); } else { cursor["continue"](); } } else { resolve(); } };  req.onerror = function () { reject(req.error); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback);  return promise; }  
			function setItem(key, value, callback) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { var dbInfo; self.ready().then(function () { dbInfo = self._dbInfo; if (toString.call(value) === '[object Blob]') { return _checkBlobSupport(dbInfo.db).then(function (blobSupport) { if (blobSupport) { return value; } return _encodeBlob(value); }); } return value; }).then(function (value) { createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) { if (err) { return reject(err); } try { var store = transaction.objectStore(self._dbInfo.storeName);  if (value === null) { value = undefined; }  var req = store.put(value, key);  transaction.oncomplete = function () { if (value === undefined) { value = null; }  resolve(value); }; transaction.onabort = transaction.onerror = function () { var err = req.error ? req.error : req.transaction.error; reject(err); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function removeItem(key, callback) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName);  var req = store["delete"](key); transaction.oncomplete = function () { resolve(); };  transaction.onerror = function () { reject(req.error); };  transaction.onabort = function () { var err = req.error ? req.error : req.transaction.error; reject(err); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function clear(callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var req = store.clear();  transaction.oncomplete = function () { resolve(); };  transaction.onabort = transaction.onerror = function () { var err = req.error ? req.error : req.transaction.error; reject(err); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }
    
    function length(callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var req = store.count();  req.onsuccess = function () { resolve(req.result); };  req.onerror = function () { reject(req.error); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			
			function key(n, callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { if (n < 0) { resolve(null);  return; }  self.ready().then(function () { createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var advanced = false; var req = store.openCursor();  req.onsuccess = function () { var cursor = req.result; if (!cursor) { resolve(null); return; } if (n === 0) { resolve(cursor.key); } else { if (!advanced) { advanced = true; cursor.advance(n); } else { resolve(cursor.key); } } };  req.onerror = function () { reject(req.error); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function keys(callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) { if (err) { return reject(err); }  try { var store = transaction.objectStore(self._dbInfo.storeName); var req = store.openCursor(); var keys = [];  req.onsuccess = function () { var cursor = req.result;  if (!cursor) { resolve(keys); return; }  keys.push(cursor.key); cursor["continue"](); };  req.onerror = function () { reject(req.error); }; } catch (e) { reject(e); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function dropInstance(options, callback) { callback = getCallback.apply(this, arguments);  var currentConfig = this.config(); options = typeof options !== 'function' && options || {}; if (!options.name) { options.name = options.name || currentConfig.name; options.storeName = options.storeName || currentConfig.storeName; }  var self = this; var promise; if (!options.name) { promise = Promise$1.reject('Invalid arguments'); } else { var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;  var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) { var dbContext = dbContexts[options.name]; var forages = dbContext.forages; dbContext.db = db; for (var i = 0; i < forages.length; i++) { forages[i]._dbInfo.db = db; } return db; });  if (!options.storeName) { promise = dbPromise.then(function (db) { _deferReadiness(options);  var dbContext = dbContexts[options.name]; var forages = dbContext.forages;  db.close(); for (var i = 0; i < forages.length; i++) { var forage = forages[i]; forage._dbInfo.db = null; }  var dropDBPromise = new Promise$1(function (resolve, reject) { var req = idb.deleteDatabase(options.name);  req.onerror = req.onblocked = function (err) { var db = req.result; if (db) { db.close(); } reject(err); };  req.onsuccess = function () { var db = req.result; if (db) { db.close(); } resolve(db); }; });  return dropDBPromise.then(function (db) { dbContext.db = db; for (var i = 0; i < forages.length; i++) { var _forage = forages[i]; _advanceReadiness(_forage._dbInfo); } })["catch"](function (err) { (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {}); throw err; }); }); } else { promise = dbPromise.then(function (db) { if (!db.objectStoreNames.contains(options.storeName)) { return; }  var newVersion = db.version + 1;  _deferReadiness(options);  var dbContext = dbContexts[options.name]; var forages = dbContext.forages;  db.close(); for (var i = 0; i < forages.length; i++) { var forage = forages[i]; forage._dbInfo.db = null; forage._dbInfo.version = newVersion; }  var dropObjectPromise = new Promise$1(function (resolve, reject) { var req = idb.open(options.name, newVersion);  req.onerror = function (err) { var db = req.result; db.close(); reject(err); };  req.onupgradeneeded = function () { var db = req.result; db.deleteObjectStore(options.storeName); };  req.onsuccess = function () { var db = req.result; db.close(); resolve(db); }; });  return dropObjectPromise.then(function (db) { dbContext.db = db; for (var j = 0; j < forages.length; j++) { var _forage2 = forages[j]; _forage2._dbInfo.db = db; _advanceReadiness(_forage2._dbInfo); } })["catch"](function (err) { (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {}); throw err; }); }); } }  executeCallback(promise, callback); return promise; }  
			
			var asyncStorage = { 
				_driver: 'asyncStorage', 
				_initStorage: _initStorage,
        _support: isIndexedDBValid(),
        iterate: iterate,
        getItem: getItem,
        setItem: setItem,
        removeItem: removeItem,
        clear: clear,
        length: length,
        key: key,
        keys: keys,
        dropInstance: dropInstance
    };
    
    function isWebSQLValid() { return typeof openDatabase === 'function'; }
    
    var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    var BLOB_TYPE_PREFIX = '~~local_forage_type~';
    var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
    
    var SERIALIZED_MARKER = '__lfsc__:';
    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

    var TYPE_ARRAYBUFFER = 'arbf';
    var TYPE_BLOB = 'blob';
    var TYPE_INT8ARRAY = 'si08';
    var TYPE_UINT8ARRAY = 'ui08';
    var TYPE_UINT8CLAMPEDARRAY = 'uic8';
    var TYPE_INT16ARRAY = 'si16';
    var TYPE_INT32ARRAY = 'si32';
    var TYPE_UINT16ARRAY = 'ur16';
    var TYPE_UINT32ARRAY = 'ui32';
    var TYPE_FLOAT32ARRAY = 'fl32';
    var TYPE_FLOAT64ARRAY = 'fl64';
    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
    
    var toString$1 = Object.prototype.toString;
    
    function stringToBuffer(serializedString) { var bufferLength = serializedString.length * 0.75; var len = serializedString.length; var i; var p = 0; var encoded1, encoded2, encoded3, encoded4;  if (serializedString[serializedString.length - 1] === '=') { bufferLength--; if (serializedString[serializedString.length - 2] === '=') { bufferLength--; } }  var buffer = new ArrayBuffer(bufferLength); var bytes = new Uint8Array(buffer);  for (i = 0; i < len; i += 4) { encoded1 = BASE_CHARS.indexOf(serializedString[i]); encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]); encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]); encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);   bytes[p++] = encoded1 << 2 | encoded2 >> 4; bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2; bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63; } return buffer; }
    
    function bufferToString(buffer) { var bytes = new Uint8Array(buffer); var base64String = ''; var i;  for (i = 0; i < bytes.length; i += 3) {  base64String += BASE_CHARS[bytes[i] >> 2]; base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4]; base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6]; base64String += BASE_CHARS[bytes[i + 2] & 63]; }  if (bytes.length % 3 === 2) { base64String = base64String.substring(0, base64String.length - 1) + '='; } else if (bytes.length % 3 === 1) { base64String = base64String.substring(0, base64String.length - 2) + '=='; }  return base64String; }  function serialize(value, callback) { var valueType = ''; if (value) { valueType = toString$1.call(value); }  if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {  var buffer; var marker = SERIALIZED_MARKER;  if (value instanceof ArrayBuffer) { buffer = value; marker += TYPE_ARRAYBUFFER; } else { buffer = value.buffer;  if (valueType === '[object Int8Array]') { marker += TYPE_INT8ARRAY; } else if (valueType === '[object Uint8Array]') { marker += TYPE_UINT8ARRAY; } else if (valueType === '[object Uint8ClampedArray]') { marker += TYPE_UINT8CLAMPEDARRAY; } else if (valueType === '[object Int16Array]') { marker += TYPE_INT16ARRAY; } else if (valueType === '[object Uint16Array]') { marker += TYPE_UINT16ARRAY; } else if (valueType === '[object Int32Array]') { marker += TYPE_INT32ARRAY; } else if (valueType === '[object Uint32Array]') { marker += TYPE_UINT32ARRAY; } else if (valueType === '[object Float32Array]') { marker += TYPE_FLOAT32ARRAY; } else if (valueType === '[object Float64Array]') { marker += TYPE_FLOAT64ARRAY; } else { callback(new Error('Failed to get type for BinaryArray')); } }  callback(marker + bufferToString(buffer)); } else if (valueType === '[object Blob]') { var fileReader = new FileReader(); fileReader.onload = function () { var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result); callback(SERIALIZED_MARKER + TYPE_BLOB + str); }; fileReader.readAsArrayBuffer(value); } else { try { callback(JSON.stringify(value)); } catch (e) { console.error("Couldn't convert value into a JSON string: ", value);  callback(null, e); } } }  
		function deserialize(value) {  if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) { return JSON.parse(value); }  var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH); var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);  var blobType; if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) { var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX); blobType = matcher[1]; serializedString = serializedString.substring(matcher[0].length); } var buffer = stringToBuffer(serializedString);  switch (type) { case TYPE_ARRAYBUFFER: return buffer; case TYPE_BLOB: return createBlob([buffer], { type: blobType }); case TYPE_INT8ARRAY: return new Int8Array(buffer); case TYPE_UINT8ARRAY: return new Uint8Array(buffer); case TYPE_UINT8CLAMPEDARRAY: return new Uint8ClampedArray(buffer); case TYPE_INT16ARRAY: return new Int16Array(buffer); case TYPE_UINT16ARRAY: return new Uint16Array(buffer); case TYPE_INT32ARRAY: return new Int32Array(buffer); case TYPE_UINT32ARRAY: return new Uint32Array(buffer); case TYPE_FLOAT32ARRAY: return new Float32Array(buffer); case TYPE_FLOAT64ARRAY: return new Float64Array(buffer); default: throw new Error('Unkown type: ' + type); } } 

		var localforageSerializer = {
        serialize: serialize,
        deserialize: deserialize,
        stringToBuffer: stringToBuffer,
        bufferToString: bufferToString
    };
    

    
    function createDbTable(t, dbInfo, callback, errorCallback) { t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback); }
    
    
			function _initStorage$1(options) { var self = this; var dbInfo = { db: null }; if (options) { for (var i in options) { dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i]; } } var dbInfoPromise = new Promise$1(function (resolve, reject) { try { dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size); } catch (e) { return reject(e); } dbInfo.db.transaction(function (t) { createDbTable(t, dbInfo, function () { self._dbInfo = dbInfo; resolve(); }, function (t, error) { reject(error); }); }, reject); });  dbInfo.serializer = localforageSerializer; return dbInfoPromise; } 
			
			function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) { t.executeSql(sqlStatement, args, callback, function (t, error) { if (error.code === error.SYNTAX_ERR) { t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) { if (!results.rows.length) { createDbTable(t, dbInfo, function () { t.executeSql(sqlStatement, args, callback, errorCallback); }, errorCallback); } else { errorCallback(t, error); } }, errorCallback); } else { errorCallback(t, error); } }, errorCallback); }  
			
			function getItem$1(key, callback) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) { var result = results.rows.length ? results.rows.item(0).value : null; if (result) { result = dbInfo.serializer.deserialize(result); }  resolve(result); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function iterate$1(iterator, callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo;  dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) { var rows = results.rows; var length = rows.length;  for (var i = 0; i < length; i++) { var item = rows.item(i); var result = item.value; if (result) { result = dbInfo.serializer.deserialize(result); }  result = iterator(result, item.key, i + 1); if (result !== void 0) { resolve(result); return; } }  resolve(); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }    
			function _setItem(key, value, callback, retriesLeft) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { if (value === undefined) { value = null; } var originalValue = value;  var dbInfo = self._dbInfo; dbInfo.serializer.serialize(value, function (value, error) { if (error) { reject(error); } else { dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () { resolve(originalValue); }, function (t, error) { reject(error); }); }, function (sqlError) { if (sqlError.code === sqlError.QUOTA_ERR) { if (retriesLeft > 0) { resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1])); return; } reject(sqlError); } }); } }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  			
			function setItem$1(key, value, callback) { return _setItem.apply(this, [key, value, callback, 1]); }
    

			function removeItem$1(key, callback) { var self = this;  key = normalizeKey(key);  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () { resolve(); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function clear$1(callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () { resolve(); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function length$1(callback) { var self = this;     var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) { var result = results.rows.item(0).c; resolve(result); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }   
			function key$1(n, callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) { var result = results.rows.length ? results.rows.item(0).key : null; resolve(result); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function keys$1(callback) { var self = this;  var promise = new Promise$1(function (resolve, reject) { self.ready().then(function () { var dbInfo = self._dbInfo; dbInfo.db.transaction(function (t) { tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) { var keys = [];  for (var i = 0; i < results.rows.length; i++) { keys.push(results.rows.item(i).key); }  resolve(keys); }, function (t, error) { reject(error); }); }); })["catch"](reject); });  executeCallback(promise, callback); return promise; }  
			function getAllStoreNames(db) { return new Promise$1(function (resolve, reject) { db.transaction(function (t) { t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) { var storeNames = [];  for (var i = 0; i < results.rows.length; i++) { storeNames.push(results.rows.item(i).name); }  resolve({ db: db, storeNames: storeNames }); }, function (t, error) { reject(error); }); }, function (sqlError) { reject(sqlError); }); }); }  
			function dropInstance$1(options, callback) { callback = getCallback.apply(this, arguments);  var currentConfig = this.config(); options = typeof options !== 'function' && options || {}; if (!options.name) { options.name = options.name || currentConfig.name; options.storeName = options.storeName || currentConfig.storeName; }  var self = this; var promise; if (!options.name) { promise = Promise$1.reject('Invalid arguments'); } else { promise = new Promise$1(function (resolve) { var db; if (options.name === currentConfig.name) { db = self._dbInfo.db; } else { db = openDatabase(options.name, '', '', 0); }  if (!options.storeName) { resolve(getAllStoreNames(db)); } else { resolve({ db: db, storeNames: [options.storeName] }); } }).then(function (operationInfo) { return new Promise$1(function (resolve, reject) { operationInfo.db.transaction(function (t) { function dropTable(storeName) { return new Promise$1(function (resolve, reject) { t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () { resolve(); }, function (t, error) { reject(error); }); }); }  var operations = []; for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) { operations.push(dropTable(operationInfo.storeNames[i])); }  Promise$1.all(operations).then(function () { resolve(); })["catch"](function (e) { reject(e); }); }, function (sqlError) { reject(sqlError); }); }); }); }  executeCallback(promise, callback); return promise; } 
  
			var webSQLStorage = {
        _driver: 'webSQLStorage',
        _initStorage: _initStorage$1,
        _support: isWebSQLValid(),
        iterate: iterate$1,
        getItem: getItem$1,
        setItem: setItem$1,
        removeItem: removeItem$1,
        clear: clear$1,
        length: length$1,
        key: key$1,
        keys: keys$1,
        dropInstance: dropInstance$1
    };
    
    function isLocalStorageValid() { try { return typeof localStorage !== 'undefined' && 'setItem' in localStorage && !!localStorage.setItem; } catch (e) { return false; } }
    
    function _getKeyPrefix(options, defaultConfig) { var keyPrefix = options.name + '/'; if (options.storeName !== defaultConfig.storeName) { keyPrefix += options.storeName + '/'; } return keyPrefix; }
    

    function checkIfLocalStorageThrows() { var localStorageTestKey = '_localforage_support_test'; try { localStorage.setItem(localStorageTestKey, true); localStorage.removeItem(localStorageTestKey);  return false; } catch (e) { return true; } }
    
    function _isLocalStorageUsable() { return !checkIfLocalStorageThrows() || localStorage.length > 0; } 
    function _initStorage$2(options) { var self = this; var dbInfo = {}; if (options) { for (var i in options) { dbInfo[i] = options[i]; } } dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig); if (!_isLocalStorageUsable()) { return Promise$1.reject(); } self._dbInfo = dbInfo; dbInfo.serializer = localforageSerializer; return Promise$1.resolve(); }
    

    function clear$2(callback) { var self = this; var promise = self.ready().then(function () { var keyPrefix = self._dbInfo.keyPrefix; for (var i = localStorage.length - 1; i >= 0; i--) { var key = localStorage.key(i); if (key.indexOf(keyPrefix) === 0) { localStorage.removeItem(key); } } }); executeCallback(promise, callback); return promise; }
    
    function getItem$2(key, callback) { var self = this; key = normalizeKey(key); var promise = self.ready().then(function () { var dbInfo = self._dbInfo; var result = localStorage.getItem(dbInfo.keyPrefix + key); if (result) { result = dbInfo.serializer.deserialize(result); } return result; }); executeCallback(promise, callback); return promise; }

    function iterate$2(iterator, callback) { var self = this; var promise = self.ready().then(function () { var dbInfo = self._dbInfo; var keyPrefix = dbInfo.keyPrefix; var keyPrefixLength = keyPrefix.length; var length = localStorage.length; var iterationNumber = 1; for (var i = 0; i < length; i++) { var key = localStorage.key(i); if (key.indexOf(keyPrefix) !== 0) { continue; } var value = localStorage.getItem(key); if (value) { value = dbInfo.serializer.deserialize(value); } value = iterator(value, key.substring(keyPrefixLength), iterationNumber++); if (value !== void 0) { return value; } } });  executeCallback(promise, callback); return promise; }
    
    function key$2(n, callback) { var self = this; var promise = self.ready().then(function () { var dbInfo = self._dbInfo; var result; try { result = localStorage.key(n); } catch (error) { result = null; }  if (result) { result = result.substring(dbInfo.keyPrefix.length); }  return result; }); executeCallback(promise, callback); return promise; }
    
    function keys$2(callback) { var self = this; var promise = self.ready().then(function () { var dbInfo = self._dbInfo; var length = localStorage.length; var keys = [];  for (var i = 0; i < length; i++) { var itemKey = localStorage.key(i); if (itemKey.indexOf(dbInfo.keyPrefix) === 0) { keys.push(itemKey.substring(dbInfo.keyPrefix.length)); } }  return keys; }); executeCallback(promise, callback); return promise; } 
    function length$2(callback) { var self = this; var promise = self.keys().then(function (keys) { return keys.length; }); executeCallback(promise, callback); return promise; }
    
    function removeItem$2(key, callback) { var self = this; key = normalizeKey(key); var promise = self.ready().then(function () { var dbInfo = self._dbInfo; localStorage.removeItem(dbInfo.keyPrefix + key); }); executeCallback(promise, callback); return promise; }  
			function setItem$2(key, value, callback) { var self = this; key = normalizeKey(key);  var promise = self.ready().then(function () { if (value === undefined) { value = null; }  var originalValue = value;  return new Promise$1(function (resolve, reject) { var dbInfo = self._dbInfo; dbInfo.serializer.serialize(value, function (value, error) { if (error) { reject(error); } else { try { localStorage.setItem(dbInfo.keyPrefix + key, value); resolve(originalValue); } catch (e) { if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') { reject(e); } reject(e); } } }); }); });  executeCallback(promise, callback); return promise; }  
			function dropInstance$2(options, callback) { callback = getCallback.apply(this, arguments);  options = typeof options !== 'function' && options || {}; if (!options.name) { var currentConfig = this.config(); options.name = options.name || currentConfig.name; options.storeName = options.storeName || currentConfig.storeName; }  var self = this; var promise; if (!options.name) { promise = Promise$1.reject('Invalid arguments'); } else { promise = new Promise$1(function (resolve) { if (!options.storeName) { resolve(options.name + '/'); } else { resolve(_getKeyPrefix(options, self._defaultConfig)); } }).then(function (keyPrefix) { for (var i = localStorage.length - 1; i >= 0; i--) { var key = localStorage.key(i);  if (key.indexOf(keyPrefix) === 0) { localStorage.removeItem(key); } } }); }  executeCallback(promise, callback); return promise; }  
			
			var localStorageWrapper = {
        _driver: 'localStorageWrapper',
        _initStorage: _initStorage$2,
        _support: isLocalStorageValid(),
        iterate: iterate$2,
        getItem: getItem$2,
        setItem: setItem$2,
        removeItem: removeItem$2,
        clear: clear$2,
        length: length$2,
        key: key$2,
        keys: keys$2,
        dropInstance: dropInstance$2
    };
    
    var sameValue = function sameValue(x, y) { return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y); };
    
    var includes = function includes(array, searchElement) { var len = array.length; var i = 0; while (i < len) { if (sameValue(array[i], searchElement)) { return true; } i++; }  return false; };
    
    var isArray = Array.isArray || function (arg) { return Object.prototype.toString.call(arg) === '[object Array]'; };
    
    var DefinedDrivers = {};
    
    var DriverSupport = {};
    
    var DefaultDrivers = {
        INDEXEDDB: asyncStorage,
        WEBSQL: webSQLStorage,
        LOCALSTORAGE: localStorageWrapper
    };
    
    var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
    
    var OptionalDriverMethods = ['dropInstance'];
    
    var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);
    
    var DefaultConfig = {
        description: '',
        driver: DefaultDriverOrder.slice(),
        name: 'localforage',
        size: 4980736,
        storeName: 'keyvaluepairs',
        version: 1.0
    };
    
    function callWhenReady(localForageInstance, libraryMethod) { localForageInstance[libraryMethod] = function () { var _args = arguments; return localForageInstance.ready().then(function () { return localForageInstance[libraryMethod].apply(localForageInstance, _args); }); }; }
    
    function extend() { for (var i = 1; i < arguments.length; i++) { var arg = arguments[i];  if (arg) { for (var _key in arg) { if (arg.hasOwnProperty(_key)) { if (isArray(arg[_key])) { arguments[0][_key] = arg[_key].slice(); } else { arguments[0][_key] = arg[_key]; } } } } }  return arguments[0]; }
    
    var LocalForage = function () {
        function LocalForage(options) { _classCallCheck(this, LocalForage);  for (var driverTypeKey in DefaultDrivers) { if (DefaultDrivers.hasOwnProperty(driverTypeKey)) { var driver = DefaultDrivers[driverTypeKey]; var driverName = driver._driver; this[driverTypeKey] = driverName;  if (!DefinedDrivers[driverName]) { this.defineDriver(driver); } } }  this._defaultConfig = extend({}, DefaultConfig); this._config = extend({}, this._defaultConfig, options); this._driverSet = null; this._initDriver = null; this._ready = false; this._dbInfo = null;  this._wrapLibraryMethodsWithReady(); this.setDriver(this._config.driver)["catch"](function () {}); }    
			LocalForage.prototype.config = function config(options) { if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') { if (this._ready) { return new Error("Can't call config() after localforage " + 'has been used.'); } for (var i in options) { if (i === 'storeName') { options[i] = options[i].replace(/\W/g, '_'); } if (i === 'version' && typeof options[i] !== 'number') { return new Error('Database version must be a number.'); } this._config[i] = options[i]; } if ('driver' in options && options.driver) { return this.setDriver(this._config.driver); } return true; } else if (typeof options === 'string') { return this._config[options]; } else { return this._config; } };
			LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) { var promise = new Promise$1(function (resolve, reject) { try { var driverName = driverObject._driver; var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver'); if (!driverObject._driver) { reject(complianceError); return; } var driverMethods = LibraryMethods.concat('_initStorage'); for (var i = 0, len = driverMethods.length; i < len; i++) { var driverMethodName = driverMethods[i]; var isRequired = !includes(OptionalDriverMethods, driverMethodName); if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') { reject(complianceError); return; } }     var configureMissingMethods = function configureMissingMethods() { var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) { return function () { var error = new Error('Method ' + methodName + ' is not implemented by the current driver'); var promise = Promise$1.reject(error); executeCallback(promise, arguments[arguments.length - 1]); return promise; }; }; for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) { var optionalDriverMethod = OptionalDriverMethods[_i]; if (!driverObject[optionalDriverMethod]) { driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod); } } }; configureMissingMethods(); var setDriverSupport = function setDriverSupport(support) { if (DefinedDrivers[driverName]) { console.info('Redefining LocalForage driver: ' + driverName); } DefinedDrivers[driverName] = driverObject; DriverSupport[driverName] = support; resolve(); }; if ('_support' in driverObject) { if (driverObject._support && typeof driverObject._support === 'function') { driverObject._support().then(setDriverSupport, reject); } else { setDriverSupport(!!driverObject._support); } } else { setDriverSupport(true); } } catch (e) { reject(e); } });     executeTwoCallbacks(promise, callback, errorCallback); return promise; };
        LocalForage.prototype.driver = function driver() { return this._driver || null; };    
        LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) { var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));     executeTwoCallbacks(getDriverPromise, callback, errorCallback); return getDriverPromise; };    
        LocalForage.prototype.getSerializer = function getSerializer(callback) { var serializerPromise = Promise$1.resolve(localforageSerializer); executeTwoCallbacks(serializerPromise, callback); return serializerPromise; };
        LocalForage.prototype.ready = function ready(callback) { var self = this;     var promise = self._driverSet.then(function () { if (self._ready === null) { self._ready = self._initDriver(); }     return self._ready; });     executeTwoCallbacks(promise, callback, callback); return promise; }; 
        LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) { var self = this;     if (!isArray(drivers)) { drivers = [drivers]; }     var supportedDrivers = this._getSupportedDrivers(drivers);     function setDriverToConfig() { self._config.driver = self.driver(); }     function extendSelfWithDriver(driver) { self._extend(driver); setDriverToConfig();     self._ready = self._initStorage(self._config); return self._ready; }     function initDriver(supportedDrivers) { return function () { var currentDriverIndex = 0;     function driverPromiseLoop() { while (currentDriverIndex < supportedDrivers.length) { var driverName = supportedDrivers[currentDriverIndex]; currentDriverIndex++;     self._dbInfo = null; self._ready = null;     return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop); } setDriverToConfig(); var error = new Error('No available storage method found.'); self._driverSet = Promise$1.reject(error); return self._driverSet; }  return driverPromiseLoop(); }; }  var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () { return Promise$1.resolve(); }) : Promise$1.resolve();  this._driverSet = oldDriverSetDone.then(function () { var driverName = supportedDrivers[0]; self._dbInfo = null; self._ready = null;  return self.getDriver(driverName).then(function (driver) { self._driver = driver._driver; setDriverToConfig(); self._wrapLibraryMethodsWithReady(); self._initDriver = initDriver(supportedDrivers); }); })["catch"](function () { setDriverToConfig(); var error = new Error('No available storage method found.'); self._driverSet = Promise$1.reject(error); return self._driverSet; });  executeTwoCallbacks(this._driverSet, callback, errorCallback); return this._driverSet; }; 
        LocalForage.prototype.supports = function supports(driverName) { return !!DriverSupport[driverName]; };    
        LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) { extend(this, libraryMethodsAndProperties); };    
        LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) { var supportedDrivers = []; for (var i = 0, len = drivers.length; i < len; i++) { var driverName = drivers[i]; if (this.supports(driverName)) { supportedDrivers.push(driverName); } } return supportedDrivers; };    
        LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() { for (var i = 0, len = LibraryMethods.length; i < len; i++) { callWhenReady(this, LibraryMethods[i]); } };    
        LocalForage.prototype.createInstance = function createInstance(options) { return new LocalForage(options); };    
        return LocalForage;
    }();

    var localforage_js = new LocalForage();
    module.exports = localforage_js;    
    },{"3":3}]},{},[4])(4)
});

/* Underscore.js 1.8.3 */
(function() {

  var root = this;
	var previousUnderscore = root._;
	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	var push  = ArrayProto.push, slice            = ArrayProto.slice, toString         = ObjProto.toString, hasOwnProperty   = ObjProto.hasOwnProperty; 
	var nativeIsArray      = Array.isArray, nativeKeys         = Object.keys, nativeBind         = FuncProto.bind, nativeCreate       = Object.create; 
	
	var Ctor = function(){};
	
  var _ = function(obj) { if (obj instanceof _) return obj; if (!(this instanceof _)) return new _(obj); this._wrapped = obj; };

  if (typeof exports !== 'undefined') { if (typeof module !== 'undefined' && module.exports) { exports = module.exports = _; } exports._ = _; } else { root._ = _; }

  _.VERSION = '1.8.3';

  var optimizeCb = function(func, context, argCount) { if (context === void 0) return func; switch (argCount == null ? 3 : argCount) { case 1: return function(value) { return func.call(context, value); }; case 2: return function(value, other) { return func.call(context, value, other); }; case 3: return function(value, index, collection) { return func.call(context, value, index, collection); }; case 4: return function(accumulator, value, index, collection) { return func.call(context, accumulator, value, index, collection); }; } return function() { return func.apply(context, arguments); }; };

	var cb = function(value, context, argCount) { if (value == null) return _.identity; if (_.isFunction(value)) return optimizeCb(value, context, argCount); if (_.isObject(value)) return _.matcher(value); return _.property(value); }; 
	_.iteratee = function(value, context) { return cb(value, context, Infinity); };
  
	var createAssigner = function(keysFunc, undefinedOnly) { return function(obj) { var length = arguments.length; if (length < 2 || obj == null) return obj; for (var index = 1; index < length; index++) { var source = arguments[index], keys = keysFunc(source), l = keys.length; for (var i = 0; i < l; i++) { var key = keys[i]; if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key]; } } return obj; }; }; 
  var baseCreate = function(prototype) { if (!_.isObject(prototype)) return {}; if (nativeCreate) return nativeCreate(prototype); Ctor.prototype = prototype; var result = new Ctor; Ctor.prototype = null; return result; };
  var property = function(key) { return function(obj) { return obj == null ? void 0 : obj[key]; }; };
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) { var length = getLength(collection); return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX; };
  
	_.each = _.forEach = function(obj, iteratee, context) { iteratee = optimizeCb(iteratee, context); var i, length; if (isArrayLike(obj)) { for (i = 0, length = obj.length; i < length; i++) { iteratee(obj[i], i, obj); } } else { var keys = _.keys(obj); for (i = 0, length = keys.length; i < length; i++) { iteratee(obj[keys[i]], keys[i], obj); } } return obj; };  
	_.map = _.collect = function(obj, iteratee, context) { iteratee = cb(iteratee, context); var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length); for (var index = 0; index < length; index++) { var currentKey = keys ? keys[index] : index; results[index] = iteratee(obj[currentKey], currentKey, obj); } return results; };

	function createReduce(dir) { function iterator(obj, iteratee, memo, keys, index, length) { for (; index >= 0 && index < length; index += dir) { var currentKey = keys ? keys[index] : index; memo = iteratee(memo, obj[currentKey], currentKey, obj); } return memo; } return function(obj, iteratee, memo, context) { iteratee = optimizeCb(iteratee, context, 4); var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1; if (arguments.length < 3) { memo = obj[keys ? keys[index] : index]; index += dir; } return iterator(obj, iteratee, memo, keys, index, length); }; }
	
  _.reduce = _.foldl = _.inject = createReduce(1);
  _.reduceRight = _.foldr = createReduce(-1);
  _.find = _.detect = function(obj, predicate, context) { var key; if (isArrayLike(obj)) { key = _.findIndex(obj, predicate, context); } else { key = _.findKey(obj, predicate, context); } if (key !== void 0 && key !== -1) return obj[key]; };
  _.filter = _.select = function(obj, predicate, context) { var results = []; predicate = cb(predicate, context); _.each(obj, function(value, index, list) { if (predicate(value, index, list)) results.push(value); }); return results; };
  _.reject = function(obj, predicate, context) { return _.filter(obj, _.negate(cb(predicate)), context); };
  _.every = _.all = function(obj, predicate, context) { predicate = cb(predicate, context); var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length; for (var index = 0; index < length; index++) { var currentKey = keys ? keys[index] : index; if (!predicate(obj[currentKey], currentKey, obj)) return false; } return true; };
  _.some = _.any = function(obj, predicate, context) { predicate = cb(predicate, context); var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length; for (var index = 0; index < length; index++) { var currentKey = keys ? keys[index] : index; if (predicate(obj[currentKey], currentKey, obj)) return true; } return false; }; 
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) { if (!isArrayLike(obj)) obj = _.values(obj); if (typeof fromIndex != 'number' || guard) fromIndex = 0; return _.indexOf(obj, item, fromIndex) >= 0; };
  _.invoke = function(obj, method) { var args = slice.call(arguments, 2); var isFunc = _.isFunction(method); return _.map(obj, function(value) { var func = isFunc ? method : value[method]; return func == null ? func : func.apply(value, args); }); };
  _.pluck = function(obj, key) { return _.map(obj, _.property(key)); };
  _.where = function(obj, attrs) { return _.filter(obj, _.matcher(attrs)); };
  _.findWhere = function(obj, attrs) { return _.find(obj, _.matcher(attrs)); };
  _.max = function(obj, iteratee, context) { var result = -Infinity, lastComputed = -Infinity, value, computed; if (iteratee == null && obj != null) { obj = isArrayLike(obj) ? obj : _.values(obj); for (var i = 0, length = obj.length; i < length; i++) { value = obj[i]; if (value > result) { result = value; } } } else { iteratee = cb(iteratee, context); _.each(obj, function(value, index, list) { computed = iteratee(value, index, list); if (computed > lastComputed || computed === -Infinity && result === -Infinity) { result = value; lastComputed = computed; } }); } return result; };
  _.min = function(obj, iteratee, context) { var result = Infinity, lastComputed = Infinity, value, computed; if (iteratee == null && obj != null) { obj = isArrayLike(obj) ? obj : _.values(obj); for (var i = 0, length = obj.length; i < length; i++) { value = obj[i]; if (value < result) { result = value; } } } else { iteratee = cb(iteratee, context); _.each(obj, function(value, index, list) { computed = iteratee(value, index, list); if (computed < lastComputed || computed === Infinity && result === Infinity) { result = value; lastComputed = computed; } }); } return result; };
	_.shuffle = function(obj) { var set = isArrayLike(obj) ? obj : _.values(obj); var length = set.length; var shuffled = Array(length); for (var index = 0, rand; index < length; index++) { rand = _.random(0, index); if (rand !== index) shuffled[index] = shuffled[rand]; shuffled[rand] = set[index]; } return shuffled; };
	_.sample = function(obj, n, guard) { if (n == null || guard) { if (!isArrayLike(obj)) obj = _.values(obj); return obj[_.random(obj.length - 1)]; } return _.shuffle(obj).slice(0, Math.max(0, n)); };
	_.sortBy = function(obj, iteratee, context) { iteratee = cb(iteratee, context); return _.pluck(_.map(obj, function(value, index, list) { return { value: value, index: index, criteria: iteratee(value, index, list) }; }).sort(function(left, right) { var a = left.criteria; var b = right.criteria; if (a !== b) { if (a > b || a === void 0) return 1; if (a < b || b === void 0) return -1; } return left.index - right.index; }), 'value'); };

	var group = function(behavior) { return function(obj, iteratee, context) { var result = {}; iteratee = cb(iteratee, context); _.each(obj, function(value, index) { var key = iteratee(value, index, obj); behavior(result, value, key); }); return result; }; };

  _.groupBy = group(function(result, value, key) { if (_.has(result, key)) result[key].push(value); else result[key] = [value]; });
  _.indexBy = group(function(result, value, key) { result[key] = value; });
  _.countBy = group(function(result, value, key) { if (_.has(result, key)) result[key]++; else result[key] = 1; });
  _.toArray = function(obj) { if (!obj) return []; if (_.isArray(obj)) return slice.call(obj); if (isArrayLike(obj)) return _.map(obj, _.identity); return _.values(obj); };
  _.size = function(obj) { if (obj == null) return 0; return isArrayLike(obj) ? obj.length : _.keys(obj).length; };
  _.partition = function(obj, predicate, context) { predicate = cb(predicate, context); var pass = [], fail = []; _.each(obj, function(value, key, obj) { (predicate(value, key, obj) ? pass : fail).push(value); }); return [pass, fail]; };
  _.first = _.head = _.take = function(array, n, guard) { if (array == null) return void 0; if (n == null || guard) return array[0]; return _.initial(array, array.length - n); }; 
  _.initial = function(array, n, guard) { return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n))); };
  _.last = function(array, n, guard) { if (array == null) return void 0; if (n == null || guard) return array[array.length - 1]; return _.rest(array, Math.max(0, array.length - n)); };
  _.rest = _.tail = _.drop = function(array, n, guard) { return slice.call(array, n == null || guard ? 1 : n); };
  _.compact = function(array) { return _.filter(array, _.identity); };
	
  var flatten = function(input, shallow, strict, startIndex) { var output = [], idx = 0; for (var i = startIndex || 0, length = getLength(input); i < length; i++) { var value = input[i]; if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {  if (!shallow) value = flatten(value, shallow, strict); var j = 0, len = value.length; output.length += len; while (j < len) { output[idx++] = value[j++]; } } else if (!strict) { output[idx++] = value; } } return output; };
	
	_.flatten = function(array, shallow) { return flatten(array, shallow, false); };
  _.without = function(array) { return _.difference(array, slice.call(arguments, 1)); };
  _.uniq = _.unique = function(array, isSorted, iteratee, context) { if (!_.isBoolean(isSorted)) { context = iteratee; iteratee = isSorted; isSorted = false; } if (iteratee != null) iteratee = cb(iteratee, context); var result = []; var seen = []; for (var i = 0, length = getLength(array); i < length; i++) { var value = array[i], computed = iteratee ? iteratee(value, i, array) : value; if (isSorted) { if (!i || seen !== computed) result.push(value); seen = computed; } else if (iteratee) { if (!_.contains(seen, computed)) { seen.push(computed); result.push(value); } } else if (!_.contains(result, value)) { result.push(value); } } return result; };
  _.union = function() { return _.uniq(flatten(arguments, true, true)); };
  _.intersection = function(array) { var result = []; var argsLength = arguments.length; for (var i = 0, length = getLength(array); i < length; i++) { var item = array[i]; if (_.contains(result, item)) continue; for (var j = 1; j < argsLength; j++) { if (!_.contains(arguments[j], item)) break; } if (j === argsLength) result.push(item); } return result; };
  _.difference = function(array) { var rest = flatten(arguments, true, true, 1); return _.filter(array, function(value){ return !_.contains(rest, value); }); };
  _.zip = function() { return _.unzip(arguments); }; 
  _.unzip = function(array) { var length = array && _.max(array, getLength).length || 0; var result = Array(length);  for (var index = 0; index < length; index++) { result[index] = _.pluck(array, index); } return result; };
  _.object = function(list, values) { var result = {}; for (var i = 0, length = getLength(list); i < length; i++) { if (values) { result[list[i]] = values[i]; } else { result[list[i][0]] = list[i][1]; } } return result; };

	function createPredicateIndexFinder(dir) { return function(array, predicate, context) { predicate = cb(predicate, context); var length = getLength(array); var index = dir > 0 ? 0 : length - 1; for (; index >= 0 && index < length; index += dir) { if (predicate(array[index], index, array)) return index; } return -1; }; }
  
	_.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);
	_.sortedIndex = function(array, obj, iteratee, context) { iteratee = cb(iteratee, context, 1); var value = iteratee(obj); var low = 0, high = getLength(array); while (low < high) { var mid = Math.floor((low + high) / 2); if (iteratee(array[mid]) < value) low = mid + 1; else high = mid; } return low; };

  function createIndexFinder(dir, predicateFind, sortedIndex) { return function(array, item, idx) { var i = 0, length = getLength(array); if (typeof idx == 'number') { if (dir > 0) { i = idx >= 0 ? idx : Math.max(idx + length, i); } else { length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1; } } else if (sortedIndex && idx && length) { idx = sortedIndex(array, item); return array[idx] === item ? idx : -1; } if (item !== item) { idx = predicateFind(slice.call(array, i, length), _.isNaN); return idx >= 0 ? idx + i : -1; } for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) { if (array[idx] === item) return idx; } return -1; }; }

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
  _.range = function(start, stop, step) { if (stop == null) { stop = start || 0; start = 0; } step = step || 1;  var length = Math.max(Math.ceil((stop - start) / step), 0); var range = Array(length);  for (var idx = 0; idx < length; idx++, start += step) { range[idx] = start; }  return range; };

	var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) { if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args); var self = baseCreate(sourceFunc.prototype); var result = sourceFunc.apply(self, args); if (_.isObject(result)) return result; return self; };

  _.bind = function(func, context) { if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1)); if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function'); var args = slice.call(arguments, 2); var bound = function() { return executeBound(func, bound, context, this, args.concat(slice.call(arguments))); }; return bound; };
  _.partial = function(func) { var boundArgs = slice.call(arguments, 1); var bound = function() { var position = 0, length = boundArgs.length; var args = Array(length); for (var i = 0; i < length; i++) { args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i]; } while (position < arguments.length) args.push(arguments[position++]); return executeBound(func, bound, this, this, args); }; return bound; };
  _.bindAll = function(obj) { var i, length = arguments.length, key; if (length <= 1) throw new Error('bindAll must be passed function names'); for (i = 1; i < length; i++) { key = arguments[i]; obj[key] = _.bind(obj[key], obj); } return obj; };
  _.memoize = function(func, hasher) { var memoize = function(key) { var cache = memoize.cache; var address = '' + (hasher ? hasher.apply(this, arguments) : key); if (!_.has(cache, address)) cache[address] = func.apply(this, arguments); return cache[address]; }; memoize.cache = {}; return memoize; };
  _.delay = function(func, wait) { var args = slice.call(arguments, 2); return setTimeout(function(){ return func.apply(null, args); }, wait); };
  _.defer = _.partial(_.delay, _, 1);
  _.throttle = function(func, wait, options) { var context, args, result; var timeout = null; var previous = 0; if (!options) options = {}; var later = function() { previous = options.leading === false ? 0 : _.now(); timeout = null; result = func.apply(context, args); if (!timeout) context = args = null; }; return function() { var now = _.now(); if (!previous && options.leading === false) previous = now; var remaining = wait - (now - previous); context = this; args = arguments; if (remaining <= 0 || remaining > wait) { if (timeout) { clearTimeout(timeout); timeout = null; } previous = now; result = func.apply(context, args); if (!timeout) context = args = null; } else if (!timeout && options.trailing !== false) { timeout = setTimeout(later, remaining); } return result; }; };
  _.debounce = function(func, wait, immediate) { var timeout, args, context, timestamp, result;  var later = function() { var last = _.now() - timestamp;  if (last < wait && last >= 0) { timeout = setTimeout(later, wait - last); } else { timeout = null; if (!immediate) { result = func.apply(context, args); if (!timeout) context = args = null; } } };  return function() { context = this; args = arguments; timestamp = _.now(); var callNow = immediate && !timeout; if (!timeout) timeout = setTimeout(later, wait); if (callNow) { result = func.apply(context, args); context = args = null; }  return result; }; };
  _.wrap = function(func, wrapper) { return _.partial(wrapper, func); };
  _.negate = function(predicate) { return function() { return !predicate.apply(this, arguments); }; };
  _.compose = function() { var args = arguments; var start = args.length - 1; return function() { var i = start; var result = args[start].apply(this, arguments); while (i--) result = args[i].call(this, result); return result; }; };
  _.after = function(times, func) { return function() { if (--times < 1) { return func.apply(this, arguments); } }; };
  _.before = function(times, func) { var memo; return function() { if (--times > 0) { memo = func.apply(this, arguments); } if (times <= 1) func = null; return memo; }; };
  _.once = _.partial(_.before, 2);

	var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; 
  function collectNonEnumProps(obj, keys) { var nonEnumIdx = nonEnumerableProps.length; var constructor = obj.constructor; var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto; var prop = 'constructor'; if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);  while (nonEnumIdx--) { prop = nonEnumerableProps[nonEnumIdx]; if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) { keys.push(prop); } } }

	_.keys = function(obj) { if (!_.isObject(obj)) return []; if (nativeKeys) return nativeKeys(obj); var keys = []; for (var key in obj) if (_.has(obj, key)) keys.push(key); if (hasEnumBug) collectNonEnumProps(obj, keys); return keys; };
  _.allKeys = function(obj) { if (!_.isObject(obj)) return []; var keys = []; for (var key in obj) keys.push(key); if (hasEnumBug) collectNonEnumProps(obj, keys); return keys; };
  _.values = function(obj) { var keys = _.keys(obj); var length = keys.length; var values = Array(length); for (var i = 0; i < length; i++) { values[i] = obj[keys[i]]; } return values; };
	_.mapObject = function(obj, iteratee, context) { iteratee = cb(iteratee, context); var keys =  _.keys(obj), length = keys.length, results = {}, currentKey; for (var index = 0; index < length; index++) { currentKey = keys[index]; results[currentKey] = iteratee(obj[currentKey], currentKey, obj); } return results; };
  _.pairs = function(obj) { var keys = _.keys(obj); var length = keys.length; var pairs = Array(length); for (var i = 0; i < length; i++) { pairs[i] = [keys[i], obj[keys[i]]]; } return pairs; };
  _.invert = function(obj) { var result = {}; var keys = _.keys(obj); for (var i = 0, length = keys.length; i < length; i++) { result[obj[keys[i]]] = keys[i]; } return result; };
  _.functions = _.methods = function(obj) { var names = []; for (var key in obj) { if (_.isFunction(obj[key])) names.push(key); } return names.sort(); };
  _.extend = createAssigner(_.allKeys);
  _.extendOwn = _.assign = createAssigner(_.keys);
  _.findKey = function(obj, predicate, context) { predicate = cb(predicate, context); var keys = _.keys(obj), key; for (var i = 0, length = keys.length; i < length; i++) { key = keys[i]; if (predicate(obj[key], key, obj)) return key; } };
  _.pick = function(object, oiteratee, context) { var result = {}, obj = object, iteratee, keys; if (obj == null) return result; if (_.isFunction(oiteratee)) { keys = _.allKeys(obj); iteratee = optimizeCb(oiteratee, context); } else { keys = flatten(arguments, false, false, 1); iteratee = function(value, key, obj) { return key in obj; }; obj = Object(obj); } for (var i = 0, length = keys.length; i < length; i++) { var key = keys[i]; var value = obj[key]; if (iteratee(value, key, obj)) result[key] = value; } return result; };
  _.omit = function(obj, iteratee, context) { if (_.isFunction(iteratee)) { iteratee = _.negate(iteratee); } else { var keys = _.map(flatten(arguments, false, false, 1), String); iteratee = function(value, key) { return !_.contains(keys, key); }; } return _.pick(obj, iteratee, context); };
  _.defaults = createAssigner(_.allKeys, true);
  _.create = function(prototype, props) { var result = baseCreate(prototype); if (props) _.extendOwn(result, props); return result; };
  _.clone = function(obj) { if (!_.isObject(obj)) return obj; return _.isArray(obj) ? obj.slice() : _.extend({}, obj); };
  _.tap = function(obj, interceptor) { interceptor(obj); return obj; };
  _.isMatch = function(object, attrs) { var keys = _.keys(attrs), length = keys.length; if (object == null) return !length; var obj = Object(object); for (var i = 0; i < length; i++) { var key = keys[i]; if (attrs[key] !== obj[key] || !(key in obj)) return false; } return true; }; 
	
  var eq = function(a, b, aStack, bStack) { if (a === b) return a !== 0 || 1 / a === 1 / b; if (a == null || b == null) return a === b; if (a instanceof _) a = a._wrapped; if (b instanceof _) b = b._wrapped; var className = toString.call(a); if (className !== toString.call(b)) return false; switch (className) { case '[object RegExp]': case '[object String]': return '' + a === '' + b; case '[object Number]': if (+a !== +a) return +b !== +b; return +a === 0 ? 1 / +a === 1 / b : +a === +b; case '[object Date]': case '[object Boolean]': return +a === +b; } var areArrays = className === '[object Array]'; if (!areArrays) { if (typeof a != 'object' || typeof b != 'object') return false; var aCtor = a.constructor, bCtor = b.constructor; if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) { return false; } } aStack = aStack || []; bStack = bStack || []; var length = aStack.length; while (length--) { if (aStack[length] === a) return bStack[length] === b; } aStack.push(a); bStack.push(b); if (areArrays) { length = a.length; if (length !== b.length) return false; while (length--) { if (!eq(a[length], b[length], aStack, bStack)) return false; } } else { var keys = _.keys(a), key; length = keys.length; if (_.keys(b).length !== length) return false; while (length--) { key = keys[length]; if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false; } } aStack.pop(); bStack.pop(); return true; };

  _.isEqual = function(a, b) { return eq(a, b); };
  _.isEmpty = function(obj) { if (obj == null) return true; if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0; return _.keys(obj).length === 0; };
  _.isElement = function(obj) { return !!(obj && obj.nodeType === 1); };
  _.isArray = nativeIsArray || function(obj) { return toString.call(obj) === '[object Array]'; };
  _.isObject = function(obj) { var type = typeof obj; return type === 'function' || type === 'object' && !!obj; };
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) { _['is' + name] = function(obj) { return toString.call(obj) === '[object ' + name + ']'; }; });
  if (!_.isArguments(arguments)) { _.isArguments = function(obj) { return _.has(obj, 'callee'); }; }
  if (typeof /./ != 'function' && typeof Int8Array != 'object') { _.isFunction = function(obj) { return typeof obj == 'function' || false; }; }
 	_.isFinite = function(obj) { return isFinite(obj) && !isNaN(parseFloat(obj)); };
  _.isNaN = function(obj) { return _.isNumber(obj) && obj !== +obj; };
  _.isBoolean = function(obj) { return obj === true || obj === false || toString.call(obj) === '[object Boolean]'; };
  _.isNull = function(obj) { return obj === null; };
  _.isUndefined = function(obj) { return obj === void 0; };
  _.has = function(obj, key) { return obj != null && hasOwnProperty.call(obj, key); };
  _.noConflict = function() { root._ = previousUnderscore; return this; };
  _.identity = function(value) { return value; };
  _.constant = function(value) { return function() { return value; }; };
	_.noop = function(){};
	_.property = property;
 	_.propertyOf = function(obj) { return obj == null ? function(){} : function(key) { return obj[key]; }; };
 	_.matcher = _.matches = function(attrs) { attrs = _.extendOwn({}, attrs); return function(obj) { return _.isMatch(obj, attrs); }; };
 	_.times = function(n, iteratee, context) { var accum = Array(Math.max(0, n)); iteratee = optimizeCb(iteratee, context, 1); for (var i = 0; i < n; i++) accum[i] = iteratee(i); return accum; };
 	_.random = function(min, max) { if (max == null) { max = min; min = 0; } return min + Math.floor(Math.random() * (max - min + 1)); };
 	_.now = Date.now || function() { return new Date().getTime(); };

  var escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' }; 
  var unescapeMap = _.invert(escapeMap); 
  var createEscaper = function(map) { var escaper = function(match) { return map[match]; }; var source = '(?:' + _.keys(map).join('|') + ')'; var testRegexp = RegExp(source); var replaceRegexp = RegExp(source, 'g'); return function(string) { string = string == null ? '' : '' + string; return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string; }; }; 
	
	_.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap); 
  _.result = function(object, property, fallback) { var value = object == null ? void 0 : object[property]; if (value === void 0) { value = fallback; } return _.isFunction(value) ? value.call(object) : value; };

  var idCounter = 0;
	
  _.uniqueId = function(prefix) { var id = ++idCounter + ''; return prefix ? prefix + id : id; };

  _.templateSettings = { evaluate    : /<%([\s\S]+?)%>/g, interpolate : /<%=([\s\S]+?)%>/g, escape      : /<%-([\s\S]+?)%>/g };

  var noMatch = /(.)^/;
  var escapes = { "'":      "'", '\\':     '\\', '\r':     'r', '\n':     'n', '\u2028': 'u2028', '\u2029': 'u2029' };
  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
  var escapeChar = function(match) { return '\\' + escapes[match]; };

  _.template = function(text, settings, oldSettings) { if (!settings && oldSettings) settings = oldSettings; settings = _.defaults({}, settings, _.templateSettings);  var matcher = RegExp([ (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source ].join('|') + '|$', 'g');  var index = 0; var source = "__p+='"; text.replace(matcher, function(match, escape, interpolate, evaluate, offset) { source += text.slice(index, offset).replace(escaper, escapeChar); index = offset + match.length;  if (escape) { source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"; } else if (interpolate) { source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"; } else if (evaluate) { source += "';\n" + evaluate + "\n__p+='"; }  return match; }); source += "';\n";  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';  source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';  try { var render = new Function(settings.variable || 'obj', '_', source); } catch (e) { e.source = source; throw e; }  var template = function(data) { return render.call(this, data, _); };  var argument = settings.variable || 'obj'; template.source = 'function(' + argument + '){\n' + source + '}';  return template; }; 
  _.chain = function(obj) { var instance = _(obj); instance._chain = true; return instance; };

  var result = function(instance, obj) { return instance._chain ? _(obj).chain() : obj; };

  _.mixin = function(obj) { _.each(_.functions(obj), function(name) { var func = _[name] = obj[name]; _.prototype[name] = function() { var args = [this._wrapped]; push.apply(args, arguments); return result(this, func.apply(_, args)); }; }); };
 _.mixin(_);
 
	_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) { var method = ArrayProto[name]; _.prototype[name] = function() { var obj = this._wrapped; method.apply(obj, arguments); if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0]; return result(this, obj); }; });
 _.each(['concat', 'join', 'slice'], function(name) { var method = ArrayProto[name]; _.prototype[name] = function() { return result(this, method.apply(this._wrapped, arguments)); }; });

	_.prototype.value = function() { return this._wrapped; };
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
  _.prototype.toString = function() { return '' + this._wrapped; };

	if (typeof define === 'function' && define.amd) { define('underscore', [], function() { return _; }); }
	
}.call(this));

(function(factory) { 
	var root = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global; if (typeof define === 'function' && define.amd) { define(['underscore','exports'], function(_,exports) { root.Backbone = factory(root, exports, _); });  } else if (typeof exports !== 'undefined') { var _ = require('underscore'); factory(root, exports, _); } else { root.Backbone = factory(root, {}, root._); }  	
})(function(root, Backbone, _) {
  var previousBackbone = root.Backbone;
  var slice = Array.prototype.slice;
  Backbone.VERSION = '1.4.0';

  Backbone.noConflict = function() { root.Backbone = previousBackbone; return this; };
  Backbone.emulateHTTP = false;
  Backbone.emulateJSON = false;

  var Events = Backbone.Events = {};
  var eventSplitter = /\s+/;
  var _listening;

  var eventsApi = function(iteratee, events, name, callback, opts) { var i = 0, names; if (name && typeof name === 'object') { if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback; for (names = _.keys(name); i < names.length ; i++) { events = eventsApi(iteratee, events, names[i], name[names[i]], opts); } } else if (name && eventSplitter.test(name)) { for (names = name.split(eventSplitter); i < names.length; i++) { events = iteratee(events, names[i], callback, opts); } } else { events = iteratee(events, name, callback, opts); } return events; };
  Events.on = function(name, callback, context) { this._events = eventsApi(onApi, this._events || {}, name, callback, { context: context, ctx: this, listening: _listening });  if (_listening) { var listeners = this._listeners || (this._listeners = {}); listeners[_listening.id] = _listening; _listening.interop = false; }  return this; };
  Events.listenTo = function(obj, name, callback) { if (!obj) return this; var id = obj._listenId || (obj._listenId = _.uniqueId('l')); var listeningTo = this._listeningTo || (this._listeningTo = {}); var listening = _listening = listeningTo[id]; if (!listening) { this._listenId || (this._listenId = _.uniqueId('l')); listening = _listening = listeningTo[id] = new Listening(this, obj); } var error = tryCatchOn(obj, name, callback, this); _listening = void 0; if (error) throw error; if (listening.interop) listening.on(name, callback); return this; };
  var onApi = function(events, name, callback, options) { if (callback) { var handlers = events[name] || (events[name] = []); var context = options.context, ctx = options.ctx, listening = options.listening; if (listening) listening.count++;  handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening}); } return events; };
  var tryCatchOn = function(obj, name, callback, context) { try { obj.on(name, callback, context); } catch (e) { return e; } };
  Events.off = function(name, callback, context) { if (!this._events) return this; this._events = eventsApi(offApi, this._events, name, callback, { context: context, listeners: this._listeners });  return this; };
  Events.stopListening = function(obj, name, callback) { var listeningTo = this._listeningTo; if (!listeningTo) return this; var ids = obj ? [obj._listenId] : _.keys(listeningTo); for (var i = 0; i < ids.length; i++) { var listening = listeningTo[ids[i]]; if (!listening) break; listening.obj.off(name, callback, this); if (listening.interop) listening.off(name, callback); } if (_.isEmpty(listeningTo)) this._listeningTo = void 0; return this; };
	var offApi = function(events, name, callback, options) { if (!events) return; var context = options.context, listeners = options.listeners; var i = 0, names;  if (!name && !context && !callback) { for (names = _.keys(listeners); i < names.length; i++) { listeners[names[i]].cleanup(); } return; }  names = name ? [name] : _.keys(events); for (; i < names.length; i++) { name = names[i]; var handlers = events[name]; if (!handlers) break; var remaining = []; for (var j = 0; j < handlers.length; j++) { var handler = handlers[j]; if ( callback && callback !== handler.callback && callback !== handler.callback._callback || context && context !== handler.context ) { remaining.push(handler); } else { var listening = handler.listening; if (listening) listening.off(name, callback); } }  if (remaining.length) { events[name] = remaining; } else { delete events[name]; } }  return events; };
  Events.once = function(name, callback, context) { var events = eventsApi(onceMap, {}, name, callback, this.off.bind(this)); if (typeof name === 'string' && context == null) callback = void 0; return this.on(events, callback, context); };
  Events.listenToOnce = function(obj, name, callback) { var events = eventsApi(onceMap, {}, name, callback, this.stopListening.bind(this, obj)); return this.listenTo(obj, events); }; 
  var onceMap = function(map, name, callback, offer) { if (callback) { var once = map[name] = _.once(function() { offer(name, once); callback.apply(this, arguments); }); once._callback = callback; } return map; };
  Events.trigger = function(name) { if (!this._events) return this;  var length = Math.max(0, arguments.length - 1); var args = Array(length); for (var i = 0; i < length; i++) args[i] = arguments[i + 1];  eventsApi(triggerApi, this._events, name, void 0, args); return this; };

	var triggerApi = function(objEvents, name, callback, args) { if (objEvents) { var events = objEvents[name]; var allEvents = objEvents.all; if (events && allEvents) allEvents = allEvents.slice(); if (events) triggerEvents(events, args); if (allEvents) triggerEvents(allEvents, [name].concat(args)); } return objEvents; }; 
  var triggerEvents = function(events, args) { var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2]; switch (args.length) { case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return; case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return; case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return; case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return; default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return; } };

  var Listening = function(listener, obj) { this.id = listener._listenId; this.listener = listener; this.obj = obj; this.interop = true; this.count = 0; this._events = void 0; };
 	Listening.prototype.on = Events.on;
  Listening.prototype.off = function(name, callback) { var cleanup; if (this.interop) { this._events = eventsApi(offApi, this._events, name, callback, { context: void 0, listeners: void 0 }); cleanup = !this._events; } else { this.count--; cleanup = this.count === 0; } if (cleanup) this.cleanup(); }; 
  Listening.prototype.cleanup = function() { delete this.listener._listeningTo[this.obj._listenId]; if (!this.interop) delete this.obj._listeners[this.id]; }; 
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  _.extend(Backbone, Events);

  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    var defaults = _.result(this, 'defaults');
    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  _.extend(Model.prototype, Events, {
    changed: null,
    validationError: null,
    idAttribute: 'id',
    cidPrefix: 'c',
    preinitialize: function(){},
    initialize: function(){},
    toJSON: function(options) { return _.clone(this.attributes); },
        
    /**/
    sync: function() { return Backbone.sync.apply(this, arguments); },
    
    get: function(attr) { return this.attributes[attr]; },
    escape: function(attr) { return _.escape(this.get(attr)); },
    has: function(attr) { return this.get(attr) != null; },
    matches: function(attrs) { return !!_.iteratee(attrs, this)(this.attributes); },
    
    /**/
    set: function(key, val, options) { if (key == null) return this;   var attrs; if (typeof key === 'object') { attrs = key; options = val; } else { (attrs = {})[key] = val; }  options || (options = {});   if (!this._validate(attrs, options)) return false;   var unset      = options.unset; var silent     = options.silent; var changes    = []; var changing   = this._changing; this._changing = true;  if (!changing) { this._previousAttributes = _.clone(this.attributes); this.changed = {}; }  var current = this.attributes; var changed = this.changed; var prev    = this._previousAttributes;  for (var attr in attrs) { val = attrs[attr]; if (!_.isEqual(current[attr], val)) changes.push(attr); if (!_.isEqual(prev[attr], val)) { changed[attr] = val; } else { delete changed[attr]; } unset ? delete current[attr] : current[attr] = val; }   if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);  if (!silent) { if (changes.length) this._pending = options; for (var i = 0; i < changes.length; i++) { this.trigger('change:' + changes[i], this, current[changes[i]], options); } }  if (changing) return this; if (!silent) { while (this._pending) { options = this._pending; this._pending = false; this.trigger('change', this, options); } } this._pending = false; this._changing = false; return this; },  
    
    
    unset: function(attr, options) { return this.set(attr, void 0, _.extend({}, options, {unset: true})); },
    clear: function(options) { var attrs = {}; for (var key in this.attributes) attrs[key] = void 0; return this.set(attrs, _.extend({}, options, {unset: true})); },
    hasChanged: function(attr) { if (attr == null) return !_.isEmpty(this.changed); return _.has(this.changed, attr); },
    changedAttributes: function(diff) { if (!diff) return this.hasChanged() ? _.clone(this.changed) : false; var old = this._changing ? this._previousAttributes : this.attributes; var changed = {}; var hasChanged; for (var attr in diff) { var val = diff[attr]; if (_.isEqual(old[attr], val)) continue; changed[attr] = val; hasChanged = true; } return hasChanged ? changed : false; }, 
    previous: function(attr) { if (attr == null || !this._previousAttributes) return null; return this._previousAttributes[attr]; },
 	previousAttributes: function() { return _.clone(this._previousAttributes); },
    fetch: function(options) { options = _.extend({parse: true}, options); var model = this; var success = options.success; options.success = function(resp) { var serverAttrs = options.parse ? model.parse(resp, options) : resp; if (!model.set(serverAttrs, options)) return false; if (success) success.call(options.context, model, resp, options); model.trigger('sync', model, resp, options); }; wrapError(this, options); return this.sync('read', this, options); },  
	save: function(key, val, options) { var attrs; if (key == null || typeof key === 'object') { attrs = key; options = val; } else { (attrs = {})[key] = val; }  options = _.extend({validate: true, parse: true}, options); var wait = options.wait;  if (attrs && !wait) { if (!this.set(attrs, options)) return false; } else if (!this._validate(attrs, options)) { return false; }  var model = this; var success = options.success; var attributes = this.attributes; options.success = function(resp) { model.attributes = attributes; var serverAttrs = options.parse ? model.parse(resp, options) : resp; if (wait) serverAttrs = _.extend({}, attrs, serverAttrs); if (serverAttrs && !model.set(serverAttrs, options)) return false; if (success) success.call(options.context, model, resp, options); model.trigger('sync', model, resp, options); }; wrapError(this, options); if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);  var method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update'; if (method === 'patch' && !options.attrs) options.attrs = attrs; var xhr = this.sync(method, this, options);  this.attributes = attributes;  return xhr; },  
	destroy: function(options) { options = options ? _.clone(options) : {}; var model = this; var success = options.success; var wait = options.wait;  var destroy = function() { model.stopListening(); model.trigger('destroy', model, model.collection, options); };  options.success = function(resp) { if (wait) destroy(); if (success) success.call(options.context, model, resp, options); if (!model.isNew()) model.trigger('sync', model, resp, options); };  var xhr = false; if (this.isNew()) { _.defer(options.success); } else { wrapError(this, options); xhr = this.sync('delete', this, options); } if (!wait) destroy(); return xhr; },  
	url: function() { var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError(); if (this.isNew()) return base; var id = this.get(this.idAttribute); return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id); },  parse: function(resp, options) { return resp; },
    clone: function() { return new this.constructor(this.attributes); },
    isNew: function() { return !this.has(this.idAttribute); },
    isValid: function(options) { return this._validate({}, _.extend({}, options, {validate: true})); },
    _validate: function(attrs, options) { if (!options.validate || !this.validate) return true; attrs = _.extend({}, this.attributes, attrs); var error = this.validationError = this.validate(attrs, options) || null; if (!error) return true; this.trigger('invalid', this, error, _.extend(options, {validationError: error})); return false; }

  });

  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    this.preinitialize.apply(this, arguments);
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  var splice = function(array, insert, at) {
    at = Math.min(Math.max(at, 0), array.length);
    var tail = Array(array.length - at);
    var length = insert.length;
    var i;
    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
    for (i = 0; i < length; i++) array[i + at] = insert[i];
    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
  };
	
  _.extend(Collection.prototype, Events, {
    model: Model,
    preinitialize: function(){},
    initialize: function(){},
    toJSON: function(options) { return this.map(function(model) { return model.toJSON(options); }); },
    
    /**/
    sync: function() { return Backbone.sync.apply(this, arguments); },
   
    add: function(models, options) { return this.set(models, _.extend({merge: false}, options, addOptions)); },
    remove: function(models, options) { options = _.extend({}, options); var singular = !_.isArray(models); models = singular ? [models] : models.slice(); var removed = this._removeModels(models, options); if (!options.silent && removed.length) { options.changes = {added: [], merged: [], removed: removed}; this.trigger('update', this, options); } return singular ? removed[0] : removed; },
    
    /**/
    set: function(models, options) { if (models == null) return;  options = _.extend({}, setOptions, options); if (options.parse && !this._isModel(models)) { models = this.parse(models, options) || []; }  var singular = !_.isArray(models); models = singular ? [models] : models.slice();  var at = options.at; if (at != null) at = +at; if (at > this.length) at = this.length; if (at < 0) at += this.length + 1;  var set = []; var toAdd = []; var toMerge = []; var toRemove = []; var modelMap = {};  var add = options.add; var merge = options.merge; var remove = options.remove;  var sort = false; var sortable = this.comparator && at == null && options.sort !== false; var sortAttr = _.isString(this.comparator) ? this.comparator : null;  var model, i; for (i = 0; i < models.length; i++) { model = models[i]; var existing = this.get(model); if (existing) { if (merge && model !== existing) { var attrs = this._isModel(model) ? model.attributes : model; if (options.parse) attrs = existing.parse(attrs, options); existing.set(attrs, options); toMerge.push(existing); if (sortable && !sort) sort = existing.hasChanged(sortAttr); } if (!modelMap[existing.cid]) { modelMap[existing.cid] = true; set.push(existing); } models[i] = existing;  } else if (add) { model = models[i] = this._prepareModel(model, options); if (model) { toAdd.push(model); this._addReference(model, options); modelMap[model.cid] = true; set.push(model); } } } if (remove) { for (i = 0; i < this.length; i++) { model = this.models[i]; if (!modelMap[model.cid]) toRemove.push(model); } if (toRemove.length) this._removeModels(toRemove, options); }  var orderChanged = false; var replace = !sortable && add && remove; if (set.length && replace) { orderChanged = this.length !== set.length || _.some(this.models, function(m, index) { return m !== set[index]; }); this.models.length = 0; splice(this.models, set, 0); this.length = this.models.length; } else if (toAdd.length) { if (sortable) sort = true; splice(this.models, toAdd, at == null ? this.length : at); this.length = this.models.length; } if (sort) this.sort({silent: true}); if (!options.silent) { for (i = 0; i < toAdd.length; i++) { if (at != null) options.index = at + i; model = toAdd[i]; model.trigger('add', model, this, options); } if (sort || orderChanged) this.trigger('sort', this, options); if (toAdd.length || toRemove.length || toMerge.length) { options.changes = { added: toAdd, removed: toRemove, merged: toMerge }; this.trigger('update', this, options); } } return singular ? models[0] : models; },
    
    reset: function(models, options) { options = options ? _.clone(options) : {}; for (var i = 0; i < this.models.length; i++) { this._removeReference(this.models[i], options); } options.previousModels = this.models; this._reset(); models = this.add(models, _.extend({silent: true}, options)); if (!options.silent) this.trigger('reset', this, options); return models; },
    push: function(model, options) { return this.add(model, _.extend({at: this.length}, options)); },
    pop: function(options) { var model = this.at(this.length - 1); return this.remove(model, options); },
    unshift: function(model, options) { return this.add(model, _.extend({at: 0}, options)); },
    shift: function(options) { var model = this.at(0); return this.remove(model, options); },
    slice: function() { return slice.apply(this.models, arguments); },
    get: function(obj) { if (obj == null) return void 0; return this._byId[obj] || this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj, obj.idAttribute)] || obj.cid && this._byId[obj.cid]; },
    has: function(obj) { return this.get(obj) != null; },
    at: function(index) { if (index < 0) index += this.length; return this.models[index]; },
    where: function(attrs, first) { return this[first ? 'find' : 'filter'](attrs); },
    findWhere: function(attrs) { return this.where(attrs, true); },
    sort: function(options) { var comparator = this.comparator; if (!comparator) throw new Error('Cannot sort a set without a comparator'); options || (options = {});  var length = comparator.length; if (_.isFunction(comparator)) comparator = comparator.bind(this); if (length === 1 || _.isString(comparator)) { this.models = this.sortBy(comparator); } else { this.models.sort(comparator); } if (!options.silent) this.trigger('sort', this, options); return this; },
    pluck: function(attr) { return this.map(attr + ''); },
    fetch: function(options) { options = _.extend({parse: true}, options); var success = options.success; var collection = this; options.success = function(resp) { var method = options.reset ? 'reset' : 'set'; collection[method](resp, options); if (success) success.call(options.context, collection, resp, options); collection.trigger('sync', collection, resp, options); }; wrapError(this, options); return this.sync('read', this, options); },
    create: function(model, options) { options = options ? _.clone(options) : {}; var wait = options.wait; model = this._prepareModel(model, options); if (!model) return false; if (!wait) this.add(model, options); var collection = this; var success = options.success; options.success = function(m, resp, callbackOpts) { if (wait) collection.add(m, callbackOpts); if (success) success.call(callbackOpts.context, m, resp, callbackOpts); }; model.save(null, options); return model; }, 
    parse: function(resp, options) { return resp; },
	clone: function() { return new this.constructor(this.models, { model: this.model, comparator: this.comparator }); },
    modelId: function(attrs, idAttribute) { return attrs[idAttribute || this.model.prototype.idAttribute || 'id']; },
    values: function() { return new CollectionIterator(this, ITERATOR_VALUES); },
    keys: function() { return new CollectionIterator(this, ITERATOR_KEYS); },
    entries: function() { return new CollectionIterator(this, ITERATOR_KEYSVALUES); },
		
    _reset: function() { this.length = 0; this.models = []; this._byId  = {}; },
    _prepareModel: function(attrs, options) { if (this._isModel(attrs)) { if (!attrs.collection) attrs.collection = this; return attrs; } options = options ? _.clone(options) : {}; options.collection = this; var model = new this.model(attrs, options); if (!model.validationError) return model; this.trigger('invalid', this, model.validationError, options); return false; },
    _removeModels: function(models, options) { var removed = []; for (var i = 0; i < models.length; i++) { var model = this.get(models[i]); if (!model) continue;  var index = this.indexOf(model); this.models.splice(index, 1); this.length--; delete this._byId[model.cid]; var id = this.modelId(model.attributes, model.idAttribute); if (id != null) delete this._byId[id];  if (!options.silent) { options.index = index; model.trigger('remove', model, this, options); }  removed.push(model); this._removeReference(model, options); } return removed; },
    _isModel: function(model) { return model instanceof Model; },
    _addReference: function(model, options) { this._byId[model.cid] = model; var id = this.modelId(model.attributes, model.idAttribute); if (id != null) this._byId[id] = model; model.on('all', this._onModelEvent, this); },
    _removeReference: function(model, options) { delete this._byId[model.cid]; var id = this.modelId(model.attributes, model.idAttribute); if (id != null) delete this._byId[id]; if (this === model.collection) delete model.collection; model.off('all', this._onModelEvent, this); },
    _onModelEvent: function(event, model, collection, options) { if (model) { if ((event === 'add' || event === 'remove') && collection !== this) return; if (event === 'destroy') this.remove(model, options); if (event === 'change') { var prevId = this.modelId(model.previousAttributes(), model.idAttribute); var id = this.modelId(model.attributes, model.idAttribute); if (prevId !== id) { if (prevId != null) delete this._byId[prevId]; if (id != null) this._byId[id] = model; } } } this.trigger.apply(this, arguments); }

  });

  var $$iterator = typeof Symbol === 'function' && Symbol.iterator;
  if ($$iterator) { Collection.prototype[$$iterator] = Collection.prototype.values; }
  var CollectionIterator = function(collection, kind) { this._collection = collection; this._kind = kind; this._index = 0; };

  var ITERATOR_VALUES = 1;
  var ITERATOR_KEYS = 2;
  var ITERATOR_KEYSVALUES = 3;

  if ($$iterator) { CollectionIterator.prototype[$$iterator] = function() { return this; }; }

  CollectionIterator.prototype.next = function() { if (this._collection) { if (this._index < this._collection.length) { var model = this._collection.at(this._index); this._index++; var value; if (this._kind === ITERATOR_VALUES) { value = model; } else { var id = this._collection.modelId(model.attributes); if (this._kind === ITERATOR_KEYS) { value = id; } else {  value = [id, model]; } } return {value: value, done: false}; } this._collection = void 0; }  return {value: void 0, done: true}; };

  var addMethod = function(base, length, method, attribute) { switch (length) { case 1: return function() { return base[method](this[attribute]); }; case 2: return function(value) { return base[method](this[attribute], value); }; case 3: return function(iteratee, context) { return base[method](this[attribute], cb(iteratee, this), context); }; case 4: return function(iteratee, defaultVal, context) { return base[method](this[attribute], cb(iteratee, this), defaultVal, context); }; default: return function() { var args = slice.call(arguments); args.unshift(this[attribute]); return base[method].apply(base, args); }; } };
  var addUnderscoreMethods = function(Class, base, methods, attribute) { _.each(methods, function(length, method) { if (base[method]) Class.prototype[method] = addMethod(base, length, method, attribute); }); };
  var cb = function(iteratee, instance) { if (_.isFunction(iteratee)) return iteratee; if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee); if (_.isString(iteratee)) return function(model) { return model.get(iteratee); }; return iteratee; };
  var modelMatcher = function(attrs) { var matcher = _.matches(attrs); return function(model) { return matcher(model.attributes); }; };

  var collectionMethods = { forEach: 3, each: 3,  map: 3, collect: 3,  reduce: 0, foldl: 0, inject: 0,  reduceRight: 0, foldr: 0,  find: 3, detect: 3, filter: 3, select: 3, reject: 3,  every: 3, all: 3,  some: 3, any: 3,  include: 3, includes: 3, contains: 3,  invoke: 0, max: 3, min: 3,  toArray: 1, size: 1, first: 3, head: 3, take: 3, initial: 3,  rest: 3, tail: 3, drop: 3, last: 3, without: 0, difference: 0,  indexOf: 3, shuffle: 1, lastIndexOf: 3, isEmpty: 1, chain: 1,  sample: 3, partition: 3,  groupBy: 3, countBy: 3, sortBy: 3, indexBy: 3,  findIndex: 3, findLastIndex: 3 }; 
  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0, omit: 0, chain: 1, isEmpty: 1};

  _.each([ [Collection, collectionMethods, 'models'], [Model, modelMethods, 'attributes'] ], function(config) { var Base = config[0], methods = config[1], attribute = config[2];  Base.mixin = function(obj) { var mappings = _.reduce(_.functions(obj), function(memo, name) { memo[name] = 0; return memo; }, {}); addUnderscoreMethods(Base, obj, mappings, attribute); };  addUnderscoreMethods(Base, _, methods, attribute); }); 
 
  function S4() { return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1); }

function guid() { return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4(); }

function updateCollectionReferences(collection, callback, err, data) { if (collection) { var collectionData = collection.map(function(model) { return collection.model.prototype.sync._localforageNamespace + '/' + model.id; }); callback = callback ? _.partial(callback, err, data) : undefined; if (!collection.sync.localforageKey) { localforageKey(collection); } localforage.setItem(collection.sync.localforageKey, collectionData, callback); } }
function localforageKey(model) { if (model instanceof Backbone.Collection) { model.sync.localforageKey = model.sync._localforageNamespace; } else {  if (!model.id) { model[model.idAttribute] = model.attributes[model.idAttribute] = guid(); }  model.sync.localforageKey = model.sync._localforageNamespace + '/' + model.id; } }

Backbone.localforage = {
	localforageInstance: localforage,  
	sync: function(name) {   var self = this;     var sync = function(method, model, options) {     localforageKey(model);       switch (method) {       case 'read': return model.id ? self.find(model, options) : self.findAll(model, options);                 case 'create': return self.create(model, options);                 case 'update': return self.update(model, options);                 case 'delete': return self.destroy(model, options);             }  }; sync._localforageNamespace = name; sync._localeForageKeyFn = localforageKey; return sync; },
	save: function(model, callback) { localforage.setItem(model.sync.localforageKey, model.toJSON(), function(err, data) { if (model.collection) { updateCollectionReferences(model.collection, callback, err, data); } else if (callback) { callback(data); } }); },
    create: function(model, callbacks) { return this.update(model, callbacks); },
    update: function(model, callbacks) { this.save(model, function(data) { if (callbacks.success) { callbacks.success(data); } }); },
    find: function(model, callbacks) { localforage.getItem(model.sync.localforageKey, function(err, data) { if (!err && !_.isEmpty(data)) { if (callbacks.success) { callbacks.success(data); } } else if (callbacks.error) { callbacks.error(); } }); },
    findAll: function(collection, callbacks) { localforage.getItem(collection.sync.localforageKey, function(err, data) { if (!err && data && data.length) { var done = function() { if (callbacks.success) { callbacks.success(data); } };  done = _.after(data.length, done);  var onModel = function(i, err, model) { data[i] = model; done(); };  for (var i = 0; i < data.length; ++i) { localforage.getItem(data[i], _.partial(onModel, i)); } } else { data = []; if (callbacks.success) { callbacks.success(data); } } }); }, 
    destroy: function(model, callbacks) { var collection = model.collection; localforage.removeItem(model.sync.localforageKey, function() { if (collection) { updateCollectionReferences(collection, callbacks.success, null, model.toJSON()); } else if (callbacks.success) { callbacks.success(model.toJSON()); } }); }
};

  Backbone.extend = function(protoProps, staticProps) { var parent = this; var child; if (protoProps && _.has(protoProps, 'constructor')) { child = protoProps.constructor; } else { child = function(){ return parent.apply(this, arguments); }; } _.extend(child, parent, staticProps); child.prototype = _.create(parent.prototype, protoProps); child.prototype.constructor = child; child.__super__ = parent.prototype;  return child; };

  Model.extend = Collection.extend = Backbone.extend;

  var urlError = function() { throw new Error('A "url" property or function must be specified'); };
  var wrapError = function(model, options) { var error = options.error; options.error = function(resp) { if (error) error.call(options.context, model, resp, options); model.trigger('error', model, resp, options); }; };

  return Backbone;
	
});
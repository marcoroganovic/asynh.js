(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Constructs AJAX request
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @param {Object} options
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @return {Object} XHR
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                **/var
AsyncRequest = function () {
  function AsyncRequest(options) {_classCallCheck(this, AsyncRequest);var
    method = options.method,url = options.url,headers = options.headers,responseType = options.responseType,rawResponse = options.rawResponse;
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = headers || null;
    this.responseType = responseType;
    this.rawResponse = rawResponse;
    this.progressHandlers = [];
    this.successHandlers = [];
    this.failureHandlers = [];
    this.request = new XMLHttpRequest();
    this.inject = null;
  }


  /**
     * Internal helper method for type checking
     * @param {String} typeName
     * @param {Any} predicate
     *
     **/_createClass(AsyncRequest, [{ key: "isType", value: function isType(
    typeName, predicate) {
      if ((typeof predicate === "undefined" ? "undefined" : _typeof(predicate)) === typeName) {
        return true;
      } else {
        throw new Error("Expected type " + typeName + ", instead got " + (typeof predicate === "undefined" ? "undefined" : _typeof(predicate)));
      }
    }


    /**
       * Injects function in every callback (for instance Redux's dispatch)
       * @param {Function} injector
       *
       **/ }, { key: "inject", value: function inject(
    fn) {
      if (isType("function", fn)) {
        this.inject = fn;
      }
    }


    /**
       * Parses text in CSV format to JSON objects
       * @param {String} response
       *
       **/ }, { key: "parseCSV", value: function parseCSV(
    response) {var
      isType = this.isType;

      if (isType("string", response)) {
        response = response.trim().split("\n");
        var firstLine = response.shift().split(",");

        return response.reduce(function (acc, current) {
          var obj = {};
          current = current.trim().split(',');

          firstLine.forEach(function (prop, index) {
            obj[prop] = current[index];
          });

          return acc.push(obj);
        }, []);
      }

      return response;
    }


    /**
       * Adds callback or callbacks to {handlersName} if type === "function"
       * @param {String} handlersName
       * @param {Array} callbacks
       *
       **/ }, { key: "addToHandlers", value: function addToHandlers(

    handlersName, callbacks) {var _this = this;var
      isType = this.isType;

      if (callbacks.length === 1) {
        if (isType("function", callbacks[0])) {
          this[handlersName].push(callbacks[0]);
        }
      }

      if (callbacks.length > 1) {
        callbacks.forEach(function (cb) {
          if (isType("function", cb)) {
            _this[handlersName].push(cb);
          }
        });
      }


    }

    /**
       * Adds callback to progress handlers
       * @param {Function} callback
       *
       **/ }, { key: "progress", value: function progress(
    callback) {
      this.addToHandlers("progressHandlers", Array.from(arguments));
      return this;
    }


    /**
       * Adds callback to success handlers
       * @param {Function} callback
       *
       **/ }, { key: "success", value: function success(
    callback) {
      this.addToHandlers("successHandlers", Array.from(arguments));
      return this;
    }


    /**
       * Adds callback to failure handlers
       * @param {Function} callback
       *
       **/ }, { key: "failure", value: function failure(
    callback) {
      this.addToHandlers("failureHandlers", Array.from(arguments));
      return this;
    }


    /**
       * Sets headers to request object
       **/ }, { key: "setHeaders", value: function setHeaders()
    {
      for (var header in headers) {
        this.request.setRequestHeader(header, headers[header]);
      }
      this.setFormHeaders();
    }

    /**
       * Check if is "POST" or "PUT"  method to set application multipart header
       *
       **/ }, { key: "setFormHeader", value: function setFormHeader()
    {
      if (this.method === "POST" || this.method === "PUT") {
        var contentType =
        headers["Content-Type"] || "application/x-www-form-urlencoded";

        this.request.setRequestHeader("Content-Type", contentType);
      }
    }


    /**
       * Formats response based on rawResponse and responseType options
       * @param {Event} res
       * @return {Text | JSON | DOM} 
       *
       **/ }, { key: "formatResponse", value: function formatResponse(
    res) {
      var resContent = res.target.responseText;

      if (this.rawResponse) {
        return resContent;
      }

      if (this.responseType === "json") {
        return JSON.parse(resContent);
      }


      if (this.responseType === "xml") {
        var parser = new DOMParser();
        return parser.parseFromString(resContent, "text/xml");
      }

      if (this.responseType === "csv") {
        return this.parseCSV(resContent);
      }
    }

    /**
       * Generic function for handler setup
       * @param {String} eventName
       * @param {String} handlersName
       *
       **/ }, { key: "setEventHandlers", value: function setEventHandlers(
    eventName, handlersName) {var _this2 = this;
      var value = void 0;

      return function () {
        if (_this2[handlersName].length) {
          _this2.request.addEventListener(eventName, function (res) {
            _this2[handlersName].forEach(function (handler) {
              var response = _this2.formatResponse(res);
              value = handler(value || res, _this2.inject);
            });
          });
        }
      };
    }


    /**
       * Calls all methods in progressHandlers on progress event
       *
       **/ }, { key: "setProgressHandlers", value: function setProgressHandlers()
    {
      this.setEventHandlers("progress", "progressHandlers")();
    }


    /**
       * Calls all methods in successHandlers on success event
       *
       **/ }, { key: "setSuccessHandlers", value: function setSuccessHandlers()
    {
      this.setEventHandlers("load", "successHandlers")();
    }


    /**
       * Calls all methods in falureHandlers on error event
       *
       **/ }, { key: "setFailureHandlers", value: function setFailureHandlers()
    {
      this.setEventHandlers("error", "failureHandlers")();
    }


    /**
       * Set event listeners for XHR events 
       *
       **/ }, { key: "setupListeners", value: function setupListeners()
    {
      this.setProgressHandlers();
      this.setSuccessHandlers();
      this.setFailureHandlers();
    }


    /**
       * Initiates XHR request
       **/ }, { key: "send", value: function send()
    {
      this.setHeaders();
      this.setupListeners();
      this.request.send();
    } }]);return AsyncRequest;}();exports.default =




AsyncRequest;

},{}],2:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _asyncRequest = require("./async-request");var _asyncRequest2 = _interopRequireDefault(_asyncRequest);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.default = _asyncRequest2.default;

},{"./async-request":1}]},{},[2]);

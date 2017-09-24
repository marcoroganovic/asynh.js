/**
 * Constructs AJAX request
 * @param {Object} options
 * @return {Object} XHR
 *
 **/
class AsyncRequest {
  constructor(options) {
    const { method, url } = options;
    this.method = method.toUpperCase();
    this.url = url;
    this.headers = options.headers || null;
    this.responseType = options.responseType || null;
    this.rawResponse = !!options.rawResponse;
    this.progressHandlers = [];
    this.successHandlers = [];
    this.failureHandlers = [];
    this.abortHandlers = [];
    this.endHandlers = [];
    this.request = new XMLHttpRequest();
    this.inject = null;
    this.requestReady = false;
  }


  /**
   * Internal helper method for type checking
   * @param {String} typeName
   * @param {Any} predicate
   *
   **/
  isType(typeName, predicate) {
    if(typeof predicate === typeName) {
      return true;
    } else {
      throw new Error(`Expected type ${typeName}, instead got ${typeof predicate}`);
    }
  }


  /**
   * Injects function in every callback (for instance Redux's dispatch)
   * @param {Function} injector
   *
   **/
  inject(fn) {
    if(isType("function", fn)) {
      this.inject = fn;
    }

    return this;
  }


  /**
   * Parses text in CSV format to JSON objects
   * @param {String} response
   * @return {Object|String} formattedResponse
   **/
  parseCSV(response) {
    const { isType } = this;

    if(isType("string", response)) {
      response = response.trim().split("\n");
      const firstLine = response.shift().split(",");

      return response.reduce((acc, current) => {
        const obj = {};
        current = current.trim().split(',');

        firstLine.forEach((prop, index) => {
          obj[prop] = current[index];
        });

        acc.push(obj);
        return acc;
      }, []);
    }

    return response;
  }


  /**
   * Adds callback or callbacks to {handlersName} if type === "function"
   * @param {String} handlersName
   * @param {Array} callbacks
   *
   **/
  
  addToHandlers(handlersName, callbacks) {
    const { isType } = this;
    
    if(callbacks.length === 1) {
      if(isType("function", callbacks[0])) {
        this[handlersName].push(callbacks[0]);
      }
    }

    if(callbacks.length > 1) {
      callbacks.forEach(cb => {
        if(isType("function", cb)) {
          this[handlersName].push(cb);
        }
      });
    }


  }

  /**
   * Adds callback to progress handlers
   * @param {Function} callback
   *
   **/
  progress(callback) {
    this.addToHandlers("progressHandlers", Array.from(arguments));
    return this;
  }


  /**
   * Adds callback to success handlers
   * @param {Function} callback
   *
   **/
  success(callback) {
    this.addToHandlers("successHandlers", Array.from(arguments));
    return this;
  }


  /**
   * Adds callback to failure handlers
   * @param {Function} callback
   *
   **/
  failure(callback) {
    this.addToHandlers("failureHandlers", Array.from(arguments));
    return this;
  }


  /**
   * Sets headers to request object
   **/
  setHeaders() {
    if(this.headers && this.isType("object", this.headers)) {
      for(let header in this.headers) {
        this.request.setRequestHeader(header, this.headers[header]);
      }
      this.setFormHeaders();
    }
  }

  /**
   * Check if is "POST" or "PUT"  method to set application multipart header
   *
   **/
  setFormHeader() {
    if(this.method === "POST" || this.method === "PUT") {
      let contentType = (
        headers["Content-Type"] || "application/x-www-form-urlencoded"
      );
      this.request.setRequestHeader("Content-Type", contentType);
    }
  }


  /**
   * Formats response based on rawResponse and responseType options
   * @param {Event} res
   * @return {Text | JSON | DOM} 
   *
   **/
  formatResponse(res) {
    let resContent = res.currentTarget.responseText;

    if(this.rawResponse) {
      return resContent;
    }

    if(this.responseType === "json") {
      return JSON.parse(resContent);
    }


    if(this.responseType === "xml") {
      let parser = new DOMParser();
      return parser.parseFromString(resContent, "text/xml");
    }

    if(this.responseType === "csv") {
      return this.parseCSV(resContent);
    }


    return resContent;
  }

  /**
   * Generic function for handler setup
   * @param {String} eventName
   * @param {String} handlersName
   *
   **/
  setEventHandlers(eventName, handlersName) {
    let value;

    return () => {
      if(this[handlersName].length) {
        this.request.addEventListener(eventName, (res) => {
          if(handlersName === "successHandlers") {
            if(this.request.status === 200) {
              this[handlersName].forEach(handler => {
                let response = value || this.formatResponse(res);
                value = handler(response, this.inject);
              });
            }
          } else {
            this[handlersName].forEach(handler => {
              handler(res);
            });
          }
        });
      }
    }
  }


  /**
   * Calls all methods in progressHandlers on progress event
   *
   **/  
  setProgressHandlers() {
    this.setEventHandlers("progress", "progressHandlers")();
  }


  /**
   * Calls all methods in successHandlers on success event
   *
   **/
  setSuccessHandlers() {
    this.setEventHandlers("load", "successHandlers")();
  }


  /**
   * Calls all methods in falureHandlers on error event
   *
   **/
  setFailureHandlers() {
    this.setEventHandlers("error", "failureHandlers")();
  }
 
  /**
   * Calls all methods in abortHandlers on request cancelation
   *
   **/

  setAbortHandlers() {
    this.setEventHandlers("abort", "abortHandlers")();
  }


  /**
   * Calls all methods in endHandlers on request end, whether is successful or
   * not
   *
   **/
  setOnRequestEndHandlers() {
    this.setEventHandlers("end", "endHandlers")();
  }


  /**
   * Set event listeners for XHR events 
   *
   **/
  setupListeners() {
    this.setProgressHandlers();
    this.setSuccessHandlers();
    this.setFailureHandlers();
    this.setAbortHandlers();
    this.setOnRequestEndHandlers();
  }


  /**
   * Aborts XHR request
   *
   **/
  abort() {
    this.request.abort();
  }

  
  /**
   * Formats query string from JS object
   *
   **/
  formatQueryString() {
    let accumulator = "";

    for(let prop in this.data) {
      accumulator += (
       `${encodeURIComponent(prop)}=${encodeURIComponent(this.data[prop])}&`
      );
    }

    // strip & from last key-value pair
    return accumulator.slice(0, -1);
  }


  /**
   * Formats data that's going to be sent to server
   *
   **/
  formatData() {
    if(this.isType("object", this.data)) {
      return this.data instanceof FormData ? 
        this.data :
        this.formatQueryString();
    } else {
      throw new Error("Data property should be object or instance of FormData");
    }
  }


  /**
   * Passses method and url to request object
   *
   **/
  openRequest() {
    if(this.isType("string", this.url) && 
       this.isType("string", this.method)) {
      this.request.open(this.method, this.url);
    }
  }


  /**
   * Send request with data passed if present
   *
   **/
  sendRequest() {
    let data = this.data ? this.formatData() : null;
    this.request.send(data);
  }

  /**
   * Initiates XHR request
   *
   **/
  send() {
    if(!this.requestReady) {
      this.setHeaders();
      this.setupListeners();
      this.requestReady = true;
    }
    this.openRequest();
    this.sendRequest();
  }

}


export default AsyncRequest;

/**
 * Observable constructor takes a function as argument which
 * expects that is for now stored in instance under property
 * name subscriber. When this method is invoked it expects 
 * that observer object is passed to it as only argument
 * Observer object must at least contain next() method.
 *
 * @param {function} subscriber
 * @return {object} 
 **/
class Observable {

  /**
   * Static helper method with predefined subscriber function that set's up
   * event listener on target element and returns method which is called
   * subscription which you can invoke to stop listening on an observable
   * when you don't need it anyomore
   *
   * @param {string} eventName
   * @param {node} target
   * @return {object} Observable
   **/
  static fromEvent(eventName, target) {
    return new Observable(observer => {
      const handler = (event) => { observer.next(event); }
      target.addEventListener(eventName, handler, false);
      return () => target.removeEventListener(eventName, handler);
    });
  }


  /**
   * Static helper method that takes arbitrary number of arguments and 
   * iterates over each one givin you access to different observable
   * operators
   * 
   * @param {any} vals
   * @return {object} Observable
   **/
  static of(...vals) {
    return new Observable(observer => {
      vals.forEach(value = observer.next(value));
      return () => {};
    });
  }

  /**
   * Static helper method that takes some period of time in which you want
   * some value to be passed down the line to either subscribe method
   * or operators in between.
   *
   * @param {number} intervalTime
   * @return {object} Observable
   **/
  static interval(intervalTime) {
    let counter = 0;
    return new Observable(observer => {
      const handler = () => {
        counter++;
        observer.next(counter);
      }

      setInterval(handler, intervalTime);

      return () => {
        counter = 0;
        clearInterval(handler);
      }
    });
  }


  /**
   * It emits values when user stops interacting with page through
   * clicking and scrolling etc.
   *
   * @param {any} vals
   * @return {object} Observable
   **/
  static idle(...vals) {
    return new Observable(observer => {
      vals.forEach(val => requestIdleCallback((val) => observer.next(val)); 
    })
  }

  /**
   * Static helper method that takes value from resolved promise and
   * passess it down to observable operators or subscribe method
   *
   * @param {object} promise
   * @return {object} Observable
   **/
  static fromPromise(promise) {
    return new Observable(observer => {
      promise.then((val) => observer.next(val));
    });
  }

  constructor(subscriber) {
    this.subscriber = subscriber;
  }

  /**
   * Operator that takes a predicate function and applies it to current
   * value and gives you return value of applied operation 
   * 
   * @param {function} predicate
   * @return {object} observable
   **/
  map(predicate) {
    const self = this;
    return new Observable(observer => {
      const customObserver = {
        next(data) {
          return observer.next(predicate(data));
        }
      }

      self.subscribe(customObserver);
    });
  }

  /**
   * Same as map operator except, it will give you value only if
   * predicate function evaluates to truthy value
   * 
   * @param {function} predicate
   * @return {object} Observable
   **/
  filter(predicate) {
    const self = this;
    return new Observable(observer => {
      const customObserver = {
        next(data) {
          if(predicate(data)) {
            observer.next(data);
          }
        }
      };

      self.subscribe(customObserver);
    });
  }

  /**
   * Delays propagation of certain value to next operator or subscribe method
   * 
   * @param {number} delayTime
   * @return {object} Observable
   **/
  delay(delayTime) {
    const self = this;
    return new Observable(observer => {
      const customObserver = {
        next(data) {
          setTimeout(() => {
            observer.next(data);
          }, delayTime);
        }
      };

      self.subscribe(customObserver);
    });
  }

  /**
   * Takes every n-value emitted from some event or other observable
   * 
   * @param {number} num
   * @return {object} Observable
   **/
  takeEvery(num) {
    const self = this;
    const start = 0;
    return new Observable(observer => {
      const customObserver = {
        next(data) {
          if(start !== num) {
            start++;
          } else {
            observer.next(data);
            start = 0;
          }
        }
      };

      self.subscribe(customObserver);
    });
  }

  /**
   * Just invokes error method on observer object
   *
   * @return {object} Observable
   **/
  throw() {
    const self = this;
    return new Observable(observer => {
      observer.error();
    })
  }

  /**
   * Method in charge of starting and consuming values emited
   * from observable directly or it operators, it also properly formats
   * and adds methods on observer object if not present
   *
   * @param {object} observer
   * @return {void}
   **/
  subscribe(observer) {
    let safeObserver = {};

    if(arguments.length === 1 && typeof observer === "function") {
      safeObserver.next = observer;
      safeObserver.completed = () => {};
      safeObserver.error = () => {};
    }

    if(typeof observer === "object" && !Array.isArray(observer)) {
      safeObserver = { 
        next: observer.next,
        completed: observer.completed || () => {},
        error: observer.error || () => {}
      }
    }
    
    this.subscriber(safeObserver);
  }

}

export default Observable;

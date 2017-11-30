const _debounce = function(fn, period) {
  let timer = null;
  
  return function() {
    const context = this;
    const args = Array.from(arguments);
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, period);
  }
}


const _throttle = (fn, period = 250, ctx) => {
  let last, defferTimer;
  
  return function() {
    const args = Array.from(arguments);
    const context = ctx || this;
    let now = +new Date;
    
    if(last && now < period + last) {
      clearTimeout(defferTimer);
      
      defferTimer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, period);
      
    } else {
      last = now;
      fn.apply(context, args);
    }
  }
}

class Observable {

  static fromEvent(eventName, target) {
    return new Observable(observer => {
      const handler = (event) => { observer.next(event) };
      target.addEventListener(eventName, handler, false);
      return () => target.removeEventListener(eventName, handler);
    });
  }
  
  
  static fromAjax(opts) {
    const { method, url, data } = opts;
    
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      
      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4 && xhr.status === 200) {
          observer.next(xhr.response);
          observer.completed();
        } else if(xhr.readyState === 4 && xhr.status !== 200) {
          observer.error()
        }
      }
      
      xhr.send(data);
      
      return () => xhr.abort();
    });
  }


  static fromPromise(promise) {
    return new Observable(observer => {
      promise.then((val => {
        observer.next(val) 
        observer.completed();
      })).catch(err => {
        observer.error(err);
      })

      return this.noop;
    });
  }


  static of(...vals) {
    return new Observable(observer => {
      vals.forEach(value => observer.next(value));
      observer.completed();
      return this.noop;
    });
  }


  static idle(...vals) {
    return new Observable(observer => {
      vals.forEach(value => requestIdleCallback(() => observer.next(value)));
      observer.completed();
      return this.noop;
    });
  }


  static interval(period) {
    let counter = 0;
    return new Observable(observer => {
      const handler = () => {
        observer.next(counter)
        counter++
      };
      
      setInterval(handler, period);
      return () => {
        counter = 0;
        clearInterval(handler);
      }
    });
  }


  constructor(subscriber) {
    this.subscriber = subscriber;
  }


  noop() {}


  map(predicate) {
    return new Observable(observer => {
      const customObserver = {
        ...observer,
        next(data) {
          observer.next(predicate(data));
        }
      };

      this.subscribe(customObserver);
    })
  }
  

  
  filter(predicate) {
    return new Observable(observer => {
      const customObserver = {
        ...observer,
        next(data) {
          if(predicate(data)) {
            observer.next(data);
          }
        }
      }

      this.subscribe(customObserver);
    });
  }


  delay(period) {
    return new Observable(observer => {
      const customObserver = {
        ...observer,
         next(data) {
           setTimeout(() => {
             observer.next(data);
           }, period)
         }
      } 

      this.subscribe(customObserver);
    });
  }
  
  
  
  debounce(period) {
    return new Observable(observer => {
      const debounced = _debounce(function(val) {
        observer.next(val);
      }, period);
      
      const customObserver = {
        ...observer,
        next(val) {
          debounced(val);
        }
      };
                          
      this.subscribe(customObserver);
    });
  }
  
  
  throttle(period) {
    return new Observable(observer => {
      const throttled = _throttle(function(val) {
        observer.next(val);
      }, period);
      
      const customObserver = {
        ...observer,
        next(val) {
          throttled(val);
        }
      };
                          
      this.subscribe(customObserver);
    });
  }
  


  takeEvery(amount) {
    let counter = 0;
    return new Observable(observer => {
      const customObserver = {
        ...observer,
        next(data) {
          if(counter === amount) {
            observer.next(data);
            counter = 0;
          } else {
            counter++;
          }
        }
      }

      this.subscribe(customObserver);
    });
  }


  throw() {
    return new Observable(observer => {
      observer.error();
    });
  }


  subscribe(observer) {
    let safeObserver = {};

    if(typeof observer === "function") {
      safeObserver.next = observer;
      safeObserver.completed = this.noop;
      safeObserver.error = this.noop;
    }

    if(typeof observer === "object" && !Array.isArray(observer)) {
      safeObserver = {
        ...observer,
        completed: observer.completed || this.noop,
        error: observer.error || this.noop
      }
    }
    this.subscriber(safeObserver);
  }

}

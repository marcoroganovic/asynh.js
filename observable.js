class Observable {

  static from(eventName, target) {
    return new Observable(observer => {
      const handler = (event) => { observer.next(event); }
      target.addEventListener(eventName, handler, false);
      return () => target.removeEventListener(eventName, handler);
    });
  }

  static of(...vals) {
    return new Observable(observer => {
      vals.forEach(value = observer.next(value));
      return () => {};
    });
  }

  constructor(subscriber) {
    this.subscriber = subscriber;
  }

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

  subscribe(observer) {
    let safeObserver = {};

    if(arguments.length === 1 && typeof observer === "function") {
      safeObserver.next = observer;
    }

    if(typeof observer === "object" && !Array.isArray(observer)) {
      safeObserver = { ...observer }
    }
    
    this.subscriber(safeObserver);
  }

}

export default Observable;

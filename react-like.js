const $ = tag => document.querySelector(tag);
const $$ = tag => document.createElement(tag);

const render = (domTree, target) => (
  target ?
    target.appendChild(domTree.internalRender()) : 
    new Error("Incorrect target provided!")
);

const randomString = () => Math.random().toString(36).substring(2);

const uuid = () => {
  const cache = {};  
  let id = randomString();
  while(id in cache) { id = randomString() }
  cache[id] = true;
  return id;
}

class Component {
  constructor(props) {
    this.props = props;
    this.state = null;
    this.componentId = uuid();
    this.events = {};
    this.addedEvents = false;
  }
  
  static nodes(arr) {
    return Array.isArray(arr) && arr.length ? arr.join("") : null;
  }

  static rootComponent(Component, props) {
    return new Component(props);
  }
  
  static create(Component, props, children) {
    const comp = new Component(props);
    const placeholder = $$("div");
    placeholder.appendChild(comp.internalRender());
    return placeholder.innerHTML;
  }
  

  setupListeners(eventTable) {
    if(eventTable && typeof eventTable === "object") {
      Object.keys(eventTable).forEach(key => {
        const [ target, type ] = key.split("::")
          .map((tag, id) => id === 0 ? tag.replace("<", "").replace(">", "") : tag);
        
        const handler = (event) => {
          if(event.target.nodeName.toLowerCase() === target) {
            eventTable[key](event);
          }
        }
        
        this.rootElement.addEventListener(type, handler);
        this.events[type] = this.events[type] || [];
        this.events[type].push(handler);
      });
    }
  }

  removeEvents(type) {
    const handlers = this.events[type];
    if(handlers) {
      handlers.forEach(handler => this.rootElement.removeEventListener(handler));
    } 
  }


  removeAllEvents() {
    Object.keys(this.events).forEach(key => {
      if(Array.isArray(this.events[key])) {
        this.events[key].forEach(handler => this.rootElement.removeEventListener(key, handler));
      }
    });
  }

  setState(fn) {
    if(!this.realDOMNode) {
      this.realDOMNode = $(`[data-comp-id='${this.componentId}']`);
    }
    
    this.state = fn(this.state);
    
    if(this.realDOMNode) {
      while (this.realDOMNode.firstChild) this.realDOMNode.removeChild(this.realDOMNode.firstChild);      
      this.realDOMNode.appendChild(this.internalRender());
      
      if(!this.addedEvents) {
        this.setupListeners(this.addEvents());
      }
    }
  }

  makeDOM(template) {
    const frag = document.createDocumentFragment();
    const placeholder = $$("div");
    placeholder.innerHTML = template;
    let firstChild = null;

    while(firstChild = placeholder.firstElementChild) {
      if(!this.rootElement) {
        this.rootElement = firstChild;
        this.rootElement.dataset.compId = this.componentId;
        if(!this.addedEvents) {
          this.setupListeners(this.addEvents());
          this.addedEvents = true;
        }
      }
      
      frag.appendChild(firstChild);
    }

    return frag;
  }
  
  
  addEvents() {
    return null;
  }
  
  internalRender() {
    return this.render(this.state, this.props);
  }

  render(state, props) {
    return null;
  }
}

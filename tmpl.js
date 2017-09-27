function makeElement(tag) {
  return document.createElement(tag);
}

function makeFragment() {
  return document.createDocumentFragment();
}

function makeDOM(str) {
  let fragment = makeFragment();
  let placeholder = makeElement("div");
  placeholder.innerHTML = str;
  let current;
  
  while(current = placeholder.firstChild) {
    fragment.appendChild(current);
  }
  
  return fragment;
}

function findIfConditions(nodes) {
  return nodes.filter(node => node.hasAttribute("data-if"));
}

function findLoops(nodes) {
  return nodes.filter(node => node.hasAttribute("data-for"));
}

function render(node, target) {
  if(typeof target === "string") {
    target = document.querySelector(target);
  } 
  
  target.appendChild(node);
}

function constructRegEx(prop) {
    return new RegExp("{{\\s+?" + prop + "\\s+?}}", "g");
}

function interpolate(tmpl, data, str) {
  
  if(typeof data === "object" && !Array.isArray(data)) {
    for(let prop in data) {
      let regex = constructRegEx(prop);
      tmpl = tmpl.replace(regex, data[prop]);
    }
    
    return str ? tmpl : makeDOM(tmpl);
  } else if(Array.isArray(data)) {
    let newTemplate = "";
    data.forEach(item => {
      if(typeof item === "object") {
        newTemplate += interpolate(tmpl, item, true);
      }
    });
    
    return str ? newTemplate : makeDOM(newTemplate);
  }
  
  return tmpl;
}

function tmpl(str, data) {
  let fragment = makeElement("div");
  fragment.innerHTML = str;
  
  let allNodes = Array.from(fragment.querySelectorAll("*"));
  let ifConditions = findIfConditions(allNodes);
  let loops = findLoops(allNodes);
  
  if(ifConditions.length) {
    ifConditions.forEach(node => {
      let prop = data[node.getAttribute("data-if")];
      node.style.display = !!prop ? "" : "none";
    });
  }
  
  if(loops.length) {
    loops.forEach(node => {
      let innerHTML = node.innerHTML;
      node.innerHTML = "";
      let prop = data[node.getAttribute("data-for")];
      node.appendChild(interpolate(innerHTML, prop));
    });
  }
  
  return interpolate(fragment.innerHTML, data);
}

let template = `
  <h1 data-if="marko">John</h1>
  <h3 data-if="kreten">Marko</h3>
  <h4>NIJE</h4>
  <h1 data-if="blueBalls" style="color: blue">Blue Balls</h1>
  <ul data-for="properties">
    <li>{{ hello }}</li>
    <li>{{ mrs }}</li>
    <li>{{ chaka }}</li>
    <li>{{ chaka }} {{ hello }} {{ mrs }}</li>
  </ul>

  <ul data-for="names">
    <li>{{ name }} {{ surname }}</li>
  </ul>

  <h3>Count of names: {{ count }}</h3>
`;

let app = tmpl(template, {
    marko: true,
    kreten: true,
    blueBalls: true,
    properties: {
      hello: "World",
      mrs: "Cao",
      chaka: "Baki"
    },
    count: 5,
    names: [
      { name: "Marko", surname: "Roganovic" },
      { name: "Chaka", surname: "Cakic" },
      { name: "Nichols", surname: "Zakas" },
      { name: "Misko", surname: "Ajkula" },
      { name: "Radijator", surname: "Markovic" }
    ]
  });

render(app, "body");

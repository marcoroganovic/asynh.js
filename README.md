## asynh.js
Small library for async browser requests with similar API to ES2015 Promises.

### To run locally
If you want to clone and run repository locally use following commands:

```
git clone https://github.com/marcoroganovic/asynh.js.git
cd asynh.js
npm install
gulp
```

### Description

When you include library in you project in order to use it you need to create instance of
Asynh.

```javascript
let req = new Asynh({});
```

Configuration object of Asynh can accept various parameter but essential
two are method (which denotes which HTTP method will be used for this async
request) and URL.

```javascript
let link = "https://jsonplaceholder.typicode.com/posts";
let req = new Asynh({
  method: "GET",
  url: link
});
```

Beside two parameters mentioned above you can also use rawResponse, which is a
boolean type. If you don't set it default value will be true and you'll get plain
text on successful response from the server to consume in your callback methods.

Next parameter is responseType. There is no default option for it, but if you
want to modify type of response from the server you need to set rawResponse to
false and choose one of these values for responseType: json, csv, xml.

To add callbacks on various events that XHR object fires you can use progress,
success, failure, abort methods. Each of these accepts function as parameter. In
callback function you'll receive either plan request object or already formatted
data based on responseType and rawResponse arguments.

Besides response event or data, as a second parameter you can receive some
method that you want to have inside callback function. To add that method you
use inject. It receives function which as stated previously will be passed to
every single callback method as a second parameter.

### Sample usage

```javascript
let link = "https://jsonplaceholder.typicode.com/posts";
let req = new Asynh({
  method: "GET",
  url: link,
  rawResponse: false,
  responseType: "json"
});

req
  .inject(dispatch)

  .progress(function(event, dispatch) {
    dispatch({ type: "DISPLAY_PROGRESS_BAR", payload: true });
  })

  .success(function(data, dispatch) {
    let firstElement = data[0];
    dispatch({ type: "RENDER_FIRST_ELEMENT", payload: firstElement });
    return data;
  })
  
  .success(function(data, dispatch) {
    dispatch({ type: "SET_POSTS_OBJECT", payload: data });
  })

  .failure(function(event, dispatch) {
    dispatch({ type: "SHOW_RESPONSE_ERROR", payload: true });
  });


  req.send();
```

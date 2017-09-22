## Async Request
Small library for async browser requests with similar API to ES2015 Promises.

### To run locally
If you want to clone and run repository locally use following commands:

```
git clone https://github.com/marcoroganovic/async-request.git
cd async-request
npm install
gulp
```

### Description

When you include library in you project in order to use it you need to create instance of
AsyncRequest.

```javascript
let req = new AsyncRequest({});
```

Configuration object of AsyncRequest can accept various parameter but essential
two are method (which denotes which HTTP method will be used for this async
request) and URL.

```javascript
let link = "https://jsonplaceholder.typicode.com/posts";
let req = new AsyncRequest({
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

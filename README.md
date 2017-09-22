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

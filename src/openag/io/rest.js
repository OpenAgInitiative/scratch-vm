// Create an instance of JSON headers for the Request helper functions below
// to share.
var JSON_HEADERS = new Headers({
  'Content-Type': 'application/json',
});

// Response message box
function RestResponse(method, url, status, body) {
    return {
        type: 'RestResponse',
        method: method,
        url: url,
        status: status,
        body: body
    };
}

// Kick off an HTTP rest request.
// Wraps some boilerplate required to make a REST/JSON request.
// Returns a promise for the parsed JSON data, boxed in a "Response" object
// along with the HTTP status code.
function fetchRest(url, method, body) {
    // Construct request
    var request = new Request(url, {
        headers: JSON_HEADERS,
        method: method,
        body: JSON.stringify(body)
    });

    // Fetch and handle promise
    return fetch(request).then(function (response) {
        if (response.ok) {
            // If HTTP request was successful, parse JSON, then box in a success
            // container.
            // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch.
            return response.json().then(function (data) {
                return RestResponse(method, response.url, response.status, data);
            });
        }
        else {
            // If response was a failure, box in an error box.
            return Promise.resolve(
                RestResponse(method, response.url, response.status, null)
            );
        }
    });
}

function makeCacheKey(method, url) {
    // Lowercase the key to normalize it.
    return method.toLowerCase() + url.toLowerCase()
}

var Rest = function (runtime) {
    /**
     * Reference to the owning Runtime.
     * @type{!Runtime}
     */
    this.runtime = runtime;
    // A cache to keep the last reponse from a given URL.
    this.cache = {};
};

Rest.prototype.postData = function (restResponse) {
    // Cache this RestResponse object at its URL.
    var key = makeCacheKey(restResponse.method, restResponse.url);
    this.cache[key] = restResponse;
}

// IO Devices don't use callbacks. Instead, they cache the last result for an
//asynchronous operation and provide a getter method for that cached value.
// We cache the last response body by url. You can get it by providing the url
// that was used fof the query.
Rest.prototype.getBody = function (args) {
    var url = args.url;
    var method = args.method;
    var key = makeCacheKey(method, url);
    if (this.cache[key]) {
        return this.cache[key].body;
    }
    else {
        return null;
    }
}

// We define a method for issuing requests.
// IO Device methods can only receive one argument when called through ioQuery,
// so we pass in an args object.
Rest.prototype.request = function (args) {
    var url = args.url;
    var method = args.method;
    var body = args.body;
    var self = this;
    return fetchRest(url, method, body).then(function (restResponse) {
        self.postData(restResponse);
    });
}

module.exports = Rest;

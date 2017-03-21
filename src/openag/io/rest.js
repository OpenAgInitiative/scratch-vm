// Create an instance of JSON headers for the Request helper functions below
// to share.
var JSON_HEADERS = new Headers({
  'Content-Type': 'application/json',
});

// Response message box
function RestData(url, status, body) {
    return {
        type: 'RestData',
        url: url,
        status: status,
        body: body
    };
}

// Reads a `RestResponse` from a DOM Response instance.
// Returns a promise for a normalized RestData object.
function readResponse(response) {
    return (
        response.ok
        // If HTTP request was successful, parse JSON, then box in a success
        // container.
        // See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch.
        ? response.json().then(function (data) {
            return RestData(response.url, response.status, data)
        })
        // If response was a failure, box HTTP status in an error box.
        : Promise.resolve(RestData(response.url, response.status, {}))
    );
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
    return fetch(request).then(readResponse);
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

Rest.prototype.postData = function (data) {
    // Cache this RestData object at its URL.
    this.cache[data.url] = data;
}

Rest.prototype.getBody = function (url) {
    if (this.cache[url]) {
        return this.cache[url].body;
    }
    else {
        return {};
    }
}

Rest.prototype.request = function (url, method, body) {
    var self = this;
    return fetchRest(url, method, body).then(function (rest) {
        self.postData(rest);
    });
}

module.exports = Rest;

var storage = {};
const LOGGED_USER_ID = "loggedUserId"

function prepareStorage() {
    if (typeof localStorage !== 'undefined') {
        storage = localStorage;
    } else {
        storage = sessionStorage;
    }
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
        console.log("CORS are not supported by this browser");
    }
    return xhr;
}

function makeCorsRequest(method, url, data, callback) {
    var xhr = createCORSRequest(method, url);
    if (!xhr) {
        alert('CORS not supported');
        return null;
    }

    xhr.onload = function() {
        callback(xhr.response);
    };

    xhr.onerror = function(data) {
        console.log(data);
        alert('Woops, there was an error making the request.');
        return null;
    };

    xhr.responseType = "json";
    if(data && method == "POST"){
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.send(JSON.stringify(data));
    }else{
        xhr.send();
    }
}


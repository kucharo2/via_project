const localTesting = false;

window.fbAsyncInit = function () {
    FB.init({
        appId: '557123124627479',
        cookie: true,
        xfbml: true,
        version: 'v2.11'
    });

    FB.AppEvents.logPageView();

    // subscribe to logout event, to know if the user logged out from FB on another page.
    FB.Event.subscribe('auth.logout', function () {
        console.log("user logged out from facebook");
        checkLoginStatus();
    });

};

// include FB sdk
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        logIntoApplication();
        console.log("loggeed in");
    } else if (response.status === 'not_authorized') {
        console.log("User is not authorized");
        logout();
    } else {
        logout();
    }
}

function checkLoginStatus() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}

function fbLogin() {
    if(localTesting) {
        var response = {
            "email": "kucharrom@gmail.com",
            "id": "10215232831076561",
            "name": "Roman Kuchy Kuchar"
        };
        loginFronted(response);
        return;
    }
    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginStatus();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, {scope: ['email', 'user_friends']});
}

function logIntoApplication() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {fields: 'id, name, email'}, function (response) {
        makeCorsRequest("GET", "https://salty-woodland-34826.herokuapp.com/user/" + response.id, null, function(user) {
            console.log(user);
            if(user.length < 1) {
                // user not existing, create a new one
                makeCorsRequest("POST", "https://salty-woodland-34826.herokuapp.com/user", {
                    "email": response.email,
                    "fbId": response.id,
                    "name": response.name
                }, function(createdUser) {
                    console.log(createdUser);
                    user = createdUser;
                });
            }
        });
        loginFronted(response);
    });
}

function loginFronted(response) {
    console.log('Successful login for: ' + response.name + " " + response.email + " " + response.id);
    var $loggedUser = $("#loggedUser");
    $loggedUser.text(response.name + ", " + response.email);
    $("#fbLogin").hide();
    $loggedUser.show();
}

function logout() {
    console.log("User was logged out.");
    var $loggedUser = $("#loggedUser");
    $loggedUser.hide();
    $("#fbLogin").show();
    $loggedUser.text("");
}

function getFbFriends() {
    FB.api('me/friends', {fields: 'id, first_name, picture'}, function (response) {
        console.log(response);
    });
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
        var parsedData = JSON.parse(xhr.responseText)
        callback(parsedData);
    };

    xhr.onerror = function(data) {
        console.log(data);
        alert('Woops, there was an error making the request.');
        return null;
    };

    if(data && method == "POST"){
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.send(JSON.stringify(data));
    }else{
        xhr.send();
    }
}

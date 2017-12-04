const mockEnabled = false;

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

    if(mockEnabled) {
        mockFacebookAPI();
    }

    prepareStorage();

    var loggedUserId = storage.getItem(LOGGED_USER_ID);
    if(loggedUserId !== null && loggedUserId !== "") {
        checkLoginStatus();
    } else {
        logout();
    }
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
        makeCorsRequest("GET", "/user/" + response.id, null, function(user) {
            if(user.length < 1) {
                console.log("User not exists. Creating a new one ...");
                makeCorsRequest("POST", "/user", {
                    "email": response.email,
                    "fbId": response.id,
                    "name": response.name
                }, function(createdUser) {
                    user = createdUser;
                });
            }
        });
        loginFronted(response);
    });
}

function loginFronted(response) {
    console.log('Successful login for: ' + response.name + " " + response.email + " " + response.id);
    storage.setItem(LOGGED_USER_ID, response.id);
    var $loggedUser = $("#loggedUser");
    $loggedUser.text(response.name + ", " + response.email);
    $loggedUser.show();

    $("#fbLogin").hide();
    $("#logout").show();
}

function logout() {
    console.log("User was logged out.");
    var $loggedUser = $("#loggedUser");
    $loggedUser.hide();
    $loggedUser.text("");

    storage.setItem(LOGGED_USER_ID, "");
    $("#fbLogin").show();
    $("#logout").hide();
}

function getFbFriends() {
    FB.api('me/friends', {fields: 'id, first_name, picture'}, function (response) {
        console.log(response);
    });
}

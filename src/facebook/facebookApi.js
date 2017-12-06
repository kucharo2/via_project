const mockEnabled = true;

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

function checkLoginStatus() {
    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', {fields: 'id, name, email'}, function (userData) {
                logIntoApplication(userData);
            });
        } else if (response.status === 'not_authorized') {
            console.log("User is not authorized");
            logout();
        } else {
            logout();
        }
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

function getFbFriends(callback) {
    FB.api('/me/friends', {fields: 'id, picture'}, function (response) {
        callback(response);
    });
}

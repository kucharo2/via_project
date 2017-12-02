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

// init fb api connection
window.fbInit = function () {
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


function fbLogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginStatus();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, {scope: ['email', 'user_friends']});
}

function checkLoginStatus() {
    FB.getLoginStatus(function (response) {
        console.log('login status check called.');
        console.log(response);

        if (response.status === 'connected') {
            logIntoApplication();
            console.log("loggeed in");
        } else if (response.status === 'not_authorized') {
            console.log("User is not authorized");
            logout();
        } else {
            logout();
        }
    });
}

function logIntoApplication() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {fields: 'id, name, email'}, function (response) {
        console.log('Successful login for: ' + response.name + " " + response.email + " " + response.id);
        var $loggedUser = $("#loggedUser");
        $loggedUser.innerHTML = response.name + ", " + response.email;
        $("#fbLogin").hide();
        $loggedUser.show();
    });
}

function logout() {
    console.log("User was logged out.");
    var $loggedUser = $("#loggedUser");
    $loggedUser.hide();
    $("#fbLogin").show();
    $loggedUser.innerHTML("");
}

function getFbFriends() {
    FB.api('me/friends', {fields: 'id, first_name, picture'}, function (response) {
        console.log(response);
    });
}
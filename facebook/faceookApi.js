window.fbAsyncInit = function() {
    FB.init({
        appId      : '557123124627479',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });

    FB.AppEvents.logPageView();

};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
//                loginUserIntoApplication();
        console.log("loggeed in");
    } else if (response.status === 'not_authorized') {
        console.log("not authorized");
//                logout();
    } else {
        console.log("something just fucked up");
//                logout();
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function fblogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            checkLoginState();
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: ['email', 'user_friends'] });
}

function logIntoApplication() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me',{ fields: 'id, name, email' }, function(response) {
        console.log('Successful login for: ' + response.name + " "+response.email+" "+response.id);

    });
}
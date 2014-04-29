function initializeLogin() {
    var gOAuth = liquid.helper.oauth;
    if (window.location.hash != '#login' && window.location.hash != '') {
        alert('Please login first to use Democratree');
        _ignoreHashChange = true;
        window.location.hash = '';
    }
    $(window).bind( 'hashchange', hashChanged );
    $('#guestLoginButton').bind('click', function() {
        loginStatus = 'guest';
        openMapPage();
    });
    $('#democratreeSigninButton').bind('click', function() {
        loginStatus = 'democratree';
        var username = document.getElementById('login-username').value;
        var pwd = document.getElementById('login-pwd').value;
        Parse.User.logIn(username, pwd, {
            success: function(user) {
                document.getElementById('login-username').value = "";
                document.getElementById('login-pwd').value = "";
                currUser = Parse.User.current();
                if(user.get("emailVerified"))
                {
                    openMapPage();
                }
                else
                {
                    alert("Email address not verified");
                    openMapPage();
                }
            },
            error: function(user, error) {
                openPopupInLogin("Incorrect username/password");
            }
        });
    });
    $('#democratreeSignupButton').bind('click', function() {
        loginStatus = 'signup';
        $('#democratreeCreateAccButton').bind('click', function() {
            var username = document.getElementById('demo-username').value;
            var name = document.getElementById('demo-name').value;
            var pwd = document.getElementById('demo-pwd').value;
            var secondpwd = document.getElementById('demo-conf-pwd').value;
            var email = document.getElementById('demo-email').value;
            if(pwd == secondpwd)
            {
                var votedOn = new Array();
                var user = new Parse.User();
                user.set('username', username);
                user.set('name', name);
                user.set('password', pwd);
                user.set('email', email);
                user.set('votedOn', votedOn);
                user.signUp(null, {
                    success: function(user) {
                        openPopupInSignup("A verification email has been sent to the email address you entered. Please verify your email and then login");
                        document.getElementById('demo-username').value = "";
                        document.getElementById('demo-name').value = "";
                        document.getElementById('demo-pwd').value = "";
                        document.getElementById('demo-conf-pwd').value = "";
                        document.getElementById('demo-email').value = "";
                        window.location.hash = '';
                    },
                    error: function(user, error) {
                        // Show the error message somewhere and let the user try again.
                        if(error.code == 202)
                        {
                            document.getElementById('demo-pwd').value = "";
                            document.getElementById('demo-conf-pwd').value = "";
                        }
                        openPopupInSignup(/*"Error: " + error.code + " " +*/error.message);
                    }
                }); 
            }
            else
            {
                document.getElementById("demo-pwd").value = "";
                document.getElementById("demo-conf-pwd").value = "";
                openPopupInSignup("The passwords you entered do not match,<p>please type them again");
            }
        });
    });
    $('#googleplusSigninButton').bind('click', function(event) {
        if(gOAuth.isAuthorized()) {
            loadGapi();
        } else {
            gOAuth.authorize(googleAuthorizeWindowChange);
        }
        event.preventDefault();
    });
    $('#twitterSigninButton').bind('click', function(event) {
        Twitter.init();
    });
    $('.logoutButton').bind('click', logout);
}

function googleAuthorizeWindowChange(uriLocation) {
    var gOAuth = liquid.helper.oauth;
    
   // check the status, oAuth process is successful!    
    if (gOAuth.requestStatus == gOAuth.status.SUCCESS) {
        var authCode = gOAuth.authCode;
        // have the authCode, now save the refreshToken
        gOAuth.saveRefreshToken({ auth_code: gOAuth.authCode }, function() {
            if (gOAuth.isAuthorized()) {
                // Refresh token saved properly, load client api and open map
                loadGapi();
            } else {
                alert("There was an error authorizing the app");
            }
        });
    }
    else if (gOAuth.requestStatus == gOAuth.status.ERROR) 
    {
        console.log("Error >> oAuth Processing");
    } 
}

function loadGapi() {
    var gOAuth = liquid.helper.oauth;
    gOAuth.getAccessToken(function(tokenObj) {
        if (!tokenObj.error) {
            gapi.auth.setToken({
                access_token    : tokenObj.access_token,
                expires_in      : tokenObj.expires_in,
                scope           : liquid.config.gapi.scope 
            });
            if (!gOAuth.isGapiLoaded) { 
                gapi.client.load('plus','v1', function(){ gOAuth.isGapiLoaded = true; });
            }
            loginStatus = 'googleplus';
            openMapPage();
        } else {
            // If there was an issue with the access token, ask the user to reauthorize
            //alert("Error retrieving access token, client gapi not loaded");
            window.localStorage.clear();
            gOAuth.authorize(googleAuthorizeWindowChange);
        }
    });
}

function logout(){
    clearProfile();
    $('#profile_revokeAccess').empty();
    if(loginStatus == 'twitter') {
        Twitter.logout();
    }
    if(loginStatus == 'facebook') {
        FB.logout(function(response) {
        });
    }
    if(loginStatus == 'democratree') {
        Parse.User.logOut(); // logout already here
    }
    $('#myTreeList').empty();
    loginStatus = 'none';
    currUser = undefined;
    ignoreHashChange = true;
    window.location.hash = 'login'
    // For some reason this fires off two hash changes - the second #'s to window.location.pathname
}

function hashChangedProfile(){
    if(loginStatus == 'googleplus'){
        googleplusHelper.profile();
        var $button = $('<button/>', {
            type: 'button',
            id: 'revokeAccess',
            text: 'Revoke the apps access to your account',
            click: googleplusHelper.disconnect
        });
        $('#profile_revokeAccess').empty();
        $button.appendTo('#profile_revokeAccess');
    }
    if(loginStatus == 'facebook'){
        facebookHelper.profile();
            var $button = $('<button/>', {
            type: 'button',
            id: 'revokeAccess',
            text: 'Revoke the apps access to your account',
            click: facebookHelper.disconnect
        });
        $('#profile_revokeAccess').empty();
        $button.appendTo('#profile_revokeAccess');
    }
    if(loginStatus == 'twitter'){
        Twitter.profile();
        // There is no revoke function in the api for twitter, users have to do it manually from twitter settings
    }
    if (loginStatus == 'democratree') { 
        clearProfile();
        user = Parse.User.current();
        $('#profile_name').append(user.get('name'));
        $('#profile_username').append(user.getUsername());
    }
    if(loginStatus != 'guest') {
        var user = currUser;
        var query = new Parse.Query("Tree");
        query.equalTo('username', user.get('username'));
        query.find({
            success: function(trees) {
                $('#myTreeList').empty();
                for (var i = 0; i < trees.length; i++) {
                    var t = trees[i].attributes
                    if(i == 0) { 
                        $('#myTreeList').append('<li class="ui-first-child">' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.story + ' : ' + t.votes +
                            '</a></li>'
                        );
                    } else if(i == trees.length && i != 0) {
                        $('#myTreeList').append('<li class="ui-last-child">' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.story + ' : ' + t.votes +
                            '</a></li>'
                        );
                    } else {
                        $('#myTreeList').append('<li>' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.story + ' : ' + t.votes +
                            '</a></li>'
                        );
                    }
                }
            },
            error: function(error) {
                console.log(error)
            }
        });
    }
    else {
        $('#profile_name').append('Currently logged in as a guest');
    }
}

function clearProfile() {
    $('#profile_username').empty();
    $('#profile_name').empty();
    $('#profile_picture').empty();
}

var googleplusHelper = (function() {
  var BASE_API_PATH = 'plus/v1/';

  return {

    /**
     * Calls the OAuth2 endpoint to disconnect the app for the user.
     */
    disconnect: function() {
      // Revoke the access token.
        var gOAuth = liquid.helper.oauth;
        gOAuth.unAuthorize();
        logout();
    },

    /**
     * Gets and renders the currently signed in user's profile data.
     */
    profile: function(){
        var gOAuth = liquid.helper.oauth;
        gOAuth.getAccessToken(function(tokenObj) {
            if (!tokenObj.error) {
                gapi.auth.setToken({
                    access_token    : tokenObj.access_token,
                    expires_in      : tokenObj.expires_in,
                    scope           : liquid.config.gapi.scope });
                var request = gapi.client.plus.people.get( {'userId' : 'me'} );
                request.execute( function(profile) {
                    clearProfile();
                    if (profile.error) {
                      alert(profile.error);
                      return;
                    }
                    $('#profile_picture').append(
                        $('<img src=\"' + profile.image.url + '\">'));
                    $('#profile_name').append(profile.displayName);
                });
            } else {
                alert("Error retrieving access token");
            }
        });
    }
  };
})();
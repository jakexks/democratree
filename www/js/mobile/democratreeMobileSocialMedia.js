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
        // Temporary
        loginStatus = 'democratree';
        openMapPage();
    });
    $('#democratreeSignupButton').bind('click', function() {
        // Temporary
        loginStatus = 'signup';
        openMapPage();
    });
    $('#googleplusSigninButton').bind('click', function(event) {
        if(gOAuth.isAuthorized()) {
            loadGapi();
            loginStatus = 'googleplus';
            openMapPage();
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
                loginStatus = 'googleplus';
                openMapPage();
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
        } else {
            alert("Error retrieving access token, client gapi not loaded");
        }
    });
}

function logout(){
    clearProfile();
    $('#profile_revokeAccess').empty();
    if(loginStatus == 'twitter') {
        Twitter.logout();
    }
    loginStatus = 'none';
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
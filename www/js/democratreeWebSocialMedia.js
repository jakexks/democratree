function initializeLogin() {
    if (window.location.hash != '#login_page' && window.location.hash != '') {
        alert('Please login first to use Democratree');
        _ignoreHashChange = true;
        window.location.hash = '';
    }
    $(window).bind( 'hashchange', hashChanged );
    document.getElementById("guestLoginButton").addEventListener('click', function() {
        loginStatus = 'guest';
        openMapPage();
    });
    $('#facebookSigninButton').bind('click', function(){
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                loginStatus = 'facebook';
                openMapPage();
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        loginStatus = 'facebook';
                        openMapPage();
                    }
                    else {
                        console.log(response);
                    }
                });
            }
        }, true);
    });
    $('#twitterSigninButton').bind('click', function(){
        $.ajax({
            url: "twitterWeb/twitter_login.php",
            type: 'post',
            dataType: 'json',
            success: function(data, status, xhr) {
                if (data.msg == 'OK') {
                    loginStatus = 'twitter';
                    window.open(data.url);
                // all ok, user logged in
                } else {
                    // display error
                    console.log(data.msg);
                }
            },
            error: function(data, status, xhr) {
                console.log(data);
            }
        });
    });
    $('.logoutButton').bind('click', logout);
}
        
function logout(){
    $('#profile_loginStatus').empty();
    $('#profile_username').empty();
    $('#profile_revokeAccess').empty();
    if(loginStatus == 'googleplus') {
        gapi.auth.signOut();
        $('#googleplusSigninButton').show();
    }
    loginStatus = 'none';
    ignoreHashChange = true;
    window.location.hash = 'login_page'
    // For some reason this fires off two hash changes - the second #'s to window.location.pathname
}

function hashChangedProfile(){
    $('#profile_loginStatus').text("Currently logged in via "+loginStatus+".");
    if(loginStatus == 'googleplus'){
        googleplusHelper.profile();
        var $button = $('<button/>', {
            type: 'button',
            id: 'revokeAccess',
            text: 'Revoke the apps access to your account',
            click: googleplusHelper.disconnect
        });
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
        $button.appendTo('#profile_revokeAccess');
    }
    if(loginStatus == 'twitter'){
        twitterHelper.profile();
        // There is no revoke function in the api for twitter, users have to do it manually from twitter settings
    }
}

// G+ callback
function onSignInCallback(authResult) {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        gapi.client.load('plus','v1');
        $('#googleplusSigninButton').hide();
        loginStatus = 'googleplus';
        openMapPage();
    } else {
        // Update the app to reflect a signed out user
        // Possible error values:
        //   "user_signed_out" - User is signed-out
        //   "access_denied" - User denied access to your app
        //   "immediate_failed" - Could not automatically log in the user
        //console.log('Sign-in state: ' + authResult['error']);                
    }
}

var googleplusHelper = (function() {
  var BASE_API_PATH = 'plus/v1/';

  return {

    /**
     * Calls the OAuth2 endpoint to disconnect the app for the user.
     */
    disconnect: function() {
      // Revoke the access token.
      $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
            gapi.auth.getToken().access_token,
        async: false,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(result) {
          // Remove user info
          $('#profile_loginStatus').empty();
          $('#profile_username').empty();
          $('#profile_revokeAccess').empty();
          logout();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },

    /**
     * Gets and renders the list of people visible to this app.
     */
    people: function() {
      var request = gapi.client.plus.people.list({
        'userId': 'me',
        'collection': 'visible'
      });
      request.execute(function(people) {
        $('#visiblePeople').empty();
        $('#visiblePeople').append('Number of people visible to this app: ' +
            people.totalItems + '<br/>');
        for (var personIndex in people.items) {
          person = people.items[personIndex];
          $('#visiblePeople').append('<img src="' + person.image.url + '">');
        }
      });
    },

    /**
     * Gets and renders the currently signed in user's profile data.
     */
    profile: function(){
      var request = gapi.client.plus.people.get( {'userId' : 'me'} );
      request.execute( function(profile) {
        $('#profile_username').empty();
        if (profile.error) {
          console.log(profile.error);
          return;
        }
        $('#profile_username').append(
            $('<p><img src=\"' + profile.image.url + '\"></p>'));
        $('#profile_username').append(
            $('<p>Currently logged in as ' + profile.displayName + '<br />Tagline: ' +
            profile.tagline + '<br />About: ' + profile.aboutMe + '</p>'));
        if (profile.cover && profile.coverPhoto) {
          $('#profile_username').append(
              $('<p><img src=\"' + profile.cover.coverPhoto.url + '\"></p>'));
        }
      });
    }
  };
})();
var facebookHelper = (function() {
   
    return {
    
    /**
    * Calls to revoke api permissions
    */
    
    disconnect: function(){
        FB.api('/me/permissions', 'delete', function(response){
            if (response == true){
                logout();
            } else {
                // Add response to user
                console.log(response);
            }
        });
    },
        
    
    /**
     * Gets profile info
     */
    profile: function(){
        FB.api("/me", function(response) {
            if(response && !response.error){
                console.log(response);
                $('#profile_username').append(
                    $('<p><img src=\"//graph.facebook.com/'+response.id+'/picture\"></p>'));
                $('#profile_username').append(
                    $('<p>Currently logged in as ' + response.name + '</p>'));
            } else {
                console.log(response.error);
            }
        });
    }
  };
})();
var twitterHelper = (function() {

    return {
    
    profile: function(){
        $.ajax({
            url: "twitterWeb/twitter_profile.php",
            type: "GET",
            dataType: "json"
        }).done(function(data) {
            console.log(data);
            if(data.msg == 'OK') {
                // Retrieved properly
                $('#profile_username').append(
                    $('<p><img src=\"' + data.response.profile_image_url+'\"></p>'));
                $('#profile_username').append(
                    $('<p>Currently logged in as ' + data.response.name + ' (@' + data.response.screen_name + ')</p>'));
            } else {
                $('#profile_username').append(
                $('<p>Unfortunately there was an error retrieving your profile from twitter.</p>'));
            }
        });
    }
  }
})();
function initializeLogin() {
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
        var username = document.getElementById('login-username').value;
        var pwd = document.getElementById('login-pwd').value;
        Parse.User.logIn(username, pwd, {
            success: function(user) {
                document.getElementById('login-username').value = "";
                document.getElementById('login-pwd').value = "";
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
    clearProfile();
    $('#profile_revokeAccess').empty();
    if(loginStatus == 'googleplus') {
        gapi.auth.signOut();
    }
    if(loginStatus == 'democratree') {
        Parse.User.logOut(); // logout already here
    }
    loginStatus = 'none';
    ignoreHashChange = true;
    window.location.hash = '#login'
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
        twitterHelper.profile();
        // There is no revoke function in the api for twitter, users have to do it manually from twitter settings
    }
    // Add case for our login
}

// G+ callback
function onSignInCallback(authResult) {
    if (authResult['status']['signed_in']) {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        gapi.client.load('plus','v1');
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
      $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
            gapi.auth.getToken().access_token,
        async: false,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(result) {
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
        clearProfile();
        if (profile.error) {
          console.log(profile.error);
          return;
        }
        $('#profile_picture').append(
            $('<img src=\"' + profile.image.url + '\">'));
        $('#profile_name').append(profile.displayName);
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
                clearProfile();
                $('#profile_picture').append(
                    $('<img src=\"//graph.facebook.com/'+response.id+'/picture\">'));
                $('#profile_name').append(response.name);
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
            clearProfile();
            if(data.msg == 'OK') {
                // Retrieved properly
                $('#profile_name').append(data.response.name);
                $('#profile_username').append('@' + data.response.screen_name);
                $('#profile_picture').append(
                    $('<p><img src=\"' + data.response.profile_image_url+'\"></p>'));
            } else {
                $('#profile_name').append(
                $('<p>Unfortunately there was an error retrieving your profile from twitter.</p>'));
            }
        });
    }
  }
})();
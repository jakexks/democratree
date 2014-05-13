var socialMediaUserID;

/* Attach all the listeners to the login buttons */
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
    $('#mapOk').bind('click', function() {
        alert("hey");
        gmarkers[currentBouncer].setAnimation(null);
        currentBouncer = null;
    });
    $('#democratreeSigninButton').bind('click', function() {
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
                    openPopupInLogin("Email address not verified, please verify before continuing");
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
                        // window.location.hash = '';
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
                FB.api('/me', function(userInfo) {
                    var query = new Parse.Query("socialMediaUsers");
                    query.equalTo("facebook", userInfo.id);
                    query.first({
                        success: function(socialMediaUser) {
                            // If there's no current entry, add it, otherwise just set the current users to it
                            if (socialMediaUser == undefined) {
                                var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                                var socialMediaUser = new socialMediaUsers();
                                socialMediaUser.set('email', userInfo.email);
                                socialMediaUser.set('facebook', userInfo.id);
                                socialMediaUser.set('name', userInfo.name);
                                socialMediaUser.set('votedOn', []);
                                socialMediaUser.save();
                                socialMediaUserID = userInfo.id;
                            } else {
                                socialMediaUserID = userInfo.id;
                            }
                        },
                        error: function(error) {
                            console.log(error)
                        }
                    });
                });
                loginStatus = 'facebook';
                openMapPage();
            } else {
                FB.login(function(response) {
                    if (response.authResponse) {
                        loginStatus = 'facebook';
                        openMapPage();
                        FB.api('/me', function(userInfo) {
                            var query = new Parse.Query("socialMediaUsers");
                            query.equalTo("facebook", userInfo.id);
                            query.first({
                                success: function(socialMediaUser) {
                                    // If there's no current entry, add it, otherwise just set the current users to it
                                    if (socialMediaUser == undefined) {
                                        var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                                        var socialMediaUser = new socialMediaUsers();
                                        socialMediaUser.set('email', userInfo.email);
                                        socialMediaUser.set('facebook', userInfo.id);
                                        socialMediaUser.set('name', userInfo.name);
                                        socialMediaUser.set('votedOn', []);
                                        socialMediaUser.save();
                                        socialMediaUserID = userInfo.id;
                                    } else {
                                        socialMediaUserID = userInfo.id;
                                    }
                                },
                                error: function(error) {
                                    console.log(error)
                                }
                            });
                        });
                    }
                    else {
                        console.log(response);
                    }
                }, {scope: 'email'});
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

function twitterLoginSuccess() {
    $.ajax({
        url: "twitterWeb/twitter_profile.php",
        type: "GET",
        dataType: "json"
    }).done(function(userInfo) {
        //console.log(userInfo);
        var query = new Parse.Query("socialMediaUsers");
        query.equalTo("twitter", userInfo.response.id_str);
        query.first({
            success: function(socialMediaUser) {
                // If there's no current entry, add it, otherwise just set the current users to it
                if (socialMediaUser == undefined) {
                    var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                    var socialMediaUser = new socialMediaUsers();
                    // There is no way to access a users email with the twitter API
                    socialMediaUser.set('twitter', userInfo.response.id_str);
                    socialMediaUser.set('name', userInfo.response.name);
                    socialMediaUser.set('votedOn', []);
                    socialMediaUser.save();
                    socialMediaUserID = userInfo.response.id_str;
                } else {
                    socialMediaUserID = userInfo.response.id_str;
                }
            },
            error: function(error) {
                console.log(error)
            }
        });
    });
}
        
function logout(){
    clearProfile();
    $('#profile_revokeAccess').empty();
    if(loginStatus == 'googleplus') {
        gapi.auth.signOut();
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
    socialMediaUserID = undefined;
    ignoreHashChange = true;
    window.open("http://localhost/webindex.html","_self");
    //window.location.hash = '#login'
    // For some reason this fires off two hash changes - the second #'s to window.location.pathname
}

/* Fill in profile fields and generate list of users trees */
function hashChangedProfile(){
    var user;
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
    if (loginStatus == 'democratree') { 
        clearProfile();
        user = Parse.User.current();
        $('#profile_name').append(user.get('name'));
        $('#profile_username').append(user.getUsername());
        $('#profile_picture').append($('<img src="img/anonuser.png">'))
    }
    if (loginStatus == 'guest') {
        clearProfile();
        $('#profile_name').append('Currently logged in as a guest');
        $('#profile_picture').append($('<img src="img/anonuser.png">'))
    }
    //if(loginStatus != 'guest') {
    else {
        var userid;
        if (loginStatus == 'democratree') {
            userid = user.get('username');
        } else {
            userid = socialMediaUserID;
        }
        var query = new Parse.Query("Tree");
        query.equalTo('username', userid);
        query.equalTo('userType', loginStatus);
        query.find({
            success: function(trees) {
                $('#myTreeList').empty();
                for (var i = 0; i < trees.length; i++) {
                    var t = trees[i].attributes;
                    if(i == 0) { 
                        $('#myTreeList').append('<li class="ui-first-child">' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.votes + ' - ' + t.name +
                            '</a></li>'
                        );
                    } else if(i == trees.length && i != 0) {
                        $('#myTreeList').append('<li class="ui-last-child">' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.votes + ' - ' + t.name +
                            '</a></li>'
                        );
                    } else {
                        $('#myTreeList').append('<li>' +
                            '<a onclick="window.location.href=\'#map\'; map.setCenter(new google.maps.LatLng('+t.lat+','+t.lng+')); map.setZoom(18);" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' 
                            + t.votes + ' - ' + t.name +
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
    //else {
    //    $('#profile_name').append('Currently logged in as a guest');
    //}
}

// G+ callback
function onSignInCallback(authResult) {
    if (authResult['status']['signed_in'] && authResult['status']['method'] == "PROMPT") {
        // Update the app to reflect a signed in user
        // Hide the sign-in button now that the user is authorized, for example:
        //console.log(authResult);
        gapi.client.load('plus','v1', function() {
            var request = gapi.client.plus.people.get( {'userId' : 'me'} );
            request.execute( function(userInfo) {
                //console.log(userInfo);
                var query = new Parse.Query("socialMediaUsers");
                // Filter emails to find primary account
                var email = userInfo['emails'].filter(function(v) {
                    return v.type === 'account'; // Filter out the primary email
                })[0].value;
                var query = new Parse.Query("socialMediaUsers");
                query.equalTo("googleplus", userInfo.id);
                query.first({
                    success: function(socialMediaUser) {
                        // If there's no current entry, add it, otherwise just set the current users to it
                        if (socialMediaUser == undefined) {
                            var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                            var socialMediaUser = new socialMediaUsers();
                            socialMediaUser.set('email', email);
                            socialMediaUser.set('googleplus', userInfo.id);
                            socialMediaUser.set('name', userInfo.displayName);
                            socialMediaUser.set('votedOn', []);
                            socialMediaUser.save();
                            socialMediaUserID = userInfo.id;
                        } else {
                            socialMediaUserID = userInfo.id;
                        }
                    },
                    error: function(error) {
                        console.log(error)
                    }
                });
            });
        });
        loginStatus = 'googleplus';
        openMapPage();
    } else {
        //console.log(authResult);
        // Update the app to reflect a signed out user
        // Possible error values:
        //   "user_signed_out" - User is signed-out
        //   "access_denied" - User denied access to your app
        //   "immediate_failed" - Could not automatically log in the user
        //console.log('Sign-in state: ' + authResult['error']);                
    }
}

/* Clear profile fields */
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
        //console.log(profile);
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
        // Remove from parse before removing permissions
        FB.api('/me', function(userInfo) {
            if(userInfo && !userInfo.error){
                var query = new Parse.Query(Parse.User);
                query.equalTo("email", userInfo.email);
                query.first({
                    success: function(user) {
                        //Doesn't work atm. 
                        //user.unset('facebook');
                        //user.save();
                    },
                    error: function(error)  {
                    }
                });
            }
        });
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
                //console.log(response);
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
            //console.log(data);
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
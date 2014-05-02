var twOauth; // It Holds the oAuth data request
var twRequestParams; // Specific param related to request
var twOptions = {
    consumerKey: 'K0mQSXAkQud9yOkLq21Msg',
    consumerSecret: '3lomb9DzdDOQQPrrZKXxKbalBckyeFYdvRxzAiKI',
    callbackUrl: "http://127.0.0.1/" }; 
var twitterKey = "twtrKey";
var inappbrowser;
         
         
var Twitter = {
    init:function(){
        // Apps storedAccessData , Apps Data in Raw format
        var storedAccessData, rawData = localStorage.getItem(twitterKey);
        // here we are going to check whether the data about user is already with us.
        if(localStorage.getItem(twitterKey) !== null){
            // when App already knows data
            storedAccessData = JSON.parse(rawData); //JSON parsing
            twOptions.accessTokenKey = storedAccessData.accessTokenKey; // data will be saved when user first time signin
            twOptions.accessTokenSecret = storedAccessData.accessTokenSecret; // data will be saved when user first time signin
                         
            // javascript OAuth take care of everything for app we need to provide just the twOptions
            twOauth = OAuth(twOptions);
            twOauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                function(data) {
                    var entry = JSON.parse(data.text);
                    var query = new Parse.Query("socialMediaUsers");
                    query.equalTo("twitter", entry.id_str);
                    query.first({
                        success: function(socialMediaUser) {
                            // If there's no current entry, add it, otherwise just set the current users to it
                            if (socialMediaUser == undefined) {
                                var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                                var socialMediaUser = new socialMediaUsers();
                                // There is no way to access a users email with the twitter API
                                socialMediaUser.set('twitter', entry.id_str);
                                socialMediaUser.set('name', entry.name);
                                socialMediaUser.set('votedOn', []);
                                socialMediaUser.save();
                                socialMediaUserID = entry.id_str;
                            } else {
                                socialMediaUserID = entry.id_str;
                            }
                        },
                        error: function(error) {
                            console.log(error)
                        }
                    });
                    loginStatus = 'twitter';
                    openMapPage();
                },
                function(data) { 
                    alert("ERROR : " + data); 
                });
        }
        else {
            // we have no data for save user
            twOauth = OAuth(twOptions);
            twOauth.get('https://api.twitter.com/oauth/request_token',
                function(data) {
                    twRequestParams = data.text;
                    inappbrowser = window.open('https://api.twitter.com/oauth/authorize?'+data.text, '_blank', 'location=yes'); // This opens the Twitter authorization / sign in page
                    inappbrowser.addEventListener('loadstart', function(uri){ Twitter.success(uri.url); }); // Here will will track the change in URL of ChildBrowser
                },
                function(data) {
                    alert("ERROR: "+data.text);
                }
            );
        }
    },
    /*
     When ChildBrowser's URL changes we will track it here.
     We will also be acknowledged was the request is a successful or unsuccessful
     */
    success:function(loc){
         
        // Here the URL of supplied callback will Load
        /*
         Here Plugin will check whether the callback Url matches with the given Url
         */
        if (loc.indexOf("http://127.0.0.1/?") >= 0) {
            // Parse the returned URL
            var index, verifier = '';
            var params = loc.substr(loc.indexOf('?') + 1);
             
            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if(y[0] === 'oauth_verifier') {
                    verifier = y[1];
                }
            }
            inappbrowser.close()
            // Here we are going to change token for request with token for access
             
            /*
             Once user has authorised us then we have to change the token for request with token of access
            here we will give data to localStorage.
             */
            twOauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+twRequestParams,
              function(data) {
                  var accessParams = {};
                  var qvars_tmp = data.text.split('&');
                  for (var i = 0; i < qvars_tmp.length; i++) {
                      var y = qvars_tmp[i].split('=');
                      accessParams[y[0]] = decodeURIComponent(y[1]);
                  }
                   
                  $('#oauthStatus').html('<span style="color:green;">Success!</span>');
                  $('#stage-auth').hide();
                  $('#stage-data').show();
                  twOauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                   
                  // Saving token of access in Local_Storage
                  var accessData = {};
                  accessData.accessTokenKey = accessParams.oauth_token;
                  accessData.accessTokenSecret = accessParams.oauth_token_secret;
                  twOauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                    function(data) {
                        var entry = JSON.parse(data.text);
                        // Find a way to close the browser faster to prevent user seeing page not found
                        var query = new Parse.Query("socialMediaUsers");
                        query.equalTo("twitter", entry.id_str);
                        query.first({
                            success: function(socialMediaUser) {
                                // If there's no current entry, add it, otherwise just set the current users to it
                                if (socialMediaUser == undefined) {
                                    var socialMediaUsers = Parse.Object.extend("socialMediaUsers");
                                    var socialMediaUser = new socialMediaUsers();
                                    // There is no way to access a users email with the twitter API
                                    socialMediaUser.set('twitter', entry.id_str);
                                    socialMediaUser.set('name', entry.name);
                                    socialMediaUser.set('votedOn', []);
                                    socialMediaUser.save();
                                    socialMediaUserID = entry.id_str;
                                } else {
                                    socialMediaUserID = entry.id_str;
                                }
                            },
                            error: function(error) {
                                console.log(error)
                            }
                        });
                        loginStatus = 'twitter';
                        // Configuring Apps LOCAL_STORAGE
                        localStorage.setItem(twitterKey, JSON.stringify(accessData));
                        openMapPage();
                    },
                    function(data) {
                        console.log("ERROR: " + data);
                    });
              
              },
              function(data) {
                  console.log("ERROR1: "+data);
              });
        }
        else {
        }
    },
    
    // Get profile info
    profile:function() {
        var storedAccessData, rawData = localStorage.getItem(twitterKey);
        storedAccessData = JSON.parse(rawData); // Paring Json
        twOptions.accessTokenKey = storedAccessData.accessTokenKey; // it will be saved on first signin
        twOptions.accessTokenSecret = storedAccessData.accessTokenSecret; // it will be save on first login
         
        // javascript OAuth will care of else for app we need to send only the options
        twOauth = OAuth(twOptions);
        twOauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
          function(data) {
            var entry = JSON.parse(data.text);
            clearProfile();
            $('#profile_name').append(entry.name);
            $('#profile_username').append('@' + entry.screen_name);
            $('#profile_picture').append(
                $('<p><img src=\"' + entry.profile_image_url+'\"></p>'));
          },
          function(data) {
                $('#profile_name').append(
                $('<p>Unfortunately there was an error retrieving your profile from twitter.</p>'));
          });
    },
    
    logout:function() {
        // Delete the keys from local storage and reset the options var
        window.localStorage.removeItem(twitterKey);
        twOptions = {
            consumerKey: 'K0mQSXAkQud9yOkLq21Msg',
            consumerSecret: '3lomb9DzdDOQQPrrZKXxKbalBckyeFYdvRxzAiKI',
            callbackUrl: "http://127.0.0.1/" };
    }
};
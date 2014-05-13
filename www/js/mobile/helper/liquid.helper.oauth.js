/**
 * @fileOverview OAuth Helper functions for google authorization.<br /> 
 * It is used to authenticate using OAuth from Google's Server. 
 * 
 * The following files should be included before this file:
 * 
 * @requires cordova.js (Phonegap library)
 * @requires inappbrowser.js (Phonegap InAppBrowser plugin)
 * @requires jquery.js (jquery library)
 * @requires gapi-client.min.js (google API JS Client)
 * @requires liquid.js (The Base library)
 * 
 * Reference (Google OAuth Playground):
 * https://developers.google.com/oauthplayground/ 
 * 
 * @author Abdullah Rubiyath
 * @since  1.0
 */


/**
 * Add Google OAuth Capabilities to the helper
 * property/attribute of liquid
 */
(/** @lends liquid.helper */function(helper) {
    var inappbrowser;
	helper.oauth = {
        /* Whether the client api has been loaded yet */
        isGapiLoaded: false,

		/* the key for refresh Token in local Storage */
		tokenKey: 'refresh_token',

		/* stores the accessToken after retrieval from google server */
		accessToken : false,

		/* stores the Time when access token was last received from server */
		accessTokenTime: false,

		/* stores access Token's Expiry Limit. Uses 58 min. instead of 60 min. */
		accessTokenExpiryLimit: 58 * 60 * 1000, 

		/* A temporary variable storing callback function */
		callbackFunc: false,

		/* config values for Google API (gapi) */
		gapiConfig: liquid.config.gapi,

		/** 
		 * Enum for Status values
		 * 
		 * @enum {number}
		 *  
		 * SUCCESS - Successfully data received from server
		 * ERROR - Error occurred when trying to receive from server
		 * NOT_DETERMINED - undetermined
		 */
		status: { 
			SUCESS: 1, 
			ERROR: -1, 
			NOT_DETERMINED: 0 
		},

		requestStatus: 0,

		/* stores the authorization Code internally */
		authCode: false,

		/* stores the error message when an error happens from google server */
		errorMessage: false,

		/**
		 * Attempts to authorize user using OAuth
		 * Opens up Another window where user allows access or denies it.
		 *  
		 * @param {function} callBack   A callback function which is invoked
		 */
		authorize: function(callBack) 
		{
			var $this = helper.oauth;
			var gapiConfig = liquid.config.gapi;

			var authUri = gapiConfig.endpoint + '?' 
			+ 'scope=' + encodeURIComponent(gapiConfig.scope) 
			+ '&' + 'redirect_uri=' + encodeURIComponent(gapiConfig.redirect_uri) 
			+ '&' + 'response_type=' + encodeURIComponent(gapiConfig.response_type) 
			+ '&' + 'client_id=' + encodeURIComponent(gapiConfig.client_id)
			+ '&' + 'state=' + encodeURIComponent(gapiConfig.state)
			+ '&' + 'access_type=' + encodeURIComponent(gapiConfig.access_type)
			+ '&' + 'approval_prompt=force'; // @TODO - check if we really need this param

			$this.callbackFunc = callBack;
			$this.requestStatus = $this.status.NOT_DETERMINED;

			// Now open new browser
            /* Old ChildBrowser code
			window.plugins.childBrowser.showWebPage(authUri, {showLocationBar : true}); 		
			window.plugins.childBrowser.onClose = $this.onAuthClose;		
			window.plugins.childBrowser.onLocationChange = $this.onAuthUrlChange; */
            // New InAppBrowser code
            inappbrowser = window.open(authUri, '_blank', 'location=yes'); 		
			inappbrowser.addEventListener('exit', $this.onAuthClose);
            inappbrowser.addEventListener('loadstart', $this.onAuthUrlChange);
		},

		/* Auth Window closed */
		onAuthClose: function() {
			//console.log("Auth window closed");
		},

		/* OAuth Successfully done */
		onAuthSuccess: function() {
			//console.log('Auth Success?');
		},

		/** 
		 * Gets Invoked when the URL changes on OAuth authorization process 
		 * 
		 * Success URL Pattern: 
		 * "redirect_uri" + "?code=" [secret code val]
		 *  
		 * Success Sample URL: 
		 * http://localhost/?code=4/WOpRLQfvvhHE0tuMUDDqnn76lCTT.8nXC4IebMEAUuJJVnL49Cc8AQGr8cQI
		 * 
		 * Denied Access URL Pattern: "redirect_uri" + ?error=access_denied
		 * Denied Access Sample: http://localhost/?error=access_denied
		 * 
		 * @param {string} uriLocation The URI Location 
		 */
		onAuthUrlChange: function(uriLocation) {
			var $this = helper.oauth;
			if(uriLocation.url.indexOf("code=") != -1) {
				$this.requestStatus = $this.status.SUCCESS;

				/* Store the authCode temporarily */
				$this.authCode = $.url(uriLocation.url).param('code');
				// close the childBrowser
				inappbrowser.close();
			}
		    else if(uriLocation.url.indexOf("error=") != -1) 
		    {
		    	$this.requestStatus = $this.status.ERROR;		    	
		    	$this.errorMessage = $.url(uriLocation.url).param('error')

		    	inappbrowser.close();
		    }
		    else {
		    	$this.requestStatus = $this.status.NOT_DETERMINED;
		    }

			$this.callbackFunc(uriLocation);
	   },


	   /**
	    * Gets the Refresh from Access Token. This method is only called internally, 
	    * and once, only after when authorization of Application happens.
	    * 
	    * @param paramObj An Object containing authorization code
	    * @param paramObj.auth_code The Authorization Code for getting Refresh Token 
	    * 
	    * @param {Function} callback callback function which is to be invoked after
	    *                            successful retrieval of data from google's server
	    *
	    */
	   getRefreshToken: function(paramObj, callback) {
		   var $this = helper.oauth;
		   var gapiConfig = liquid.config.gapi;

		   $.ajax({
				  type: "POST",
				  url: gapiConfig.endtoken,
				  data: {
                       code         : paramObj.auth_code,
					   client_id    : gapiConfig.client_id,
					   client_secret: gapiConfig.client_secret,	
					   redirect_uri : gapiConfig.redirect_uri,
					   grant_type   : gapiConfig.grantTypes.AUTHORIZE
				   }
				})
			    .done(function(data) {
			    	//alert("Refresh Token Received / Found? >> " + JSON.stringify(data));
			    	/* upon sucess, do a callback with the data received */
			    	// temporary storing access token
			    	$this.accessToken     = data.access_token;
			    	$this.accessTokenTime = (new Date()).getTime();

			    	/* set the error of data to false, as it was successful */
			    	data.error = false;

			    	/* now invoke the callback */
			    	callback(data);
			   	})
			    .fail(function(xhr, textStatus) {
			    	//alert("Token request error ?? >>" + xhr.responseText);
			    	callback({
			    		error: true,
			    		message: xhr.responseText
			    	});
			    })
			    .always(function() { 
			    	//console.log("Token request complete"); 
			    });		   
	   },


	   /**
	    * This method should ONLY be called locally from within this class. 
	    * Returns the Refresh Token from the local database.
	    * 
	    * @return {String} The refresh Token
	    *  
	    */
	   getToken: function() {
		   var $this = helper.oauth;

		   return window.localStorage.getItem($this.tokenKey);
	   },


	   /**
	    * This method is invoked externally. It retrieves the Access Token by at first
	    * checking if current access token has expired or not. If its not expired, it
	    * simply returns that, otherwise, it gets the refresh Token from the local database 
	    * (by invoking getToken) and then connecting with Google's Server (using OAuth) 
	    * to get the Access Token.
	    * 
	    * @param {Function} callback   A callBack function which is to be invoked after
	    *                             data is retrieved from the google's server. The data
	    *                             from google server is passed to callback as args.
	    * 
	    */
	   getAccessToken: function(callback) {
		   var $this = helper.oauth;
		   var gapiConfig = $this.gapiConfig;
		   var currentTime = (new Date()).getTime();	   

		   /* check if current Token has not expired (still valid) */
		   if ($this.accessToken && $this.accessToken != false && 
			   currentTime < ($this.accessTokenTime + $this.accessTokenExpiryLimit)) {
			   callback({ access_token: $this.accessToken });

			   return;
		   }

		   /* else, get the refreshToken from local storage and get a new access Token */
		   var refreshToken = $this.getToken();


		   $.ajax({
			  type: "POST",
			  url: gapiConfig.endtoken,
			  data: {
				  client_id    : gapiConfig.client_id,
				  client_secret: gapiConfig.client_secret,	
				  refresh_token: refreshToken,
                  grant_type   : gapiConfig.grantTypes.REFRESH
			  }
			})
		    .done(function(data) {
		    	//alert("Token Received / Found?");
		    	/* upon sucess, do a callback with the data received */
		    	// temporary storing access token
		    	$this.accessToken = data.access_token;
		    	$this.accessTokenTime = (new Date()).getTime();

		    	/* set the error to false */
		    	data.error = false;
		    	callback(data);
		   	})
            // Refresh token has expired as well
		    .fail(function(xhr, textStatus) {
                //alert("Error retrieving token : " + xhr.responseText);
		    	callback({
		    		error: true,
		    		message: xhr.responseText
		    	});
		    })
		    .always(function() { //alert("Token request complete"); 
		    });			   
	   },	   



	   /**
	    * Saves the Refresh Token in a local database or localStorage
	    * This method shall be invoked from externally only <b>once</b> after an 
	    * authorization code is received from google's server. This method 
	    * calls the other method (getRefreshToken) to get the refresh Token and
	    * then saves it locally on database and invokes a callback function
	    * 
	    * @param tokenObj A Object containing authorization code
	    * @param {String} tokenObj.auth_code The authorization code from google's server
	    * 
	    * @param {Function} callback The function to be invoked with parameters
	    */
	   saveRefreshToken: function(tokenObj, callback) {
		   var $this = helper.oauth;

		   $this.getRefreshToken(tokenObj, function(data) {

			   /* if there's no error */
			   if (!data.error) {
				  // @TODO: make another method saveToken to abstract the storing of token
			      window.localStorage.setItem($this.tokenKey, data.refresh_token);
			   } else { 
               //alert("Data error: "+data.error); alert("Data message: "+data.message); alert("Data access: "+data.access_token); 
               }

			   callback(data);
		   });
	   },



	   /**
	    * Checks if user has authorized the App or not
	    * It does so by checking if there's a refresh_token
	    * available on the current database table.
	    * 
	    * @return {Boolean} true if authorized, false otherwise
	    */
	   isAuthorized: function() {
		  var $this = helper.oauth;
		  var tokenValue = window.localStorage.getItem($this.tokenKey);

		  return ((tokenValue !== null) && (typeof tokenValue !== 'undefined'));  
	   },



	   /**
	    * Unauthorizes user by removing all stored data from the app
	    * 
	    */
	   unAuthorize: function() {
	       var $this = helper.oauth;

	       // Proceed with resetting all the values used throughout the app

	       // Send a request to revoke the refresh token
           $.ajax({
              type: 'GET',
              url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
                  $this.getToken(),
              async: false,
              contentType: 'application/json',
              dataType: 'jsonp',
              success: function(result) {
                logout();
              },
              error: function(e) {
                alert(e);
              }
           });
           // Clear all locally saved data
	       window.localStorage.clear();  

	   },



	   /**
	    * Extracts the code from the url. Copied from online
	    * @TODO needs to be simplified. 
	    *  
	    * @param name The parameter whose value is to be grabbed from url 
	    * @param url  The url to be grabbed from.
	    * 
	    * @return Returns the Value corresponding to the name passed 
	    */
	   getParameterByName: function(name, url) {
		  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		  var regexS = "[\\?&]" + name + "=([^&#]*)";
		  var regex = new RegExp(regexS);
		  var results = regex.exec(url);

		  if(results == null) {
		    return false;
		  }
		  else 
		    return decodeURIComponent(results[1].replace(/\+/g, " "));
		},

	};

})(window.liquid.helper);
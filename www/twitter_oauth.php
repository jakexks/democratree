<?php
require("twitter/twitteroauth.php");
session_start();
if(!empty($_GET['oauth_verifier']) && !empty($_SESSION['oauth_token']) && !empty($_SESSION['oauth_token_secret'])){
    // TwitterOAuth instance, with two new parameters we got in twitter_login.php
    $twitteroauth = new TwitterOAuth('K0mQSXAkQud9yOkLq21Msg', '3lomb9DzdDOQQPrrZKXxKbalBckyeFYdvRxzAiKI', $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
    // Let's request the access token
    $access_token = $twitteroauth->getAccessToken($_GET['oauth_verifier']);
    // Save it in a session var
    $_SESSION['access_token'] = $access_token;
    echo "<script>window.opener.loginStatus = 'twitter'; window.opener.openMapPage();</script>";
    echo "<script>window.close();</script>";
} else {
    // Something's missing, did the user deny access
    if(!empty($_GET['denied'])){
        // Close the window - Alternatively we could display some message stating user must login to use?
        echo "<script>window.close();</script>";
    }
}
?>
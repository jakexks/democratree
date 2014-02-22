<?php
require("twitteroauth.php");
session_start();
// Get new OAuth from access token
$twitteroauth = new TwitterOAuth('K0mQSXAkQud9yOkLq21Msg', '3lomb9DzdDOQQPrrZKXxKbalBckyeFYdvRxzAiKI', $_SESSION['access_token']['oauth_token'], $_SESSION['access_token']['oauth_token_secret']);
// Get user info
$user_info = $twitteroauth->get('account/verify_credentials');
// Return user's info
if(!empty($user_info->errors)){
    echo json_encode(Array('msg' => 'Error', 'errormsg' => $user_info->errors));
} else {
    echo json_encode(Array('msg' => 'OK', 'response' => $user_info));
}
?>
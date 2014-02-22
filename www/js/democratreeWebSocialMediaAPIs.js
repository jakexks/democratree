(function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/client:plusone.js?onload=render';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();
   
function render() {

    // Additional params including the callback, the rest of the params will
    // come from the page-level configuration.
    var additionalParams = {
        'callback': onSignInCallback,
        'clientid':'472542569529-mfjun68cmt6gojdfis32u465hpkbjij8.apps.googleusercontent.com',
        'cookiepolicy':'single_host_origin',
        'requestvisibleactions':'http://schemas.google.com/AddActivity',
        'scope':'https://www.googleapis.com/auth/plus.login'
    };

    // Attach a click listener to a button to trigger the flow.
    var signinButton = document.getElementById('googleplusSigninButton');
    signinButton.addEventListener('click', function() {
        gapi.auth.signIn(additionalParams); // Will use page level configuration
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '628889687147449',
        status     : true,
        xfbml      : true,
        oauth   : true
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    //js.src = "//connect.facebook.net/en_UK/all.js"; For some reason this fails to get the page.
    js.src = "js/fb_all.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
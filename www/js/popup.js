function openPopupInMap(message)
{
    $( "#alertMap" ).popup({ theme: "a" });
    document.getElementById("alertTextMap").innerHTML = message + '<br/><br/><div align="center" style="width:100px"><a href="#" class="ui-btn ui-shadow ui-corner-all" data-rel="back">OK</a></div>';
    $( "#alertMap" ).popup("open");
}

function openPopupInLogin(message)
{
    $( "#alertLogin" ).popup({ theme: "a" });
    document.getElementById("alertTextLogin").innerHTML = message + '<br/><br/><div align="center" style="width:100px"><a href="#" class="ui-btn ui-shadow ui-corner-all" data-rel="back">OK</a></div>';
    $( "#alertLogin" ).popup("open");
}

function openPopupInSignup(message)
{
    $( "#alertSignup" ).popup({ theme: "a" });
    document.getElementById("alertTextSignup").innerHTML = message + '<br/><br/><div align="center" style="width:100px"><a href="#" class="ui-btn ui-shadow ui-corner-all" data-rel="back">OK</a></div>';
    $( "#alertSignup" ).popup("open");
}

function openPopupInSettings(message)
{
    $( "#alertSettings" ).popup({ theme: "a" });
    document.getElementById("alertTextSettings").innerHTML = message + '<br/><br/><div align="center" style="width:100px"><a href="#" class="ui-btn ui-shadow ui-corner-all" data-rel="back">OK</a></div>';
    $( "#alertSettings" ).popup("open");
}

function changePassword() {
        alert("on page");
        $('#settings-changepwdbtn').bind('click', function() {

            alert("sdsaasd");

            var pwd = document.getElementById('settings-curpwd').value;
            var newpwd = document.getElementById('settings-newpwd').value;
            var newpwd2 = document.getElementById('settings-newpwd2').value;
            var currentUser = Parse.User.current();

            Parse.User.logIn(currentUser, pwd, {
                success: function(user) {
                    if (newpwd == newpwd2) {
                        document.getElementById("settings-curpwd").value = "";
                        document.getElementById("settings-newpwd").value = "";
                        document.getElementById("settings-newpwd2").value = "";
                        openPopupInSettings("Successfully changed");
                        currentUser.set('password', newpwd);
                    }
                    else {
                        document.getElementById("settings-curpwd").value = "";
                        document.getElementById("settings-newpwd").value = "";
                        document.getElementById("settings-newpwd2").value = "";
                        openPopupInSettings("The passwords you entered do not match,<p>please type them again");
                    }
                },
                error: function(user, error) {
                    openPopupInSettings("Incorrect username/password");
                }
            });
        });
        $('#settings-resetpwdbtn').bind('click', function() {
            var email = $('settings-email').value;
            Parse.User.requestPasswordReset(email, {
              success: function() {
                // Password reset request was sent successfully
              },
              error: function(error) {
                // Show the error message somewhere
                alert("Error: " + error.code + " " + error.message);
              }
            });
        });
    }
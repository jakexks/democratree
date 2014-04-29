function openPopupInMap(message)
{
    $( "#alertMap" ).popup({ theme: "a" });
    document.getElementById("alertTextMap").innerHTML = message;
    $( "#alertMap" ).popup("open");
}

function openPopupPlant(message)
{
    $( "#plantMap" ).popup({ theme: "a" });
    document.getElementById("plantTextMap").innerHTML = message + '<br/><br/><div align="center" style="width:100px"><a href="#" class="ui-btn ui-shadow ui-corner-all" data-rel="back">OK</a></div>';
    $( "#plantMap" ).popup("open");
}

function openPopupInLogin(message)
{
    $( "#alertLogin" ).popup({ theme: "a" });
    document.getElementById("alertTextLogin").innerHTML = message;
    $( "#alertLogin" ).popup("open");
}

function openPopupInSignup(message)
{
    $( "#alertSignup" ).popup({ theme: "a" });
    document.getElementById("alertTextSignup").innerHTML = message;
    $( "#alertSignup" ).popup("open");
}

function openPopupInSettings(message)
{
    $( "#alertSettings" ).popup({ theme: "a" });
    document.getElementById("alertTextSettings").innerHTML = message;
    $( "#alertSettings" ).popup("open");
}
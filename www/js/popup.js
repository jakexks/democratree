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
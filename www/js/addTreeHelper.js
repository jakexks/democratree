var newChosenTree = "";
var newTreeLabel = "";
var newTreeStory = "";
var newTreeImg = null;
var newLatLng = null;


$(document).on( "pagebeforeshow","#plantconfirm", function() {
    $("#confirmTitle").html("<h2>" + newTreeLabel + "</h2>");
    $("#confirmType").html(newChosenTree);
    $("#confirmImg").src = "data:image/jpeg;base64," + newTreeImg;
    $("#confirmStory").html(newTreeStory);
    $("#confirmMap").attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" + newLatLng.lat() + "," + newLatLng.lng() + "&key=AIzaSyAHfzX08GH1op3bMCsv7FqpkzxBwwQO4Rw&size=300x300&zoom=14");
} );

function addTree1() {
    newChosenTree = $("#chosenTree :radio:checked").val();
}

function addTree2() {
    newTreeLabel = $("#tree-label").val();
    newTreeStory = $("#tree-story").val();
}

function attachPhoto1() {
    navigator.camera.getPicture(onAddTreeSuccess, onAddTreeFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL});
}

function attachPhoto2() {
    navigator.camera.getPicture(onAddTreeSuccess, onAddTreeFail, { quality: 50, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.DATA_URL});
}


function onAddTreeSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
    newTreeImg = imageData;
}

function onAddTreeFail(message) {
    //alert('Failed because: ' + message);
}
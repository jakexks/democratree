

function attachPhoto1() {
	navigator.camera.getPicture(onAddTreeSuccess, onAddTreeFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL});
}

function attachPhoto2() {
	navigator.camera.getPicture(onAddTreeSuccess, onAddTreeFail, { quality: 50, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.DATA_URL});
}


function onAddTreeSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onAddTreeFail(message) {
    alert('Failed because: ' + message);
}
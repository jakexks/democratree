function attachPhoto1() {
	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL});
}

function attachPhoto2() {
	navigator.camera.getPicture(onSuccess, onFail, { quality: 50, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.DATA_URL});
}


function onSuccess(imageData) {
    var image = document.getElementById('myImage');
    image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    alert('Failed because: ' + message);
}
var dd = $.Deferred();
var jqd = $.Deferred();
$.when(dd, jqd).done(doInit);
$(document).bind('mobileinit', function () {
    jqd.resolve();
});
function doInit() {
    FastClick.attach(document.body);
    var ele = document.getElementById("deviceproperties");
    ele.innerHTML = 'Device Model: '    + device.model    + '<br />' +
                    'Device Cordova: '  + device.cordova  + '<br />' +
                    'Device Platform: ' + device.platform + '<br />' +
                    'Device UUID: '     + device.uuid     + '<br />' +
                    'Device Version: '  + device.version  + '<br />';
}
$.support.cors = true;
$.mobile.allowCrossDomainPages = true;
$.mobile.buttonMarkup.hoverDelay = 10;
function updateLeaderboard() {
    var dropdown=document.getElementById("leaderboardFilter");
    var dropdownText=dropdown.options[dropdown.selectedIndex].text;
    var lbsize;

    if (dropdownText == 'Overall') {
        sortArray = new Array();
        sortArray = treeArray;
    }
    else if (dropdownText == 'This Month') {
        sortArray = new Array();
        var dm = new Date();
        dm.setMonth(dm.getMonth() - 1);
        for (var i = 0; i < treeArray.length; i++) {
             if (treeArray[i].createdAt > dm) {
                sortArray.push(treeArray[i]);
            }
        }
    }
    else if (dropdownText == 'This Week') {
        sortArray = new Array();
        var dw = new Date();
        dw.setDate(dw.getDate() - 7);
        for (var i = 0; i < treeArray.length; i++) {
            if (treeArray[i].createdAt > dw) {
                sortArray.push(treeArray[i]);
            }
        }
    }
    else if (dropdownText == 'Today') {
        sortArray = new Array();
        var dt = new Date();
        dt.setDate(dt.getDate() - 1);
        for (var i = 0; i < treeArray.length; i++) {
            if (treeArray[i].createdAt > dt) {
                sortArray.push(treeArray[i]);
            }
        }
    }
    else if (dropdownText == 'Hot') {
        sortArray = new Array();
        var dh = new Date();
        dh.setMinutes(dh.getMinutes() - 30);
        for (var i = 0; i < treeArray.length; i++) {
            if (treeArray[i].updatedAt > dh) {
                sortArray.push(treeArray[i]);
            }
        }
    }
            
    sortArray.sort(compare);
    lbsize = sortArray.length;
            
    for (var i = 0; i < 15; i++) {
        if (i < lbsize) {
            document.getElementById("lb" + (i+1) + "no").innerHTML=sortArray[i].get("votes");
            document.getElementById("lb" + (i+1) + "name").innerHTML=sortArray[i].get("username");
        }
        else {
            document.getElementById("lb" + (i+1) + "no").innerHTML='-'
            document.getElementById("lb" + (i+1) + "name").innerHTML='-'
        }
    }
}
        
function goToLeaderboardMapLocation(pos) {
    var lat;
    var lng;
    var found = false;
    var mark;
    var index;
    if (pos <= sortArray.length) {
        lat = sortArray[pos-1].get("lat");
        lng = sortArray[pos-1].get("lng");
        window.location.href='#map';
        map.panTo(new google.maps.LatLng(lat,lng));
        map.setZoom(18);

        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i].position.toString() === ('(' + lat + ', ' + lng + ')')) {
                mark = gmarkers[i];
                index = i;
                found = true;
            }
            if (found) break;
        }
        infoWindowArray[index].open(map,mark);
    }
}
        
function compare(a,b) {
    if (a.get("votes") < b.get("votes"))
        return 1;
    if (a.get("votes") > b.get("votes"))
        return -1;
    return 0;
}

        Parse.initialize("Pw7r5n6AfEqyu1qCWzPGFveMWwfkBDiNSAE33dnL", "eTo4A3yQclInUHyVSj96zDP45Hdy6XIxHtfl2yIe");
        
        var treeCount = 0;
        var markerCount = 0;
        var treeArray = new Array();
        var gmarkers = new Array();
        var infoWindowArray = new Array();
        var map = undefined;
        var loginStatus = 'none';
        var ignoreHashChange = false;
        var sortArray = new Array();
        
        var clusterStyles = [{
            url: 'img/m1.png',
            width: 35,
            height: 35,
            textColor: '#ff00ff',
            textSize: 10
        }, {
            url: 'img/m1.png',
            width: 45,
            height: 45,
            textColor: '#ff0000',
            textSize: 11
        }, {
            url: 'img/m1.png',
            width: 55,
            height: 55,
            textColor: '#ffffff',
            textSize: 12
        }];
        
        function hashChanged(event){
            if(ignoreHashChange == false){
                if(loginStatus == 'none' && window.location.hash != '#login' && window.location.hash != ''){
                    ignoreHashChange = true;
                    window.location.hash = '#login';
                    alert('Please login first to use Democratree');
                }
                else if(window.location.hash == '#profile'){
                    hashChangedProfile();
                }
            }
            ignoreHashChange = false;
        }
        
        
        function openMapPage() {
            window.location.hash = '#map';
            // Prevent reloading the map when logging out and back in during the same session
            if (map == undefined) {
                map = initializeMap();
            }
            else {
                map.panTo(new google.maps.LatLng(51.455, -2.588));
                map.setZoom(13);
            }
            var c = map.getCenter();    
            
            // Fix for loading map into 'hidden' div on other page
            // If the login takes a long time this sometimes doesn't work
            google.maps.event.addListener(map, 'idle', function(){
                google.maps.event.trigger(map, 'resize');
                map.setCenter(c);
                google.maps.event.clearListeners(map, 'idle');
            });
            
        }
        
        // Initialize Map page
        function initializeMap() {
            var mapOptions = {
                center: new google.maps.LatLng(51.455, -2.588),
                zoom: 13,
                minZoom: 13
            };
            map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
            
            // Listen for clicks to add labels
            google.maps.event.addListener(map, 'click', function(event) {
                infowindow.open(map);
                infowindow.setPosition(event.latLng);
            });
            
            
            // Rough BS1-16 (Bristol council jurisdiction) postcode bounds, needs refining to a polygon
            var allowedBounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(51.389244, -2.709939), 
                                                             new google.maps.LatLng(51.552326,-2.41893));
            
            var lastValidCenter = map.getCenter();
            
            google.maps.event.addListener(map, 'center_changed', function() {
                if (allowedBounds.contains(map.getCenter())) {
                    lastValidCenter = map.getCenter();
                    return; 
                }
                map.panTo(lastValidCenter);
            });
            
            // String to display when user tries to place tree in disallowed area
            var badArea = 'Sorry, this area is outside the predefined allowed locations for tree planting';
            
            // Infowindow to display when tree planting is attempted in disallowed area
            var infowindow = new google.maps.InfoWindow({ 
                content: badArea
            });
            // Coordinates for disallowed area
            var polyCoords = [
            new google.maps.LatLng(51.422368, -2.600615), new google.maps.LatLng(51.422281, -2.599920), new google.maps.LatLng(51.422303, -2.598823), 
            new google.maps.LatLng(51.421931, -2.598190), new google.maps.LatLng(51.421291, -2.598362), new google.maps.LatLng(51.420220, -2.599207), 
            new google.maps.LatLng(51.420162, -2.599341), new google.maps.LatLng(51.420210, -2.599928), new google.maps.LatLng(51.420321, -2.600121), 
            new google.maps.LatLng(51.420759, -2.600387), new google.maps.LatLng(51.420884, -2.600556), new google.maps.LatLng(51.421294, -2.600470), 
            new google.maps.LatLng(51.421716, -2.600202), new google.maps.LatLng(51.421925, -2.600481), new google.maps.LatLng(51.421946, -2.600620), 
            ];
            
            var circleOptions = {
                strokeColor: '#FF0000',
                strokeOpacity: 0.1,
                strokeWeight: 2,
                fillColor: '#A1F4A1',
                fillOpacity: 0.1,
                map: map,
                center: new google.maps.LatLng(51.421274, -2.599345),
                radius: 2500
            };
            
            plantArea = new google.maps.Circle(circleOptions);
            
            // Polygon for disallowed area
            shading = new google.maps.Polygon({
                paths: polyCoords,
                strokeColor: '#595555',
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColour: '#595555',
                fillOpacity: 0.3
            });
            
            // Coordinates for disallowed area
            var polyCoords = [
            new google.maps.LatLng(51.422368, -2.600615), new google.maps.LatLng(51.422281, -2.599920), new google.maps.LatLng(51.422303, -2.598823), 
            new google.maps.LatLng(51.421931, -2.598190), new google.maps.LatLng(51.421291, -2.598362), new google.maps.LatLng(51.420220, -2.599207), 
            new google.maps.LatLng(51.420162, -2.599341), new google.maps.LatLng(51.420210, -2.599928), new google.maps.LatLng(51.420321, -2.600121), 
            new google.maps.LatLng(51.420759, -2.600387), new google.maps.LatLng(51.420884, -2.600556), new google.maps.LatLng(51.421294, -2.600470), 
            new google.maps.LatLng(51.421716, -2.600202), new google.maps.LatLng(51.421925, -2.600481), new google.maps.LatLng(51.421946, -2.600620), 
            ];
            
            var objectId = "xxxxxxx";
            
            var circleOptions = {
                strokeColor: '#FF0000',
                strokeOpacity: 0.1,
                strokeWeight: 2,
                fillColor: '#66FF66',
                fillOpacity: 0.1,
                map: map,
                center: new google.maps.LatLng(51.421274, -2.599345),
                radius: 2500
            };
            
            plantArea = new google.maps.Circle(circleOptions);
            
            // Polygon for disallowed area
            shading = new google.maps.Polygon({
                paths: polyCoords,
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColour: '#FF0000',
                fillOpacity: 0.3
            });
            
            google.maps.event.addListener(shading, 'click', function(event) {
                infowindow.open(map);
                infowindow.setPosition(event.latLng);
            });
            
            // Makes disallowed area polygon only appear above a certain zoom level 
            google.maps.event.addListener(map, "zoom_changed", function() { 
                if(map.getZoom() > 15) shading.setMap(map);
                                          else shading.setMap(null);
            });
            
            var warning = new google.maps.InfoWindow({ 
                content: "Please finish placing your previous tree first"
            });
            
            google.maps.event.addListener(plantArea, 'click', function(event)
            {
                if(map.getZoom() > 15) {
                    if (markerCount != treeCount) {
                        if(warning.getMap() == null) warning.open(map);
                                          warning.setPosition(event.latLng);
                    } else placeMarker(event.latLng, map);
                }
            });
            
            // Create the search box and link it to the UI element.
            var input = document.getElementById('search-input');
            //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
            
            var autoComplete = new google.maps.places.Autocomplete(input);
            autoComplete.setComponentRestrictions({'country': 'uk'});
            
            // Listen for the event fired when the user selects an item from the
            // pick list. Retrieve the matching place for that item.
            google.maps.event.addListener(autoComplete, 'place_changed', function() {
                var result = autoComplete.getPlace();
                if(typeof result.address_components == 'undefined') {
                    // The user pressed enter in the input 
                    // without selecting a result from the list
                    var bounds = map.getBounds();
                    autocompleteService = new google.maps.places.AutocompleteService();
                    autocompleteService.getPlacePredictions(
                        {
                            'input': result.name,
                            'offset': result.name.length,
                            'bounds': bounds,
                            'componentRestrictions': {'country': 'uk'}
                        },
                        function listentoresult(list, status) {
                            if(list == null || list.length == 0) {
                                // There are no suggestions available.
                            } else {
                                // Here's the first result that the user saw in the list.
                                placesService = new google.maps.places.PlacesService(document.getElementById('search-input'));
                                placesService.getDetails(
                                    {'reference': list[0].reference},
                                    function detailsresult(detailsResult, placesServiceStatus) {
                                        // Here's the first result in the AutoComplete with the exact
                                        // same data format as you get from the AutoComplete.
                                        document.getElementById('search-input').value = detailsResult.formatted_address;
                                        map.setCenter(detailsResult.geometry.location);
                                        map.setZoom(16);
                                    }
                                );
                            }
                        }
                    );
                } else {
                    map.setCenter(result.geometry.location);
                    map.setZoom(16);
                }
            });
            
            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function() {
                var bounds = map.getBounds();
                autoComplete.setBounds(bounds);
            });
            
            // Set height
            h = $(window).height();
            document.getElementById('map-canvas').style.height = "750px";
            // Set cache reset for jStorage
            $('.resetCache').bind('click', function() { 
                for(var i = treeCount-1; i >= 0; i--) {
                    treeArray[i].id = null;
                    treeArray[i] = null;
                    // Remove from map before removing reference
                    gmarkers[i].setMap(null);
                    gmarkers[i] = null;
                    infoWindowArray[i] = null;
                }
                // Check if a tree is in the process of being placed, treeCount should only ever be one less or equal
                if(treeCount != markerCount) {
                    gmarkers[markerCount-1].setMap(null);
                    infoWindowArray[markerCount-1] = null;
                }
                treeArray = [];
                infoWindowArray = [];
                gmarkers = [];
                treeCount = 0;
                markerCount = 0;
                $.jStorage.flush();
            });
            $('.cacheSize').bind('click', function() { console.log($.jStorage.storageSize()); });
            initializeArrays(map);
            
            return map;
        } 
        
        function initializeArrays(map) {
            var results;
            var Tree = Parse.Object.extend("Tree");
            var query = new Parse.Query("Tree");
            query.find({
                // Load each tree
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var tree = results[i];
                        var latlng = new google.maps.LatLng(tree.get("lat"), tree.get("lng"));
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: ""+i,
                            animation: google.maps.Animation.DROP,
                            icon: 'img/tree1.png'
                        });
                        gmarkers.push(marker);
                        attachMessageInit(marker, map, tree);
                        treeArray.push(tree);
                    }
                    treeCount = results.length;
                    markerCount = treeCount;
                    
                    // cluster            
                    var markerCluster = new MarkerClusterer(map, gmarkers, {
                        maxZoom: 14,
                        gridSize: 80,
                        styles: clusterStyles
                    }
                    );
                },
                error: function(error) {
                    alert("failure");
                }
            });
        }
        function showLoader()
        {
            var inter = setInterval(function() {
                $.mobile.loading('show', {text: 'Checking Location...', textVisible: true, theme: 'a'});
                clearInterval(inter);
            }, 1);  
        }
        
        function hideLoader()
        {
            var inter = setInterval(function() {
                $.mobile.loading('hide');
                clearInterval(inter);
            }, 1);  
        }
        
        // Function to place marker
        function placeMarker(location, map) {
            showLoader();
            $.get("http://pecan.jakexks.com/democratree/plantable.php?lat=" + location.lat() + "&long=" + location.lng(), function(data) { 
                hideLoader();
                if(data == "true")
                {
                    var marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        title: ""+markerCount,    
                        animation: google.maps.Animation.DROP,
                        icon: 'img/tree1.png'
                    });
                    var currentUser = Parse.User.current();
                    var Tree = Parse.Object.extend("Tree");
                    var tree = new Tree();
                    tree.set("lat", location.lat());
                    tree.set("lng", location.lng());
                    tree.set("type", "default");
                    tree.set("username", currentUser.get("username"));
                    tree.set("votes", 0); 
                    tree.set("story", "none");
                    tree.save(null, {
                        success: function(tree) {
                            objectId = tree.id;
                            markerCount++;
                            gmarkers.push(marker);
                            map.panTo(location);
                            attachMessage(marker, map);
                        },
                        error: function(error) {
                            alert("error");
                        }
                    });
                }
                else 
                {
                    document.getElementById("alertText").innerHTML= "That area is not plantable (according to our heuristic)<p>Try planting somewhere else!";
                    $( "#alert" ).popup({ theme: "a" });
                    $( "#alert" ).popup("open");
                }
            });
        }
        
        function cancelTree(i) {
            var Tree = Parse.Object.extend("Tree");
            var query = new Parse.Query("Tree");
            query.equalTo("objectId", objectId);
            query.first({
                success: function(tree) {
                    gmarkers[i].setMap(null);
                    gmarkers.pop();
                    infoWindowArray.pop();
                    markerCount--;
                    tree.destroy();
                },
                error: function(error) {
                    alert("error destroying tree");
                }
            });
        }
        
        function voteUp(objectId, infowindow) {
            var Tree = Parse.Object.extend("Tree");
            var query = new Parse.Query("Tree");
            query.equalTo("objectId", objectId);
            query.first({
                success: function(tree) {
                    var currentUser = Parse.User.current();
                    currentUser.add("votedOn", tree.id) 
                    currentUser.save();
                    if(tree.get("username") == currentUser.get("username"))
                    {
                        alert("you cannot vote on your own tree");
                    }
                    else
                    {
                        var score = tree.get("votes");
                        tree.set("votes", score + 1);
                        tree.save();
                        infowindow.setContent('<p>User Name: ' + tree.get("username") + '<p>Tree Story: ' + tree.get("story") + '<p><p>Votes: ' + tree.get("votes") + '<p><button id="btnVoteUp' + tree.id + '">Vote Up</button>');
                    }
                },
                error: function(error) {
                    alert("voteup error");
                }
            });
        }
        
        function addNewTree() {
            var fStory=document.forms["myForm"]["Story"].value;
            var Tree = Parse.Object.extend("Tree");
            var tree = new Tree();
            var query = new Parse.Query("Tree");
            query.equalTo("objectId", objectId);
            query.first({
                success: function(tree) {
                    tree.set("story", fStory);
                    tree.save();
                    infoWindowArray[treeCount].close();
                    //infoWindowArray[treeCount].setContent('Tree submitted.<p>User Name: ' + tree.get("username") + '<p>Tree Story: ' + fStory + '<p><p>Votes: 0');
                    document.getElementById("treeInfoText").innerHTML= 'Tree submitted.<p>User Name: ' + tree.get("username") + '<p>Tree Story: ' + fStory + '<p><p>Votes: 0';
                    $( "#treeInfo" ).popup({ theme: "a" });
                    $( "#treeInfo" ).popup("open");
                    //treeArray.push(treeInfo); //Needed?
                    treeCount++;
                },
                error: function(error) {
                    alert("tree story saving error");
                }
            });
            return;
        }
        
        // Attaches infowindow to each marker
        function attachMessage(marker, map) {           
            var contentString = '<p id="textInfoWindow"><b>New Tree Placed</b><p><form id="myForm"> Story: <input type="text" name="Story"><br></form><p><button id="btnSubmitTree" onclick="return addNewTree()">Submit</button><button id="btnCancelTree" onclick="return cancelTree(markerCount-1)">Cancel</button></p>'
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infoWindowArray.push(infowindow);
            infowindow.open(map, marker);
            google.maps.event.addListener(marker, 'click', function() {
               infowindow.open(map,marker);
            });
            google.maps.event.addListener(infowindow, 'domready', function(){
                var contentStr = '<p id="textInfoWindow"><b>New Tree Placed</b><p><form id="myForm"> User Name: <input type="text" name="Name"><br> Story: <input type="text" name="Story"><br></form><p><button id="btnSubmitTree" onclick="return addNewTree()">Submit</button><button id="btnCancelTree" onclick="return cancelTree(markerCount-1)">Cancel</button></p>'
                // Check to make sure it has been submitted
                if(infowindow.content == contentStr) {}
                else {
                    var str = infowindow.content;
                    var id = str.slice(-28, -18); // If content string changes after <button id="btnVoteUp####..., needs changing
                    // Attach listener
                    var btn = document.getElementById("btnVoteUp"+id);
                    btn.addEventListener('click', function() {
                        voteUp(id, infowindow);
                    });
                }
            });
        }
        
        // Create infoWindows when loading from Parse Cloud
        function attachMessageInit(marker, map, tree) {
            {
                var infowindow = new google.maps.InfoWindow({
                    content: '<p>User Name: ' + tree.get("username") + '<p>Tree Story: ' + tree.get("story") + '<p>Votes: ' + tree.get("votes") + '<p><button id="btnVoteUp'+tree.id+'">Vote Up</button>'
                });
            }
            var idForVote = tree.id;
            infoWindowArray.push(infowindow);
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });
            google.maps.event.addListener(infowindow, 'domready', function(){
                // Attach listener
                var btn = document.getElementById("btnVoteUp"+tree.id);
                btn.addEventListener('click', function() {
                    var user = Parse.User.current();
                    var votedOn = user.get("votedOn");
                    if(votedOn.indexOf(tree.id) == -1) 
                    {
                        voteUp(idForVote, infowindow);
                    }
                    else
                    {
                        alert("you have already voted on this tree");
                    }
                });
            });
        }
        
        // LEADERBOARD STUFF
        
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
        google.maps.event.addDomListener(window, 'load', initializeLogin);
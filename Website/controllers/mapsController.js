(function(){
    pages.controller('mapsCtrl', function(data){

        // Display title on View
        this.title = data.title();

        // Polygon is the combination of the vertices - Google Map's Object
        var polygon;

        // Default client id - subject to change
        var clientid = "innovationwarehouse";

        /*
            Data from Database
         */
        var vertices = [
            new google.maps.LatLng(51.519558, -0.103953),
            new google.maps.LatLng(51.519671, -0.101109),
            new google.maps.LatLng(51.518537, -0.102740)
        ];

        /*
             GetLocation() -> InitiliazeGoogleMaps()
             Attempt to get user's location first then
             only load Google Maps
        */
        (function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        initializeGoogleMaps(googleMapsLatLng(position.coords.latitude, position.coords.longitude));
                    },function(){
                        initializeGoogleMaps(googleMapsLatLng(60, -0.102740));
                });
            } else {
                alert("Geolocation is not supported by this browser.");
                initializeGoogleMaps(googleMapsLatLng(60, -0.102740));
            }
        })();

        // Returns Google Map's LatLng object
        function googleMapsLatLng(lat, lng){
            return new google.maps.LatLng(lat, lng);
        }

        function initializeGoogleMaps(latlng) {

            // Maps Options
            var mapOptions = {
                zoom: 10,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };

            // Construct a new Map
            var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

            googleMapsSearchBox(map);

            googleMapsPolygon(map, vertices);
        };

        // Adding a Search Box into the Google Maps
        function googleMapsSearchBox(map){
            // Create the search box and link it to the UI element.
            var input = /** @type {HTMLInputElement} */(
                document.getElementById('pac-input'));
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var markers = [];
            var searchBox = new google.maps.places.SearchBox(
                /** @type {HTMLInputElement} */(input));

            // Listen for the event fired when the user selects an item from the
            // pick list. Retrieve the matching places for that item.
            google.maps.event.addListener(searchBox, 'places_changed', function() {
                var places = searchBox.getPlaces();

                if (places.length == 0) {
                    return;
                }
                for (var i = 0, marker; marker = markers[i]; i++) {
                    marker.setMap(null);
                }

                // For each place, get the icon, place name, and location.
                markers = [];
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, place; place = places[i]; i++) {
                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    var marker = new google.maps.Marker({
                        map: map,
                        icon: image,
                        title: place.name,
                        position: place.geometry.location
                    });

                    markers.push(marker);

                    bounds.extend(place.geometry.location);
                }

                map.fitBounds(bounds);
            });

            // Bias the SearchBox results towards places that are within the bounds of the
            // current map's viewport.
            google.maps.event.addListener(map, 'bounds_changed', function() {
                var bounds = map.getBounds();
                searchBox.setBounds(bounds);
            });
        }

        // Polygon as the authenticated area
        function googleMapsPolygon(map, vertices) {

            /*
                Construct a draggable blue triangle with Geodesic set to false.

                Geodesic means that the polygon will stretch / shrink from
                the perspective of 2D map
                according to the Earth's curved surface.
            */

            polygon = new google.maps.Polygon({
                map: map,
                paths: vertices,
                strokeColor: '#0000FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#0000FF',
                fillOpacity: 0.35,
                draggable: true,
                geodesic: false,
                editable: true
            });

            /*
             POLYGON EVENT LISTENERS

             // New point Inserted
             google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
             console.log("New Point Added", getVertices(polygon));
             vertices = getVertices(polygon);
             });

             // Polygon Dragged
             google.maps.event.addListener(polygon, 'dragend', function() {
             console.log("Shape Dragged", getVertices(polygon));
             vertices = getVertices(polygon);
             });

             // Point Updated
             google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
             console.log("Point Updated", getVertices(polygon));
             vertices = getVertices(polygon);
             });
             */
        }

        // Get the vertices of a polygon
        function getVertices(polygon){
            var coords = [];
            for(var ind in polygon.getPath().j){
                coords.push(polygon.getPath().j[ind].A + "," + polygon.getPath().j[ind].F);
            }
            return coords;
        }

        /*
            Reset default vertices
         */
        function resetCoords(){
            polygon.setPaths(vertices);
        }

        /*
            Sending info to server
         */
        function sendCoords(){

            var obj = {
                "clientid" : clientid,
                "coords" : getVertices(polygon)
            }

            console.log(JSON.stringify(obj));

            $.ajax({
                type: "POST",
                url: "http://172.16.7.243:9000/clients/borders",
                data: JSON.stringify(obj),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(){
                    alert("Success");
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest, textStatus, errorThrown);
                }
            });

            // Send JSON.stringify(obj) to server
            // Receive response
        }

    });
})();
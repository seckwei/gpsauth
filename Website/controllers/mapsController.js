pages.controller('mapsCtrl', function($scope, data){

    $scope.Maps = {

        map : {},
        boundaries: [],
        polygons: [],
        currentEdit: -1,

        createNewBoundary: function(){

            // Get the center of current map's view
            var center = {
                lat : parseFloat(this.map.center.A),
                lng : parseFloat(this.map.center.F)
            };
            var offset = 0.05;

            var newBoundary = {
                name : 'Unnamed Boundary',
                vertices : [
                    {lat : center.lat + offset,     lng : center.lng - offset},
                    {lat : center.lat + offset,     lng : center.lng + offset},
                    {lat : center.lat - offset/2,   lng : center.lng}
                ]
            };

            // Add to the existing array of Boundaries and Polygons
            this.boundaries.push(newBoundary);
            this.polygons.push(
                this.createGoogleMapsPolygon(newBoundary.vertices)
            );
        },

        // Returns Google Map's LatLng object
        createGoogleMapsLatLng: function (lat, lng){
            return new google.maps.LatLng(lat, lng);
        },

        // Polygon as the authenticated area
        createGoogleMapsPolygon: function (vertices) {

            /*
             Construct a draggable blue triangle with Geodesic set to false.

             Geodesic means that the polygon will stretch / shrink from
             the perspective of 2D map
             according to the Earth's curved surface.
             */

            // Converting numbers into Google Maps' LatLng object
            for(var ind in vertices){
                vertices[ind] = this.createGoogleMapsLatLng(vertices[ind].lat, vertices[ind].lng);
            }

            return new google.maps.Polygon({
                map: this.map,
                paths: vertices,
                strokeColor: '#0000FF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#0000FF',
                fillOpacity: 0.35,
                draggable: false,
                geodesic: false,
                editable: false
            });

            /*
             POLYGON EVENT LISTENERS

             // New point Inserted
             google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
                 console.log("New Point Added", getPolygonVertices(polygon));
                 vertices = getPolygonVertices(polygon);
             });

             // Polygon Dragged
             google.maps.event.addListener(polygon, 'dragend', function() {
                 console.log("Shape Dragged", getPolygonVertices(polygon));
                 vertices = getPolygonVertices(polygon);
             });

             // Point Updated
             google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
                 console.log("Point Updated", getPolygonVertices(polygon));
                 vertices = getPolygonVertices(polygon);
             });
             */
        },

        // Populate map with polygons
        populatePolygons: function(){
            for(var ind in this.boundaries){
                this.polygons.push(
                    this.createGoogleMapsPolygon(this.boundaries[ind].vertices)
                );
            }
        },

        // Edit a boundary
        editBoundary: function(index){

            // If another Boundary is already being edited
            if(this.currentEdit > -1){
                // Remove the listener from old Bounds
                this.setPolygonEventListeners(this.polygons[this.currentEdit], false);

                // Change draggable to false
                this.setPolygonEditable(this.polygons[this.currentEdit], false);
            }

            // Add listener to New Bounds
            this.currentEdit = index;

            this.setPolygonEditable(this.polygons[this.currentEdit], true);
            this.setPolygonEventListeners(this.polygons[this.currentEdit], true);
        },

        // Delete a boundary
        deleteBoundary: function(index){
            // Remove '1' item at position 'index'
            this.boundaries.splice(index, 1);

            // Remove the Polygon from map before
            // removing from array
            this.polygons[index].setMap(null);
            this.polygons.splice(index,1);
        },

        // Get the vertices of a polygon
        getPolygonVertices: function(polygon){
            var vertices = [];
            var LatLng = {};

            //console.log(polygon);

            for(var ind in polygon.getPath().j){
                LatLng.lat = polygon.getPath().j[ind].A;
                LatLng.lng = polygon.getPath().j[ind].F;
                vertices.push(LatLng);
            }
            return vertices;
        },

        // Get the vertices of a path
        getPathVertices: function(path){
            var vertices = [];
            var LatLng = {};

            //console.log(polygon);

            for(var ind in path.j){
                LatLng.lat = path.j[ind].A;
                LatLng.lng = path.j[ind].F;
                vertices.push(LatLng);
            }
            return vertices;
        },

        // Set Polygon's Editable and Draggable properties
        setPolygonEditable: function(polygon, bool){
            polygon.setOptions({draggable : bool});
            polygon.setOptions({editable : bool});
        },

        // Set Polygon's Event Listeners On / Off
        setPolygonEventListeners: function(polygon, bool){
            if(bool){

                // Dragging the Polygon
                google.maps.event.addListener(polygon, 'dragend', function() {
                    // Update the vertices in Boundaries
                    $scope.Maps.boundaries[$scope.Maps.currentEdit].vertices = $scope.Maps.getPolygonVertices(this);
                    $scope.$apply();
                });

                // Creating a new Vertex
                google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
                    // Update the vertices in Boundaries
                    $scope.Maps.boundaries[$scope.Maps.currentEdit].vertices = $scope.Maps.getPathVertices(this);
                    $scope.$apply();
                });

                // Right click to delete a Vertex - Polygon has to be Editable first
                google.maps.event.addListener(polygon, 'rightclick', function(polygon) {
                    if(polygon.vertex != null && this.getPath().getLength() > 3){
                        this.getPath().removeAt(polygon.vertex);

                        $scope.Maps.boundaries[$scope.Maps.currentEdit].vertices = $scope.Maps.getPolygonVertices(this);
                        $scope.$apply();
                    }
                });
            }
            else {
                google.maps.event.clearListeners(polygon, 'dragend');
                google.maps.event.clearListeners(polygon.getPath(), 'insert_at');
                google.maps.event.clearListeners(polygon, 'rightclick');
            }
        },

        // Reset default vertices
        resetCoords: function (){
            polygon.setPaths(vertices);
        },

        // Sending info to server
        sendCoords: function(){

            var obj = {
                "clientid" : clientid,
                "coords" : getPolygonVertices(polygon)
            };

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

    };

    // Display title on View
    $scope.title = data.title();

    // Boundaries Data - to be retrieved from database
    $scope.Maps.boundaries = [
        {
            name : "Main Building",
            vertices : [
                {lat : 53.5867, lng : -2.1518},
                {lat : 53.5867, lng : -2.0518},
                {lat : 53.5117, lng : -2.1018}
            ]
        },
        {
            name : "Building #2",
            vertices : [
                {lat : 53.5350, lng : -2.4049},
                {lat : 53.5350, lng : -2.3049},
                {lat : 53.4600, lng : -2.3549}
            ]
        }
    ];

    // Combination of the vertices - Google Map's Object
    var polygon;

    // Default client id - subject to change
    var clientid = "innovationwarehouse";


    /*
         GetLocation() -> InitiliazeGoogleMaps()
         Attempt to get user's location first then
         only load Google Maps
    */
    (function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    initializeGoogleMaps($scope.Maps.createGoogleMapsLatLng(position.coords.latitude, position.coords.longitude));
                },function(){
                    initializeGoogleMaps($scope.Maps.createGoogleMapsLatLng(60, -0.102740));
            });
        } else {
            alert("Geolocation is not supported by this browser.");
            initializeGoogleMaps($scope.Maps.createGoogleMapsLatLng(60, -0.102740));
        }
    })();

    function initializeGoogleMaps(latlng) {

        // Maps Options
        var mapOptions = {
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        // Construct a new Map
        $scope.Maps.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        googleMapsSearchBox($scope.Maps.map);
        $scope.Maps.populatePolygons();

        //polygon = maps.createGoogleMapsPolygon(map, vertices);
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




});



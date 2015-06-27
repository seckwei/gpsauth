var polygon;

// Data from Database
var clientid = "innovationwarehouse";
var vertices = [];

function initialize() {

  // Maps Options
  var mapOptions = {
    zoom: 18,
    //center: new google.maps.LatLng(51.519084, -0.102794),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  // Construct a new Map
  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
          map: map,
          position: pos,
          content: 'You are here'
        });

        map.setCenter(pos);
      }, 
      function() {
        handleNoGeolocation(true);
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }

  polygonClass(map);

}

function polygonClass(map) {

  // Default Coordinates for the polygon
  // If present, set the value gotten from database?
  vertices = [
    new google.maps.LatLng(51.519558, -0.103953),
    new google.maps.LatLng(51.519671, -0.101109),
    new google.maps.LatLng(51.518537, -0.102740)
  ];

  // Construct a draggable blue triangle with geodesic set to false.
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

    POLYGON EVETN LISTENERS

  
  // New point Inserted
  google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
    console.log("New Point Added", getPoints(polygon));
    vertices = getPoints(polygon);
  });

  // Polygon Dragged
  google.maps.event.addListener(polygon, 'dragend', function() {
    console.log("Shape Dragged", getPoints(polygon));
    vertices = getPoints(polygon);
  });

  // Point Updated
  google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
    console.log("Point Updated", getPoints(polygon));
    vertices = getPoints(polygon);
  });
  */
}

function getPoints(polygon){
  var coords = [];
  for(var ind in polygon.getPath().j){
    coords.push(polygon.getPath().j[ind].A + "," + polygon.getPath().j[ind].F);
  }
  return coords;
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(51.519084, -0.102794),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);

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
    "coords" : getPoints(polygon)
  }

  console.log(JSON.stringify(obj));

  $.ajax({
    type: "POST",
    url: "http://10.0.5.114:9000/test",
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
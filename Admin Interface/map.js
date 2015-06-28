var polygon;
var clientid = "innovationwarehouse";

/*
  Data from Database
*/
// Default Coordinates for the polygon
// If present, set the value gotten from database?
vertices = [
  new google.maps.LatLng(51.519558, -0.103953),
  new google.maps.LatLng(51.519671, -0.101109),
  new google.maps.LatLng(51.518537, -0.102740)
];

function initialize() {

  // Maps Options
  var mapOptions = {
    zoom: 18,
    center: vertices[0],
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  // Construct a new Map
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  polygonClass(map);

}

function polygonClass(map) {

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
    url: "http://localhost:9000/clients/borders",
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
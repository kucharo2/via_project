const apiKey = 'AIzaSyD10rgOEQhCGE26z1MxQ5A6IQKuH51JOnY';

var map;
var infowindow;

function initMap() {

    var location = new google.maps.LatLng(50.1027792, 14.392020799999997);
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: location,
        radius: 500,
        types: ['cafe', 'restaurant', 'bar']
    }, callback);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        title: place.name
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}


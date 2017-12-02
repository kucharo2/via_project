const apiKey = 'AIzaSyD10rgOEQhCGE26z1MxQ5A6IQKuH51JOnY';

var map;
var infoWindow;

function showCurrentLocation(location) {
    new google.maps.Marker({
        position: location,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'blue',
            fillOpacity: .8,
            strokeColor: 'white',
            strokeWeight: .5,
            scale: 10
        }
    });
}
function initMap() {

    navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
        var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map = new google.maps.Map(document.getElementById('map'), {
            center: location,
            zoom: 15
        });

        showCurrentLocation(location);

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: location,
            radius: 500,
            types: ['cafe', 'restaurant', 'bar']
        }, callback);
    });
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
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}


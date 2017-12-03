var map;
var infoWindow;
var googleLocation;

function showCurrentLocation() {
    new google.maps.Marker({
        position: googleLocation,
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
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            googleLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map = new google.maps.Map(document.getElementById('map'), {
                center: googleLocation,
                zoom: 15
            });

            infoWindow = new google.maps.InfoWindow();
            showCurrentLocation();

            searchNearbyPlaces(function (nearbyPlaces) {
                for (var i = 0; i < nearbyPlaces.length; i++) {
                    createMarker(nearbyPlaces[i]);
                }
            });

        });
    } else {
        $("#map").text("Your browser does not support geolocation.")
    }
}

function searchNearbyPlaces(callback) {
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: googleLocation,
        radius: 250,
        types: ['cafe', 'restaurant', 'bar']
    }, function (result, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            callback(result);
        }
    });
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


var map;
var service;
var infoWindow;
var googleLocation;

function showCurrentLocation() {
    return new google.maps.Marker({
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
            // navigator.geolocation.watchPosition(function (position) {
            console.log(position);
            googleLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map = new google.maps.Map(document.getElementById('map'), {
                center: googleLocation,
                zoom: 15
            });

            infoWindow = new google.maps.InfoWindow();
            service = new google.maps.places.PlacesService(map);
            var actualPositionMarker = showCurrentLocation();

            navigator.geolocation.watchPosition(function (position) {
                actualPositionMarker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            });
        }, function() {
            $("#map").text("Application does not have permissions to get your location.")
        });
    } else {
        $("#map").text("Your browser does not support geolocation.")
    }
}

function searchNearbyPlaces(callback) {
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

function placeDetail(placeId, callback) {
    if (typeof service === "undefined") {
        setTimeout(function() {
            placeDetail(placeId, callback);
        }, 200);
        return;
    }
    service.getDetails({
        placeId: placeId
    }, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            callback(place);
        }
    });
}

function createMarker(place, contentCreator) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        title: place.name
    });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(contentCreator());
        infoWindow.open(map, this);
    });
}


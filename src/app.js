var storage = {};
const LOGGED_USER_ID = "loggedUserId";

function createPlacesTable() {
    $("#modalAjaxIndicator").show();
    var $addPlaceModalContent = $("#addPlaceModalContent");
    $addPlaceModalContent.text("");
    searchNearbyPlaces(function (nearbyPlaces) {
        if (nearbyPlaces.length > 0) {
            nearbyPlaces.sort(distanceComparator);
            var tableHtml = '<table class="table">' +
                '    <tbody>';
            for (var i = 0; i < nearbyPlaces.length; i++) {
                var place = nearbyPlaces[i];
                console.log(place);

                tableHtml+= '<tr>';
                tableHtml+= '<td><img src="' + place.photos[0].getUrl({'maxWidth': 150, 'maxHeight': 150}) + '" alt="' + place.name + '"/></td>';
                tableHtml+= '<td><div>' + place.name + '</div><div>' + place.vicinity + '</div></td>';
                tableHtml+= '</tr>';
            }
            tableHtml += '</tbody>' +
                '</table>';
            $addPlaceModalContent.html(tableHtml);
        } else {
            $addPlaceModalContent.text("Cannot found any place near to you.");
        }
        $("#modalAjaxIndicator").hide();

    })
}

function distanceComparator(place1, place2) {
    var actualLat = googleLocation.lat();
    var actualLon = googleLocation.lng();
    var placeLocation1 = place1.geometry.location;
    var placeLocation2 = place2.geometry.location;
    var distance1 = getDistance(actualLat, actualLon, placeLocation1.lat(), placeLocation1.lng());
    var distance2 = getDistance(actualLat, actualLon, placeLocation2.lat(), placeLocation2.lng());
    return distance1 - distance2;
}

function getDistance(ax, ay, bx, by) {
    return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
}

function prepareStorage() {
    if (typeof localStorage !== 'undefined') {
        storage = localStorage;
    } else {
        storage = sessionStorage;
    }
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
        console.log("CORS are not supported by this browser");
    }
    return xhr;
}

function makeCorsRequest(method, url, data, callback) {
    var xhr = createCORSRequest(method, url);
    if (!xhr) {
        alert('CORS not supported');
        return null;
    }

    xhr.onload = function () {
        callback(xhr.response);
    };

    xhr.onerror = function (data) {
        console.log(data);
        alert('Woops, there was an error making the request.');
        return null;
    };

    xhr.responseType = "json";
    if (data && method == "POST") {
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
}


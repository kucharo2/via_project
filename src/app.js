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

                tableHtml+= '<tr onclick="showAddPlaceFom(' + i + ')">';
                tableHtml+= '<td><img src="' + place.photos[0].getUrl({'maxWidth': 150, 'maxHeight': 150}) + '" alt="' + place.name + '"/></td>';
                tableHtml+= '<td><div>' + place.name + '</div><div>' + place.vicinity + '</div></td>';
                tableHtml+= '</tr>';
                tableHtml+= createAddPlaceForm(i, place)
            }
            tableHtml += '</tbody>' +
                '</table>';

            $addPlaceModalContent.html(tableHtml);

            $addPlaceModalContent.find("form").on("submit", submitAddPlaceForm)
        } else {
            $addPlaceModalContent.text("Cannot found any place near to you.");
        }
        $("#modalAjaxIndicator").hide();

    })
}

function submitAddPlaceForm(e) {
    var $this = $(this);
    var formData = {
        "placeId" : $this.find("input[name='placeId']").val(),
        "comment" : $this.find("textarea[name='comment']").val(),
        "stars" : $this.find("input[name='star']:checked:first").val()
    };
    // makeCorsRequest("POST", "https://salty-woodland-34826.herokuapp.com/user/" + storage.getItem(LOGGED_USER_ID) + "/addPlace", formData, function(user) {
    //    console.log(user);
    // });
    $('#addPlaceModal').modal('hide');
    e.preventDefault();
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

function showAddPlaceFom(index) {
    var $addPlaceModalContent = $("#addPlaceModalContent");
    $addPlaceModalContent.find("tr[id^='addPlaceForm']").hide();
    $addPlaceModalContent.find("#addPlaceForm" + index).show();
}

function createAddPlaceForm(i, place) {
    return '<tr style="display:none" id="addPlaceForm' + i + '"><td colspan="2">' +
        '<form>' +
            '<input type="hidden" name="placeId" value="' + place.id + '"/>' +
                getReviewStarsHtml() +
                '<div class="form-group">' +
                    '<label>Comment</label>' +
                    '<textarea class="form-control" name="comment" rows="2"></textarea>' +
                '</div>' +
            '<button type="submit" class="btn btn-primary">Submit</button>' +
        '</form>' +
        '</td></tr>';
}

function getReviewStarsHtml() {
    return '<div class="stars form-group">' +
    '        <input class="star star-5" id="star-5" type="radio" name="star" value="5"/>' +
    '        <label class="star star-5" for="star-5"></label>' +
    '        <input class="star star-4" id="star-4" type="radio" name="star" value="4"/>' +
    '        <label class="star star-4" for="star-4"></label>' +
    '        <input class="star star-3" id="star-3" type="radio" name="star" value="3"/>' +
    '        <label class="star star-3" for="star-3"></label>' +
    '        <input class="star star-2" id="star-2" type="radio" name="star" value="2"/>' +
    '        <label class="star star-2" for="star-2"></label>' +
    '        <input class="star star-1" id="star-1" type="radio" name="star"  value="1"/>' +
    '        <label class="star star-1" for="star-1"></label>' +
    '</div>';
}

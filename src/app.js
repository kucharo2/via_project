var storage = {};
const PUB_TRACKER_API_URL = "https://salty-woodland-34826.herokuapp.com";
const LOGGED_USER_ID = "loggedUserId";

function createPlacesTable() {
    $("#modalAjaxIndicator").show();
    var $addPlaceModalContent = $("#addPlaceModalContent");
    $addPlaceModalContent.text("");
    searchNearbyPlaces(function (nearbyPlaces) {
        if (nearbyPlaces.length > 0) {
            nearbyPlaces.sort(distanceComparator);
            var tableHtml = createPlaceTableHtml(nearbyPlaces);

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
        "placeId": $this.find("input[name='placeId']").val(),
        "comment": $this.find("textarea[name='comment']").val(),
        "stars": $this.find("input[name='star']:checked:first").val()
    };
    makeCorsRequest("POST", "/user/" + storage.getItem(LOGGED_USER_ID) + "/addPlace", formData, function(user) {
       console.log(user);
    });
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
    } else if (typeof XDomainRequest !== "undefined") {
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

function makeCorsRequest(method, route, data, callback) {
    var url = PUB_TRACKER_API_URL + route;
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
    if (data && method === "POST") {
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }
}

function showAddPlaceForm(index) {
    var $addPlaceModalContent = $("#addPlaceModalContent");
    $addPlaceModalContent.find("tr[id^='addPlaceForm']").hide();
    $addPlaceModalContent.find("#addPlaceForm" + index).show();
}

function logIntoApplication(response) {
    makeCorsRequest("GET", "/user/" + response.id, null, function (user) {
        if (user.length < 1) {
            console.log("User not exists. Creating a new one ...");
            makeCorsRequest("POST", "/user", {
                "email": response.email,
                "fbId": response.id,
                "name": response.name
            }, function (createdUser) {
                user = createdUser;
            });
        }
    });

    getFbFriends(function(response) {
        if (response.data.length > 0) {
            var friendFbIds = [];
            response.data.forEach(function(friend) {
                friendFbIds.push(friend.id);
            });
            makeCorsRequest("POST", "/friends/visited", friendFbIds, function(result) {
                console.log(result);
                result.forEach(function (place) {
                    placeDetail(place._id, function(placeDetail) {
                       createMarker(placeDetail);
                    });
                })
            });
        }
    });
    setLoggedUser(response);
}

function logout() {
    setLoggedUser(null);
}

function setLoggedUser(response) {
    var $loggedUser = $("#loggedUser");
    var $applicationControls = $("#applicationControls li");
    var $fbLoginButton = $("#fbLogin");
    if (typeof response !== "undefined" && response != null) {
        console.log('Successful login for: ' + response.name + " " + response.email + " " + response.id);
        $loggedUser.text(response.name + ", " + response.email);
        $loggedUser.show();

        storage.setItem(LOGGED_USER_ID, response.id);

        $fbLoginButton.hide();
        $applicationControls.show();
    } else {
        console.log("User was logged out.");
        $loggedUser.hide();
        $loggedUser.text("");

        storage.setItem(LOGGED_USER_ID, "");
        $fbLoginButton.show();
        $applicationControls.hide();
    }
}

function createPlaceTableHtml(nearbyPlaces) {
    var tableHtml = '<table class="table">' +
        '    <tbody>';
    for (var i = 0; i < nearbyPlaces.length; i++) {
        var place = nearbyPlaces[i];

        tableHtml += '<tr onclick="showAddPlaceForm(' + i + ')">';
        if (typeof place.photos === "undefined") {
            tableHtml += '<td><img src="' + place.icon + '" alt="' + place.name + '"/></td>';
        } else {
            tableHtml += '<td><img src="' + place.photos[0].getUrl({
                    'maxWidth': 150,
                    'maxHeight': 150
                }) + '" alt="' + place.name + '"/></td>';
        }
        tableHtml += '<td><div>' + place.name + '</div><div>' + place.vicinity + '</div></td>';
        tableHtml += '</tr>';
        tableHtml += createAddPlaceForm(i, place)
    }
    tableHtml += '</tbody>' +
        '</table>';
    return tableHtml;
}

function createAddPlaceForm(i, place) {
    return '<tr style="display:none" id="addPlaceForm' + i + '"><td colspan="2">' +
        '<form>' +
        '<input type="hidden" name="placeId" value="' + place.place_id + '"/>' +
        getReviewStarsHtml(i) +
        '<div class="form-group">' +
        '<label>Comment</label>' +
        '<textarea class="form-control" name="comment" rows="2"></textarea>' +
        '</div>' +
        '<button class="btn btn-primary">Submit</button>' +
        '</form>' +
        '</td></tr>';
}

function getReviewStarsHtml(index) {
    return '<div class="stars form-group">' +
        '        <input class="star star-5" id="star-' + index + '-5" type="radio" name="star" value="5"/>' +
        '        <label class="star star-5" for="star-' + index + '-5"></label>' +
        '        <input class="star star-4" id="star-' + index + '-4" type="radio" name="star" value="4"/>' +
        '        <label class="star star-4" for="star-' + index + '-4"></label>' +
        '        <input class="star star-3" id="star-' + index + '-3" type="radio" name="star" value="3"/>' +
        '        <label class="star star-3" for="star-' + index + '-3"></label>' +
        '        <input class="star star-2" id="star-' + index + '-2" type="radio" name="star" value="2"/>' +
        '        <label class="star star-2" for="star-' + index + '-2"></label>' +
        '        <input class="star star-1" id="star-' + index + '-1" type="radio" name="star"  value="1"/>' +
        '        <label class="star star-1" for="star-' + index + '-1"></label>' +
        '</div>';
}
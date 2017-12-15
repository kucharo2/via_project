var storage = {};
const PUB_TRACKER_API_URL = "https://salty-woodland-34826.herokuapp.com";
const LOGGED_USER_ID = "loggedUserId";
const LOGGED_USER_PHOTO_URL = "loggedUserPhotoUrl";
const VISITED_PLACES_RESULT = "visitedPlacesResult";

function createPlacesTable() {
    var $addPlaceModalContent = $("#addPlaceModalContent");
    var $ajaxIndicator = $addPlaceModalContent.parent().find(".modalAjaxIndicator");
    $ajaxIndicator.show();
    $addPlaceModalContent.text("");
    searchNearbyPlaces(function (nearbyPlaces) {
        if (nearbyPlaces.length > 0) {
            nearbyPlaces.sort(distanceComparator);
            var tableHtml = createAddPlaceTableHtml(nearbyPlaces);

            $addPlaceModalContent.html(tableHtml);

            $addPlaceModalContent.find("form").on("submit", submitAddPlaceForm)
        } else {
            $addPlaceModalContent.text("Cannot found any place near to you.");
        }
        $ajaxIndicator.hide();
    })
}

function submitAddPlaceForm(e) {
    var $this = $(this);
    var rating = $this.find("input[name='star']:checked:first").val();
    if (typeof rating === "undefined") {
        rating = 0;
    }
    var formData = {
        "placeId": $this.find("input[name='placeId']").val(),
        "comment": $this.find("textarea[name='comment']").val(),
        "stars": rating
    };
    makeCorsRequest("POST", "/user/" + storage.getItem(LOGGED_USER_ID) + "/addPlace", formData, function (user) {
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

function showVisitedPlacesByFriends() {
    getFbFriends(function (response) {
        if (response.data.length > 0) {
            var friendFbIds = [storage.getItem(LOGGED_USER_ID)];
            response.data.forEach(function (friend) {
                friendFbIds.push(friend.id);
            });
            makeCorsRequest("POST", "/friends/visited", friendFbIds, function (result) {
                var resultToStorage = {};
                result.forEach(function (place) {
                    // place is one result of mapReduce, so it holds all friends that was in this place and their comments
                    resultToStorage[place._id] = place.value;
                    placeDetail(place._id, function (placeDetail) {
                        createMarker(placeDetail, function () {
                            return createPlaceDetailInfoWindowContent(placeDetail, place.value);
                        });
                    });
                });
                storage.setItem(VISITED_PLACES_RESULT, JSON.stringify(resultToStorage));
            });
        }
    });
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

    showVisitedPlacesByFriends();
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

        $loggedUser.html("<span>" + response.name + "</span>" + " <img id='profilePicture' src='" + response.picture.data.url + "'/>");
        $loggedUser.show();

        storage.setItem(LOGGED_USER_ID, response.id);
        storage.setItem(LOGGED_USER_PHOTO_URL, response.picture.data.url);

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

function showPlaceReviewModal(placeId, placeName) {
    var placeReview = JSON.parse(storage.getItem(VISITED_PLACES_RESULT))[placeId];
    var $placeReviewModal = $("#placeReview").modal('show');
    $placeReviewModal.find(".modalAjaxIndicator").show();
    $placeReviewModal.find("#placeReviewTitle").text(placeName);
    getFbFriends(function (friendsResult)  {
        var friendsPhotoUrl = {};
        var myId = storage.getItem(LOGGED_USER_ID);

        friendsResult.data.forEach(function (friend) {
           friendsPhotoUrl[friend.id] = friend.picture.data.url;
        });

        var tableHtml = "";
        var friendsIds = Object.keys(placeReview.friends);
        var myReview = placeReview.friends[myId];
        if (typeof myReview !== "undefined") {
            tableHtml += renderUserComment(myReview, storage.getItem(LOGGED_USER_PHOTO_URL));
            friendsIds.splice(friendsIds.indexOf(myId), 1);
        }

        friendsIds.forEach(function (key) {
            var friend = placeReview.friends[key];
            tableHtml += renderUserComment(friend, friendsPhotoUrl[key]);
        });

        $placeReviewModal.find("#placeReviewContent").html(tableHtml);
        $placeReviewModal.find(".modalAjaxIndicator").hide();
    });

}

function createAddPlaceTableHtml(nearbyPlaces) {
    var tableHtml = '<table class="table">' +
        '    <tbody>';
    for (var i = 0; i < nearbyPlaces.length; i++) {
        var place = nearbyPlaces[i];

        tableHtml += '<tr onclick="showAddPlaceForm(' + i + ')">';
        tableHtml += '<td>' + getPlacePhoto(place) + '</td>';
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

function getPlacePhoto(placeDetail) {
    if (typeof placeDetail.photos === "undefined") {
        return '<img src="' + placeDetail.icon + '" alt="' + placeDetail.name + '"/>';
    } else {
        return '<img src="' + placeDetail.photos[0].getUrl({
                'maxWidth': 150,
                'maxHeight': 150
            }) + '" alt="' + placeDetail.name + '" alt="' + placeDetail.name + '"/>';
    }
}

function createPlaceDetailInfoWindowContent(placeDetail, placeReview) {
    var visitorsText = "";
    var myId = storage.getItem(LOGGED_USER_ID);

    var friendsIds = Object.keys(placeReview.friends);
    if (placeReview.friends[myId]) {
        visitorsText += "You";
        if(Object.keys(placeReview.friends).length > 1) {
            visitorsText += ",";
        }
        visitorsText += " ";
        friendsIds.splice(friendsIds.indexOf(myId), 1);
    }

    for (var i = 0; i < 3; ++i) {
        if (friendsIds.length > i) {
            visitorsText += placeReview.friends[friendsIds[i]].name;
            if (i > 2 && i < friendsIds.length) {
                visitorsText += ",";
            }
            visitorsText += " ";
        }
    }
    if (friendsIds.length > 3) {
        visitorsText += "and " + friendsIds.length - 3 + " more ";
    }
    visitorsText +=  "were here.";
    return '<h5>' + placeDetail.name + '</h5>' +
        '<div class="infoWindowContent">' +
        '   <div>' + getPlacePhoto(placeDetail) + '</div>' +
        '   <div>' +
                renderRating(placeReview.rating) + '</br>' +
        '       ' + placeDetail.adr_address + '</br></br>' +
                    visitorsText + '</br></br>' +
        // '           <a href="#" onclick="showPlaceReviewModal(\'' + placeDetail.place_id  + '\')">See review >></a>' +
        '           <a href="#" onclick="showPlaceReviewModal(\'' + placeDetail.place_id + '\', \'' + placeDetail.name + '\')">See review >></a>' +
        '       ' +
        '   </div>' +
        '</div>';
}

function renderRating(rating) {
    var fullStarsNumber = parseInt(rating);
    var halfStar = Math.round(rating) !== fullStarsNumber;
    var html = '';
    for (var i = 0; i < 5; i++) {
        if (i < fullStarsNumber) {
            html += '<span class="star star-full"></span>';
        } else if (i == fullStarsNumber && halfStar) {
            html += '<span class="star star-half"></span>';
        } else {
            html += '<span class="star star-empty"></span>';
        }
    }
    return html;
}

function renderUserComment(friend, photoUrl) {
    var commentList = "";
    var overallRating = 0;
    friend.reviews.forEach(function (review) {
        commentList += '<li>' + review.comment + '</li>';
        overallRating += parseInt(review.stars);
    });
    var tableHtml = '' +
        '<div class="friendHeader">' +
        '   <div><img src="' + photoUrl + '" alt="' + friend.name + '"/></div>' +
        '   <div><span class="friendName"><strong>' + friend.name + '</strong></span></br>' + renderRating(overallRating / friend.reviews.length) + '</div>' +
        '</div>' +
        '<div>' +
        '   <ul>' +
        commentList +
        '   </ul>' +
        '</div>';
    return tableHtml;
}
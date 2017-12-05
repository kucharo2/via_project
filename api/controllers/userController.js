'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.getUserByFbId = function (req, res) {
    User.find({"fbId": req.params.fbId}, function (err, user) {
        if (err)
            res.send(err);
        res.json(user);
    });
};

exports.createUser = function (req, res) {
    var newUser = new User(req.body);
    newUser.save(function (err, user) {
        if (err)
            res.send(err);
        res.json(user);
    })
};

exports.addVisitedPlace = function (req, res) {
    User.findOneAndUpdate(
        {fbId: req.params.fbId},
        {$push: {"visitedPlaces": req.body}},
        {safe: true, upsert: true},
        function (err, user) {
            if (err)
                res.send(err);
            res.json(user);
        }
    );
};

exports.getVisitedPlaceByFriends = function (req, res) {
    User.mapReduce({
        query: {fbId: {$in: [req.body]}},
        map: function () {
            // this should equals the actual selected user
            var user = this;
            user.visitedPlaces.forEach(function (place) {
                emit(palce.placeId, {
                    userName: user.name,
                    stars: place.stars,
                    comment: place.comment})
            });
        },
        reduce: function (placeId, values) {
            var friends = {};
            var rating = 0;
            values.forEach(function (value) {
                if (typeof friends[value.userName] === "undefined") {
                    friends[value.userName] = [];
                }
                friends[value.userName].push({stars: value.stars, comment: value.comment});
                rating += value.stars;
            });
            return {
                placeId: placeId,
                friends: friends,
                rating: rating/values.length
            }
        }
    }, function (err, results) {
        if (err)
            res.send(err);
        res.json(results);
    }).then(function (docs) {
        console.log(docs);
    }).then(null, function(err) { console.log(err)}).end();
};
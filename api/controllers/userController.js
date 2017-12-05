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
    var o = {};
    o.map = function () {
        // this should equals the actual selected user
        var user = this;
        user.visitedPlaces.forEach(function (place) {
            console.log("mapping place");
            emit(place.placeId, {
                userName: user.name,
                stars: place.stars,
                comment: place.comment})
        });
    };
    o.reduce = function (placeId, values) {
        var friends = {};
        var rating = 0;
        console.log("reducing place");
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
    };

    o.out = { replace: 'createdCollectionNameForResults' }
    o.verbose = true;
    User.mapReduce(o, function (err, model, stats) {
        console.log('map reduce took %d ms', stats.processtime);
        if (err)
            res.send(err);
        res.json(model);
    });
};
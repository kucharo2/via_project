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
    var configuration = {};
    configuration.query = {fbId : {$in : req.body}};
    configuration.map = function () {
        // this should equals the actual selected user
        var user = this;
        user.visitedPlaces.forEach(function (place) {
            var friends = {};
            friends[user.fbId] = {name: user.name, reviews: [{stars: place.stars, comment: place.comment}]};
            emit(place.placeId, {
                friends: friends,
                rating: place.stars
            });
        });
    };
    configuration.reduce = function (placeId, values) {
        var friends = {};
        var rating = 0;
        values.forEach(function (value) {
            var valueFriend = value.friends;
            var userFbId = Object.keys(value.friends)[0];
            if (typeof friends[userFbId] === "undefined") {
                friends[userFbId] = {name: valueFriend[userFbId].name, reviews: []};
            }
            friends[userFbId].reviews.push(valueFriend[userFbId].reviews[0]);
            rating += parseInt(value.rating);
        });
        return {
            friends: friends,
            rating: rating/values.length

        }
    };
    // configuration.out = {inline: 1};

    User.mapReduce(configuration, function (err, model) {
        if (err)
            res.send(err);
        res.json(model);
    });
};
'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.getUserByFbId = function(req, res) {
    User.find({"fbId": req.params.fbId}, function(err, user) {
        if (err)
            res.send(err);
        res.json(user);
    });
};

exports.createUser = function(req, res) {
    var newUser = new User(req.body);
    newUser.save(function(err, user) {
        if (err)
            res.send(err);
        res.json(user);
    })
};

exports.addVisitedPlace = function(req, res) {
    User.findByIdAndUpdate(
        {fbId : req.params.fbId},
        {$push: {"visitedPlaces": req.body}},
        {safe: true, upsert: true},
        function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        }
    );
};
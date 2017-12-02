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
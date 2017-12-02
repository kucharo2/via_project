'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    fbId: {
        type: String,
        required: "Only users logged by FB can use this application. Please add fbId."
    },
    name: {
        type: String,
        required: "Name of the user is required."
    },
    email: {
        type: String,
        required: "User email is required."
    },
    visitedPlaces: {
        type: Array
    }
});

module.exports = mongoose.model("User", UserSchema);
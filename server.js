var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');

//mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://advisor:needToDrink@ds237445.mlab.com:37445/pubtracker');

var User = require("./api/models/userModel");
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var routes = require('./api/routes/pubTrackerRoutes');
routes(app);

app.listen(port);

console.log("todo list RESTful API server started on"  + port);

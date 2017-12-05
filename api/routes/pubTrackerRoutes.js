'use strict';
module.exports = function (app) {
    var userController = require('../controllers/userController');

    // prepare headers for cross side requests.
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, X-Codingpedia");
        res.header("Content-Type", "application/json; charset=UTF-8");
        next();
    });

    app.route("/user/:fbId")
        .get(userController.getUserByFbId);

    app.route("/user")
        .post(userController.createUser);

    app.route("/user/:fbId/addPlace")
        .post(userController.addVisitedPlace);

    app.route("/friends/visited")
        .post(userController.getVisitedPlaceByFriends);

    app.route("")
        .get(function(req, res) {
            var data = "<h1>Pub tracker API</h1></br><p>Find more information at <a href='https://github.com/kucharo2/via_project'>project repository</a>.</p>";
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            res.write(data);
        })
};
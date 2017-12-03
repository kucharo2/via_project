'use strict';
module.exports = function (app) {
    var userController = require('../controllers/userController');

    // prepare headers for cross side requests.
    app.use(function(req, res, next) {
        console.log('Something is happening.');
        res.header("Access-Control-Allow-Origin", "https://kucharo2.github.io/via_project/");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, X-Codingpedia");
        res.header("Content-Type", "application/json; charset=UTF-8");
        next();
    });

    app.route("/user/:fbId")
        .get(userController.getUserByFbId);

    /**
     * @PUT create new user
     */
    app.route("/user")
        .post(userController.createUser);

    app.route("")
        .get(function(req, res) {
            var data = "<h1>Pub tracker API</h1></br><p>Find more information at <a href='https://github.com/kucharo2/via_project'>project repository</a>.</p>";
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            res.write(data);
        })
};
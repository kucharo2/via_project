'use strict';
module.exports = function (app) {
    var userController = require('../controllers/userController');


    app.route("/user/:fbId")
        .get(userController.getUserByFbId);

    /**
     * @PUT create new user
     */
    app.route("/user")
        .put(userController.createUser);

    app.route("")
        .get(function(req, res) {
            var data = "<h1>Pub tracker API</h1></br><p>Find more information at <a href='https://github.com/kucharo2/via_project'>project repository</a>.</p>";
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            res.write(data);
        })
};
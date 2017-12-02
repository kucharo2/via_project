'use strict';
module.exports = function (app) {
    var todoList = require('../controllers/todoListController');

    //todoList Routes
    app.route("/task")
        .get(todoList.list_all_tasks)
        .post(todoList.create_a_task);

    app.route("/task/:taskId")
        .get(todoList.read_a_task)
        .put(todoList.update_a_task)
        .delete(todoList.delete_a_task);

    app.route("")
        .get(function(req, res) {
            var data = "<h1>Pub tracker API</h1></br><p>Find more information at <a href='https://github.com/kucharo2/via_project'>project repository</a>.</p>";
            res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
            res.write(data);
        })
};
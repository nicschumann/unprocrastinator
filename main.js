
var express = require("express");
var db = require("./queries/queries.js");
var app = express();

var steven = {
    "email": "steven@fake.com",
    "password": "123",
    "username": "Steven"
};

var allie = {
    "email": "allie@fake.com",
    "password": "123",
    "username": "allie"
};

var eat_fries = {
    "name": "Eat fries",
    "progress": 0,
    "due_date": new Date().getTime(),
    "start_date": new Date().getTime(),
    "hours": 0,
    "notes": "I love fries!!!",
    "tags": ["junk", "delicious", "very yellow"],
    "category": "food"
};

var eat_apples = {
    "name": "Eat apples",
    "progress": 0,
    "due_date": new Date().getTime(),
    "start_date": new Date().getTime(),
    "tags": ["healthy", "delicious"],
    "category": "food"
};

var eat_bananas = {
    "name": "Eat bananas",
    "progress": 0,
    "due_date": new Date().getTime(),
    "tags": ["healthy", "very yellow"],
    "category": "food"
};

app.get('/', function(request, response) {
    // response.render("dbtest_login.html");
    // response.end();
});

app.get('/create_users', function(request, response) {
    db.add_user(steven, function (error, user_id) {
        if (!error) {
            db.add_user(allie);
        }
    });
    response.end();
});

app.get('/allie', function(request, response) {
    db.log_in(allie, function (error, user_id) {
        if (!error) {
            // db.get_user_tasks(user_id, function (error, tasks) {
            //     if (!error) {
            //         console.log(tasks);
            //     }
            // });

            db.get_task_by_tags(user_id, ["very yellow", "healthy"], function (error, tasks) {
                if (!error) {
                    console.log(tasks);
                }
            });
        }
    });
    response.end();
});

app.get('/add_tasks', function(request, response) {
    db.log_in(steven, function (error, user_id) {
        db.add_task_to_user(user_id, eat_fries, function (error, task_id) {
            console.log("done");
        });
    });

    response.end();
});

app.get('/steven', function(request, response) {
    db.log_in(steven, function (error, user_id) {
        if (!error) {
            db.get_user_tasks(user_id, function (error, tasks) {
                if (!error) {
                    console.log(tasks);
                }
            });
        }
    });
    response.end();
});

app.get('/delete_users', function(request, response) {
    db.log_in(steven, function (error, user_id) {
        if (!error) {
            db.delete_user(user_id, steven);

            db.log_in(allie, function (error, user_id) {
                if (!error) {
                    db.delete_user(user_id, allie);
                }
            });
        }
    });
    response.end();
});

app.listen(8080);

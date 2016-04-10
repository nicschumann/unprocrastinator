"use strict";

var options 	= require('./config.json');
var router 		= require('./router')( options );

router();

//ZC's code starts here
var express = require("express");
var db = require("./queries/queries.js");
var app = express();

app.get('/', function(request, response) {

    var david = {
        "username": "David",
        "password": "123"
    };

    var lose_weight = {"name": "Loose Weight", "category": false};
    var gain_weight = {"name": "Gain Weight", "category": false};
    var food = {"name": "Food", "category": true};

    db.add_tag(lose_weight, function(lose_weight_id) {
        db.add_tag(gain_weight, function(gain_weight_id) {
            db.add_tag(food, function(food_id) {
                var eat = {
                    "name": "eat whole wheat animal biscuit",
                    "category": food_id,
                    "progress": 0,
                    "tags": [lose_weight_id, gain_weight_id]
                };
                db.add_user(david, function(david_id) {
                    db.add_task_to_user(david_id, eat, function(eat_id) {
                        db.patch_user(david_id, {"username": "Divad", "password": "321"}, function(user) {
                            db.patch_task(eat_id, {"name": "Keep eating!", "progress": 95});
                            // db.remove_task_from_user(david_id, eat_id);
                        });
                    });
                });
            });
        });
    });

    response.end();
});

app.listen(8080);


var firebase = require("firebase");
var root = new Firebase("dazzling-heat-1685.firebaseio.com/");
var users = root.child("users");
var tasks = root.child("tasks");
var tags = root.child("tags");

exports.add_user = function(user, callback) {
    var user_ref = users.push({
        "username": user.username,
        "password": user.password
    });
    if (callback) { callback(user_ref.key()); }
};

exports.get_user = function(user_id, callback) {
    users.child(user_id).once("value", function(snapshot) {
        var user = snapshot.val();
        if (callback) { callback(user); }
    });
};

exports.patch_user = function(user_id, user_object, callback) {
    users.child(user_id).update(user_object);
    exports.get_user(user_id, callback);
};

exports.delete_user = function(user_id, callback) {
    users.child(user_id).remove();
    if (callback) { callback(); }
};

exports.add_task_to_user = function(user_id, task, callback) {
    task_ref = tasks.push({
        "name": task.name,
        "category": task.category,
        "progress": task.progress
    });
    task_id = task_ref.key();
    task.tags.forEach(function(tag_id) {
        tasks.child(task_id).child("tags").push(tag_id);
        users.child(user_id).child("tags").push(tag_id);
    });
    users.child(user_id).child("tasks").push(task_id);
    if (callback) { callback(task_id); }
};

exports.patch_task = function(task_id, task_object) {
    tasks.child(task_id).update(task_object);
};

exports.remove_task_from_user = function(user_id, task_id, callback) {
    tasks.child(task_id).child("tags").once("value", function(snapshot) {
        snapshot.forEach(function(tag) {
            users.child(user_id).child("tags").orderByValue().equalTo(tag.val()).ref().remove();
        });
    });
    tasks.child(task_id).remove();
    users.child(user_id).child("tasks").orderByValue().equalTo(task_id).ref().remove();
};

exports.add_tag = function(tag, callback) {
    // var tag_id;
    // tags.orderByChild("name").equalTo(tag.name).once("value", function(snapshot) {
    //     if (snapshot.exists()) {
    //         tag_id = Object.keys(snapshot.val())[0];
    //     } else {
    //         var tag_ref = tags.push({
    //             "name": tag.name,
    //             "category": tag.category
    //         });
    //         tag_id = tag_ref.key();
    //     }
    //     if (callback) { callback(tag_id); }
    // });

    var tag_ref = tags.push({
        "name": tag.name,
        "category": tag.category
    });
    if (callback) { callback(tag_ref.key()); }

};

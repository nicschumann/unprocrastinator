var firebase = require("firebase");

var root = new Firebase("https://unprocrastinatordb.firebaseio.com");
var users = root.child("users");
var tasks = root.child("tasks");

// User

exports.add_user = function (user, callback) {
    root.createUser(user, function (error, userData) {
        if (error) {
            console.log("Error creating user: ", error);
            if (callback) { callback(error); }
        } else {
            var user_id = userData.uid;
            root.authWithPassword(user, function (error, authData) {
                if (error) {
                    console.log("Error creating user: ", error);
                    if (callback) { callback(error); }
                } else {
                    users.child(authData.uid).set({
                        email: authData.password.email,
                        username: user.username
                    });
                    console.log("Successfully created user acoount with uid: ", user_id);
                    if (callback) { callback(null, user_id); }
                }
                // root.unauth();
            });
        }
    });
};

exports.log_in = function (user, callback) {
    root.authWithPassword(user, function (error, authData) {
        if (error) {
            console.log("Login Failed!", error);
            if (callback) { callback(error); }
        } else {
            console.log(user.email + " has logged in");
            if (callback) { callback(null, authData.uid); }
        }
    });
};

exports.log_out = function (callback) {
    console.log("User logged out.");
    root.unauth();
    if (callback) { callback(); }
};

exports.delete_user = function (user_id, user, callback) {
    users.child(user_id).child("tasks").once("value", function (snapshot) {
        snapshot.forEach(function (task_id) {
            tasks.child(task_id.val()).remove(function (error) {
                if (error) {
                    console.log("Error when deleting user tasks before deleting user: ", error);
                    if (callback) { callback(error); }
                } else {
                    console.log("Deleted user tasks");
                }
            });
        });
        users.child(user_id).remove(function (error) {
            if (error) {
                console.log("Error removing user: ", error);
                if (callback) { callback(error); }
            } else {
                root.removeUser(user, function (error) {
                    if (error) {
                        console.log("Error removing user:", error);
                        if (callback) { callback(error); }
                    } else {
                        console.log("User removed successfully");
                        if (callback) { callback(null); }
                    }
                });
            }
        });
    }, function (error) {
        console.log("Error when deleting user tasks before deleting user: ", error);
        if (callback) { callback(error); }
    });
};

exports.get_user = function (user_id, callback) {
    users.child(user_id).once("value", function(snapshot) {
        var user = snapshot.val();
        console.log("Successfully got user.");
        if (callback) { callback(null, user); }
    }, function (error) {
        console.log("Error getting user: ", error);
        if (callback) { callback(error); }
    });
};

exports.change_email = function (old_email, new_email, password, callback) {
    root.changeEmail({
        oldEmail: old_email,
        newEmail: new_email,
        password: password
    }, function (error) {
        if (error) {
            console.log("Error changing email: ", error);
            if (callback) { callback(error); }
        } else {
            console.log("Email changed successfully.");
            if (callback) { callback(null); }
        }
    });
};

exports.change_password = function (email, old_password, new_password, callback) {
    root.changePassword({
        email: email,
        oldPassword: old_password,
        newPassword: new_password
    }, function (error) {
        if (error) {
            console.log("Error changing password: ", error);
            if (callback) { callback(error); }
        } else {
            console.log("Password changed successfully.");
            if (callback) { callback(null); }
        }
    });
};

exports.patch_user = function (user_id, user, callback) {
    users.child(user_id).update(user, function (error) {
        if (error) {
            console.log("Error when patching user: ", error);
            if (callback) { callback(error); }
        } else {
            console.log("Successfully patched user");
            if (callback) { callback(null); }
        }
    });
};

// Task

exports.add_task_to_user = function (user_id, task, callback) {
    task.user = user_id;
    var task_ref = tasks.push(task, function (error) {
        if (error) {
            console.log("Error adding task to user.");
            if (callback) { callback(error); }
        } else {
            var task_id = task_ref.key();
            users.child(user_id).child("tasks").push(task_id, function (error) {
                if (error) {
                    console.log("Error adding task.");
                    if (callback) { callback(error); }
                } else {
                    console.log("Successfully added task.");
                    if (callback) { callback(null, task_ref.key()); }
                }
            });
        }
    });
};

exports.patch_task_for_user = function (task_id, task_object, callback) {
    tasks.child(task_id).update(task_object, function (error) {
        if (error) {
            console.log("Error patching task.");
            if (callback) { callback(error); }
        } else {
            console.log("Successfully patched task.");
            if (callback) { callback(null); }
        }
    });
};

exports.remove_task_from_user = function (user_id, task_id, callback) {
    tasks.child(task_id).remove(function (error) {
        if (error) {
            console.log("Error removing task.");
            if (callback) { callback(error); }
        } else {
            users.child(user_id).child("tasks").orderByValue().equalTo(task_id)
                .ref().remove(function (error) {
                    if (error) {
                        console.log("Error removing task from user.");
                        if (callback) { callback(error); }
                    } else {
                        if (callback) { callback(null); }
                        console.log("Successfully removed task.");
                    }
                });
        }
    });

};

exports.get_user_tags = function (user_id, callback) {
    tasks.orderByChild("user").equalTo(user_id).once("value", function (snapshot) {
        var tags = new Set();
        snapshot.forEach(function (tasks_snap) {
            tasks_snap.val().tags.forEach(function (tag) {
                tags.add(tag);
            });
        });
        console.log("Successfully got user tags.");
        if (callback) { callback(null, tags); }
    }, function (error) {
        console.log("Error when listing user tags: ", error);
        if (callback) { callback(error); }
    });
};

exports.get_user_tasks = function (user_id, callback) {
    tasks.orderByChild("user").equalTo(user_id).once("value", function (snapshot) {
        // var user_tasks = [];
        // snapshot.forEach(function (task_snapshot) {
        //     user_tasks.push(task_snapshot.val());
        // });
        if (callback) { callback(null, snapshot.val()); }
        console.log("Successfully got user tasks.");
    }, function (error) {
            console.log("Error getting user tasks: ", error);
            if (callback) { callback(error); }
    });
};

exports.get_task_by_category = function (user_id, category, callback) {
    tasks.orderByChild("user").equalTo(user_id).once("value", function (snapshot) {

        var filtered_tasks = [];
        snapshot.forEach(function (task_snapshot) {
            var task = task_snapshot.val();
            if (task.category == category) {
                filtered_tasks.push(task);
            }
        });
        console.log("Successfully filtered by category.");
        if (callback) { callback(null, filtered_tasks); }
    }, function (error) {
            console.log("Error filtering by category: ", error);
            if (callback) { callback(error); }
        }
    );
};

exports.get_task_by_tags = function (user_id, tags, callback) {
    tasks.orderByChild("user").equalTo(user_id).once("value", function (snapshot) {
        var filtered_tasks = [];
        snapshot.forEach(function (task_snapshot) {
            var task = task_snapshot.val();
            if (tags.every(function (tag) { return task.tags.indexOf(tag) >= 0; })) {
                filtered_tasks.push(task);
            }
        });
        if (callback) { callback(null, filtered_tasks); }
        console.log("Successfully filtered by tags.");
    }, function (error) {
            console.log("Error filtering by tags: ", error);
            if (callback) { callback(error); }
        }
    );
};

var db = require('../queries/queries.js');

var uid;
var err;
var taskid;
var taskTwoId;

var username = randomString(10);
var email = randomEmail();
var password = randomString(5);

var testUser = {
  "username" : username,
  "email" : email,
  "password" : password
}

var testUserObject;

var category = randomString(5);
var category2 = randomString(5);
var tag1 = randomString(4);
var tag2 = randomString(3);
var tag3 = randomString(2);
var fakeTag = randomString(5);

var testTask = {
  "name" : randomString(10),
  "progress" : 0,
  "due_date" : new Date().getTime(),
  "tags" : [tag1, tag2, fakeTag],
  "category" : category
}

var testTaskTakeTwo = {
  "name" : randomString(10),
  "progress" : 0,
  "due_date" : new Date().getTime(),
  "tags" : [tag1, tag2, fakeTag],
  "category" : category2
}

exports.create_account_test = function(test) {
  test.expect(2);

  console.log(email);

  db.add_user(testUser, function (error, user_id) {
    err = error;
    uid = user_id;
    test.ok(!err, "this shouldn't throw an error");
    test.ok(uid, "and user_id should now exist");
    test.done();
  });
}

exports.log_in_test = function(test) {
  test.expect(2);
  db.log_in(testUser, function (error, user_id) {
    err = error;
    uid = user_id;
    test.ok(!err, "this shouldn't throw an error");
    test.ok(uid, "and user_id should now exist");
    test.done();
  });
}

exports.get_user_test = function(test) {
  test.expect(2);
  db.get_user(uid, function (error, user) {
    err = error;
    testUserObject = user;
    test.ok(!err, "this shouldn't throw an error");
    test.ok(uid, "and user should now exist");
    test.done();
  })
}

exports.change_email_test = function(test) {
  test.expect(1);
  var newEmail = randomEmail();
  db.change_email(email, newEmail, password, function (error) {
    err = error;
    test.ok(!err, "this shouldn't throw an error");
    email = newEmail;
    testUser = {
      "username" : username,
      "email" : email,
      "password" : password
    }
    test.done();
  })
}

exports.change_password_test = function(test) {
  test.expect(1);
  var newPassword = randomString(10);
  db.change_password(email, password, newPassword, function (error) {
    err = error;
    test.ok(!err, "this shouldn't throw an error");
    password = newPassword;
    testUser = {
      "username" : username,
      "email" : email,
      "password" : password
    }
    test.done();
  })
}

exports.patch_user_test = function(test) {
  test.expect(1);
  username = randomString(10);
  testUser = {
    "username" : username,
    "email" : email,
    "password" : password
  }
  db.patch_user(uid, testUser, function (error) {
    err = error;
    test.ok(!err, "this shouldn't throw an error");
    test.done();
  })
}

exports.add_task_to_user_test = function(test) {
  test.expect(2);
  db.add_task_to_user(uid, testTask, function (error, task_id){
    err = error;
    test.ok(!err, "this shouldn't throw an error");
    taskid = task_id;
    test.ok(task_id, "taskid should exist now");
    test.done();
  });
}

exports.patch_task_for_user_test = function(test) {
  test.expect(1);
  var taskPatch = {
    "tags" : [tag1, tag2, tag3]
  }
  testTask.tags = [tag1, tag2, tag3];
  db.patch_task_for_user(taskid, taskPatch, function (error){
    test.ok(!err, "this shouldn't throw an error");
    test.done();
  });
}

exports.remove_task_from_user_test = function(test) {
  test.expect(1);
  db.add_task_to_user(uid, testTaskTakeTwo, function (error, task_id) {
    taskTwoId = task_id;
    db.remove_task_from_user(uid, taskTwoId, function (error) {
      err = error;
      test.ok(!err, "this shouldn't throw an error");
      test.done();
    });
  });
}

exports.get_user_tags_test = function(test) {
  test.expect(5);
  db.get_user_tags(uid, function (error, tags) {
    test.ok(!err, "this shouldn't throw an error");
    test.ok(tags.has(tag1), "tag1 in tags");
    test.ok(tags.has(tag2), "tag2 in tags");
    test.ok(tags.has(tag3), "tag3 in tags");
    test.ok(!tags.has(fakeTag), "tag3 in tags");
    test.done();
  });
}

exports.get_user_tasks_test = function(test) {
  test.expect(8);
  db.get_user_tasks(uid, function (error, tasks) {
    test.ok(!err, "this shouldn't throw an error");

    var yesTask = tasks[taskid];
    var noTask = tasks[taskTwoId];

    test.ok(yesTask, "testTask in tasks");
    test.ok(!noTask, "testTask in tasks");

    test.ok(yesTask.name === testTask.name, "tasks are the same");
    test.ok(yesTask.category === testTask.category, "tasks are the same");
    test.ok(yesTask.progress === testTask.progress, "tasks are the same");
    test.ok(yesTask.due_date === testTask.due_date, "tasks are the same");
    test.ok(yesTask.user === testTask.user, "tasks are the same");

    test.done();
  });
}

exports.get_task_by_category_test = function(test) {
  test.expect(2);
  db.add_task_to_user(uid, testTaskTakeTwo);
  db.get_task_by_category(uid, category2, function (error, tasks) {
    test.ok(!err, "this shouldn't throw an error");
    test.ok(tasks[0].name === testTaskTakeTwo.name, "categorized task");
    test.done();
  });
}

exports.get_task_by_tags_test = function(test) {
  test.expect(2);  //several
  db.get_task_by_tags(uid, [tag1, fakeTag], function (error, tasks) {
    test.ok(!err, "this shouldn't throw an error");
    test.ok(tasks[0].name === testTaskTakeTwo.name, "tagged task");
    test.done();
  });
}

exports.delete_user_test = function(test) {
  test.expect(1);

  db.delete_user(uid, testUser, function (error) {
    err = error;
    test.ok(!err, "this shouldn't throw an error");
    test.done();
  });
}

exports.log_in_deleted_test = function(test) {
  test.expect(2);
  db.log_in(testUser, function (error, user_id) {
    err = error;
    uid = user_id;
    test.ok(err, "this should throw an error, bc we just deleted that user");
    test.ok(!uid, "and user_id should NOT exist");
    test.done();
  });
}

function randomString(length) {
  var str = "";
  var possible = "abcdefghijklmnopqrstuvwxyz";

  for( var i=0; i < length; i++ ) {
    str += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return str;
}

function randomEmail() {
  return randomString(4) + '@' + randomString(3) + '.' + randomString(3);
}


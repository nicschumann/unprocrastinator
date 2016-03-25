var exports = module.exports = {};
var token = null;
var uid = null;

// functions as a login, setting the token and id for the given session
// so that all other functions (add/edit task, etc.) work without needing
// separate authentication
exports.get_user = function(username, password, callback) {
  var encryptedPassword = encrypt(password);
  $.ajax('/authenticate/' + username, 
    {data: {password: encryptedPassword}},
    function(data) {
      //in the backend, server sets err if there's an error,
      //otherwise sets credential: uid & token
      if (data.err) {
        callback(data.err);
      } else {
        token = data.credential.token;
        uid = data.credential.user_id;
        callback();
      }
    }
  );
}

// similar to the above, sets the toke and id, this time creating a new
// user object in the backend rather than retrieving and verifying a
// pre-existing one
exports.add_user = function(username, password, callback) {
  var encryptedPassword = encrypt(password);
  $.ajax('/createUser/' + username, 
    {data: {password: encryptedPassword}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        token = data.credential.token;
        uid = data.credential.user_id;
        callback();
      }
    }
  );
}

// deletes the current user, so no need to pass userID in
exports.delete_user = function(callback) {
  $.ajax('/users/' + uid + '/delete', 
    {data: {userID: uid, accessToken: token}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        token = null;
        uid = null;
        callback(data.user);  // return the user object that's been deleted
      }
    }
  );
}

exports.get_tasks = function(callback) {
  $.get('/users/' + uid + '/tasks', 
    {data: {userID: uid, accessToken: token}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.tasks);  // return the set of tasks
      }
    }
  );
}

exports.get_task = function(taskID, callback) {
  $.get('/users/' + uid + '/tasks/' + taskID,
    {data: {userID: uid, accessToken: token}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.task);  // return the single task requested
      }
    }
  );
}

exports.get_tasks_by_tag = function(tagID, callback) {
  $.get('/users/' + uid + '/tags/' + tagID + '/tasks', 
    {data: {userID: uid, accessToken: token}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.tasks);  // return set of tasks with given tag
      }
    }
  );
}

exports.add_task = function(task, callback) {
  $.post('/users/' + uid + '/tasks/add', 
    {data: {userID: uid, accessToken: token, to_add: task}}, 
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.task.taskID);  // return task's id
      }
    }
  );
}

exports.delete_task = function(taskID, callback) {
  $.post('/users/' + uid + '/tasks/' + taskID + '/delete',
    {data: {userID: uid, accessToken: token}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.task);  // return the task object just deleted
      }
    }
  );
}

exports.edit_task = function(taskID, taskObject) {
  $.post('/users/' + uid + '/tasks/' + taskID + '/edit',
    {data: {userID: uid, accessToken: token, editedTask: taskObject}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.task);  // return the edited task object
      }
    }
  );
}

exports.add_tag_to_task = function(taskID, tag) {
  // did we decide that tasks know their tags, or the other way around, or both?
  $.post('/users/' + uid + '/tasks/' + taskID + '/tags/add', 
    {data: {userID: uid, accessToken: token, newTag: tag}},
    function(data) {
      if (data.err) {
        callback(data.err);
      } else {
        callback(data.tag.tagID);  // return the id of the added tag
      }
    }
  );
}

//TODO for password encryption later
function encrypt(text) {
  return text;
}
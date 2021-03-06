/********************************************
QUICK README:

The general flow of the index.html is as follows:

1. On page load, a full week of dates is populated by populateWeek, which...
    i) calls generateDayHTML 7 times.
    ii) loads "taskButton" so new tasks can be added by user

2. generateTodayOverview is called to load the rainbow progress bar at the top.
   currently, it uses fake numbers (hard coded %s that i made up) - needs to use DB data
   and ML algorithm stuff later

3. For now, "today" is loaded with a dummy task of "Eat lunch" for testing purposes by...
    i) simply calling appendTask.
        a. appendTask calls loadTask, which loads the interactive aspects (timer, progress, calendar, subtasks, notes)
           of a task

GENERAL NOTES
I don't recommend auto-indenting all, since the HTML templates are indented in a particular way
for readability, but its nbd if you don't read the HTML templates - you shouldn't need to anyway!

#TODO
I have tagged all things that need to be done soon with a #TODO tag. Please look for these and
pick out any you'd like to tackle!

ANY QUESTIONS?
Ask Jina about the front end code anytime!!! :)

********************************************/

var fadeOutTiming = 750;

var db = require('../../queries/queries.js');
var autosize = require('autosize');

var tag_search = require('./tag-search')( db, $ );

// Global date variables
var today = new Date();
    today.setHours(0,0,0,0);

var todayId = generateDateId(today);
var dateCounter = 0;

//Global task map for loading existing tasks
var taskMap = {};

function fadeOverlayOut() {
     $('#overlay').fadeOut( fadeOutTiming ); 
}

// Actions to happen on page load
$(document).ready(function(){
  if ($('.index-body')[0]) {

    if ( typeof sessionStorage.user_id === "undefined" || sessionStorage.user_id === null ) {
      window.location.href = '/login';
    }

    loadTaskMap();

    $("#monthName").text(getMonthOfYear(today));
    $('#jumpDate').val(todayId);

    // Load calendar jump datepicker
    $('.date').datepicker()
      .on('changeDate', function(e) {
        scrollJump($('.date').datepicker('getDate'));
      });

      // As user scrolls, loads 7 more days infinitely. 
      // #TODO - Currently has bugs according to screen/zoom size 
      // where screen has to be 100%
      $(window).scroll(function(){
        if ($(window).scrollTop() == $(document).height()-$(window).height()){ // doesnt work if zoom is not at 100%
          populateWeek(taskMap);
        }
        if ($(window).scrollTop() == 0){
          $("#monthName").text(getMonthOfYear(today));
        } else {
          // #monthBar changes from APRIL to MAY to JUNE, etc, as it scrolls through the days.
          var days = $(".day.row");

          for (var i = 0; i < days.length; i++) {
            if (collide( $("#monthBarWrap"), $("#" + days[i].id) )) {
              $("#monthName").text(getMonthByNum(days[i].id[0]));
            }
          }
        }
    });

    } else if ($('.landing-body')[0]) {

      // -----------------------------------------------------------

      /************************
          LANDING.HTML JS
      *************************/

      fadeOverlayOut();

      // Button and request handlers for landing.html
      $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus()
      })

      $('#createaccount').on('click', function(event) {
        event.preventDefault();
          var user = {
            "username": $("#newusername").val(),
              "email": $("#newemail").val(),
              "password": $("#newpassword").val(),
              "categories": []
          };
          db.add_user(user, function (error, user_id) {
              if (!error) {
                sessionStorage.user_id = user_id;
                  window.location.href = "/user";
              } else {
                  $('#errorModal').modal('show');
                  $('#modalErrorText').text( error.message );
              }
          });
      }); 

      $('#signin').on('click', function(event) {
        event.preventDefault();
        var user = {
          "email": $("#email").val(),
          "password": $("#password").val()
        };
        db.log_in(user, function (error, user_id) {
          if (!error) {
              sessionStorage.user_id = user_id;
              window.location.href = "/user";
          } else {
              $('#errorModal').modal('show');
              $('#modalErrorText').text( error.message );
          }
        }); 
      });

    } else if ($('.faq-body')[0]) {

      fadeOverlayOut();

    }
});

/*
    getDayOfWeek: A simple function that returns corresponding day-of-week abbreviations.
    @date - the Date object to retrieve the abbreviated day of week for.
*/
function getDayOfWeek(date) {
   return ["SUN","MON","TUE","WED","THU","FRI","SAT"][(date.getDay())];
}

function getMonthOfYear(date) {
  return ["January","February","March",
          "April","May","June","July",
          "August","September","October",
          "November","December"][(date.getMonth())];
}

function getMonthByNum(i) {
  return ["January","February","March",
          "April","May","June","July",
          "August","September","October",
          "November","December"][i - 1];
}

function scrollJump(date) {
  date.setDate(date.getDate() - 1);
  while ($("#" + generateDateId(date)).length == 0) {
    populateWeek(taskMap);
  }
  $.scrollTo($("#" + generateDateId(date)));
}

function collide(div1, div2) {
  var x1 = div1.offset().left;
  var y1 = div1.offset().top;
  var h1 = div1.outerHeight(true);
  var w1 = div1.outerWidth(true);
  var b1 = y1 + h1;
  var r1 = x1 + w1;
  var x2 = div2.offset().left;
  var y2 = div2.offset().top;
  var h2 = div2.outerHeight(true);
  var w2 = div2.outerWidth(true);
  var b2 = y2 + h2;
  var r2 = x2 + w2;

  if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
  return true;
}

function generateDateId(date) {
  var month = date.getMonth() + 1; // js is ridiculous.
  return month + "-" + date.getDate() + "-" + date.getFullYear();
}

function generateDateFromId(dateId) {
  var date = dateId.split('-');
  var month = date[0]-1; // js is ridiculous.
  var day = date[1];
  var year = date[2]
  return new Date(year, month, day, 0, 0, 0, 0);
}

function parseDate(dateValue) {
  var date = new Date(dateValue);
  var month = date.getMonth() + 1; // js is ridiculous.
  return month + "-" + date.getDate() + "-" + date.getFullYear();
}

function loadTaskMap() {
  db.get_user_tasks(sessionStorage.user_id, function (error, tasks) {
    if (!error) {
      for (var task_id in tasks) {
          if (tasks.hasOwnProperty(task_id)) {
            var task = tasks[task_id];

            if (task.complete && task.due_date < today.getTime()) {
              continue;
            }

            var taskDateId = parseDate(task.assigned_date);
          } else {
            console.log('ERROR: tasks are invalid')
          }

          if (taskMap[taskDateId]) {
            var existingTasks = taskMap[taskDateId];
            var updatedTasks = existingTasks.concat({task_id: task_id, task: task});
            delete taskMap[taskDateId];
            taskMap[taskDateId] = updatedTasks;
          } else {
            taskMap[taskDateId] = [{task_id: task_id, task: task}];
          }
      }

      var reassignTaskMap = {};
      for (var dateId in taskMap) {
        if (generateDateFromId(dateId).getTime() < today.getTime()) {
          reassignTaskMap[dateId] = taskMap[dateId];
          delete taskMap[dateId]
         };
      };

      checkReassignTasks(reassignTaskMap);
      populateWeek(taskMap);
      fadeOverlayOut();
    }
  });
}

function checkReassignTasks(reassignTaskMap) {
  for (var dateId in reassignTaskMap) {
    if (generateDateFromId(dateId).getTime() < today.getTime()) {
      for (var taskIndex in reassignTaskMap[dateId]) {
        var taskPair = reassignTaskMap[dateId][taskIndex];
        var reassignedTask = taskPair.task;

        // Removed this while merging JINA's Branch
        // db.patch_task_for_user( taskPair.task_id, reassignedTask, function(err, task) {
        //   appendTask(taskPair.task_id, reassignedTask);
        // })

        var taskPatch = {
          "assigned_date": today.getTime()
        }


        db.patch_task_for_user( taskPair.task_id, taskPatch );
        appendTask(taskPair.task_id, reassignedTask, true);

      }
    }
  }
}

/*
    generateDateTemplate: Generates the HTML template for a single day on the agenda list.
    @currDate - the Date object to generate the HTML for.
*/
function generateDayTemplate(currDate) {
  var currDateId = generateDateId(currDate);
  return '<div class="day row" id="' + currDateId + '">' + 
            '<div class="dates col-xs-1">' + 
              '<div class="row">' + 
                '<h2>' + currDate.getDate() + '<br>' + getDayOfWeek(currDate) + '</h2>' + 
              '</div>' + 
            '</div>' + 
            '<div class="day-info-box col-xs-11">' + 
              '<p>' + 
                '<div class="well" style="height: auto;overflow: auto;">' + 
                  '<ul class="tasks list-group checked-list-box">' +
                  '</ul>'+ 
                    '<div class="input-group" style="width:99%">' +
                      '<input type="text" class="form-control taskInput" placeholder="Category, Task name..." aria-describedby="basic-addon2">' +
                        '<span class="input-group-addon taskButton"> + </span>' +
                    '</div>'+
                '</div>' +
              '</p>' +
            '</div>';
}

/*
    Generates the Today Overview Bar.
*/
function generateTodayOverview() {
  return '<div id="todayOverview">' +
            '<div class="row">' +
              '<div class="col-xs-3">' +
                '<h4>Today\'s Overview:</h4>' +
              '</div>' +
              '<div class="col-xs-9">' +
                '<div class="progress" style="margin-top: 13px;">' +
                  '<div class="progress-bar progress-bar-success" style="width: 35%">' +
                    '<span class="sr-only">35% Complete (success)</span>' +
                  '</div>' +
                  '<div class="progress-bar progress-bar-warning progress-bar-striped" style="width: 20%">' +
                    '<span class="sr-only">20% Complete (warning)</span>' +
                  '</div>' +
                  '<div class="progress-bar progress-bar-danger" style="width: 10%">' +
                    '<span class="sr-only">10% Complete (danger)</span>' +
                  '</div>' +
                '</div>'+
              '</div>' +
            '</div>' +
          '</div>';
}

/*
  loadTodayOverview: loads and appends today overview progress bar.
*/
function loadTodayOverview() {
  $("#agendaList").append(generateTodayOverview());
}

/*
    populateWeek: Populates the next 7 days. Is called for use in the infinite scroll.
*/
function populateWeek(loadedTaskMap) {
  for (i = 0; i < 7; i++) {
    var currDate = new Date();
    currDate.setDate(today.getDate() + dateCounter);

    $("#agendaList").append(generateDayTemplate(currDate));

    var currDateId = generateDateId(currDate);

    if (loadedTaskMap[currDateId]) { 
      for (var taskIndex in loadedTaskMap[currDateId]) {
        var taskPair = loadedTaskMap[currDateId][taskIndex];
        appendTask(taskPair.task_id, taskPair.task, false);
      }
    }

    // Cursor for add button
    $('#' + currDateId + ' .taskButton').css("cursor", "pointer");

    // Event handlers for adding task (click and enter)
    $('#' + currDateId + ' .taskButton').click(function (e) {
      e.preventDefault();
      var dateId = $(this).parent().parent().parent().parent().attr('id');

      var input = $(this).prev().val();

      if (!input) {
        return;
      }

      var category = input.split(",")[0];
      var name = input.split(",")[1]

      if (/^\s*$/.test(name)) {
        return;
      }

      var tags = [category];
      var words = name.split(" ");

      for (word in words) {
        tags.push(words[word]);
      }
      /**
       * @modification nic
       * I'm changing the "add" logic so the category is added to the set of tags,
       * and the tags to be a collection – it should be an array of "tag" values, which
       * in this case are just strings.
       */

      var taskToAdd =  {
          "name": name,
          "hours": 0,
          "progress": 0,
          "complete": false,
          "assigned_date": generateDateFromId(dateId).getTime(),
          "due_date": generateDateFromId(dateId).getTime(),
          "tags": [category],
          "category": category,
          "subtasks": [],
          "notes": ""
      };

      db.add_task_to_user(sessionStorage.user_id, taskToAdd, function(error, taskId) {
        appendTask(taskId, taskToAdd, false);
      });

      $(this).prev().val('');
    });

   tag_search( $( "#" + currDateId + ' .taskInput'), {
    post: function( element ) {
      return function ( e ) {

          e.preventDefault();

          var dateId = element.parent().parent().parent().parent().attr('id');

          var input = element.val();

          if (!input) {
            return;
          }

          var category = input.split(", ")[0];
          var name = input.split(", ")[1];

          if (/^\s*$/.test(name)) {
            return;
          }

          var tags = [category];
          var words = name.split(" ");

          for (word in words) {
            tags.push(words[word]);
          }

          /**
           * Push categories as a string,
           * even though they are {name: category-name, color: "#xxxxxx"}
           * in the database
           *
           * @type {TaskObject}
           */
          var taskToAdd =  {
                "name": name,
                "hours": 0,
                "progress": 0,
                "complete": false,
                "assigned_date": generateDateFromId(dateId).getTime(),
                "due_date": generateDateFromId(dateId).getTime(),
                "tags": [category],
                "category": category,
                "subtasks": [],
                "notes": ""
            };

          db.add_task_to_user(sessionStorage.user_id, taskToAdd, function(error, taskId, task) {

            db.get_user_task( sessionStorage.user_id, taskId, function( err, task ) {

              appendTask(taskId, task, false);

            });

          });

          element.val('');
        };

    }
   });

    dateCounter++;
  }
}

/*
    appendTask: Appends a task to a date.
    @dateId - the date ID for the date to append this task to
    @taskName - the name of the task.
    #TODO Currently uses a "dummy" random int as a task ID. Connect DB to use the real task ID.
*/
function appendTask(taskId, task, isReassigned) {

  // Assign task category color
  db.get_user(sessionStorage.user_id, function (error, user) {
    var categoryColor;

    for (category in user.categories) {
      if (user.categories[category].name == task.category) {
        categoryColor = user.categories[category].color;
      }
    }


// Took out estimated time part:

  var taskDetailsDOM =
    '<div class="taskDetails">' +
          '<input type="text" class="form-control editName" placeholder="' + task.name + '" style="display: none;">' +
      '<h4 class="taskDetailsHeading">' + '<span style="color: '+ categoryColor +'" >' + task.category.toUpperCase() + '</span> ' + task.name +'</h4>' +


    '<button class="editButton" type="button">' +
        '<span id="editIcon" class="glyphicon glyphicon-edit" data-toggle="tooltip" title="Edit task name"></span>' +
      '</button>' + 
    '<button class="targetTimeButton" type="button">' +
        '<span class="targetTimeIcon glyphicon glyphicon-hourglass" data-toggle="tooltip" title="Estimated time to completion"></span>' +
      '</button>' + 
      '<div class="targetTimeWrapper"></div>' +

      '<p class="remainderTimeText" style="text-align: right"></p>' +
      '<p class="targetTimeText" style="text-align: right"></p>' +
      '<div class="progress">' +
        '<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width: ' + task.progress + '%">' +
        '</div>' +
      '</div>' +
      '<p class="progressText"></p>' +
      '<div class="taskIcons">' +
        '<span class="plusIcon glyphicon glyphicon-plus-sign" data-toggle="tooltip" title="Add progress"></span>' +
          '<div class="plusWrapper"></div>' +
        '<span class="timeIcon glyphicon glyphicon-time" data-toggle="tooltip" title="Progress timer"></span>' +
          '<div class="timerWrapper"></div>' +
        '<span class="calIcon glyphicon glyphicon-calendar" data-toggle="tooltip" title="Reschedule"></span>' +
          '<div class="dateWrapper" style="width: 50%; display: inline-block; vertical-align: middle;"></div>' +
        '<button class="trashButton" type="button">' +
          '<span id="trashIcon" class="glyphicon glyphicon-trash" data-toggle="tooltip" title="Delete task"></span>' +
        '</button>' +
      '</div><br>' +
      '<div class="tagsContainer">' +
        '<h5>Tags</h5>' +
        '<input name="tags" class="tags" value=""/>' +
        '</ul>' +
      '</div>' +
     '<h5>Subtasks</h5>' +
     '<div class="subtasks" style="height: auto;overflow: auto;">  ' +
          '<ul class="list-group checked-list-box"> ' +
          '</ul> ' +
            '<div class="input-group"> ' +
              '<input type="text" class="form-control subtaskInput" placeholder="Add a subtask..." aria-describedby="basic-addon2">' +
                '<span class="input-group-addon subtaskButton">+</span> ' +
            '</div>' +
        '</div> ' +

      '<div class="notes">' +
        '<h5>Notes</h5>' +
        '<textarea class="noteInput form-control" rows="1" placeholder="Write a note..." aria-describedby="sizing-addon1">'+ ((typeof task.notes !== "undefined") ? task.notes : "")  +'</textarea>' +
      '</div>' +
    '</div>';

  var due = new Date(task.due_date);
  var d = due.getDate();
  var m = due.getMonth() + 1;

  var taskDom;

  if (task.progress <= 100) {
      taskDOM = 
        '<li id="'+ taskId +'" class="task list-group-item" data-checked="false">' +
          '<input class="taskCheckbox" type="checkbox"/>' + '<span style="color: ' + categoryColor + '; font-weight="bolder">&#9679;</span> ' + '<span class="taskName">' + task.name + " [Due " + m + "/" + d + "] " + "<b>" + "<i><span class='progress-indicator'>" + task.progress + "%" + "</span></i>" + "</b>" + '</span>' + 
          taskDetailsDOM + 
        '</li>';
  } else {
      taskDOM = 
        '<li id="'+ taskId +'" class="task list-group-item" data-checked="false">' +
          '<input class="taskCheckbox" type="checkbox"/>' + '<span style="color: ' + categoryColor + '; font-weight="bolder">&#9679;</span> ' + '<span class="taskName">' + task.name + " [Due " + m + "/" + d + "] " + "<b>" + "<i><span class='progress-indicator'></span></i>" + "</b>" + '</span>' + 
          taskDetailsDOM + 
        '</li>';
  }


      $("#" + parseDate(task.assigned_date) + " .tasks").append(taskDOM);


      for (var tag in task.tags) {
         $('#' + taskId + ' .tags').addTag(task.tags[tag]);
      }

  if (task.due_date < today.getTime()) {
    $("#" + taskId).find(".taskName").css("color", "red");
  }

  $("#" + taskId).find(".noteInput").val(task.notes);

  //hover text init
  $('[data-toggle="tooltip"]').tooltip();

  // Display tags
  $('#' + taskId + ' .tags').tagsInput({
    'width': '100%',
    'height': 'auto',
    'onAddTag': addTagToDb,
    'onRemoveTag': removeTagFromDb
  });

      // Load subtasks
      for (var subtask in task.subtasks) {
        renderSubtask( taskId, task.subtasks, task.subtasks[subtask].name, task.subtasks[subtask].complete );
      }
      $('#' + taskId + ' .taskDetails').hide(); // Hide taskDetails until clicked.

  // Load estimated time
  renderEstimate(task.estimate, taskId);

  renderRemainder(task.estimate, task.hours, taskId);

      // CSS cursor for add subtask button
      $("#" + taskId + ' .subtaskButton').css("cursor", "pointer"); 

      // Event handlers for adding subtasks (click and enter key)
      $("#" + taskId + ' .subtaskButton').click(function (e) { 
        e.preventDefault();
        var taskId = $(this).parent().parent().parent().parent().attr('id');
        var subtaskName = $(this).prev().val();
        db.get_user_task(sessionStorage.user_id, taskId, function (error, task) {
          if (error) {
            console.log(error);
            return;
          }
          appendSubtask(taskId, task.subtasks, subtaskName);
          renderSubtask( taskId, task.subtasks, subtaskName, false );
          $("#" + taskId + ' .subtaskButton').prev().val('');
        })
      });

      $("#" + taskId + ' .subtaskInput').keypress(function (e) {
         var key = e.which;
         if (key == 13) { // the enter key code
          e.preventDefault();
          var taskId = $(this).parent().parent().parent().parent().attr('id');
          var subtaskName = $(this).val();
          db.get_user_task(sessionStorage.user_id, taskId, function (error, task) {
            if (error) {
              console.log(error);
              return;
            }
            appendSubtask(taskId, task.subtasks, subtaskName);
            renderSubtask( taskId, task.subtasks, subtaskName, false );
            $("#" + taskId + ' .subtaskButton').prev().val('');
          })
        }
      });

      $("#" + taskId + ' .editName').keypress(function (e) {
        var key = e.which;
        if (key == 13) { // the enter key code
          e.preventDefault();
          var taskId = $(this).parent().parent().attr('id');
          var name = $(this).val();

          var taskPatch =  {
            "name": name,
          };

          db.patch_task_for_user(taskId, taskPatch, function(error) {
            $('#' + taskId).remove();
            db.get_user_task(sessionStorage.user_id, taskId, function (error, task) {
              appendTask(taskId, task, false);
            });
          });
        }
      });   

      // Call loadTask to load the interactive features of a task (toggle, details, etc.)
      loadTask(taskId, task);
      if (isReassigned) {
        $("#" + taskId).find(".taskName").css("color", "red");
        isReassigned = false;
      }
  });

}

/*
    appendSubtask: Appends a new subtask to a task - fired when a user clicks subtaskButton.
    @taskId - the ID of the task to append this subtask to
    @subtaskName - the name of the subtask
*/
function appendSubtask(taskId, subtasks, subtaskName) {
  var newSubtasks = subtasks ? subtasks : [];
  newSubtasks.push( { "name": subtaskName, "complete": false } );
  var taskPatch = {
      "subtasks": newSubtasks
  };

  db.patch_task_for_user(taskId, taskPatch, function (error) {
    if (error) {
      console.log("ERROR: patch task " + error);
    }
  });
}

/*
    removeSubtask: Removes the given subtask from a task - fired when a user
    clicks delete on a subtask.
    @taskId - the ID of the task to delete this subtask from
    @subtaskName - the name of the subtask to delete
*/
function deleteSubtask(taskId, subtasks, subtaskName) {
  var newSubtasks = subtasks;

  for (var i = 0; i < newSubtasks.length; i++) {
    if (newSubtasks[i].name == subtaskName) {
      newSubtasks.splice(i, 1);
    }
  }

  var taskPatch = {
      "subtasks": newSubtasks
  };

  db.patch_task_for_user(taskId, taskPatch, function (error) {
    if (error) {
      console.log("ERROR: patch task " + error);
    }
  });
}

/*
    checkSubtask: Checks or unchecks the given subtask from a task - fired when a user
    clicks the check box next to a subtask.
    @taskId - the ID of the task this subtask falls under
    @subtaskName - the name of the subtask
    @isChecked - whether the subtask should be checked or no
*/
function checkSubtask(taskId, subtasks, subtaskName, isChecked) {
  var newSubtasks = subtasks;

  for (var i = 0; i < newSubtasks.length; i++) {
    if (newSubtasks[i].name == subtaskName) {
      newSubtasks[i].complete = isChecked;
    }
  }

  var taskPatch = {
      "subtasks": newSubtasks
  };

  db.patch_task_for_user(taskId, taskPatch, function (error) {
    if (error) {
      console.log("ERROR: patch task " + error);
    }
  });
}


/**
 * this routine renders a subtask given by the parameters to the dom.
 *
 * @param  {String}  taskId      the id of the task to render the subtask for.
 * @param  {SubtaskObjects}  subtasks    the existing set of subtasks to render
 * @param  {String}  subtaskName the name of the subtask to render
 * @param  {Boolean} isComplete  whether the subtask is complete
 */
function renderSubtask( taskId, subtasks, subtaskName, isComplete ) {
    var isCompleteDom = isComplete ? 'checked' : '';
    var isCompleteDomClass = isComplete ? 'class="checked"' : '';

    var subtask =
    '<li class="list-group-item subtask" data-checked="false">' +
      '<input class="subtaskCheckbox" type="checkbox"' + isCompleteDom + '/>' +
      '<span ' + isCompleteDomClass + '>' + subtaskName + '</span>' +
      '<span id="trashIcon" class="glyphicon glyphicon-trash">' +
    '</li>';
    $subtask = $("#" + taskId + " .subtasks > .list-group").append(subtask);
    $checkbox = $subtask.find('.subtaskCheckbox');
    $deleteButton = $subtask.find('.glyphicon-trash');

    $("#" + taskId + " .subtasks > .list-group .glyphicon-trash").on('click', function () {
      var subtaskName = $(this).parent()[0].childNodes[1];
      $(this).parent().remove();
      db.get_user_task(sessionStorage.user_id, taskId, function (error, task) {
        if (error) {
          console.log(error);
          return;
        }
        var subtasks = task.subtasks;
        deleteSubtask(taskId, subtasks, subtaskName.textContent);
      })
    });

    $("#" + taskId + " .subtasks > .list-group .subtaskCheckbox").on('change', function () {
      var isChecked = $(this).is(':checked');

      if (isChecked) {
        $(this).next().addClass('checked');
      } else {
        $(this).next().removeClass('checked');
      }

      $(this).data('state', (isChecked) ? "complete" : "incomplete");
      var subtaskName = $(this).parent()[0].childNodes[1];
      db.get_user_task(sessionStorage.user_id, taskId, function (error, task) {
        if (error) {
          console.log(error);
          return;
        }
        var subtasks = task.subtasks;
        checkSubtask(taskId, subtasks, subtaskName.textContent, isChecked);
      })
    });

}
/*
  addTagToDb(): the callback that our tag library calls when someone
  adds a tag to an input field.
  @tagText: the tag string to be appended to the task object's tag list
*/
function addTagToDb(tagText) {
  var taskId = $(this).parent().parent().parent()[0].id;
  var task = db.get_user_task(sessionStorage.user_id, taskId, function(error, task) {
    if (error) {
      console.log(error);
      return;
    }
    var newTags = task.tags ? task.tags : [];

    if (newTags.indexOf(tagText) >= 0) {
      return;
    }

    newTags.push(tagText);
    var taskPatch = {
      "tags": newTags
    }

    db.patch_task_for_user(taskId, taskPatch, function (error) {
      if (error) {
        console.log("ERROR: patch task " + error);
      }
    })

  });
}

/*
  removeTagFromDb(): the callback that our tag library calls when someone
  deletes a tag from an input field.
  @tagText: the tag string to be deleted
*/
function removeTagFromDb(tagText) {
  var taskId = $(this).parent().parent().parent()[0].id;
  var task = db.get_user_task(sessionStorage.user_id, taskId, function(error, task) {
    if (error) {
      console.log(error);
      return;
    }
    var newTags = task.tags ? task.tags : [];

    for (var i = 0; i < newTags.length; i++) {
      if (newTags[i] == tagText) {
        newTags.splice(i, 1);
      }
    }

    var taskPatch = {
      "tags": newTags
    }

    db.patch_task_for_user(taskId, taskPatch, function (error) {
      if (error) {
        console.log("ERROR: patch task " + error);
      }
    })

  });
}

function renderEstimate(estimatedTime, taskId) {
  if (estimatedTime) {
    var hours = Math.floor(estimatedTime / 3600);
    var minutes = Math.floor((estimatedTime - 3600 * hours) / 60);
    var seconds = Math.floor(estimatedTime - 3600 * hours - 60 * minutes);

    if (hours > 0) {
      if (minutes > 0) {
        $( '#'+taskId ).find('.targetTimeText').text("Estimated time: " + hours + " hr and " + minutes + " min");
      } else {
        $( '#'+taskId ).find('.targetTimeText').text("Estimated time: " + hours + " hr ");
      }
    } else {
      $( '#'+taskId ).find('.targetTimeText').text("Estimated time: " + minutes + " min");
    }
  }
}

function renderRemainder(estimatedTime, timeSpent, taskId) {
  if (estimatedTime) {

    var difference = 0;
    var hoursLeft = 0;
    var minutesLeft = 0;
    var seoncdleft = 0;
    if (estimatedTime < 3600) {//less than 1 hour
      difference = estimatedTime - timeSpent;
      minutesLeft = Math.round((difference) / 60);
      secondsLeft = Math.round(difference - 60 * minutesLeft);
    } else {
      difference = estimatedTime - timeSpent;
      hoursLeft = Math.floor(difference / 3600);
      minutesLeft = Math.round((difference - 3600 * hoursLeft) / 60);
      secondsLeft = Math.round(difference - 3600 * hoursLeft - 60 * minutesLeft);
    }
    
    console.log(difference);
    if (difference < 0) { //over
      if (hoursLeft == 0) {
        $( '#'+taskId ).find('.remainderTimeText').text("Over " + (-1) * minutesLeft + " min. Please update your estimated time!");
      }
      if (hoursLeft < 0) {
        if (minutesLeft < 0) {
          $( '#'+taskId ).find('.remainderTimeText').text("Over " + (-1) * hoursLeft + " hr and " + (-1) * minutesLeft + " min. Please update your estimated time!");
        } else {
          $( '#'+taskId ).find('.remainderTimeText').text("Over " + (-1) * hoursLeft + " hr. Please update your estimated time!");
        }
      } else {
        $( '#'+taskId ).find('.remainderTimeText').text("Over " + (-1) * minutesLeft + " min. Please update your estimated time!");
      }
      $( '#'+taskId ).find('.remainderTimeText').css("color", "red");
    } else {
      if (hoursLeft > 0) {
        if (minutesLeft > 0) {
          $( '#'+taskId ).find('.remainderTimeText').text(hoursLeft + " hr and " + minutesLeft + " min left!");
        } else {
          $( '#'+taskId ).find('.remainderTimeText').text(hoursLeft + " hr left!");
        }
      } else {
        $( '#'+taskId ).find('.remainderTimeText').text(minutesLeft + " min left!");
      }
      $( '#'+taskId ).find('.remainderTimeText').css("color", "black");
    }
  }
}


/*
    loadTask: Loads the interactive features of a task, such as click to toggle, and
    task details.
    @taskId - the ID of the task to load

    #TODO* - can possibly be refactored into smaller chunks for readability. not a priority yet
    #TODO* - we can use the built in settings to change color/icon, but also not priority.

    #TODO - Jina is working on this, but: Interactivity for notes, and icon interactions!
*/
function loadTask(taskId, task) {

  $('#' + taskId).each(function () {
    // Settings
    var $widget = $(this),
    $checkbox = $('#' + taskId + " .taskCheckbox"),
    $notes = $widget.find(".noteInput"),
    $timerWrapper = $widget.find(".timerWrapper"),
    $timerButton = $widget.find(".timeIcon"),
    $plusButton = $widget.find(".plusIcon"),
    $plusWrapper = $widget.find(".plusWrapper"),
    $editButton = $widget.find(".editButton"),
    $taskName = $widget.find(".taskName"),
    $taskDetailsHeading = $widget.find(".taskDetailsHeading")[0],
    $editTaskInput = $widget.find(".editName")[0],
    $deleteTask = $widget.find(".trashButton"),
    $targetTimeButton = $widget.find(".targetTimeIcon"),
    $targetTimeWrapper = $widget.find(".targetTimeWrapper")
    color = ($widget.data('color') ? $widget.data('color') : "primary"),
    style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-");

    if (task.complete) {
      $taskName.addClass('checked');
      $checkbox.prop('checked', true);
    }
    // settings = {
    //     on: {
    //         icon: 'glyphicon glyphicon-check'
    //     },
    //     off: {
    //         icon: 'glyphicon glyphicon-unchecked'
    //     }
    // };

    $widget.css('cursor', 'pointer'); // Change cursor to indicate clickable
    autosize($('.noteInput')); // Autosize note textarea

    $widget.find('.calIcon').click(function(e) {
      if ($widget.find('.input-daterange').length == 0) {
        $widget.find('.dateWrapper').append(
          '<div class="input-group input-daterange">' +
              '<span class="input-group-addon">Assigned:</span>' +
              '<input type="text" class="form-control assign-date" data-date-start-date="today" value="' + parseDate(task.assigned_date) + '">' +
              '<span class="input-group-addon">Due:</span>' +
              '<input type="text" class="form-control due-date" data-date-start-date="today" value="' + parseDate(task.due_date) + '">' +
          '</div>')

        $widget.find('.input-daterange input').each(function() {
          $(this).datepicker();
        });

        $widget.find('.input-daterange .assign-date').each(function() {
          $(this).on('changeDate', function (e) {
            var taskToPatch = task;
            var newAssignedDate = $(this).datepicker('getDate');
            taskToPatch.assigned_date = newAssignedDate.getTime();
            
            var taskPatch = {
              "assigned_date": newAssignedDate.getTime()
            }

            db.patch_task_for_user(taskId, taskPatch);

            $(this).on('hide', function (e) {
              $widget.remove();
              scrollJump(newAssignedDate);
              appendTask(taskId, taskToPatch, false);
            });

          });
        });

        $widget.find('.input-daterange .due-date').each(function() {
          $(this).on('changeDate', function (e) {

            var dueDate = $(this).datepicker('getDate');
            var taskPatch = {
              "due_date": dueDate.getTime()
            }
            db.patch_task_for_user(taskId, taskPatch);

            var taskTitleBar = $widget.find('.taskName')[0].innerHTML;
            var dateString = dueDate.getMonth() + 1 + '/' + dueDate.getDate();
            var regex = /\d{1,2}\/\d{2}/;
            taskTitleBar = taskTitleBar.replace(regex, dateString);

            $widget.find('.taskName')[0].innerHTML = taskTitleBar;
          });
        });

      } else {
        $widget.find('.dateWrapper').empty();
      }
    });



    $targetTimeButton.click(function(e) {

      if ($targetTimeWrapper.find('.targetTime').length == 0) { // check that this doesnt already exist

        $targetTimeWrapper.append("<input type='text' placeholder='hr min' class='targetTime'></input>");
        $targetTimeWrapper.find('.targetTime').focus();

        $targetTimeWrapper.find('.targetTime').keypress(function (e) {
         var key = e.which;
         if (key == 13) { // the enter key code
          e.preventDefault();
          
          var targetTime = $(this).val().split(/[ ,]+/);
          var hours = 0;
          var minutes = 0;

          if (targetTime.length == 2) { //"hr" and "min" without space OR "h" and "min" without space OR two numbers
            var first = $(this).val().split("hr");
            if (first == $(this).val()) { //no "hr" OR "h" and "m" OR two numbers
              var second = $(this).val().split("min");
              if (second == $(this).val()) { //"h" and "m" OR two numbers  
                var third = $(this).val().split("h");
                if (third == $(this).val()) { //no "h" OR two numbers
                  var fourth = $(this).val().split("m");
                  if (fourth == $(this).val()) { //two numbers
                    hours = Math.floor(targetTime[0]);
                    minutes = Math.floor(targetTime[1]);
                  } else {
                    minutes = Math.floor(fourth[0]);
                  }
                } else {
                  hours = Math.floor(third[0]);
                  minutes = Math.floor(targetTime[1].split("m")[0]);
                }
              } else {
                minutes = Math.floor(second[0]);
              }
            } else {
              hours = Math.floor(first[0]);
              minutes = Math.floor(targetTime[1].split("min")[0]);
            }
          } else if (targetTime.length == 4) { //type in two numbers and hr and min with space
            for (chunk in targetTime) {
              if (targetTime[chunk] == "hr") {
                hours = Math.floor(targetTime[chunk - 1]);
              } 
              if (targetTime[chunk] == "min") {
                minutes = Math.floor(targetTime[chunk - 1]);
              }
              if (targetTime[chunk] == "h") {
                hours = Math.floor(targetTime[chunk - 1]);
              } 
              if (targetTime[chunk] == "m") {
                minutes = Math.floor(targetTime[chunk - 1]);
              }
            }
          } else if (targetTime.length == 1) {//only entered one number OR "min" only OR "m" only OR no space
            var fifth = $(this).val().split("hr");
            if (fifth == $(this).val()) { //"h" and "m"
              var sixth = $(this).val().split("h");
              if (sixth == $(this).val()) { //no hours input
                var seventh = $(this).val().split("min");
                if (seventh == $(this).val()) { //"m" or just number
                  var eighth = $(this).val().split("m");
                  if (eighth == $(this).val()) { //just number
                    minutes = Math.floor($(this).val()); 
                  } else {
                    minutes = Math.floor(eighth[0]);
                  }
                } else {
                  minutes = Math.floor(seventh[0]);
                }
              } else {
                hours = Math.floor(sixth[0]);
                minutes = Math.floor(sixth[1].split("m")[0]);
              }
            } else {
              hours = Math.floor(fifth[0]);
              minutes = Math.floor(fifth[1].split("min")[0]);
            }
          }

          var total = 3600 * hours + 60 * minutes; //total is in seconds

          if (!isNaN(hours) && !isNaN(minutes)) {

            $widget.find('.targetTimeText').css({ opacity: 1, "height": "auto", "padding-bottom" : "10px"});

            db.get_user_task(sessionStorage.user_id, taskId, function (err, newTask) {
                var new_estimate = total
                var taskPatch = {
                    "estimate": new_estimate,
                    "estimate_set": true,
                    "progress": Math.round((newTask.hours / new_estimate) * 100)
                };
                db.patch_task_for_user(taskId, taskPatch);
            });


            $targetTimeWrapper.empty();
          }
        }
      });
      } else if ($targetTimeWrapper.find('.targetTime').length == 1) {
        $targetTimeWrapper.empty();
      }
    })

    // Event Handlers
    // -----------------------
    // Datepicker event handlers

    if (task.complete) {
      $checkbox.attr("disabled", true);
    }

    // Handle clicking the task outside of the checkbox
    $widget.on('click', function () {
        $widget.find('.taskDetails').slideToggle();
      });

    // Used for testing click
    $checkbox.on('click', function (e) {
        e.stopPropagation(); // so it doesnt slideToggle
      });

    // Cursor for within task details
    $(".taskDetails").css('cursor', 'default')

    // Prevents clicking in task details from slideToggling
    $(".taskDetails").on('click', function(e) {
        e.stopPropagation();
    });

    // Handles changing the task checkbox state (complete/incomplete)
    $checkbox.on('change', function () {
        // Set the button's state
        var isChecked = $checkbox.is(':checked');
        var taskToPatch = task;
        if (isChecked) {
          $(this).next().next().addClass('checked');
          task.complete = true;
        } else {
          $(this).next().next().removeClass('checked');
          task.complete = false;
        }

        // this is where CHECKBOX stuff happens (merging JINA's commits).
        $checkbox.attr("disabled", true);

        // patch task to mark complete or not. needs DB field
        var taskPatch = {
          "complete": task.complete
        }
        db.patch_task_for_user(taskId, taskPatch, function(error) {
          if (error) {
            console.log(error);
          }
        });

        $widget.data('state', (isChecked) ? "complete" : "incomplete");
      });

    autosize.update('#' + taskId + ' .noteInput');

    $notes.keypress(function (e) {
       var key = e.which;
       if (key == 13) { // the enter key code

          var taskPatch = {
              "notes": $notes.val()
          };

          db.patch_task_for_user(taskId, taskPatch, function (error) {
            if (error) {
              console.log("ERROR: patch task " + error);
            }
          });

          if (e.shiftKey === true)
        {
            return true;
        }
        else
        {
          $(this).blur();
        }
        return false;
        }
    });

    $plusButton.click(function(e) {
      if ($plusWrapper.find('.plusProgress').length == 0) { // check that this doesnt already exist
        $plusWrapper.append("<input type='text' placeholder='hr min' class='plusProgress'></input>");
        $plusWrapper.find('.plusProgress').focus();

        $plusWrapper.find('.plusProgress').keypress(function (e) {
         var key = e.which;
         if (key == 13) { // the enter key code
          e.preventDefault();
          
          var prgressTime = $(this).val().split(/[ ,]+/);
          var hours = 0;
          var minutes = 0;

          if (prgressTime.length == 2) { //"hr" and "min" without space OR "h" and "min" without space OR two numbers
            var first = $(this).val().split("hr");
            if (first == $(this).val()) { //no "hr" OR "h" and "m" OR two numbers
              var second = $(this).val().split("min");
              if (second == $(this).val()) { //"h" and "m" OR two numbers  
                var third = $(this).val().split("h");
                if (third == $(this).val()) { //no "h" OR two numbers
                  var fourth = $(this).val().split("m");
                  if (fourth == $(this).val()) { //two numbers
                    hours = Math.floor(prgressTime[0]);
                    minutes = Math.floor(prgressTime[1]);
                  } else {
                    minutes = Math.floor(fourth[0]);
                  }
                } else {
                  hours = Math.floor(third[0]);
                  minutes = Math.floor(prgressTime[1].split("m")[0]);
                }
              } else {
                minutes = Math.floor(second[0]);
              }
            } else {
              hours = Math.floor(first[0]);
              minutes = Math.floor(prgressTime[1].split("min")[0]);
            }
          } else if (prgressTime.length == 4) { //type in two numbers and hr and min with space
            for (chunk in prgressTime) {
              if (targetTime[chunk] == "hr") {
                hours = Math.floor(prgressTime[chunk - 1]);
              } 
              if (prgressTime[chunk] == "min") {
                minutes = Math.floor(prgressTime[chunk - 1]);
              }
              if (prgressTime[chunk] == "h") {
                hours = Math.floor(prgressTime[chunk - 1]);
              } 
              if (prgressTime[chunk] == "m") {
                minutes = Math.floor(prgressTime[chunk - 1]);
              }
            }
          } else if (prgressTime.length == 1) {//only entered one number OR "min" only OR "m" only OR no space
            var fifth = $(this).val().split("hr");
            if (fifth == $(this).val()) { //"h" and "m"
              var sixth = $(this).val().split("h");
              if (sixth == $(this).val()) { //no hours input
                var seventh = $(this).val().split("min");
                if (seventh == $(this).val()) { //"m" or just number
                  var eighth = $(this).val().split("m");
                  if (eighth == $(this).val()) { //just number
                    minutes = Math.floor($(this).val()); 
                  } else {
                    minutes = Math.floor(eighth[0]);
                  }
                } else {
                  minutes = Math.floor(seventh[0]);
                }
              } else {
                hours = Math.floor(sixth[0]);
                minutes = Math.floor(sixth[1].split("m")[0]);
              }
            } else {
              hours = Math.floor(fifth[0]);
              minutes = Math.floor(fifth[1].split("min")[0]);
            }
          }

          var total = 3600 * hours + 60 * minutes; //total is in seconds

          if (!isNaN(hours) && !isNaN(minutes)) {

            $widget.find('.progressText').css({ opacity: 1, "height": "auto", "padding-bottom" : "10px"});
            $widget.find('.progressText').text(hours + " hr " + minutes + " min of progress time have been added.");
            $widget.find('.progressText').delay(2000).animate({ opacity: 0, "height": "0", "padding-bottom": "0px"});

            db.get_user_task(sessionStorage.user_id, taskId, function (err, newTask) {
              var new_hours = newTask.hours + total
              var taskPatch= {
                  "hours": new_hours,
                  "progress": Math.round((new_hours / newTask.estimate) * 100)
              };
              db.patch_task_for_user(taskId, taskPatch);
            });

            $plusWrapper.empty();
          }

        }
      });
      } else if ($plusWrapper.find('.plusProgress').length == 1) {
        $plusWrapper.empty();
      }
    })

    // Loads and handles timer actions
    $timerButton.click(function(e) {
      if ($timerWrapper.find('.timer').length == 0) { // check that tmer doesnt already exist
        $timerWrapper.append("<div class='timer'></div>");
        var $timer = $timerWrapper.find('.timer')
        var startTime = new Date();
        $timer.countdown({since: startTime, format: 'HMS', 'compact': 'true'});
        $timer.countdown('resume');
        $timer.css("height", "10%");
        $timer.parent().append('<span class="playIcon glyphicon glyphicon-play"></span><span class="pauseIcon glyphicon glyphicon-pause"></span><span class="stopIcon glyphicon glyphicon-stop"></span>')
        $timer.parent().find('.playIcon').click(function (e) {
          $timer.countdown('resume');
        });
        $timer.parent().find('.pauseIcon').click(function (e) {
          $timer.countdown('pause');
        });
        $timer.parent().find('.stopIcon').click(function (e) {
          $timer.countdown('pause');
          var progressTime = $timer.countdown('getTimes');
          $timer.countdown('destroy');
          $timer.parent().empty();
          $timer.remove();

          var hours = Math.floor(progressTime[4]);
          var minutes = Math.floor(progressTime[5]);
          var seconds = Math.floor(progressTime[6]);

          var total = 3600 * hours + 60 * minutes + seconds; //total is in seconds

          $widget.find('.progressText').css({ opacity: 1, "height": "auto", "padding-bottom": "10px"});
          $widget.find('.progressText').text(hours + " hr " + minutes + " min of progress time have been added.");
          $widget.find('.progressText').delay(2000).animate({ opacity: 0, "height": "0", "padding-bottom": "0px"});

          var progress = Math.round((task.hours + total / task.estimate) * 100);

          var taskPatch = {
            "hours": task.hours + total,
            "progress": progress
          }
          db.patch_task_for_user(taskId, taskPatch);

        });
      } else if ($timerWrapper.find('.timer').length == 1) {
          var $timer = $timerWrapper.find('.timer')
          $timer.countdown('pause');
          $timer.countdown('destroy');
          $timer.parent().empty();
          $timer.remove();
      }
    });

    $editButton.click(function(e) {
      if ($taskDetailsHeading.style.display == 'none') {
        $taskDetailsHeading.style.display = 'inline-block';
        $editTaskInput.style.display = 'none';
      } else {
        $taskDetailsHeading.style.display = 'none';
        $editTaskInput.style.display = 'inline-block';
        $editTaskInput.focus();
      }
      //$editTaskInput.style.display = 'block';
    });

    $deleteTask.click(function(e) {
      $('#' + taskId).remove();
      db.remove_task_from_user(sessionStorage.user_id, taskId, function(error) {
        if (error) {
          console.log("ERROR: remove task " + error);
        }
      })
    });

    db.watch_task_progress( taskId, function( err, progress ) {
        db.get_user_task(sessionStorage.user_id, taskId, function (error, newTask) {
            if (newTask) {
              $( '#'+taskId ).find('.progress-bar').css({ width: newTask.progress + '%' });
              if (newTask.progress <= 100) {
                $( '#'+taskId ).find('.progress-indicator').text( newTask.progress + '%' );
              } 
            }
        });
    });

    db.watch_task_hours( taskId, function( err, hours ) {
        db.get_user_task(sessionStorage.user_id, taskId, function (error, newTask) {
            if (newTask) {
              renderRemainder( newTask.estimate, newTask.hours, taskId);
              renderEstimate( newTask.estimate, taskId );
            }
        });
    })

    db.watch_task_estimate( taskId, function( err, estimate ) {
        db.get_user_task(sessionStorage.user_id, taskId, function (error, newTask) {
            if (newTask) {
                renderRemainder( newTask.estimate, newTask.hours, taskId );
                renderEstimate( newTask.estimate, taskId );
                newTask.progress = Math.round((newTask.hours / newTask.estimate) * 100);
                $( '#'+taskId ).find('.progress-bar').css({ width: newTask.progress + '%' });

                if (newTask.progress <= 100) {
                  $( '#'+taskId ).find('.progress-indicator').text( newTask.progress + '%' );
                }
            }
        });
    });




    // Actions
    function updateDisplay() {
      var isChecked = $checkbox.is(':checked');

        // Set the button's state
        $widget.data('state', (isChecked) ? "on" : "off");

        // Set the button's icon
        // $widget.find('.state-icon')
        //     .removeClass()
        //     .addClass('state-icon ' + settings[$widget.data('state')].icon);


        // Update the button's color
        // if (isChecked) {
        //     $widget.addClass(style + color + ' active');
        // } else {
        //     $widget.removeClass(style + color + ' active');
        // }
      }

    // Initialization
    function init() {

      if ($widget.data('checked') == true) {
        $checkbox.prop('checked', !$checkbox.is(':checked'));
      }

      updateDisplay();

        // Inject the icon if applicable
        // if ($widget.find('.state-icon').length == 0) {
        //     $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
        // }
      }
    // init();
  });

  // $('#get-checked-data').on('click', function(event) {
  //  event.preventDefault();
  //  var checkedItems = {}, counter = 0;
  //  $("#check-list-box li.active").each(function(idx, li) {
  //    checkedItems[counter] = $(li).text();
  //    counter++;
  //  });
  //  $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
  // });
}

$("#logout").click(function (event) {
    event.preventDefault();
    db.log_out(function (error) {
        if (!error) {
            sessionStorage.user_id = null;
            window.location.href = "/login";
        }
    });
});

$("#unprocrastinator").click(function (event) { //automatically log user out
    event.preventDefault();
    db.log_out(function (error) {
        if (!error) {
            sessionStorage.user_id = null;
            window.location.href = "/login";
        }
    });
});

/*
displayUserInfo: displays user info to
make sure the sign in process worked!
*/
function displayUserInfo() {
    db.get_user(sessionStorage.user_id, function (error, user) {
        if (!error) {
            var info = user.username + "&nbsp;&nbsp; | &nbsp;&nbsp;";
            $("#user_label").html(info);
        }
    });
}
displayUserInfo();
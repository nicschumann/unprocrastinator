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

DESIGN QUESTIONS
Editing task name?
Due date display?
Category display?
Notes saving?


ANY QUESTIONS? 
Ask Jina about the front end code anytime!!! :)

********************************************/

var db = require('../../queries/queries.js');
var autosize = require('autosize');

// Global date variables
var today = new Date();
var todayId = generateDateId(today); 
var dateCounter = 0;

//Global task map for loading existing tasks
var taskMap = {};

var showPopover = $.fn.popover.Constructor.prototype.show;
$.fn.popover.Constructor.prototype.show = function () {
    showPopover.call(this);
    if (this.options.showCallback) {
        this.options.showCallback.call(this);
    }
}

// Actions to happen on page load
$(document).ready(function(){
  loadTaskMap();
  loadTodayOverview();

  $("#monthName").text(getMonthOfYear(today));

  // Required Bootstrap JS 
  $('[data-toggle="popover"]').popover(
    {html: true,
      showCallback: function () {
        $('#datepicker1').datepicker();
    }
  });

    // As user scrolls, loads 7 more days infinitely. 
    // #TODO - Currently has bugs according to screen/zoom size
    $(window).scroll(function(){
      if ($(window).scrollTop() == $(document).height()-$(window).height()){ // doesnt work if zoom is not at 100%
        populateWeek();
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





  $("#datepicker1").datepicker();
  $('#datepicker1').on("changeDate", function() {
      $('#pickedDate').val(
          $('#datepicker1').datepicker('getFormattedDate')
      );
      console.log( $('#pickedDate').val());
  });
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
            var taskDateId = parseDate(task.assigned_date);
          } else {
            console.log('invalid task to load')
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
      populateWeek();
    }
  }); 
}

/*
    generateDateTemplate: Generates the HTML template for a single day on the agenda list.
    @currDate - the Date object to generate the HTML for.
*/
function generateDayTemplate(currDate) {
  var currDateId = generateDateId(currDate);
  return '<div class="day row" id="' + currDateId + '">' + 
            '<div class="dates col-md-1">' + 
              '<div class="row">' + 
                '<h2>' + currDate.getDate() + '<br>' + getDayOfWeek(currDate) + '</h2>' + 
              '</div>' + 
            '</div>' + 
            '<div class="col-md-11">' + 
              '<p>' + 
                '<div class="well" style="height: auto;overflow: auto;">' + 
                  '<ul class="tasks list-group checked-list-box">' +
                  '</ul>'+ 
                    '<div class="input-group">' +
                      '<input type="text" class="form-control taskInput" placeholder="Category, Task name..." aria-describedby="basic-addon2">' +
                        '<span class="input-group-addon taskButton"> + </span>' +
                    '</div>'+
                '</div>' +
              '</p>' + 
            '</div>'
            '</div>';
}

/*
    Generates the Today Overview Bar.
    #TODO interact/connect with DB data.
*/
function generateTodayOverview() {
  return '<div class= id="todayOverview">' + 
            '<div class="row">' + 
              '<div class="col-sm-3">' +
                '<h4>Today\'s Overview:</h4>' +
              '</div>' +
              '<div class="progress">' +
                '<div class="progress-bar progress-bar-success" style="width: 35%">' +
                  '<span class="sr-only">35% Complete (success)</span>' +
                '</div>' +
                '<div class="progress-bar progress-bar-warning progress-bar-striped" style="width: 20%">' +
                  '<span class="sr-only">20% Complete (warning)</span>' +
                '</div>' +
                '<div class="progress-bar progress-bar-danger" style="width: 10%">' +
                  '<span class="sr-only">10% Complete (danger)</span>' +
                '</div>' +
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
    populateTodaySample: Populates just the current day with a sample task. 
    #TODO - Delete later on; this is for testing purposes.
*/
function populateTodaySample() {
  var sampleTask =  {
        "name": "Eat lunch",
        "progress": 0,
        "assigned_date": today.getTime(),
        "due_date": today.getTime(),
        "tags": "test",
        "category": "",
        "subtasks": [
          {
            "name": "subtask1",
            "complete": true
          }
        ]
    };

  db.add_task_to_user(sessionStorage.user_id, sampleTask, function(error, taskId) {
    appendTask(taskId, sampleTask);
  });
}

/*
    populateWeek: Populates the next 7 days. Is called for use in the infinite scroll.
*/
function populateWeek() {
  for (i = 0; i < 7; i++) {
    var currDate = new Date();
    currDate.setDate(today.getDate() + dateCounter);

    $("#agendaList").append(generateDayTemplate(currDate));

    var currDateId = generateDateId(currDate);

    if (taskMap[currDateId]) { 
      for (var taskIndex in taskMap[currDateId]) {
        var taskPair = taskMap[currDateId][taskIndex];
          appendTask(taskPair.task_id, taskPair.task);
        // }
      }
    }

    // Cursor for add button
    $('#' + currDateId + ' .taskButton').css("cursor", "pointer"); 

    // Event handlers for adding task (click and enter)
    $('#' + currDateId + ' .taskButton').click(function (e) {
      e.preventDefault();
      var dateId = $(this).parent().parent().parent().parent().attr('id');
      
      var input = $(this).prev().val();
      var category = input.split(",")[0];
      var name = input.split(",")[1];

      var taskToAdd =  {
            "name": name,
            "progress": 0,
            "assigned_date": generateDateFromId(dateId).getTime(),
            "due_date": generateDateFromId(dateId).getTime(),
            "tags": "test",
            "category": category
        };
      db.add_task_to_user(sessionStorage.user_id, taskToAdd, function(error, taskId) {
        appendTask(taskId, taskToAdd);
      });

      $(this).prev().val('');
    });

    $("#" + currDateId + ' .taskInput').keypress(function (e) {
       var key = e.which;
       if (key == 13) { // the enter key code
          e.preventDefault();
          var dateId = $(this).parent().parent().parent().parent().attr('id');
          
          var input = $(this).val();
          var category = input.split(",")[0];
          var name = input.split(",")[1];


          var taskToAdd =  {
                "name": name,
                "progress": 0,
                "assigned_date": generateDateFromId(dateId).getTime(),
                "due_date": generateDateFromId(dateId).getTime(),
                "tags": "test",
                "category": category,
                "subtasks": [
                  {
                    "name": "completed?",
                    "complete": true
                  }
                ]
            };
          db.add_task_to_user(sessionStorage.user_id, taskToAdd, function(error, taskId) {
            appendTask(taskId, taskToAdd);
          });

          $(this).val('');
        }
    });   
  
    dateCounter++;
  }
}

/*
    displayCalendarComponent: Loads the calendar component. Is used in two cases -
        1) in the month bar where the user can click a day to jump to it without scrolling
        2) in the task details where the user can reschedule a task

*/
function displayCalendarComponent() {
    // #TODO - implement this... There are some libraries that provide it but I can't get them to work!
}

/*
    appendTask: Appends a task to a date.
    @dateId - the date ID for the date to append this task to
    @taskName - the name of the task.
    #TODO need to add: @category and @dueDate
    #TODO Currently uses a "dummy" random int as a task ID. Connect DB to use the real task ID.
*/
function appendTask(taskId, task) {
	var taskDetailsDOM = 
		'<div class="taskDetails">' +
			'<h4>' + "[" + task.category + "]" + task.name + '</h4>' +
		  '<div class="progress">' +
		    '<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%">' +
		      '<span class="sr-only">40% Complete (success)</span>' +
		    '</div>' +
		  '</div>' +
      '<p class="progressText"></p>' +

		  '<div class="taskIcons">' +
		    '<span class="plusIcon glyphicon glyphicon-plus-sign"></span>' +
        '<div class="plusWrapper"></div>' +
		    '<span class="timeIcon glyphicon glyphicon-time"></span>' +
        '<div class="timerWrapper"></div>' +
        '<button class="calButton" type="button" title="Reschedule Task" data-container="body" data-toggle="popover" data-placement="bottom">' +
            '<span id="calIcon" class="glyphicon glyphicon-calendar"></span>' +
        '</button>' +
        '<div class="datepicker-wrapper" style="display:none;">' +
          '<div class="datepicker" style="color: black"></div>' +
          '<input type="hidden" class="newAssignedDate">' +
        '</div>' +
		  '</div><br>' +

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
		    '<textarea class="noteInput form-control" placeholder="Write a note..." rows="1" aria-describedby="sizing-addon1"></textarea>' +
		  '</div>' +
		'</div>'

	var taskDOM = 
		'<li id="'+ taskId +'" class="list-group-item" data-checked="false">' +
			'<input class="taskCheckbox" type="checkbox"/>' + "[" + task.category + "]" + task.name + 
			taskDetailsDOM + 
		'</li>';

  $("#" + parseDate(task.assigned_date) + " .tasks").append(taskDOM);

  // Load subtasks
  for (var subtask in task.subtasks) {
    console.log(task.subtasks[subtask]);
    appendSubtask(taskId, task.subtasks[subtask].name, task.subtasks[subtask].complete);
  }
  $('#' + taskId + ' .taskDetails').hide(); // Hide taskDetails until clicked.

  // CSS cursor for add subtask button
  $("#" + taskId + ' .subtaskButton').css("cursor", "pointer"); 

  // Event handlers for adding subtasks (click and enter key)
  $("#" + taskId + ' .subtaskButton').click(function (e) { 
    e.preventDefault();
    var taskId = $(this).parent().parent().parent().parent().attr('id');
    var subtaskName = $(this).prev().val();
    appendSubtask(taskId, subtaskName, false);

    $(this).prev().val('');
  });

  $("#" + taskId + ' .subtaskInput').keypress(function (e) {
     var key = e.which;
     if (key == 13) { // the enter key code
      e.preventDefault();
      var taskId = $(this).parent().parent().parent().parent().attr('id');
      var subtaskName = $(this).val();
      appendSubtask(taskId, subtaskName, false);
      $(this).val('');
    }
  });   

  // Call loadTask to load the interactive features of a task (toggle, details, etc.)
  loadTask(taskId);
}

/*
    appendSubtask: Appends a subtask to a task - fired when a user clicks subtaskButton.
    @taskId - the ID of the task to append this subtask to
    @subtaskName - the name of the subtask
    @isComplete - boolean of if complete or not (unchecked/check)
    #TODO Discuss if subtasks need any more values besides name?
    #TODO Should subtasks have subtaskIds?
*/
function appendSubtask(taskId, subtaskName, isComplete) {
	var subtask = 
		'<li class="list-group-item subtask" data-checked="false">' +
			'<input class="subtaskCheckbox" type="checkbox"/>' + subtaskName +
		'</li>';
    $subtask = $("#" + taskId + " .subtasks > .list-group").append(subtask);
    $checkbox = $subtask.find('.subtaskCheckbox');
    $checkbox.prop('checked', isComplete)

    $("#" + taskId + " .subtasks > .list-group .subtaskCheckbox").on('change', function () {
        var isChecked = $(this).is(':checked');
        // Set the button's state -- #TODO connect to db
        $(this).data('state', (isChecked) ? "complete" : "incomplete");
      });
}


/*
    loadTask: Loads the interactive features of a task, such as click to toggle, and
    task details. 
    @taskId - the ID of the task to load

    #TODO* - can possibly be refactored into smaller chunks for readability. not a priority yet
    #TODO* - we can use the built in settings to change color/icon, but also not priority.
    
    #TODO - Jina is working on this, but: Interactivity for notes, and icon interactions!
*/
function loadTask(taskId) {

	$('#' + taskId).each(function () {
    // Settings
    var $widget = $(this),
    $checkbox = $('#' + taskId + " .taskCheckbox"),
    $notes = $widget.find(".noteInput"),
    $timerWrapper = $widget.find(".timerWrapper"),
    $timerButton = $widget.find(".timeIcon"),
    $plusButton = $widget.find(".plusIcon"),
    $plusWrapper = $widget.find(".plusWrapper"),
    color = ($widget.data('color') ? $widget.data('color') : "primary"),
    style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-");
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
    $widget.find( ".datepicker" ).datepicker(); // Datepicker JS
    $widget.find('[data-toggle="popover"]').popover(
      {html: true,
       content: function() {
             return $widget.find('.datepicker-wrapper').html(); //need to initialize datepicker AFTER
           }
      }
    );

    $widget.find('.newAssignedDate').on("changeDate", function() {
        $widget.find('.newAssignedDate').val(
            $widget.find('.datepicker').datepicker('getFormattedDate')
        );
    });
   
    // Event Handlers
    // -----------------------
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
        var isChecked = $checkbox.is(':checked');
        // Set the button's state
        $widget.data('state', (isChecked) ? "complete" : "incomplete");
      });

    autosize.update('#' + taskId + ' .noteInput');

    $notes.keypress(function (e) {
       var key = e.which;
       if (key == 13) { // the enter key code
          // update notes in DB with $(this).val()
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
        $plusWrapper.append("<input type='text' placeholder='HRS, MIN, SEC' class='plusProgress'></input>");
        $plusWrapper.find('.plusProgress').focus();  

        $plusWrapper.find('.plusProgress').keypress(function (e) {
         var key = e.which;
         if (key == 13) { // the enter key code
          e.preventDefault();
          var progressTime = $(this).val().split(/[ ,]+/);

          $widget.find('.progressText').css({ opacity: 1, "height": "auto", "padding-bottom" : "10px"});
          $widget.find('.progressText').text(progressTime[0] + " hours, " + progressTime[1] + " minutes, and " + progressTime[2] + " seconds of progress time have been added.");
          $widget.find('.progressText').delay(2000).animate({ opacity: 0, "height": "0", "padding-bottom": "0px"});

          $plusWrapper.empty();
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

          $widget.find('.progressText').css({ opacity: 1, "height": "auto", "padding-bottom": "10px"});
          $widget.find('.progressText').text(progressTime[4] + " hours, " + progressTime[5] + " minutes, and " + progressTime[6] + " seconds of progress time have been added.");
          $widget.find('.progressText').delay(2000).animate({ opacity: 0, "height": "0", "padding-bottom": "0px"});

        });
      } else if ($timerWrapper.find('.timer').length == 1) {
          var $timer = $timerWrapper.find('.timer')
          $timer.countdown('pause');
          $timer.countdown('destroy');
          $timer.parent().empty();
          $timer.remove();
      }
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

    // #TODO - delete this. This is probably not needed, but commenting out just in case.
	// $('#get-checked-data').on('click', function(event) {
	// 	event.preventDefault(); 
	// 	var checkedItems = {}, counter = 0;
	// 	$("#check-list-box li.active").each(function(idx, li) {
	// 		checkedItems[counter] = $(li).text();
	// 		counter++;
	// 	});
	// 	$('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
	// });
}

// -----------------------------------------------------------

/************************
    LANDING.HTML JS
*************************/

// Button and request handlers for landing.html
$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').focus()
})

$('#createaccount').on('click', function(event) {
	event.preventDefault();
    var user = {
    	"username": $("#newusername").val(),
        "email": $("#newemail").val(),
        "password": $("#newpassword").val()
    };
    db.add_user(user, function (error, user_id) {
        if (!error) {
         	sessionStorage.user_id = user_id;
            window.location.href = "/user";
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
		    alert(error);
		}
	});	
});

$("#logout").click(function (event) {
    event.preventDefault();
    db.log_out(function (error) {
        if (!error) {
            window.location.href = "/login";
        }
    });
});

$("#unprocrastinator").click(function (event) { //automatically log user out
    event.preventDefault();
    db.log_out(function (error) {
        if (!error) {
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
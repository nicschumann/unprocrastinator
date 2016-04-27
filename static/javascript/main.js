/********************************************
QUICK README:

The general flow of the index.html is as follows:

1. On page load, a full week of dates is populated by populateWeek, which...
    i) calls generateDayHTML 7 times.
    ii) loads "addTaskButtons" so new tasks can be added by user 

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

var db = require('../../queries/queries.js');

// Global date variables
var today = new Date();
var todayId = today.getMonth() + '-' + today.getDate() + '-' + today.getYear();
var dateCounter = 1;

// Actions to happen on page load
$(document).ready(function(){
	populateToday();
	populateWeek();

    // As user scrolls, loads 7 more days infinitely. 
    // #TODO - Currently has bugs according to screen/zoom size
    // #TODO - Make the #monthBar change from APRIL to MAY to JUNE, etc, as it scrolls
    // through the days. (basic idea = keep track of when the monthBar div touches a div with
    // a new month in its dateId)
    $(window).scroll(function(){
      if ($(window).scrollTop() == $(document).height()-$(window).height()){ // doesnt work if zoom is not at 100%
      	populateWeek();
      }
  });

    // Required Bootstrap JS 
    $('[data-toggle="popover"]').popover();
});

/*
    getDayOfWeek: A simple function that returns corresponding day-of-week abbreviations.
    @date - the Date object to retrieve the abbreviated day of week for.
*/
function getDayOfWeek(date) { 
   return ["SUN","MON","TUE","WED","THU","FRI","SAT"][(date.getDay())];
}

/*
    generateDateTemplate: Generates the HTML template for a single day on the agenda list.
    @currDate - the Date object to generate the HTML for.
*/
function generateDayTemplate(currDate) {
  var currDateId = currDate.getMonth() + '-' + currDate.getDate() + '-' + currDate.getYear()
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
                      '<input type="text" class="form-control ="newTask' + '" placeholder="Add a task..." aria-describedby="basic-addon2">' +
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
    populateToday: Populates just the current day with a sample task. 
    #TODO - Delete later on; this is for testing purposes.
*/
function populateToday() {
  $("#agendaList").append(generateTodayOverview() + generateDayTemplate(today));
  appendTask(todayId, 'Eat lunch');
}

/*
    populateWeek: Populates the next 7 days. Is called for use in the infinite scroll.
    Not actually necessary to make this a lone function, but improves code readability!
*/
function populateWeek() {
  for (i = 0; i < 7; i++) {
      var currDate = new Date();
      currDate.setDate(today.getDate() + dateCounter);

      $("#agendaList").append(generateDayTemplate(currDate));
      dateCounter++;
  }

  // Event handler for adding task
  $('.taskButton').click(function (e) { 
      e.preventDefault();
      var dateId = $(this).parent().parent().parent().parent().attr('id');
      var taskName = $(this).prev().val();
      appendTask(dateId, taskName);
      // loadCheckboxes();

      $(this).prev().val('');
  });
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
function appendTask(dateId, taskName) {
	var taskId = Math.floor(Math.random() * 100);
	// console.log(taskId)
	var taskDetails = 
		'<div class="taskDetails">' +
			'<h4>Task Details</h4>' +
		  '<div class="progress">' +
		    '<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%">' +
		      '<span class="sr-only">40% Complete (success)</span>' +
		    '</div>' +
		  '</div>' +

		  '<div class="taskIcons">' +
		    '<span id="plusIcon" class="glyphicon glyphicon-time"></span>' +
		    '<span id="timeIcon" class="glyphicon glyphicon-plus-sign"></span>' +
		    '<span id="calIcon" class="glyphicon glyphicon-calendar"></span>' +
		  '</div>' +

  	 '<h5>Subtasks</h5>' +
		 '<div class="subtasks well" style="height: auto;overflow: auto;">  ' +
          '<ul class="list-group checked-list-box"> ' +
          '</ul> ' +
            '<div class="input-group"> ' +
              '<input type="text" class="form-control" id="newSubtask" placeholder="Add a subtask..." aria-describedby="basic-addon2">' +
                '<span class="input-group-addon subtaskButton">+</span> ' +
            '</div>' +
        '</div> ' +

		  '<div class="notes">' +
		  	'<h5>Notes</h5>' +
		    '<input type="text" class="form-control" placeholder="Write a note..." aria-describedby="sizing-addon1">' +
		  '</div>' +
		'</div>'

	var task = 
		'<li id="'+ taskId +'" class="list-group-item" data-checked="false">' +
			'<input type="checkbox"/>' + taskName + 
			taskDetails + 
		'</li>';

 
  $("#" + dateId + " .tasks").append(task);
  $('#' + taskId + ' .taskDetails').hide(); // Hide taskDetails until clicked.

  // Event handler for adding subtasks 
  $("#" + taskId + ' .subtaskButton').click(function (e) { 
      console.log('subtask button click')
      e.preventDefault();
      var taskId = $(this).parent().parent().parent().parent().attr('id');
      console.log('taskId =  ' + taskId)
      var subtaskName = $(this).prev().val();
      appendSubtask(taskId, subtaskName);

      $(this).prev().val('');
  });

  // Call loadTask to load the interactive features of a task (toggle, details, etc.)
  loadTask(taskId);
}

/*
    appendSubtask: Appends a subtask to a task - fired when a user clicks subtaskButton.
    @taskId - the ID of the task to append this subtask to
    @subtaskName - the name of the subtask
    #TODO Discuss if subtasks need any more values besides name?
*/
function appendSubtask(taskId, subtaskName) {
  console.log('subtask added')
	var subtask = 
	// '<li id="'+ taskId +'" class="list-group-item" data-checked="false">' +
	// no task ID yet
		'<li class="list-group-item subtask" data-checked="false">' +
			'<input type="checkbox"/>' + subtaskName +
		'</li>';

	  $("#" + taskId + " .subtasks > .list-group").append(subtask);
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
    $checkbox = $("input:checkbox"),
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

    // Change cursor to indicate clickable
    $widget.css('cursor', 'pointer');

    // Append, load, and hide taskDetails template
    // $widget.append(taskDetails);
    // loadTaskDetails(taskId);
    // $widget.hide($(".taskDetails"));

    // Event Handlers
    // -----------------------
    // Handle clicking the task outside of the checkbox
    $widget.on('click', function () {
        $widget.find('.taskDetails').slideToggle();
      });

    // Handle clicking just the checkbox (mark task as complete/incomplete)
    $checkbox.on('click', function (e) {
        e.stopPropagation();
        console.log('clicked!')
      });

    // Cursor for within task details
    $(".taskDetails").css('cursor', 'default')

    // Handle click - used for testing
    $(".taskDetails").on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    // Handles changing the checkbox state (complete/incomplete)
    $checkbox.on('change', function () {
        var isChecked = $checkbox.is(':checked');
        // Set the button's state
        $widget.data('state', (isChecked) ? "complete" : "incomplete");

        console.log($widget.data('state'));
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
    displayUserInfo: For testing purposes - displays user info to
    make sure the sign in process worked!
*/
function displayUserInfo() {
    db.get_user(sessionStorage.user_id, function (error, user) {
        if (!error) {
            var info = "Username: " + user.username + "&nbsp;&nbsp; | &nbsp;&nbsp;"
                    + "Email: " + user.email + "&nbsp;&nbsp; | &nbsp;&nbsp;"
                    + "User ID: " + sessionStorage.user_id;
            $("#user_account_label").html(info);
        }
    });
}

displayUserInfo();

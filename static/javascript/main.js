<<<<<<< HEAD
// var Calendar = require('calendar');

// var cal = new Calendar;
// cal.el.appendTo('body');

console.log( 'hi!' );

var today = new Date();
var dateCounter = 1;

$(document).ready(function(){
	populateToday();
	populateSevenDays();
	loadCheckboxes();

	$(window).scroll(function(){
	    if ($(window).scrollTop() == $(document).height()-$(window).height()){
	        populateSevenDays();
			loadCheckboxes();
	    }

	});

	// $(window).scroll(function () {
	//         if ($(this).scrollTop() > 50) {
	//             $("#monthBar").addClass("f-nav");
	//         } else {
	//             $("#monthBar").removeClass("f-nav");
	//         }
	//     });
  $('[data-toggle="popover"]').popover();

});



function getDayOfWeek(date) { 
	return ["SUN","MON","TUE","WED","THU","FRI","SAT"][(date.getDay())];
}

function populateToday() {
	$("#agendaList").append('<div class="day" id="today"><div class="row"><div class="col-sm-3"><h4>Today\'s Overview:</h4></div><div class="progress col-sm-9"><div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;">60%</div></div></div><div class="row"><div class="dates col-md-1"><div class="row"><h2>' + today.getDate() + '<br>' + getDayOfWeek(today) + '</h2></div></div><div class="col-md-11"><div class="well" style="height: auto;overflow: auto;"><ul id="todo-list" class="list-group checked-list-box"><li class="list-group-item">Eat lunch </li><li class="list-group-item" data-checked="true">Wake up</li><li class="list-group-item">Work on CS132<br><br><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%"></div></div></li><li class="list-group-item">Study for CLPS</li></ul></div></div></div>');
}

function populateSevenDays() {
	for (i = 0; i < 7; i++) {
		console.log('hi')
		var currDate = new Date();
		currDate.setDate(today.getDate() + dateCounter);
		$("#agendaList").append('<div class="row"><div class="dates col-md-1"><div class="row"><h2>' + currDate.getDate() + '<br>' + getDayOfWeek(currDate) + '</h2></div></div><div class="col-md-11"><p><div class="well" style="height: auto;overflow: auto;"><ul id="todo-list" class="list-group checked-list-box"><li class="list-group-item">Eat lunch</li><li class="list-group-item" data-checked="true">Wake up</li><li class="list-group-item">Work on CS132</li><li class="list-group-item">Study for CLPS</li></ul></div></p></div>');
		dateCounter++;
	}

	// var currDate = new Date();
	// currDate.setDate(today.getDate() + dateCounter);
	// populateEmptyDay(currDate);
}

// function populateEmptyDay(currDate) {
// 	$("#agendaList").append('<div class="row"><div class="dates col-md-1"><div class="row"><h2>' + currDate.getDate() + '<br>' + getDayOfWeek(currDate) + '</h2></div></div><div class="col-md-11"><p><div class="well" style="height: auto;overflow: auto;"><ul id="todo-list" class="list-group checked-list-box"></ul></div></p></div>');
// }



function loadCheckboxes() {
	$('.list-group.checked-list-box .list-group-item').each(function () {
	    
	    // Settings
	    var $widget = $(this),
	        $checkbox = $('<input type="checkbox" class="hidden" />'),
	        color = ($widget.data('color') ? $widget.data('color') : "primary"),
	        style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
	        settings = {
	            on: {
	                icon: 'glyphicon glyphicon-check'
	            },
	            off: {
	                icon: 'glyphicon glyphicon-unchecked'
	            }
	        };
	        
	    $widget.css('cursor', 'pointer')
	    $widget.append($checkbox);

	    // Event Handlers
	    $widget.on('click', function () {
	        $checkbox.prop('checked', !$checkbox.is(':checked'));
	        $checkbox.triggerHandler('change');
	        updateDisplay();
	    });
	    $checkbox.on('change', function () {
	        updateDisplay();
	    });
	      

	    // Actions
	    function updateDisplay() {
	        var isChecked = $checkbox.is(':checked');

	        // Set the button's state
	        $widget.data('state', (isChecked) ? "on" : "off");

	        // Set the button's icon
	        $widget.find('.state-icon')
	            .removeClass()
	            .addClass('state-icon ' + settings[$widget.data('state')].icon);

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
	        if ($widget.find('.state-icon').length == 0) {
	            $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
	        }
	    }
	    init();
	});
	
	$('#get-checked-data').on('click', function(event) {
	    event.preventDefault(); 
	    var checkedItems = {}, counter = 0;
	    $("#check-list-box li.active").each(function(idx, li) {
	        checkedItems[counter] = $(li).text();
	        counter++;
	    });
	    $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
	});
}

$('#add-task').on('click', function(e) {
	console.log('click');
    e.preventDefault();
    var taskName = $('#task-name').val();
    var dueDate = $('#due-date').val();

    $('#todo-list').append('<li class="list-group-item">'+ dueDate + ' - ' + taskName +'</li>');

    loadCheckboxes();

    $('#task-name').val('');
    $('#due-date').val('');
});
=======
var today = new Date();
var todayId = today.getMonth() + '-' + today.getDate() + '-' + today.getYear();
var dateCounter = 1;

// actions to happen on page load
$(document).ready(function(){
	populateToday();
	populateWeek();
	loadCheckboxes();

	$(window).scroll(function(){
	    if ($(window).scrollTop() == $(document).height()-$(window).height()){
	        populateWeek();
			loadCheckboxes();
	    }
	});

  $('[data-toggle="popover"]').popover();

  $('.taskButton').click(function (e) { 
  	e.preventDefault();
  	var dateId = $(this).parent().parent().parent().parent().attr('id');
	var taskName = $(this).prev().val();
	appendTask(dateId, taskName)
	loadCheckboxes();

	$(this).prev().val('');
	});
});

// function that translate 0-6 to SUN-SAT
function getDayOfWeek(date) { 
	return ["SUN","MON","TUE","WED","THU","FRI","SAT"][(date.getDay())];
}

// generates day HTML template
function generateDayTemplate(currDate) {
	var currDateId = currDate.getMonth() + '-' + currDate.getDate() + '-' + currDate.getYear()
	return  '<div class="day row" id="' + currDateId + '">' + 
				'<div class="dates col-md-1">' + 
					'<div class="row">' + 
						'<h2>' + currDate.getDate() + '<br>' + getDayOfWeek(currDate) + '</h2>' + 
					'</div>' + 
				'</div>' + 
				'<div class="col-md-11">' + 
					'<p>' + 
						'<div class="well" style="height: auto;overflow: auto;">' + 
							'<ul class="list-group checked-list-box">' +
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

//today Overview bar
function generateTodayOverview() {
	return '<div class= id="todayOverview">' + 
				'<div class="row">' + 
					'<div class="col-sm-3">' +
						'<h4>Today\'s Overview:</h4>' +
					'</div>' +
					'<div class="progress col-sm-9"><div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;">60%</div>' +
				'</div>' +
			'</div>';
}

// append a task to a date
function appendTask(dateId, taskName) {
	$("#" + dateId + " ul").append('<li class="list-group-item" data-checked="false">' + taskName + '</li>');
}

//populate today (just for a sample)
function populateToday() {
	$("#agendaList").append(generateTodayOverview() + generateDayTemplate(today));
	appendTask(todayId, 'Eat lunch')
}

//populates next 7 days. happens when user scrolls down infinitely too
function populateWeek() {
	for (i = 0; i < 7; i++) {
		console.log('hi')
		var currDate = new Date();
		currDate.setDate(today.getDate() + dateCounter);

		$("#agendaList").append(generateDayTemplate(currDate));
		dateCounter++;
	}
}

//loads checkboxes 
function loadCheckboxes() {
	$('.list-group.checked-list-box .list-group-item').each(function () {
	    
	    // Settings
	    var $widget = $(this),
	        $checkbox = $('<input type="checkbox" class="hidden" />'),
	        color = ($widget.data('color') ? $widget.data('color') : "primary"),
	        style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
	        settings = {
	            on: {
	                icon: 'glyphicon glyphicon-check'
	            },
	            off: {
	                icon: 'glyphicon glyphicon-unchecked'
	            }
	        };
	        
	    $widget.css('cursor', 'pointer')
	    $widget.append($checkbox);

	    // Event Handlers
	    $widget.on('click', function () {
	        $checkbox.prop('checked', !$checkbox.is(':checked'));
	        $checkbox.triggerHandler('change');
	        updateDisplay();
	    });
	    $checkbox.on('change', function () {
	        updateDisplay();
	    });
	      

	    // Actions
	    function updateDisplay() {
	        var isChecked = $checkbox.is(':checked');

	        // Set the button's state
	        $widget.data('state', (isChecked) ? "on" : "off");

	        // Set the button's icon
	        $widget.find('.state-icon')
	            .removeClass()
	            .addClass('state-icon ' + settings[$widget.data('state')].icon);
	    }

	    // Initialization
	    function init() {
	        
	        if ($widget.data('checked') == true) {
	            $checkbox.prop('checkerd', !$checkbox.is(':checked'));
	        }
	        
	        updateDisplay();

	        // Inject the icon if applicable
	        if ($widget.find('.state-icon').length == 0) {
	            $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
	        }
	    }
	    init();
	});
	
	$('#get-checked-data').on('click', function(event) {
	    event.preventDefault(); 
	    var checkedItems = {}, counter = 0;
	    $("#check-list-box li.active").each(function(idx, li) {
	        checkedItems[counter] = $(li).text();
	        counter++;
	    });
	    $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
	});
}
>>>>>>> develop-frontend

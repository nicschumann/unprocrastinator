var db = require('../../../queries/queries.js');

$(document).ready(function () {
    $("#login_button").click(function (event) {
        event.preventDefault();
        var user = {
            "email": $("#email").val(),
            "password": $("#password").val()
        };
        db.log_in(user, function (error, user_id) {
            if (!error) {
                sessionStorage.user_id = user_id;
                window.location.href = "/test/user";
            }
        });
    });

    $("#create_user_button").click(function (event) {
        event.preventDefault();
        var username = prompt("Enter a username: ");
        var user = {
            "email": $("#email").val(),
            "password": $("#password").val(),
            "username": username
        };
        db.add_user(user, function (error, user_id) {
            if (!error) {
                sessionStorage.user_id = user_id;
                window.location.href = "/test/user";
            }
        });
    });

    function display_user_info() {
        db.get_user(sessionStorage.user_id, function (error, user) {
            if (!error) {
                var info = "Username: " + user.username + "&nbsp;&nbsp; | &nbsp;&nbsp;"
                         + "Email: " + user.email + "&nbsp;&nbsp; | &nbsp;&nbsp;"
                         + "User ID: " + sessionStorage.user_id;
                $("#user_account_label").html(info);
            }
        });
    }

    display_user_info();

    $("#log_out").click(function (event) {
        event.preventDefault();
        db.log_out(function (error) {
            if (!error) {
                window.location.href = "/test/login";
            }
        });
    });

    function update_task_list() {
        function parseDate(date_value) {
            var date = new Date(date_value);
            var month = date.getMonth() + 1; // js is ridiculous.
            return month + "-" + date.getDate() + "-" + date.getFullYear();
        }
        db.get_user_tasks(sessionStorage.user_id, function (error, tasks) {
            if (!error) {
                tasks_html = "<tr><th>Name</th><th>Category</th><th>Tags</th><th>Progress</th><th>Due Date</th><th>Action</th></tr>";
                for (var task_id in tasks) {
                    if (tasks.hasOwnProperty(task_id)) {
                        var task = tasks[task_id];
                        var remove_button = "<button class='remove' id=" + task_id + " > delete </button>";
                        tasks_html += "<tr> <td>" + task.name
                                    + " </td><td> " + task.category
                                    + " </td><td> " + task.tags.join(" | ")
                                    + " </td><td> " + task.progress + "%"
                                    + " </td><td> " + parseDate(task.due_date)
                                    + " </td><td> " + remove_button
                                    + "</td></tr>";
                    }
                }
                $("#task_list").html(tasks_html);
                $(".remove").each(function(i, button) {
                    $(button).click(function (event) {
                        var task_id = $(this).attr("id");
                        db.remove_task_from_user(sessionStorage.user_id, task_id, function (error) {
                            if (!error) {
                                update_task_list();
                            }
                        });
                    });
                });
            }
        });
    }

    update_task_list();

    $("#add_task").click(function (event) {
        event.preventDefault();
        var task = {
            "name": $("#task_name").val(),
            "progress": 0,
            "due_date": new Date($("#due_date").val()).getTime(),
            "tags": $("#tags").val().split(/,\s*/),
            "category": $("#category").val()
        };
        db.add_task_to_user(sessionStorage.user_id, task, function (error, task_id) {
            if (!error) {
                update_task_list();
                $("input").val("");
            }
        });
    });

});

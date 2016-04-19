# Database Documentation

## How to use

You will need to use our public google account unprocrastinatordb@gmail.com for the Firebase. (Somehow, you need to sign in this account before sign in Firebase.) Run node main.js.

If you want to use your personal Firebase account, you need to:

1.  Replace the app url.
2.  Replace Security & Rules with content in queries/rules.json.

In main.js, there are some terrible test code.

## Datatypes

``` javascript
{
    Users: {
        $user_id {
            email: String,
            password: String,
            username: String,
            tasks: [task_id]
        }
    },
    Tasks: {
        $task_id {
            name: String,
            user: uid,
            progress: Number in [0, 100],
            category: String,
            tags: [String]
        }
    }
}
```

## Database API

``` javascript
function add_user (user: User) -> UID
```

Add user to the database. `username` and `tasks` properties are optional. This method will not automatically log this user in.

``` javascript
function log_in (user: User) -> UID
function log_out (user: User) -> Void
```

User needs to log in before doing any modification to his/her account or tasks.

``` javascript
function get_user (user_id: UID) -> User
```

``` javascript
function change_email (old_email: String, new_email: String, password: String) -> Void
function change_password (email, old_password, new_password) -> Void
```
`email` and `password` are keys for authenticating users. I made dedicated method for changing them.

``` javascript
function patch_user(user_id: UID, user_object: UserObject) -> Void
```
Use this method for patching anything else.

``` javascript
function delete_user(user_id: UID, user: UserObject) -> Void
```

This method will delete the entire user account and his/her tasks.

``` javascript
function add_task_to_user(user_id: UID, task: TaskObject) -> TaskId
```

Since `user_id` is also passed in, `user` property in task is optional.

``` javascript
function add_task_to_user(user_id: UID, task: TaskObject) -> TaskId
function patch_task_for_user(task_id: TaskID, task_object: TaskObject) -> Void
function remove_task_from_user(user_id: UID, task_id: TaskID) -> Void
```
Basic task adding/patching/deleting.

``` javascript
function get_user_tasks(user_id: UID) -> {TaskID : Task}
function get_user_tags(user_id: UID) -> {String}
```
Return all the tasks or tags owned by a user.

``` javascript
function get_task_by_category(user_id: UID, category: String) -> [Task]
function get_task_by_tags(user_id: UID, tags: [String]) -> [Task]
```
Two methods for filtering tasks by category or tags.

## Rules

The database also enforces some constraints to the data, such like:
-   Users can only write into his/her own account.
-   Progress can only be number from 0 to 100.

I am still figuring this out. If you encounter errors like "Permission Denied", please check if you have logged in properly.

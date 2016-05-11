# Unprocrastinator

Emily Horing (```ehoring```), Jenny Lee (```jl148```), Jina Yoon (```jy101```), Martha Edwards (```mkedward```), Nic Schumann (```nschuman```), Ziyuan Chen (```zchen24```).

## Handin!

Hi Everyone,

The file you are looking at is the README for our project. The project uses a lot of dependencies, including globally installed javascript compilation scripts and  CSS preprocessor scripts. You can read about how these tools were used below. Installing the tools can be a bit of a headache, so instead of handing in the project, having you install all the dependencies (and their dependencies), and then building the project yourself and running locally, we thought we'd just provide you with 3 links.


1. [live heroku app](http://unprocrastinator.herokuapp.com) – This is the live application, which you can play with.

2. [github repository](http://github.com/nicschumann/unprocrastinator) – This is the project's github repository. You can browse the source code here. Most of the interesting work happens in ```static/javascript``` and ```queries```. The server itself, which is insanely minimal, lives in ```router.js```.

3. [final report](https://docs.google.com/document/d/19uGloGuMyR024V_m6vM_PHlFRA4iEAfp7oWiy0q-DiE/pub). This is our final report, as a google drive document. 

That should be all you need! If you feel like you need more information, or want to get the project running locally, or generally have other questions, please email the group at **our-cs-logins-listed-above** ```@``` **cs** ```.``` **brown** ```.``` **edu**.

Thanks!

## Simple Front End

We've build a basic server that can be used for debugging and playing with the basic task-tracking and authentication functions. Here's how to get up and running with that.

1. Run ```npm install``` or ```sudo npm install``` if you're not a sudoer on your computer by default. This will fetch down all of the libraries and dependencies for the project.

2. Run ```make build-test``` to compile and package the client-side database scripts. This needs to happen so that we can embed the database and nodejs specific programs in a browser-friendly manner. Under the hood, this uses a tool called ```browserify``` which does a nice job converting a node program into a vanilla javascript program.

3. Run ```node main.js``` this will start a server on port ```8080``` .

The core methods for interacting with the firebase are located at ```queries/queries.js```. The front end code that interacts with the html, and uses the queries is located at ```static/javascript/main.js```, and gets compiled to the file at ```static/javascript/bundle.js```. In general, we should use the term **```bundle.<filetype>```** for compiled output, and ignore that output in version control (this is why you have to run ```make build-client``` when you check the branch out). 

The actual HTML that represents the views of the test application live at ```templates/index.html``` and ```templates/landing.html```. 


## Installation

This section of the README handles installing a local, development version of this project on your local machine. The following documentation assumes you have ```node``` and ```npm``` installed locally, that you have at least a passing familiarity with ```git```, and that you're using a mac for development. If you're not using a mac, please figure out how to get this program running on your machine, and make a pull-request adding the proper steps to this document. Thanks.

You'll  also need to have ```sass```, the [css preprocessor](http://sass-lang.com) installed locally, which you can get with ```sudo gem install sass``` assuming you have ruby installed, and ```watchify```, which you can get with a simple ```npm install -g watchify``` or ```sudo npm install -g watchify``` if you get errors. Both of these tools will be used to compile front end javascript and css. We're also using livereload, which refreshes our client whenever a source file changes, which means we won't have to CMD-R all the time during development to see changes on the client – you can get that as a local tool by running ```npm install -g livereload```. If you have all that, clone this repository locally, ```cd``` into the new directory, and run ```npm install``` to install the required dependencies.

At this point you should be all set to launch the development server by running ```make serve``` at the commandline. This should start a development server running on your local machine, which you can visit at ```http://localhost:8080```.

Since this development workflow launches compilation servers as background processes, When you're done with development, you should kill the server and then run ```make stop``` at the terminal, to shut down all the background processes.

## Abstract Specification

This section of the README outlines the APIs that different segments of the application use. The APIs that we specify here are generally used to obtain references to, interact with, and safely and consistently alter application state. We'll start by outlining the different datatypes that the application manipulates, and continue by describing the **client API** (a browser-side library for interacting with the application's REST API), the **REST API** (The application's routes), and the **Database API** (a server-side library for interfacing with our [firebase](https://www.firebase.com/features.html) instance.)

*Please note that this is a living document, and we may change it as a group in the future, as we learn more.*

---

### Datatypes

---

There are three distinct datatypes, which we'll describe here. We think of all of our datatypes as structured JSON with a certain, fixed number of keys, with definite fixed types. Adding a key not present in this specification to a user is an error, as is submitting a user with a key whose type varies from its expected type.

#### Users

The user type models our application's notion of users. Each user object is identified by a unique ```UserID```, which is a uuid generated by the firebase.

```js
var User = {
	"username": String,
	"password": EncryptedString,
	"tasks": [ TaskID ],
	"tags": [ TagID ],
	"categories": [ CategoryID ],
	"avg_time": Integer,
	"task_num": Integer
}
```

#### Tasks

The task type defines what a task type means to us. Just like users, each task object is identified by a unique ```TaskID```, which is also generated by the firebase.

```js
var Task = {
	"name": String,
	"Category": CategoryID
	"subtasks": [
		{
			"name": String
			"complete": Boolean
		}
	],
	"progress": [0, 100],
	"tags": [ TagID ],
	"hours": Integer,
	"assigned_date": dateID,
	"due_date": dateID,
	"estimate": Integer,
	"complete": Boolean,
	"estimate_set": Boolean,
	"notes": String
}
```

Note that each subtask is an object with a specified form, and the progress takes values in the interval ```[0,100]``` although we're still shakey on exactly what this means.

#### Tags

Tags are a little bit simpler, but follow the same model. Each tag gets a unique ```TagID```, just like the other datatypes.


```js
var Tag = {
	"name": String,
	"total_time": Integer,
	"avg_time": Integer,
	"num_tasks": Integer
}
```

---

### APIs

---

Our application is decomposed into three different interface APIs; we'll discuss the **client API** and the **Database API** here. We'll let the **REST API** emerge dynamically out of the needs of each of these.

**Note for developers / API implementors: please update these pages in your feature-branches as you work! That way, we'll fill out a specification as we work**


#### The Client API

The Client API is implemented as a client-side javascript library for the front-end code to interact with when it needs to take an action operating on application state. The following section describes the methods implemented by the client API. Note that in the client API should always place the required contextual UsedID as the first argument to each method. Also note that each method comes in synchronous and asychronous flavors. Since each of these methods interacts with a remote service and therefore performs non-trivial IO, we should prefer the non-blocking callback method to the synchronous method. The abstract interface for the callback method is included with each method for completeness, although the synchronous version is "easier to read", in some sense. The interface for an asynchronous version of a synchronous method can be obtained from the synchronous version in a completely robotic way. If a sychronous method has interface ```f : A → B```, then the asynchronous version has interface ```f_async : A → ( (Err, B) → void ) → void```, Where the second parameter to the function is a callback expecting a potentially-null error as the first parameter and the value ```B``` as its second parameter, and the entire routine is ```void```-valued.

Further note that **all** of these methods will need to pass, implicitly or explicitly, a ```session_id``` or ```access_token``` along with the request that acts to validate that this request is acting on behalf of a certain user. For the sake of simplicity, let's refer to a pair of a ```UserID``` and an ```AccessToken``` as a ```Credential```, so that in the following ``` Credential = (UserID, AccessToken)```.



---

##### ```get_user : (Username, EncryptedPassword) → Credential```
*```get_user_async : (Username, EncryptedPassword) → ( (Err, Credential) → void ) → void```*

Given a username and a password, retrieve the user specified by that username, password pair.

---

##### ```add_user : (Username, EncryptedPassword) → Credential```
*```add_user_async : (Username, EncryptedPassword) → ( (Err, UserID) → void ) → void```*

Add a new user to the database, assuming that the username is unique in the database.

---

##### ```delete_user : UserID → User```
*```delete_user : UserID → ( (Err, User) → void ) → void```*

Remove a user from the database

---

##### ```get_tasks : Credential → [Task]```
*```get_tasks_async : UserID → ( (Err, [Task]) → void ) → void```*

Given a ```UserID```, get the list of task objects attached to that users. Consider implementing a cache for this function, to make ```get_task``` more performant.

---

##### ```get_task : (Credential, TaskID) → Task```
*```get_task_async : (UserID, TaskID) → ( (Err,Task) → void ) → void ```*

If you have a specific ```TaskID``` that you'd like to retrieve a task for, you can use this routine, which is essentially a specialization of the above.

---

##### ```get_tasks_by_tag : (Credential, TagId) → [Task]```
*```get_tasks_by_tag : (UserID, TagId) → ( (Err,[Task]) → void ) → void ```*

If you have a specific ```TagID``` that you'd like to retrieve a task for, you can use this routine, which will retrieve all tasks with respect to a certain user that have the specified tag.

---

##### ```get_tasks_by_category : (Credential, CategoryId) → [Task]```
*```get_tasks_by_category : (UserID, CategoryId) → ( (Err,[Task]) → void ) → void ```*

If you have a specific ```CategoryID``` that you'd like to retrieve a task for, you can use this routine, which will retrieve all tasks with respect to a certain user that have the specified category.

---

##### ```add_task : (Credential, Task) → TaskID```
*```get_tasks_by_tag : (UserID, Task) → ( (Err,TaskID) → void ) → void ```*

Given a ```UserID``` and a ```Task``` add a that task to the database and link it to the given user as a single transaction.

---

##### ```delete_task : (Credential, TaskID) → Task```
*```delete_task : (UserID, TaskID) → ( (Err,Task) → void ) → void ```*

Given a specific ```UserID``` and a specific ```TaskId```, drop that task from the database, and return the freshly deleted task.

---

##### ```edit_task : (Credential, TaskID, TaskObject) → Task```
*```edit_task : (UserID, TaskID, TaskObject) → ( (Err,Task) → void ) → void ```*

This routine consumes a ```TaskObject``` which is some subset of the fields required by a ```Task```, and updates that given ```TaskID``` to reflect this "patch".

---

*There are serveral more methods in the client interface, but their interfaces and functionalities should be deducable from the examples above. Please implement, and fill them in here! If there are any questions, we can resolve them as a group.*


#### The Database API

The database API provides a specific interface between the server and the firebase. It provides a public API based around resolving information on behalf of a user. We'll use the same notation as above in specifying this API. Just like the above, database API methods come in synchronous and asynchronous flavors. Just like the above, asynchronous, non-blocking methods should **always** be prefered above synchronous alternatives. That said, the synchronous alternatives are easier to read, so we lead with those. The database makes extensive use of the idea of a ```PatchObject``` which is an object which partially obeys the specification of some parent ```JSONObject```. The ```PatchObject``` represents a patch that should be applied to some parent object.

---

##### ```add_user : User → UserID```
*```add_user : User → ( (Err,UserID) → void ) → void ```*

Given an initial user object, add that object to the database, generate a unique id for that object, and return it.

---

##### ```patch_user : (UserID, UserObject) → User```
*```add_user : UserID, UserObject → ( (Err,User) → void ) → void ```*

Given a partial user object and a user id, update the fields of that user with the patch object.

---

##### ```delete_user : UserID → User```
*```add_user : UserID → ( (Err,User) → void ) → void ```*

Given a ```UserId```, delete the user specified by the given identifier.

---

##### ```add_task_to_user : UserID, Task → TaskID```
*```add_task_to_user : UserID, Task  → ( (Err,TaskID) → void ) → void ```*

This routine adds a task to a given user, and returns the task id associated with the new task.

---

##### ```remove_task_from_user : UserID, TaskID → Task```
*```add_task_to_user : UserID, TaskID  → ( (Err,Task) → void ) → void ```*

This routine deletes a task from the database, removing it from any user(s) it might be associated with, and deleting any references to it as well.

---

##### ```get_user : UserID → User```
*```get_user : UserID  → ( (Err,User) → void ) → void ```*

This routine exchanges a ```UserID``` for a ```User```.

---

##### ```patch_tasks_for_user : UserID, [(TaskID, TaskObject)] → User```
*```patch_tasks_for_user : UserID, [(TaskID, TaskObject)]  → ( (Err,User) → void ) → void ```*

This routine patches a set of the users tasks.

---

*Note that this description qualifies a public interface to the database. It also implies the existence of some private methods that manage tags and tasks specifically, and independent of a given user. The decision to hide this portion of the database's operation is an intentional choice.*

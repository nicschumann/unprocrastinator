# Unprocrastinator

Finally – an intelligent TODO application!

## Installation

This section of the README handles installing a local, development version of this project on your local machine. The following documentation assumes you have ```node``` and ```npm``` installed locally, that you have at least a passing familiarity with ```git```, and that you're using a mac for development. If you're not using a mac, please figure out how to get this program running on your machine, and make a pull-request adding the proper steps to this document. Thanks.

You'll  also need to have ```sass```, the [css preprocessor](http://sass-lang.com) installed locally, which you can get with ```sudo gem install sass``` (if you have a mac) assuming you have ruby installed, and ```watchify```, which you can get with a simple ```npm install -g watchify``` or ```sudo npm install -g watchify``` if you get errors. Both of these tools will be used to compile front end javascript and css. We're also using livereload, which refreshes our client whenever a source file changes, which means we won't have to CMD-R all the time during development to see changes on the client – you can get that as a local tool by running ```npm install -g livereload```. If you have all that, clone this repository locally, ```cd``` into the new directory, and run ```npm install``` to install the required dependencies. 

At this point you should be all set to launch the development server by running ```make serve``` at the commandline. This should start a development server running on your local machine, which you can visit at ```http://localhost:8080```.

Since this development workflow launches compilation servers as background processes, When you're done with development, you should kill the server and then run ```make stop``` at the terminal, to shut down all the background processes.

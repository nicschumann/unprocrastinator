"use strict";


var http 		= require('http');
var path 		= require('path');
var express 	= require('express');

var app 		= express();



/**
 * This is the mount point for the applications router.
 * requiring this module gives you a reference to the entirety
 * of the router. pass in a set of options that are used to configure the
 * server, and call the returned function to start the server on the 
 * port specified by options. You can optionally pass a function to
 * execute after the server has started running.
 * 
 * @param  {Object} options the set of options defined in 'config.json'
 * @return {Function} a function which, when called, starts the server
 */
module.exports = function( options ) {

	/**
	 * Build out a object containing different middleware
	 * structures to mount at different routes
	 * 
	 * @type {Object}
	 */
	var middleware 	= {
		log: require('./middleware/log')( options )
	};	 

	// at the specified static route, invoke the express static middleware
	// on the specified static source directory
	app.use( options.static.route, express.static( path.join( __dirname, options.static.directory ) ) );

	// use the logger everywhere.
	app.use( '/', middleware.log );

	// send the basic index.html when / is requested.
	app.get('/', function( req, res ) {

		res.sendFile( path.join( __dirname, 'templates', 'index.html' ) );

	});

	// =================== TESTING CODE ===============================

	/** 
	 * this is a temporary route which serves
	 * ZC's code. You can hit this endpoint to try out the basic
	 * authentication and task creation workflow.
	 */
	app.get('/test', function( req, res ) {
		res.redirect('/test/login');
	});

	/** 
	 * This page displays a login field, which will redirect you
	 * to the user page, once a you've logged in.
	 */
	app.get('/test/login', function( req, res ) {
		res.sendFile( path.join( __dirname, 'templates', 'test', 'login.html') );
	});

	/**
	 * This page serves out the user page, which renders
	 * each user's specific tasks.
	 */
	app.get('/test/user', function( req, res ) {
		res.sendFile( path.join( __dirname, 'templates', 'test', 'user.html') );
	});


	return function( continuation ) {

		app.listen( options.port, continuation );

	};

};
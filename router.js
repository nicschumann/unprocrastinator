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

	// at the specified static route, invoke the express static middleware
	// on the specified static source directory
	app.use( options.static.route, express.static( path.join( __dirname, options.static.directory ) ) );

	// send the basic index.html when / is requested.
	app.get('/', function( req, res ) {

		res.sendFile( path.join( __dirname, 'templates', 'index.html' ) );

	});

	return function( continuation ) {

		app.listen( options.port, continuation );

	};

};
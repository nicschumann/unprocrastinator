var dateFormat = require('dateformat');
var colors = require('colors');
var util = require('util');

/**
 * This module mounts a logging mechanism on each route.
 * The logger records the request data, and prints to the terminal, 
 * if the application is in debug mode.
 * 
 * Given the global options object, this module returns a middleware that
 * logs request data to the terminal.
 */
module.exports = function( options ) {
	/**
	 * This is the middleware itselfs
	 */
	var logger = function( req, res, next ) {

		if ( options.debug ) {

			console.log( 
				[

					'[ '.gray,
					dateFormat(),
					' ] - '.gray,
					req.method.cyan,
					' ',
					req.path.underline

				].join('')
			);

		}

		next();

	};

	/**
	 * This is a utility method that logs a simple message 
	 * when the server starts up.
	 */
	logger.init = function() {
		console.log( 
			[

				'[ '.gray,
				dateFormat(),
				' ] - Started server on port '.gray,
				(options.port + '').underline

			].join('')
		);
	};

	return logger;
};
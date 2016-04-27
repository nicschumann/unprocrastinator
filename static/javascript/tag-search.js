"use strict";

var $ = require('jquery');

var autocomplete = require('jquery-autocomplete');

/**
 * Given a reference to the database, this routine
 * builds an autocomplete system, using jQuery autocomplete,
 * which supplies suggested tags for a given input.
 * 
 * @param  {queries/queries.js} db a reference to the firebase.
 * @return {Function}    a function which, given an element, instantiates an autocomplete routine with it.
 */
module.exports = function( db ) {

	/**
	 * This is the actual function which attaches an autocomplete
	 * to the passed element. You can additionally pass
	 * jquery autocomplete options to customize the styling 
	 * of the dropdown, and it's behavior. If you want, you can
	 * even change the source of the autocomplete data with, the
	 * {source: Array} key. By default, this is the set of all
	 * tags associated to a user.
	 *
	 * Full documentation of the jquery autocomplete library is
	 * available [here](http://xdsoft.net/jqplugins/autocomplete).
	 * 
	 * @param  {jQuery} element input field to attach the autocomplete process to.
	 * @param  {Object} options any additional parameters you'd like to install on the autocomplete.
	 */
	return function( element, options ) {

		if ( typeof element === "undefined" ) { throw new Error("ERROR: Autocomplete needs an element to attach to!"); }

		options = options || {};

		if ( typeof sessionStorage.user_id !== "undefined" ) {

			db.get_user_tags( sessionStorage.user_id, function( err, tags ) {

				if ( err ) {

					console.log("ERROR: Couldn't attach autocomplete to the given element");

				} else {

					element.autocomplete($.extend({

						sources: tags.entries()

					}, options));

				}

			});

		} else {
			throw new Error('ERROR: Tried to attach an autocomplete instance with no logged-in user!');
		}

	};
};
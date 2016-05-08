"use strict";

var $ = require('jquery');

var getDeletedText = require('./tag-get-deleted-text');

var keyevent = 'keyup';

var stored_value = "unprocrastinator-stored-value";

var category_update = "unprocrastinator-category-update";


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
	 * reference to the tags associated with an instance 
	 * of the autocomplete framework.
	 * 
	 * @type {[Tag]}
	 */
	var TAGS = [];

	if ( typeof sessionStorage.user_id !== "undefined" ) {

		db.watch_user_categories( sessionStorage.user_id, function( err, categories ) {

			if ( err ) {

				console.log("ERROR: Couldn't attach autocomplete to the given element");

			} else {

				//console.log( categories );

				TAGS = searchableArrayFromTagSet( categories );

				$(document).trigger(category_update, TAGS);

			}

		});

	} else {

		//throw new Error('ERROR: Tried to attach an autocomplete instance with no logged-in user!');

	}

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
	 * Note, that a sessionStorage.user_id **must** be defined
	 * in order for this module to work.
	 *
	 * @todo  Make the tag list respond to new values that come in.
	 * 
	 * @param  {jQuery} element input field to attach the autocomplete process to.
	 * @param  {Object} options any additional parameters you'd like to install on the autocomplete.
	 */
	return function( element, options ) {

		if ( typeof element === "undefined" ) { throw new Error("ERROR: Autocomplete needs an element to attach to!"); }

		options = options || {};

		//$(document).on( category_update, setAutocompleteSource );

		initializeAutocomplete();

		




		/**
		 * This routine sets up the autocomplete instance, as well as the associated events.
		 * It extends the default options witht he options that are passed to the module.
		 */
		function initializeAutocomplete() {

			require('jquery-autocomplete');

			element.off( keyevent );

			element.autocomplete($.extend({

				titleKey: 'name',
				source: []

			}, options ))

			.on( 'selected.xdsoft', setCategory )

			.on( keyevent, ifKeyIsComma( manuallySetCategory ))

			.on( keyevent, recordValue );

			setAutocompleteSource( null, TAGS );

			element.focus();

		}

		/**
		 * This routine destroys the state of the current 
		 * autocomplete instance on the bound element.
		 */
		function destroyAutocomplete() {

			element.off( keyevent );

			element.autocomplete('destroy');

			element.removeClass('xdsoft_input');

		}

		/**
		 * This routine transitions the target autocomplete element 
		 * into an "autocompleted" state. In other words, this state
		 * disables autocomplete, and instantiates the correct plugins
		 * transitions to allow the user to enter a title, and submit the task.
		 * @return {[type]} [description]
		 */
		function setCategory( event, datum ) {

			destroyAutocomplete();

			if (!datum) { 

				var text = element.data( stored_value );

				element.val( 
					( text.indexOf(',') !== -1 ) ? text : [ text, ', ' ].join('') 
				);

			} else {

				element.val( [datum, ', '].join('') );

			}

			element.focus();

			element.on( keyevent, ifNoCommas( initializeAutocomplete ) );

			element.on( keyevent, ifEnterAndNonEmpty( options.post( element ) ) );

		}

		function setAutocompleteSource( event, categories ) {

			//console.log( event );
			//console.log( categories );

			element.autocomplete('setSource', TAGS );

		}


		/**
		 * recordValue persists intermediate values of the input field
		 * to the DOM to ensure that we can deal with the annoying case
		 * where you enter a new tag that's not recorded, and the input
		 * value gets replaced with "false,", which is false.
		 */
		function recordValue( ) {

			element.data( stored_value, element.val() );

		}


		/**
		 * This triggers a continuation just in case the value of
		 * our set element is not empty, and the keycode is 13 (enter).
		 * 
		 * @param  {Function} continuation the continuation to fire. This will be passed the event object.
		 */
		function ifEnterAndNonEmpty( continuation ) {
			return function( event ) {
				if ( event.keyCode === 13 ) {
					if ( element.val().split(',')[1].trim().length > 0 ) {

						continuation( event );

					}
				}
			}; 
		}

		/**
		 * This is a helper combinator that fires its 
		 * continuation just in case there are no commas remaining in the 
		 * in the text of the input box
		 * 
		 * @param  {Function} continuation the event to trigger it there are no commas. This will be passed the event object.
		 */
		function ifNoCommas( continuation ) {

			return function( event ) {

				var deletedText = getDeletedText( element, event );
				var preDeletionText = element.val();

				if ( (deletedText.match(/,/g) || []).length >= (preDeletionText.match(/,/g) || []).length  ) {

					continuation( event );

				}
			};
		}

		/**
		 * This is a helper combinator that fires its 
		 * continuation just in case the key pressed is a comma
		 * 
		 * @param  {Function} continuation the event to trigger it the keypress is a comma
		 * @return {[type]}              [description]
		 */
		function ifKeyIsComma( continuation ) {
			return function( event ) {
				if ( event.keyCode === 188 ) {
					continuation( event );
				}
			};
		} 

		/**
		 * This allows us to set a category manually by typing a comma.
		 * Basically allows for the original usecase to exist in parallel 
		 * with the upgraded one, woo.
		 * 
		 * @param  {jQueryEvent} event
		 */
		function manuallySetCategory( event ) {

			setCategory( event, element.val().substring( 0,element.val().length - 1 ) );

		}

	};
};

/**
 * given a set of tags from the database,
 * this routine formats the tag set such that the autocomplete mechanism
 * can work with them.
 * 
 * @param  {Set} set a set of tag elements.
 * @return {[Tag]}    a formatted array of tag elements.
 */
function searchableArrayFromTagSet( set ) {

	//return [ set.map]

	// return [{
	// 	data: set,
	// 	getTitle: function( data ) { console.log( data ); return data['name']; },
	// 	getValue: function( data ) { console.log( data ); return data['name']; }
	// }];


	return [ set.map( function( category ) { return category.name; } ) ];

	//return [Array.from( set.entries() ).map( function( tag_bucket ) { return tag_bucket[0]; } )];

}
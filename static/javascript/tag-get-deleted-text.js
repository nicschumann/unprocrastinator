"use strict";

var getCursorPosition = require('./tag-get-cursor-position');

module.exports = function( element, event ) {
	var position = getCursorPosition( element );
	var deleted = '';
	var val = element.val();
	if (event.which == 8) {
	    if (position[0] == position[1]) {
	        if (position[0] == 0)
	            deleted = '';
	        else
	            deleted = val.substr(position[0] - 1, 1);
	    }
	    else {
	        deleted = val.substring(position[0], position[1]);
	    }
	}
	else if (event.which == 46) {
	    var val = element.val();
	    if (position[0] == position[1]) {

	        if (position[0] === val.length)
	            deleted = '';
	        else
	            deleted = val.substr(position[0], 1);
	    }
	    else {
	        deleted = val.substring(position[0], position[1]);
	    }
	}

	return deleted;
};

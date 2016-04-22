"use strict";


var options 	= require('./config.json');
var router 		= require('./router')( options );
var init		= require('./middleware/log')( options ).init;

router( init );

STATIC_DIR 	= static

SCSS_SOURCE 	= $(STATIC_DIR)/sass/main.scss
JS_SOURCE 		= $(STATIC_DIR)/javascript/main.js

JS_TARGET 		= $(STATIC_DIR)/bundle.js
SCSS_TARGET 	= $(STATIC_DIR)/bundle.css

ENTRY_POINT	= main.js

all: serve

serve:
	sass --watch $(SCSS_SOURCE):$(SCSS_TARGET) &
	watchify $(JS_SOURCE) -o $(JS_TARGET) &
	livereload $(STATIC_DIR) &

kill: stop

stop:
	kill -9 $$(ps aux | grep -v grep | grep "livereload" | awk '{print $$2}') 
	kill -9 $$(ps aux | grep -v grep | grep "watchify" | awk '{print $$2}') 
	kill -9 $$(ps aux | grep -v grep | grep "sass" | awk '{print $$2}') 
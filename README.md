# Love2D WebPlayer
started 2012-03 ghoulsblade@schattenkind.net
demos: http://ghoulsblade.schattenkind.net/love-webplayer/
github: https://github.com/ghoulsblade/love-webplayer
infos: http://ghoulsblade.schattenkind.net/wiki/index.php/Love-WebPlayer
love-forum: https://love2d.org/forums/viewtopic.php?f=5&t=8487

## NEWS:
* 2013-05 for 100% c-lua compatibility (fully working lua string patterns etc) check out 
** campadrenalin's work on "weblua" : https://github.com/campadrenalin/weblua
** and his porting of love-webplayer to it in the weblua branch : https://github.com/ghoulsblade/love-webplayer/tree/weblua


goal : play games made for love2d inside the browser without plugins (webgl+javascript capable browser required)
usage: unpack .love file (rename to .zip), add the .js files and the index.html from love-webplayer, upload the whole folder to webserver, open in browser, play
tech : webgl for display, github.com/mherkender/lua.js to run lua code in javascript

love2d is a lua based 2d game engine : http://love2d.org/ 
lua-parser.js is a lua interpreter/converter in javascript from https://github.com/mherkender/lua.js (added LuaBootStrap call)
Box2dWeb-2.1.a.3.min.js is a javascript port of the Box2D engine from http://code.google.com/p/box2dweb/

### Not-Yet-Implemented (incomplete list) 
* love 0.8 api (currently webplayer is mostly for 0.7, to test some 0.8 stuff add to index.html : <body onload="Love_Enable_Experimental_080(); ...>
* spritebatch,framebuf
* love.physics/box2d  (started usign Box2dWeb)
* font truetype/ttf loading (rasterizer), pixelfonts should work  (except a few special cases in text formatting/wrapping)
* network/luasocket
* love.thread
* love.sound sounddata/decoder stuff. audio itself should work, but is troublesome in some browsers, notably firefox (html5 audio)
* love.timer.sleep : not possible in js, would lead to browser hang in most browsers
* love.imagedata (load-from-file + imgdata.paste + graphics.newImage(imgdata) works, but not decoding, etc)
* love.filesystem stuff (some of it already works, but only if "localstorage" is available in the browser, stored in cookies or sth)
* debug.stacktrace and useful stacktraces on error in general (i recommend testing in native love first and if the problem is webplayer only litter the code with lots of print("pos01") to narrow it down)
* complex string matching pattern, especially balanced braces (e.g. xml parsers, see below)
* screensize wrong (-1,-1) during love.load : love.graphics.getWidth()/getHeight()
* raw sound/audio editing : love.sound.newSoundData etc

### Known Issues : 
* audio : music formats .xm and .mod not supported by browsers usually
* 404 warning in webconsole when using "require somemodule", you can safely ignore this, this is just the only way javascript can do a file-exists check for the module loading behavior of require
* __(TODO)__ workaround for 404 : call LoveFileList('filelist.txt') in index.html body onload to enable love.filesystem.enumerate
* images have to be listed in index.html onLoad call for preloading, otherwise .width/.height access can return 0, and it's not possible in chrome+firefox to pause running code without changing code-structure to callback
* ticket/issue at lua.js github : https://github.com/mherkender/lua.js/issues/5
* parser bug : clouds demo : parse error in keypressed :  >> love.filesystem.load("main.lua")() << (already fixed for some generic cases) workaround : >> (love.filesystem.load("main.lua"))() <<
* parser NotImplemented : string.format("%d",5),debug.backtrace,coroutines,...
* firefox(11) is known to have issues with sound: lag,delay..   chrome (18.0.1025.151) works better for me on ubuntu 11.04 (2012-04)
* doesn't work with file:// url for some reason. so you need to upload stuff to a webserver to try, php and similar isn't needed.
* when changing lua files, be sure to clear browser cache to see your changes, pressing f5 is not enough since it doesn't refresh dynamically loaded files like the .lua ones
* lua string patterns aren't fully convertible to javascript regexp, so while most string patterns should work, more complex ones (like xml parsers) might fail
** if you need this for maploading or similar i'd recommend working around that by serialize the loaded table as .lua file
* functions not allowed as table key
* table with key-type=obj tends to slow down if inserted/deleted a lot every frame, usage of js:splice in lua-parser might be bad? further testing needed, example devmania2012veh pre 2012-10-12

### Web api available:
* if (love.web) then ... end
* love.web.javascript("jsfun()")
* if (string.find(love.web.getAgent(),"MSIE")) then ...mp3... else ...ogg... end
* love.web.setMaxFPS(99) -- default 60, stepper interval
* love.web.showPreCompiledJS("map.lua") -- shows a html textbox with the lua file converted to javascript, useful for loading big (several mb) files in firefox without parser hang, see ludumdare201204 for example
* if (love.web.browserIsFirefox() or love.web.browserIsChrome()) then ... end

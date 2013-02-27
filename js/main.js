var kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G = null; // the big lua _G containing lua global vars
var gMyTicks = MyGetTicks();
var gSecondsSinceLastFrame = 0;
var gMaxHTMLConsoleLines = 10;
var gLoveExecutionHalted = false; // stop at first fatal error
var gLastLoadedLuaCode;
var gPreloadImages = {};
var gMainRunAfterPreloadFinished = false;
var GamepadState = false;
var gLoveConf = false;
var gScreenWidth = 800;
var gScreenHeight = 600;
var gNotImplementedAlreadyPrinted = {};
var gWebGLCanvasId = "glcanvas";
var LuaNil = [];
var LuaNoParam = [];
var gEnableLove080 = false;
var kProfileReportIfTimeAbove = 1*1000; ///< msec
var kProfileReportIfTimeAbove = 0.1*1000; ///< msec
var gCanvasElement;

function lua_precompile (code) { 
	// >>> love.filesystem.load("test.print.myvar.lua")() <<< ->  >>> (love.filesystem.load("test.print.myvar.lua"))() <<<
	code = code.replace(/(love.filesystem.load)\(([^\)]*)\)[ \t]*\(\)/g,"($1($2))()");
	//~ code = code.replace(/([\w\.]+)\(([^\)]*)\)\(\)/g,"($1($2))()");
	return code;
}

_lua_load_orig = lua_load; 
// overwrite original lua_load for precompile fixes
lua_load = function (chunk, chunkname) { return _lua_load_orig(lua_precompile(chunk), chunkname); }


/// output in html, for fatal error messages etc, also users that don't have webdev console open can see them
function MainPrintToHTMLConsole () {
	if (gMaxHTMLConsoleLines == 0) return;
	--gMaxHTMLConsoleLines;
	try {
		console.log.apply(console, arguments); // javascript console, e.g. firefox
	} catch (e) {
		// do nothing
	}
	var element = document.getElementById('output');
	if (!element) return; // perhaps during startup
	element.innerHTML += "<br/>\n";
	for (var i = 0; i < arguments.length; ++i) element.innerHTML += String(arguments[i]) + " ";
	element.innerHTML += "<hr/>\n";
	if (gMaxHTMLConsoleLines == 0) element.innerHTML += "<br/>\n...";
}

/// debug output (usually just on webdev console)
function MainPrint () {
	if (kUseHTMLConsole) {
		var element = document.getElementById('output');
		if (!element) return; // perhaps during startup
		element.innerHTML += "<br/>\n";
		for (var i = 0; i < arguments.length; ++i) element.innerHTML += String(arguments[i]) + " ";
	} else {
		try {
			console.log.apply(console, arguments); // javascript console, e.g. firefox
		} catch (e) {
			// do nothing
		}
	}
}

/// dummy/stub for love api functions that haven't been implemented yet
function NotImplemented (name) { 
	if (!gNotImplementedAlreadyPrinted[name]) {
		gNotImplementedAlreadyPrinted[name] = true;
		MainPrint("NotImplemented:"+String(name)); 
	}
	return LuaNil; 
}

/// enable experimental love 0.8.0 api support (mari0 testing)
function Love_Enable_Experimental_080 () {
	gEnableLove080 = true;
}


function LuaOverrideLibs () {
	//~ string.match (s, pattern [, init])
	//~ Looks for the first match of pattern in the string s. If it finds one, then match returns the captures from the pattern; otherwise it returns nil. 
	//~ If pattern specifies no captures, then the whole match is returned. 
	//~ A third, optional numerical argument init specifies where to start the search; its default value is 1 and may be negative. 
	//~ lua_libs["string"]["match"] = function (s,pattern,init) {} -- idea: hard to transform regexp, try porting c code? 

	//~ arr=s.match(regexp) apply regexp
	//~ s2 = s.replace(regexp,replace_txt) apply regexp and replace
	//~ pos = s.search(regexp) search with regexp  : return -1 if not found, otherwise pos of first match
	//~ slice() get part of a string
	// s.indexOf(char_or_string,optional_startindex) == -1
	// http://de.selfhtml.org/javascript/objekte/regexp.htm
	// luanote : set : a single character class followed by `-´, which also matches 0 or more repetitions of characters in the class. Unlike `*´, these repetition items will always match the shortest possible sequence; 
	// luanote : %bxy, where x and y are two distinct characters; such item matches strings that start with x, end with y, and where the x and y are balanced. This means that, if one reads the string from left to right, counting +1 for an x and -1 for a y, the ending y is the first y where the count reaches 0. For instance, the item %b() matches expressions with balanced parentheses. 
	
	// probably best to 
	
	
	//~ lua_libs["string"]["find"] = function (s,pattern,init) { ... }
	
	//~ Returns an iterator function that, each time it is called, returns the next captures from pattern over string s.
	//~ If pattern specifies no captures, then the whole match is produced in each call.
	//~ lua_libs["string"]["gmatch"] = function (s, pattern) { return NotImplemented("string.gmatch"); }
	//~ lua_libs["string"]["gsub"] = function (s, pattern) { return NotImplemented("string.gsub"); }
}

/// called after lua code has finished loading and is about to be run, where environment has already been setup
/// when calling the result from lua_load, LuaBootStrap is exectuted between lua environment setup and the parsed code


function LuaBootStrap (G) {
	//~ G.bla = (G.bla ? G.bla : 0) + 1; // check if G is preserved across multiple load_chunks
	//~ MainPrint("LuaBootStrap called "+G.bla);
	if (G.str['love'] != null) return; // bootstrap already done
	G.str['love'] = lua_newtable();
	
	if (gEnableLove080) {
		// const int VERSION_MAJOR = 0; const int VERSION_MINOR = 8; const int VERSION_REV = 0;
		G.str['love'].str['_version_major'] = 0; // 0.8.0 ... 0? or 8?
		G.str['love'].str['_version_minor'] = 8;
		G.str['love'].str['_version_rev'] = 0;
	}
	
	// callback defaults
	// note : could maybe be done by lua_libs['love']['load'] = ...
	G.str['love'].str['load']		= function () {};
	G.str['love'].str['draw']		= function () {};
	G.str['love'].str['update']		= function () {};
	G.str['love'].str['focus']	= function () {};
	G.str['love'].str['joystickpressed']	= function () {};
	G.str['love'].str['joystickreleased']	= function () {};
	G.str['love'].str['keypressed']	= function () {};
	G.str['love'].str['keyreleased']	= function () {};
	G.str['love'].str['mousepressed']	= function () {};
	G.str['love'].str['mousereleased']	= function () {};
	G.str['love'].str['quit']	= function () {};
	G.str['table'].str['getn']	= function (t) { return [lua_len(t)]; }; ///< table.getn for backwards compatibility
	
	// register love api functions
	Love_Audio_CreateTable(G);
	Love_Event_CreateTable(G);
	Love_Filesystem_CreateTable(G);
	Love_Font_CreateTable(G);
	Love_Graphics_CreateTable(G);
	Love_Image_CreateTable(G);
	Love_Joystick_CreateTable(G);
	Love_Keyboard_CreateTable(G);
	Love_Mouse_CreateTable(G);
	Love_Physics_CreateTable(G);
	Love_Sound_CreateTable(G);
	Love_Thread_CreateTable(G);
	Love_Timer_CreateTable(G);
	Love_Web_CreateTable(G); // web api
	
	// replace default lua.js require
	// could also be done by lua_core["require"] = function () {...}
	G.str['require'] = function (path) {
		// builtin libs
		if (path == "socket.http") { return LoveRequireSocketHTTP(); }
		
		// path transformations
		if (path.substr(-4) == ".lua") path = path.slice(0, -4); // require automatically appends .lua to the filepath later, remove it here
		path = path.replace(/\./g, "/");
		
		var initpath = path+"/init.lua"; // require("shaders") -> shaders/init.lua 
		if (LoveFS_exists(initpath)) 
				return RunLuaFromPath(initpath);
		else	return RunLuaFromPath(path + ".lua"); // require("bla") -> bla.lua
		
		//~ NOTE: replaces parser lib lua_require(G, path);
	};
	G.str['dofile'] = function (path) {
		return RunLuaFromPath(path);
	};
}

/// init lua api
function Love_Web_CreateTable (G) {
	var t = lua_newtable();
	G.str['love'].str['web'] = t;
	t.str['javascript']		= function (code) { return [eval(code)]; }
	
	/// e.g. if (string.find(love.web.getAgent(),"MSIE")) then ...mp3... else ...ogg... end
	t.str['checkGLError']		= function (msg) { MyCheckGLError(msg); return LuaNil; }
	t.str['getAgent']		= function (code) { return [navigator.userAgent]; }
	t.str['setMaxFPS']		= function (fps) { MainPrint("obsolete: love.web.setMaxFPS"); }
	t.str['showPreCompiledJS']	= function (path) { showPreCompiledJS(path); }
	t.str['browserIsFirefox']	= function () { return [gAgent_Firefox]; }
	t.str['browserIsChrome']	= function () { return [gAgent_Chrome]; }
	
	//~ -- firefox browser= Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:11.0) Gecko/20100101 Firefox/11.0 @ http://localhost/love-webplayer/js/lua-parser.js:19
	//~ -- chromium browser= Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Ubuntu/11.04 Chromium/18.0.1025.151 Chrome/18.0.1025.151 Safari/535.19
	
	gAgent_Firefox = navigator.userAgent.indexOf("Firefox") != -1;
	gAgent_Chrome = navigator.userAgent.indexOf("Chrome") != -1;
	MainPrint("browser: firefox,chrome=",gAgent_Firefox,gAgent_Chrome);
}


function showPreCompiledJS (path) {
	var element = document.getElementById('output');
	if (!element) { MainPrint("showPreCompiledJS: output not found"); return; } // perhaps during startup
	var areaid = "precompile_out";
	element.innerHTML += encodeURI(path)+"<br/>";
	element.innerHTML += "<textarea id='"+areaid+"' style='width:80%;height:100px'/>\n";
	var element = document.getElementById(areaid);
	if (!element) { MainPrint("showPreCompiledJS: textarea not found"); return; } // perhaps during startup
	
	// load lua
	gLastLoadedLuaCode = false;
	MyProfileStart("RunLuaFromPath:download:"+path);
	UtilAjaxGet(path,function (luacode) { gLastLoadedLuaCode = luacode; },true);
	var luacode = gLastLoadedLuaCode;
	
	// parse&compile to js
	if (luacode != null) {
		luacode = lua_precompile(luacode);
		var jscode = "";
		
		jscode += "// precompiled lua-js code for "+path+", run with:\n";
		jscode += "// if (MyPreCompiledJS) MyPreCompiledJS();\n";
		jscode += "// or similar\n";
		jscode += "function MyPreCompiledJS() {\n" +
		lua_parser.parse(luacode) + "\n" +
		"  return G;\n" +
		"};\n"
		
		// write to textarea
		element.value = jscode;
	}
	//~ MainPrint("showPreCompiledJS: code written");
}

// require "shaders"  mari0 main.lua... might be shaders/init.lua ? file_exists()
function LoveRequireShaders () {
	NotImplemented('require("shaders")');
	return LuaNil;
}

// http = require("socket.http")
function LoveRequireSocketHTTP () {
	NotImplemented('require("socket.http")');
	var t = lua_newtable()
	var pre = "http.";
	t.str['request'] = function () { return NotImplemented(pre+'request'); };
	// http.request("http://bla")
	return [t];
}

/// synchronous ajax to get file, so code executed before function returns
function RunLuaFromPath (path, safe) {
	if (gLoveExecutionHalted) return;
	if (!lua_parser) {
		throw new Error("Lua parser not available, perhaps you're not using the lua+parser.js version of the library?");
	}

	//~ MainPrint("RunLuaFromPath "+path);
	try {
		// download code via synchronous ajax... sjax? ;)
		gLastLoadedLuaCode = false;
		MyProfileStart("RunLuaFromPath:download:"+path);
		UtilAjaxGet(path,function (luacode) { gLastLoadedLuaCode = luacode; },true);
		MyProfileEnd();
		var luacode = gLastLoadedLuaCode;
		
		// check if download worked
		if ((typeof luacode) != "string") { throw String("RunLuaFromPath failed '"+path+"' : type="+(typeof luacode)+" val="+String(luacode)); }
	
		// construct temporary function name containing filepath for more useful error messages
		var temp_function_name = "luatmp_"+path.replace(/[^a-zA-Z0-9]/g,"_");
		
		MyProfileStart("RunLuaFromPath:parse:"+path);
		var myfun = lua_load(luacode,temp_function_name); // parse code
		MyProfileStart("RunLuaFromPath:run:"+path);
		var res = myfun(); // run code, returns _G
		MyProfileEnd();
		return res;
	} catch (e) {
		MyProfileEnd();
		// error during run, display infos as good as possible, lua-stacktrace would be cool here, but hard without line numbers
		if (!safe)
			LoveFatalError("error during "+path+" : "+String(e)+" :\n"+PrepareExceptionStacktraceForOutput(e)); 
	}
}

/// format the exception stacktrace to be a bit readable in html output
function PrepareExceptionStacktraceForOutput (e) {
	var txt = e.stack ? e.stack : "";
	txt = txt.replace(/@/g,"<br/>\n@");
	return txt;
}

/// halt execution and display error message
function LoveFatalError (msg) {
	gLoveExecutionHalted = true;
	MainPrintToHTMLConsole(msg); 
}

/// execute love callback function, catch any error message and display in html so people can see without webdev console  (blue love error screen)
function call_love_callback_guarded (callbackname,fargs) {
	if (gLoveExecutionHalted) return;
	if (!G) return;
	try {
		return lua_call(G.str['love'].str[callbackname],fargs);
	} catch (e) {
		LoveFatalError("error during love."+callbackname+"("+String(fargs)+") : "+String(e)+" :\n"+PrepareExceptionStacktraceForOutput(e));
	}
}

function call_lua_function(name, fargs)
{
	if (gLoveExecutionHalted)
		return;
	if (!G)
		return;

	try
	{
		var parts = name.split(".");
		var func = G;
		for (part in parts)
		{
			func = func.str[parts[part]];
			if (!func)
				throw "Function not found";
		}
		return lua_call(func, fargs);
	}
	catch (e)
	{
		LoveFatalError("Error during "+name+"("+String(fargs)+") : "+String(e)+" :\n"+PrepareExceptionStacktraceForOutput(e));
	}
}

function call_lua_function_safe(name, fargs)
{
	if (gLoveExecutionHalted)
		return;
	if (!G)
		return;

	try
	{
		var parts = name.split(".");
		var func = G;
		for (part in parts)
		{
			func = func.str[parts[part]];
			if (!func)
				return;
		}
		return lua_call(func, fargs);
	}
	catch (e)
	{
		LoveFatalError("Error during "+name+"("+String(fargs)+") : "+String(e)+" :\n"+PrepareExceptionStacktraceForOutput(e));
	}
}

// love main callbacks, if you call them, please use these helpers for easier maintenance,error handling etc
function call_love_load				(cmdline_args)		{ return call_love_callback_guarded('load',[cmdline_args]); }	// This function is called exactly once at the beginning of the game.
function call_love_draw				()					{ return call_love_callback_guarded('draw',LuaNoParam); }	// Callback function used to draw on the screen every frame.
function call_love_update			(dt)				{ return call_love_callback_guarded('update',[dt]); }	// Callback function used to update the state of the game every frame.
//function call_love_focus			(bHasFocus)			{ return call_love_callback_guarded('focus',[bHasFocus]); }	// Callback function triggered when window receives or loses focus.
//function call_love_joystickpressed	(joystick, button)	{ return call_love_callback_guarded('joystickpressed',[joystick, button]); }	// Called when a joystick button is pressed.
//function call_love_joystickreleased	(joystick, button)	{ return call_love_callback_guarded('joystickreleased',[joystick, button]); }	// Called when a joystick button is released.
//function call_love_keypressed		(key, unicode)		{ return call_love_callback_guarded('keypressed',[key, unicode]); }	// Callback function triggered when a key is pressed.
//function call_love_keyreleased		(key)				{ return call_love_callback_guarded('keyreleased',[key]); }	// Callback function triggered when a key is released.
//function call_love_mousepressed		(x, y, button)		{ return call_love_callback_guarded('mousepressed',[x, y, button]); }	// Callback function triggered when a mouse button is pressed.
//function call_love_mousereleased	(x, y, button)		{ return call_love_callback_guarded('mousereleased',[x, y, button]); }	// Callback function triggered when a mouse button is released.
//function call_love_quit				()					{ return call_love_callback_guarded('quit',[]); }	// Callback function triggered when the game is closed.
function call_love_run				()					{ return call_love_callback_guarded('run',LuaNoParam); }	// The main function, containing the main loop. A sensible default is used when left out.
function push_event(eventname, a, b, c, d)
{
	call_lua_function("love.event.push", [eventname, a, b, c, d]);
}

/// just for debug until keyboard works, index.html: <br><a href="javascript:MainButton()">MainButton()</a>
var gTestKeyDown = false;
function MainButton () {
	push_event("keypressed", " ");
	push_event("keypressed", "return");
	gTestKeyDown = true;
	window.setTimeout(function () { gTestKeyDown = false; }, 500);
	MainPrint("MainButton");
}

/// called every frame
function MainStep () {
	if (gLoveExecutionHalted) return;
	window.requestAnimFrame(MainStep, gCanvasElement);
	
//	var t = MyGetTicks();
//	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
//	gMyTicks = t;
	call_lua_function("love.timer.step", LuaNoParam);
	
	Love_Graphics_Step_Start();
	
	// only call love functions if MainStep() has finished loading
	if (G) {
		var it = call_lua_function("love.event.poll", LuaNoParam)[0];
		var ev;
		while ((ev = lua_call(it, [])))
		{
			var ev_name = ev[0];
			ev.shift();
			call_lua_function_safe("love."+ev_name, ev);
		}
		var res = call_lua_function("love.timer.getDelta", LuaNoParam);
		var dt = res[0];
		if (Gamepad.supported)
			GamepadState = Gamepad.getStates();
		
		call_love_update(dt);
		call_love_draw();
	}
	
	Love_Graphics_Step_End();
}

/// http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           return window.setTimeout(callback, 1000/60);
         };
})();

// ***** ***** ***** ***** ***** profiling

var gProfileTitle;
var gProfileStartT;
/// measure time and report what takes long
function MyProfileStart (title) {
	MyProfileEnd();
	gProfileTitle = title;
	gProfileStartT = MyGetTicks();
}
function MyProfileEnd () {
	if (!gProfileTitle) return;
	var dt = MyGetTicks() - gProfileStartT;
	if (dt >= kProfileReportIfTimeAbove) MainPrint("profile:"+dt+" msec: "+gProfileTitle);
	gProfileTitle = null;
	gProfileStartT = null;
}

// ***** ***** ***** ***** ***** MainOnLoad etc

function GetPreLoadedImage (url) { return gPreloadImages[url]; }

/// called on html-body onload event
function MainOnLoad (preload_image_list) {
	if (kDefaultImageFontURL) { if (!preload_image_list) preload_image_list = []; preload_image_list.push(kDefaultImageFontURL); } // preload default image font if available for this host
	if (preload_image_list && preload_image_list.length > 0) {
		// preload images before starting, MainRunAfterPreloadFinished() will be called when all are done loading
		for (k in preload_image_list) {
			var url = preload_image_list[k];
			//~ MainPrint("preload image:"+url);
			var img = new Image();
			gPreloadImages[url] = img;
			img.myurl = url; // img.src might be transformed to absolute path etc, so keep this as array-key
			img.onload = function() { PreLoadImageFinishOne(this.myurl); }
		}
		for (k in preload_image_list) {
			var url = preload_image_list[k];
			gPreloadImages[url].src = url; // start loading here after the list has been filled in case of instant .onload call
		}
	} else {
		// no preload list available, start immediately
		MainRunAfterPreloadFinished();
	}
}

function PreLoadImageFinishOne (url) {
	//~ MainPrint("preload image finished:"+url);
	for (k in gPreloadImages) if (k != url && !gPreloadImages[k].complete) return; // still more to do
	if (gMainRunAfterPreloadFinished) return; // only call once
	gMainRunAfterPreloadFinished = true;
	MainRunAfterPreloadFinished(); // preload for all images finished
}

function MainRunAfterPreloadFinished () {
	Love_Audio_Init();
	Love_Graphics_Init();
	Love_Mouse_Init();
	// additional init functions should be called here
	
	LuaOverrideLibs();
	G = lua_load("", "stub")();
	RunLuaFromPath("conf.lua", true); // run conf.lua
	gLoveConf = lua_newtable2({
		title: "Untitled",
		author: "Unnamed",
		version: "0.7.2",
		screen: lua_newtable2({
			width: 800,
			height: 600,
			fullscreen: false,
			vsync: true,
			fsaa: 0,
		}),
		modules: lua_newtable2({
			event: true,
			keyboard: true,
			mouse: true,
			timer: true,
			joystick: true,
			image: true,
			graphics: true,
			audio: true,
			physics: true,
			sound: true,
			font: true,
			thread: true,
		}),
		console: false,
		identity: false,
	});
	call_lua_function_safe("love.conf", [gLoveConf]);
	if (gLoveConf.str["screen"])
	{
		var screen = gLoveConf.str["screen"].str;
		call_lua_function("love.graphics.setMode",
				[screen.width, screen.height, screen.fullscreen,
				screen.vsync, screen.fsaa]);
	}
	call_lua_function("love.graphics.setCaption", [gLoveConf.str["title"] || "LÃ–VE-webplayer"]);
	var identity = gLoveConf.str["identity"];
	if (!identity)
		identity = document.location.pathname; // Base it on url
	call_lua_function("love.filesystem.setIdentity", [identity]);
	RunLuaFromPath("main.lua"); // run main.lua
	MyProfileStart("love.load");
	call_love_load(); // call love.load()
	MyProfileEnd();
	
	// call MainStep() every frame, see: http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
	gCanvasElement = document.getElementById(gWebGLCanvasId);
	MainStep(); // draw first frame, will use requestAnimFrame for further frames
}

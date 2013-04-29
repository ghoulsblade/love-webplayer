// First of all, initialize the Lua module here.
Lua.initialize();

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
var LuaNil = [null];
var LuaNoParam = [];
var gEnableLove080 = false;
var kProfileReportIfTimeAbove = 1*1000; ///< msec
var kProfileReportIfTimeAbove = 0.1*1000; ///< msec
var gCanvasElement;

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


/// called after lua code has finished loading and is about to be run, where environment has already been setup
/// when calling the result from lua_load, LuaBootStrap is exectuted between lua environment setup and the parsed code


function LuaBootStrap () {
	if (Lua.eval('love == nil') == [false]) return; // bootstrap already done
	var love_module = {};
	
	if (gEnableLove080) {
		// const int VERSION_MAJOR = 0; const int VERSION_MINOR = 8; const int VERSION_REV = 0;
		love_module['_version_major'] = 0; // 0.8.0 ... 0? or 8?
		love_module['_version_minor'] = 8;
		love_module['_version_rev']   = 0;
	}
	
	// callback defaults
	// note : could maybe be done by lua_libs['love']['load'] = ...
	love_module['load']		= function () { return LuaNil; };
	love_module['draw']		= function () { return LuaNil; };
	love_module['update']		= function () { return LuaNil; };
	love_module['focus']	= function () { return LuaNil; };
	love_module['joystickpressed']	= function () { return LuaNil; };
	love_module['joystickreleased']	= function () { return LuaNil; };
	love_module['keypressed']	= function () { return LuaNil; };
	love_module['keyreleased']	= function () { return LuaNil; };
	love_module['mousepressed']	= function () { return LuaNil; };
	love_module['mousereleased']	= function () { return LuaNil; };
	love_module['quit']	= function () { return LuaNil; };

    Lua.inject(love_module, 'love');
	
	// register love api functions
	Love_Audio_CreateTable();
	Love_Event_CreateTable();
	Love_Filesystem_CreateTable();
	//Love_Font_CreateTable();
	Love_Graphics_CreateTable();
	Love_Image_CreateTable();
	Love_Joystick_CreateTable();
	Love_Keyboard_CreateTable();
	Love_Mouse_CreateTable();
	//Love_Physics_CreateTable();
	//Love_Sound_CreateTable();
	//Love_Thread_CreateTable();
	Love_Timer_CreateTable();
	Love_Web_CreateTable(); // web api
	
	// replace default lua.js require
    console.log("Replacing require")
	Lua.inject(function (path) {
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
	}, 'require');
	Lua.inject(function (path) {
		return RunLuaFromPath(path);
	}, 'dofile');

}

/// init lua api
function Love_Web_CreateTable () {
	var web_module = {};
	web_module['javascript']		= function (code) { return [eval(code)]; }
	
	/// e.g. if (string.find(love.web.getAgent(),"MSIE")) then ...mp3... else ...ogg... end
	web_module['checkGLError']		= function (msg) { MyCheckGLError(msg); return LuaNil; }
	web_module['getAgent']		= function (code) { return [navigator.userAgent]; }
	web_module['setMaxFPS']		= function (fps) { MainPrint("obsolete: love.web.setMaxFPS"); }
	web_module['browserIsFirefox']	= function () { return [gAgent_Firefox]; }
	web_module['browserIsChrome']	= function () { return [gAgent_Chrome]; }
	
	//~ -- firefox browser= Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:11.0) Gecko/20100101 Firefox/11.0 @ http://localhost/love-webplayer/js/lua-parser.js:19
	//~ -- chromium browser= Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Ubuntu/11.04 Chromium/18.0.1025.151 Chrome/18.0.1025.151 Safari/535.19
	
	gAgent_Firefox = navigator.userAgent.indexOf("Firefox") != -1;
	gAgent_Chrome = navigator.userAgent.indexOf("Chrome") != -1;
	MainPrint("browser: firefox,chrome=",gAgent_Firefox,gAgent_Chrome);

    Lua.inject(web_module, 'web');
}


// require "shaders"  mari0 main.lua... might be shaders/init.lua ? file_exists()
function LoveRequireShaders () {
	NotImplemented('require("shaders")');
	return LuaNil;
}

// http = require("socket.http")
function LoveRequireSocketHTTP () {
	NotImplemented('require("socket.http")');
	var http_module = {};
	var pre = "http.";
	http_module['request'] = function () { return NotImplemented(pre+'request'); };
	// http.request("http://bla")
	return [http_module];
}

/// synchronous ajax to get file, so code executed before function returns
function RunLuaFromPath (path, safe) {
	if (gLoveExecutionHalted) return;
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
		// var temp_function_name = "luatmp_"+path.replace(/[^a-zA-Z0-9]/g,"_");
		
		MyProfileStart("RunLuaFromPath:run:"+path);
        Lua.cache.items = {}; // Clear cache;
		var res = Lua.exec(luacode, path);
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
    //console.log(">> love." + callbackname);
    Lua.call('love.' + callbackname, fargs);
    //console.log("<< love." + callbackname);
    /*
	if (!G) return;
	try {
		return lua_call(love_module[callbackname],fargs);
	} catch (e) {
		LoveFatalError("error during love."+callbackname+"("+String(fargs)+") : "+String(e)+" :\n"+PrepareExceptionStacktraceForOutput(e));
	}
    */
}

// love main callbacks, if you call them, please use these helpers for easier maintenance,error handling etc
function call_love_load				(cmdline_args)		{ return call_love_callback_guarded('load',[cmdline_args]); }	// This function is called exactly once at the beginning of the game.
function call_love_draw				()					{ return call_love_callback_guarded('draw',LuaNoParam); }	// Callback function used to draw on the screen every frame.
function call_love_update			(dt)				{ return call_love_callback_guarded('update',[dt]); }	// Callback function used to update the state of the game every frame.
//function call_love_focus			(bHasFocus)			{ return call_love_callback_guarded('focus',[bHasFocus]); }	// Callback function triggered when window receives or loses focus.
//function call_love_joystickpressed	(joystick, button)	{ return call_love_callback_guarded('joystickpressed',[joystick, button]); }	// Called when a joystick button is pressed.
//function call_love_joystickreleased	(joystick, button)	{ return call_love_callback_guarded('joystickreleased',[joystick, button]); }	// Called when a joystick button is released.
function call_love_keypressed		(key, unicode)		{ return call_love_callback_guarded('keypressed',[key, unicode]); }	// Callback function triggered when a key is pressed.
function call_love_keyreleased		(key)				{ return call_love_callback_guarded('keyreleased',[key]); }	// Callback function triggered when a key is released.
function call_love_mousepressed		(x, y, button)		{ return call_love_callback_guarded('mousepressed',[x, y, button]); }	// Callback function triggered when a mouse button is pressed.
function call_love_mousereleased	(x, y, button)		{ return call_love_callback_guarded('mousereleased',[x, y, button]); }	// Callback function triggered when a mouse button is released.
function call_love_quit				()					{ return call_love_callback_guarded('quit',[]); }	// Callback function triggered when the game is closed.
function call_love_run				()					{ return call_love_callback_guarded('run',LuaNoParam); }	// The main function, containing the main loop. A sensible default is used when left out.
function push_event(eventname, a, b, c, d)
{
	Lua.call("love.event.push", [eventname, a, b, c, d]);
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
	
//	var t = MyGetTicks();
//	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
//	gMyTicks = t;
	Lua.eval("love.timer.step()");
	
	Love_Graphics_Step_Start();
	
	// only call love functions if MainStep() has finished loading
	//if (Lua.eval('love == nil') == [false]) {
		var it = Lua.cache("love.event.poll()")[0];
		var ev;

		while (( ev = it() ))
		{
			var ev_name = ev[0];
            if (!ev_name) break;
			ev.shift();
			Lua.call("love."+ev_name, ev);
		}
		var res = Lua.eval("love.timer.getDelta()");
		var dt = res[0];
		if (Gamepad.supported)
			GamepadState = Gamepad.getStates();
		
		call_love_update(dt);
		call_love_draw();
	//}
	
	Love_Graphics_Step_End();
    // Only continue if no error has occurred
	window.requestAnimFrame(MainStep, gCanvasElement);
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
    LuaBootStrap();
	Love_Audio_Init();
	Love_Graphics_Init();
	Love_Mouse_Init();
	// additional init functions should be called here
	
	//LuaOverrideLibs();
	//G = lua_load("", "stub")();
	RunLuaFromPath("conf.lua", true); // run conf.lua
	gLoveConf = {
		title: "Untitled",
		author: "Unnamed",
		version: "0.7.2",
		screen: {
			width: 800,
			height: 600,
			fullscreen: false,
			vsync: true,
			fsaa: 0,
            '__handle': true,
		},
		modules: {
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
            '__handle': true,
		},
		console: false,
		identity: false,
        '__handle': true,
	};
	Lua.call("love.conf", [gLoveConf]);
	if (gLoveConf["screen"])
	{
		var screen = gLoveConf["screen"];
		Lua.call("love.graphics.setMode", [
				screen.width, screen.height, screen.fullscreen,
				screen.vsync, screen.fsaa]);
	}
	Lua.call("love.graphics.setCaption", [gLoveConf["title"] || "LÖVE-webplayer"]);
	var identity = gLoveConf["identity"];
	if (!identity)
		identity = document.location.pathname; // Base it on url
	Lua.call("love.filesystem.setIdentity", [identity]);
	RunLuaFromPath("main.lua"); // run main.lua
	MyProfileStart("love.load");
	call_love_load(); // call love.load()
	MyProfileEnd();
	
	// call MainStep() every frame, see: http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
	gCanvasElement = document.getElementById(gWebGLCanvasId);
	MainStep(); // draw first frame, will use requestAnimFrame for further frames
}

var kMainLuaURL = "main.lua";
var kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G = null; // the big lua _G containing lua global vars
var gFrameWait = 1000/40; // TODO: adjust for performance ?
var gMyTicks = MyGetTicks();
var gSecondsSinceLastFrame = 0;
var gMaxHTMLConsoleLines = 10;
var gLoveExecutionHalted = false; // stop at first fatal error
var gLastLoadedLuaCode;

/// output in html, for fatal error messages etc, also users that don't have webdev console open can see them
function MainPrintToHTMLConsole () {
	if (gMaxHTMLConsoleLines == 0) return;
	--gMaxHTMLConsoleLines;
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
function NotImplemented (name) { MainPrint("NotImplemented:"+String(name)); return []; }

/// called after lua code has finished loading and is about to be run, where environment has already been setup
/// when calling the result from lua_load, LuaBootStrap is exectuted between lua environment setup and the parsed code
function LuaBootStrap (G) {
	//~ G.bla = (G.bla ? G.bla : 0) + 1; // check if G is preserved across multiple load_chunks
	//~ MainPrint("LuaBootStrap called "+G.bla);
	G.str['love'] = lua_newtable();
	
	// callback defaults
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
	
	// replace default lua.js require
	G.str['require'] = function (path) {
		if (path.substr(-4) != ".lua") path += ".lua"; // require automatically appends .lua to the filepath
		//~ MainPrint("require "+path);
		RunLuaFromPath(path);
		//~ MainPrint("require done.");
		//~ throw ("'require' not yet implemented ("+path+")");
		//~ lua_require(G, path);
	};
}

/// synchronous ajax to get file, so code executed before function returns
function RunLuaFromPath (path) {
	if (gLoveExecutionHalted) return;
	if (!lua_parser) {
		throw new Error("Lua parser not available, perhaps you're not using the lua+parser.js version of the library?");
	}

	MainPrint("RunLuaFromPath "+path);
	try {
		// download code via synchronous ajax... sjax? ;)
		gLastLoadedLuaCode = false;
		UtilAjaxGet(path,function (luacode) { gLastLoadedLuaCode = luacode; },true);
		var luacode = gLastLoadedLuaCode;
		
		// check if download worked
		if ((typeof luacode) != "string") { throw String("RunLuaFromPath failed '"+path+"' : tyep="+(typeof luacode)+" val="+String(luacode)); }
	
		// construct temporary function name containing filepath for more useful error messages
		var temp_function_name = "luatmp_"+path.replace(/[^a-zA-Z0-9]/g,"_");
		
		var myfun = lua_load(luacode,temp_function_name); // parse code
		return myfun(); // run code, returns _G
	} catch (e) {
		LoveFatalError("error during "+path+" : "+String(e)+" : "+PrepareExceptionStacktraceForOutput(e)); 
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
		LoveFatalError("error during love."+callbackname+"("+String(fargs)+") : "+String(e)+" : "+PrepareExceptionStacktraceForOutput(e));
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
		LoveFatalError("Error during "+name+"("+String(fargs)+") : "+String(e)+" : "+PrepareExceptionStacktraceForOutput(e));
	}
}

// love main callbacks, if you call them, please use these helpers for easier maintenance,error handling etc
function call_love_load				(cmdline_args)		{ return call_love_callback_guarded('load',[cmdline_args]); }	// This function is called exactly once at the beginning of the game.
function call_love_draw				()					{ return call_love_callback_guarded('draw',[]); }	// Callback function used to draw on the screen every frame.
function call_love_update			(dt)				{ return call_love_callback_guarded('update',[dt]); }	// Callback function used to update the state of the game every frame.
//function call_love_focus			(bHasFocus)			{ return call_love_callback_guarded('focus',[bHasFocus]); }	// Callback function triggered when window receives or loses focus.
//function call_love_joystickpressed	(joystick, button)	{ return call_love_callback_guarded('joystickpressed',[joystick, button]); }	// Called when a joystick button is pressed.
//function call_love_joystickreleased	(joystick, button)	{ return call_love_callback_guarded('joystickreleased',[joystick, button]); }	// Called when a joystick button is released.
//function call_love_keypressed		(key, unicode)		{ return call_love_callback_guarded('keypressed',[key, unicode]); }	// Callback function triggered when a key is pressed.
//function call_love_keyreleased		(key)				{ return call_love_callback_guarded('keyreleased',[key]); }	// Callback function triggered when a key is released.
//function call_love_mousepressed		(x, y, button)		{ return call_love_callback_guarded('mousepressed',[x, y, button]); }	// Callback function triggered when a mouse button is pressed.
//function call_love_mousereleased	(x, y, button)		{ return call_love_callback_guarded('mousereleased',[x, y, button]); }	// Callback function triggered when a mouse button is released.
//function call_love_quit				()					{ return call_love_callback_guarded('quit',[]); }	// Callback function triggered when the game is closed.
function call_love_run				()					{ return call_love_callback_guarded('run',[]); }	// The main function, containing the main loop. A sensible default is used when left out.
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
//	var t = MyGetTicks();
//	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
//	gMyTicks = t;
	call_lua_function("love.timer.step", []);
	
	Love_Graphics_Step_Start();
	
	// only call love functions if MainStep() has finished loading
	if (G) {
		var ev;
		while ((ev = call_lua_function("love.event.poll", [])))
		{
			var ev_name = ev[0];
			ev.shift();
			call_lua_function("love."+ev_name, ev);
		}
		var dt = call_lua_function("love.timer.getDelta", [])[0];
		if (Gamepad.supported)
			GamepadState = Gamepad.getStates();
		call_love_update(dt);
		call_love_draw();
	}
	
	Love_Graphics_Step_End();
}

/// http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
if (false) {
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
}

/// called on html-body onload event
function MainOnLoad () {
	Love_Audio_Init();
	Love_Graphics_Init("glcanvas");
	// additional init functions should be called here
	
	// call MainStep() every frame
	window.setInterval("MainStep()", gFrameWait); // TODO: http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_implement_a_rendering_loop.3F
	//~ window.requestAnimFrame(MainStep); // doesn't work ?

	G = RunLuaFromPath(kMainLuaURL); // run main.lua
	call_love_load(); // call love.load()
}

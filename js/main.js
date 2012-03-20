var kMainLuaURL = "main.lua";
var kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G = null; // the big lua _G containing lua global vars
var gFrameWait = 1000/40; // TODO: adjust for performance ?
var gMyTicks = MyGetTicks();
var gSecondsSinceLastFrame = 0;

/// output in html, for fatal error messages etc, also users that don't have webdev console open can see them
function MainPrintToHTMLConsole () {
	var element = document.getElementById('output');
	if (!element) return; // perhaps during startup
	element.innerHTML += "<br>\n";
	for (var i = 0; i < arguments.length; ++i) element.innerHTML += String(arguments[i]) + " ";
}

/// debug output (usually just on webdev console)
function MainPrint () {
	if (kUseHTMLConsole) {
		var element = document.getElementById('output');
		if (!element) return; // perhaps during startup
		element.innerHTML += "<br>\n";
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
	G.str['love'] = lua_newtable();
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
}

/// execute love callback function, catch any error message and display in html so people can see without webdev console  (blue love error screen)
function call_love_callback_guarded (callbackname,fargs) {
	if (!G) return;
	try {
		return lua_call(G.str['love'].str[callbackname],fargs);
	} catch (e) {
		MainPrintToHTMLConsole("error during love."+callbackname+"("+String(fargs)+") : "+String(e)); 
	}
}

// love main callbacks, if you call them, please use these helpers for easier maintenance,error handling etc
function call_love_load				(cmdline_args)		{ return call_love_callback_guarded('load',[cmdline_args]); }	// This function is called exactly once at the beginning of the game.
function call_love_draw				()					{ return call_love_callback_guarded('draw',[]); }	// Callback function used to draw on the screen every frame.
function call_love_update			(dt)				{ return call_love_callback_guarded('update',[dt]); }	// Callback function used to update the state of the game every frame.
function call_love_focus			(bHasFocus)			{ return call_love_callback_guarded('focus',[bHasFocus]); }	// Callback function triggered when window receives or loses focus.
function call_love_joystickpressed	(joystick, button)	{ return call_love_callback_guarded('joystickpressed',[joystick, button]); }	// Called when a joystick button is pressed.
function call_love_joystickreleased	(joystick, button)	{ return call_love_callback_guarded('joystickreleased',[joystick, button]); }	// Called when a joystick button is released.
function call_love_keypressed		(key, unicode)		{ return call_love_callback_guarded('keypressed',[key, unicode]); }	// Callback function triggered when a key is pressed.
function call_love_keyreleased		(key)				{ return call_love_callback_guarded('keyreleased',[key]); }	// Callback function triggered when a key is released.
function call_love_mousepressed		(x, y, button)		{ return call_love_callback_guarded('mousepressed',[x, y, button]); }	// Callback function triggered when a mouse button is pressed.
function call_love_mousereleased	(x, y, button)		{ return call_love_callback_guarded('mousereleased',[x, y, button]); }	// Callback function triggered when a mouse button is released.
function call_love_quit				()					{ return call_love_callback_guarded('quit',[]); }	// Callback function triggered when the game is closed.
function call_love_run				()					{ return call_love_callback_guarded('run',[]); }	// The main function, containing the main loop. A sensible default is used when left out.

/// called every frame
function MainStep () {
	var t = MyGetTicks();
	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
	gMyTicks = t;
	
	Love_Graphics_Step_Start();
	
	// only call love functions if MainStep() has finished loading
	if (G) {
		var dt = gSecondsSinceLastFrame;
		call_love_update(dt);
		call_love_draw();
	}
	
	Love_Graphics_Step_End();
}

/// called on html-body onload event
function MainOnLoad () {
	Love_Audio_Init();
	Love_Graphics_Init("glcanvas");
	// additional init functions should be called here
	
	// call MainStep() every frame
	window.setInterval("MainStep()", gFrameWait);

	UtilAjaxGet(kMainLuaURL,function (luacode) {
		// code inside this callback is called when ajax asynchronous download of the lua code text has been finished
		var myfun = lua_load(luacode,"maincode"); // parse code
		try {
			G = myfun(); // run code
		} catch (e) {
			MainPrintToHTMLConsole("error during main.lua : "+String(e)); 
			return;
		}
		call_love_load(); // call love.load()
	});
}

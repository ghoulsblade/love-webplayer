var kMainLuaURL = "main.lua";
var kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G = null; // the big lua _G containing lua global vars
var gFrameWait = 1000/40; // TODO: adjust for performance ?
var gMyTicks = MyGetTicks();
var gSecondsSinceLastFrame = 0;

/// debug output
function MainPrint () {
	if (kUseHTMLConsole) {
		var element = document.getElementById('output');
		if (!element) return; // perhaps during startup
		element.innerHTML += "<br>\n" + String(arguments);
	} else {
		try {
			console.log.apply(console, arguments); // javascript console, e.g. firefox
		} catch (e) {
			// do nothing
		}
	}
}

/// when calling the result from lua_load, RobBootLoad is exectuted between lua environment setup and the parsed code
function LuaBootStrap (G) {
	//~ MyPrint("bootloader called");
	G.str['love'] = lua_newtable();
	Love_Audio_CreateTable(G);
	Love_Graphics_CreateTable(G);
}

/// called every frame
function MainStep () {
	var t = MyGetTicks();
	gSecondsSinceLastFrame = min(1,(t - gMyTicks) / 1000.0);
	gMyTicks = t;
	
	Love_Graphics_Step_Start();
	
	if (G != null) {
		var dt = gSecondsSinceLastFrame;
		lua_call(G.str['love'].str["update"], [dt]);
		lua_call(G.str['love'].str["draw"], []);
	}
	
	Love_Graphics_Step_End();
}

function MainOnLoad () {
	Love_Audio_Init();
	Love_Graphics_Init("glcanvas");
	
	window.setInterval("MainStep()", gFrameWait);

	UtilAjaxGet(kMainLuaURL,function (luacode) {
		
		var myfun = lua_load(luacode,"maincode");
		G = myfun();
		lua_call(G.str['love'].str["load"], []); 
		
		//~ lua_call(G.str['love'].str["keypressed"], [k]);
		//~ lua_call(G.str.print, [lua_concat("Hello world! This is: ", G.str._VERSION)]); 
	});
}

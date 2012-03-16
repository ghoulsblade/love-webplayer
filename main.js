kMainLuaURL = "main.lua";
kUseHTMLConsole = false; // if false, output is still visible in firefox javascript console
var G; // the big lua _G containing lua global vars

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

// when calling the result from lua_load, RobBootLoad is exectuted between lua environment setup and the parsed code
function LuaBootStrap (G) {
	//~ MyPrint("bootloader called");
	G.str['love'] = lua_newtable();
	Love_LoadAudio(G);
	Love_LoadGraphics(G);
}

function MainOnLoad () {
	UtilAjaxGet(kMainLuaURL,function (luacode) {
		
		var myfun = lua_load(luacode,"maincode");
		G = myfun();
		lua_call(G.str['love'].str["load"], []); 
		var dt = 1;
		lua_call(G.str['love'].str["update"], [dt]);
		lua_call(G.str['love'].str["draw"], []);
		
		//~ lua_call(G.str['love'].str["keypressed"], [k]);
		//~ lua_call(G.str.print, [lua_concat("Hello world! This is: ", G.str._VERSION)]); 
	});
}

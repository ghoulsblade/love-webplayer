kMainLuaURL = "main.lua";
//~ kMainLuaURL = "main-test01.lua";
var G; // the big lua _G containing lua global vars


function MyTest () {
		//~ alert("spot01");
		var base = "";
		//~ var base = "/";
		//~ var base = "file:///cavern/code/love-webplayer/";
		//~ MyAjaxGet(base+"main.lua","testfield01");
		//~ MyAjaxGet(base+"bla.txt","testfield01");
		//~ MyAjaxGet(base+"bla.xml","testfield01");
		//~ document.getElementById("testfield01").innerHTML = "blubb!";
		//~ alert("spot02");
		
		doRun2();
		//~ doRun();
}

function MyPrint (txt) {
  var element = document.getElementById('output');
  if (!element) return; // perhaps during startup
  element.innerHTML += "<br>\n" + txt;
}

// when calling the result from lua_load, RobBootLoad is exectuted between lua environment setup and the parsed code
function RobBootLoad (G) {
	MyPrint("bootloader called");
	G.str['love'] = lua_newtable();
	G.str['love'].str['audio'] = lua_newtable();
	G.str['love'].str['graphics'] = lua_newtable();
	
	// love.audio.newSource(path)
	G.str['love'].str['audio'].str['newSource']		= function (path) { MyPrint("audio.newSource called"); return lua_newtable(); }
	
	// love.audio.play(sourceobj, number)
	G.str['love'].str['audio'].str['play']			= function (src,num) { MyPrint("audio.play called"); }
	
	// love.graphics.newImage(path)
	G.str['love'].str['graphics'].str['newImage']	= function (path) { MyPrint("graphics.newImage called"); return lua_newtable(); }
	
	// love.graphics.setBackgroundColor(r,g,b)
	G.str['love'].str['graphics'].str['setBackgroundColor']	= function (r,g,b) { MyPrint("graphics.setBackgroundColor called"); }
	
	// love.graphics.setColor(r,g,b,a)
	G.str['love'].str['graphics'].str['setColor']	= function (r,g,b,a) { MyPrint("graphics.setColor called"); }
	
}

function doRun2 () {
	
	MyAjaxGetAux(kMainLuaURL,function (luacode) {
		//~ execute(result);
		MyPrint("just a test");
		
		
		var myfun = lua_load(luacode,"maincode");
		G = myfun();
		lua_call(G.str['love'].str["load"], []); 
		
		/*
		//~ MyPrint("lua_load -> type="+(typeof myfun)+" val="+String(myfun));
		lua_load -> type=function val=function maincode() { var tmp; var G = lua_newtable2(lua_core); 
			for (var i in lua_libs) { G.str[i] = lua_newtable2(lua_libs[i]); } 
			G.str.arg = lua_newtable(); 
			G.str._G = G; 
			G.str.module = function (name) {lua_createmodule(G, name, slice(arguments, 1));}; 
			G.str.require = function (name) {lua_require(G, name);}; 
			G.str.package.str.seeall = function (module) {if (!module.metatable) {module.metatable = lua_newtable();}module.metatable.str.__index = G;}; 
			RobBootLoad(G); 
			G.str.bla = 5; 
			lua_call(G.str.print, [lua_concat("Hello world! This is: ", G.str._VERSION)]); 
			lua_call(G.str.print, ["hello world !!!", lua_add(lua_multiply(G.str.bla, 2), 3)]); 
			return G;
		}
		bootloader called
		*/
		
	});
}
/*

// print function which the Lua engine will call
var lines = [], printed = false;

function print(text) {
  lines.push(text);
  printed = true;
}

function execute(text) {
  lines = [];
  printed = false;

  raw_argv[8] = Pointer_make(intArrayFromString(text), 0, ALLOC_STATIC); // leak!
  argv = Pointer_make(raw_argv, null);
  __Z7runargsP9lua_StatePPci(GLOBAL_L, argv, argc)

  if (!printed) {
	print('<small><i>(no output)</i></small>');
  }

  var element = document.getElementById('output');
  if (!element) return; // perhaps during startup
  element.innerHTML = lines.join('<br>') + '<hr>' + element.innerHTML;
}

function doRun() {
  args = ['-e', ''];
  run(args);
  
	MyAjaxGetAux(kMainLuaURL,function (result) {
		execute(result);
	});
  //~ execute("print \"1234\"");
}
*/


/// init lua api
function Love_Keyboard_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.keyboard.";

	G.str['love'].str['keyboard'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"enumerate"); }
}

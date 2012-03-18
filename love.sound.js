
/// init lua api
function Love_Sound_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.sound.";

	G.str['love'].str['sound'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

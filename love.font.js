
/// init lua api
function Love_Font_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.font.";

	G.str['love'].str['font'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

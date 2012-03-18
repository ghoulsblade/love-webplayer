
/// init lua api
function Love_Mouse_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.mouse.";

	G.str['love'].str['mouse'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

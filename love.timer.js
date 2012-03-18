
/// init lua api
function Love_Timer_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.timer.";

	G.str['love'].str['timer'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

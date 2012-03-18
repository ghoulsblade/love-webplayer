
/// init lua api
function Love_Event_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.event.";

	G.str['love'].str['event'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

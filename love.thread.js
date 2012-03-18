
/// init lua api
function Love_Thread_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.thread.";

	G.str['love'].str['thread'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

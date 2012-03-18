
/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}


/// init lua api
function Love_Joystick_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.joystick.";

	G.str['love'].str['joystick'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

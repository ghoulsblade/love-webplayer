
/// init lua api
function Love_Keyboard_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.keyboard.";

	G.str['love'].str['keyboard'] = t;
	
	t.str['getKeyRepeat']		= function () { return NotImplemented(pre+'getKeyRepeat'); }
	t.str['isDown']				= function () { return NotImplemented(pre+'isDown'); }
	t.str['setKeyRepeat']		= function () { return NotImplemented(pre+'setKeyRepeat'); }
}

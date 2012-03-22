
/// init lua api
function Love_Mouse_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.mouse.";

	G.str['love'].str['mouse'] = t;
	
	t.str['getPosition']	= function () { NotImplemented(pre+'getPosition'); return [0,0]; }
	t.str['getX']			= function () { NotImplemented(pre+'getX'); return [0]; }
	t.str['getY']			= function () { NotImplemented(pre+'getY'); return [0]; }
	t.str['isDown']			= function () { return NotImplemented(pre+'isDown'); }
	t.str['isGrabbed']		= function () { return NotImplemented(pre+'isGrabbed'); }
	t.str['isVisible']		= function () { return NotImplemented(pre+'isVisible'); }
	t.str['setGrab']		= function () { return NotImplemented(pre+'setGrab'); }
	t.str['setPosition']	= function () { return NotImplemented(pre+'setPosition'); }
	t.str['setVisible']		= function () { return NotImplemented(pre+'setVisible'); }
}

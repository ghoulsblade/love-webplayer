
/// init lua api
function Love_Timer_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.timer.";

	G.str['love'].str['timer'] = t;
	
	t.str['getDelta']		= function () { return NotImplemented(pre+'getDelta'); }
	t.str['getFPS']			= function () { return NotImplemented(pre+'getFPS'); }
	t.str['getMicroTime']	= function () { return NotImplemented(pre+'getMicroTime'); }
	t.str['getTime']		= function () { return NotImplemented(pre+'getTime'); }
	t.str['sleep']			= function () { return NotImplemented(pre+'sleep'); }
	t.str['step']			= function () { return NotImplemented(pre+'step'); }
}

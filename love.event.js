
/// init lua api
function Love_Event_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.event.";

	G.str['love'].str['event'] = t;
		
	t.str['clear']			= function () { return NotImplemented(pre+'clear'); }
	t.str['poll']			= function () { return NotImplemented(pre+'poll'); }
	t.str['pump']			= function () { return NotImplemented(pre+'pump'); }
	t.str['push']			= function () { return NotImplemented(pre+'push'); }
	t.str['wait']			= function () { return NotImplemented(pre+'wait'); }
}

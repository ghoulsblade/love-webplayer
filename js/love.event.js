
/// init lua api
function Love_Event_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.event.";
	var events = [];

	G.str['love'].str['event'] = t;
		
	t.str['clear']			= function () { events = []; }
	t.str['poll']			= function () { var ev = events[0]; events.shift(); return ev; }
	t.str['pump']			= function () { } // If you ever need other events coming in
	t.str['push']			= function (e, a, b, c, d) { events[events.length] = [e, a, b, c, d]; }
	t.str['wait']			= function () { } // Makes no sense, there is nothing else that can push stuff.. yet
}

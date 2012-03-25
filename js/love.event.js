var gEvents = [];
function Love_Event_PollIterator()
{
	var ev = gEvents[0];
	gEvents.shift();
	return ev;
}

$(window).focus(function()
{
	push_event("focus", true);
});

$(window).blur(function()
{
	push_event("focus", false);
});

window.onbeforeunload = function() {
	call_lua_function_safe("love.quit", []);
};

/// init lua api
function Love_Event_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.event.";

	G.str['love'].str['event'] = t;
		
	t.str['clear']			= function () { gEvents = []; }
	t.str['poll']			= function () { return [Love_Event_PollIterator]; }
	t.str['pump']			= function () { } // If you ever need other events coming in
	t.str['push']			= function (e, a, b, c, d) { gEvents[gEvents.length] = [e, a, b, c, d]; }
	t.str['wait']			= function () { } // Makes no sense, there is nothing else that can push stuff.. yet
}

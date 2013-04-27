var gEvents = [];
function Love_Event_PollIterator()
{
	var ev = gEvents[0];
	gEvents.shift();
	return ev ? ev : LuaNil;
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
	Lua.call("love.quit", []);
};

/// init lua api
function Love_Event_CreateTable (G) {
	var t = {};
	var pre = "love.event.";

	t['clear']			= function () { gEvents = []; return LuaNil; }
	t['poll']			= function () { return [Love_Event_PollIterator]; }
	t['pump']			= function () { return LuaNil; } // If you ever need other events coming in
	t['push']			= function (e, a, b, c, d) { gEvents[gEvents.length] = [e, a, b, c, d]; return LuaNil; }
	t['wait']			= function () { return LuaNil; } // Makes no sense, there is nothing else that can push stuff.. yet

    Lua.inject(t, null, "love.event");
}

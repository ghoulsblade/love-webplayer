
/// init lua api
function Love_Thread_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.thread.";

	G.str['love'].str['thread'] = t;
	
	t.str['getThread']			= function () { return NotImplemented(pre+'getThread'); }
	t.str['getThreads']			= function () { return NotImplemented(pre+'getThreads'); }
	t.str['newThread']			= function () { return NotImplemented(pre+'newThread'); }
}

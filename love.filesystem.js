
/// init lua api
function Love_Filesystem_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.filesystem.";

	G.str['love'].str['filesystem'] = t;
	
	t.str['enumerate']	= function () { return NotImplemented(pre+"enumerate"); }
}

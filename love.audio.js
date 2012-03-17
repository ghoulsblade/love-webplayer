function Love_Audio_Init () {}

function Love_Audio_CreateTable (G) {
	var t = lua_newtable();
	G.str['love'].str['audio'] = t;
	
	// love.audio.newSource(path)
	t.str['newSource']		= function (path) { MainPrint("audio.newSource called "+path); return lua_newtable(); }
	
	// love.audio.play(sourceobj, number)
	t.str['play']			= function (src,num) { MainPrint("audio.play called"); }
}

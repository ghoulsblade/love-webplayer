function Love_LoadAudio (G) {
	G.str['love'].str['audio'] = lua_newtable();
	
	// love.audio.newSource(path)
	G.str['love'].str['audio'].str['newSource']		= function (path) { MainPrint("audio.newSource called "+path); return lua_newtable(); }
	
	// love.audio.play(sourceobj, number)
	G.str['love'].str['audio'].str['play']			= function (src,num) { MainPrint("audio.play called"); }
}

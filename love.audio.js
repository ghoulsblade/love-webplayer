function Love_Audio_Init () {}

function Love_Audio_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.audio.";
	
	G.str['love'].str['audio'] = t;
	
	// love.audio.newSource(path)
	t.str['newSource']		= function (path) { return []; }
	//~ t.str['newSource']				= function () { return NotImplemented(pre+'newSource'); }
	
	// love.audio.play(sourceobj, number)
	t.str['play']			= function (src,num) { } // MainPrint("audio.play called");
	//~ t.str['play']					= function () { return NotImplemented(pre+'play'); }
	
	// TODO: "play" overloads
	// TODO: "newSource" overloads
	
	t.str['getNumSources']			= function () { return NotImplemented(pre+'getNumSources'); }
	t.str['getOrientation']			= function () { return NotImplemented(pre+'getOrientation'); }
	t.str['getPosition']			= function () { return NotImplemented(pre+'getPosition'); }
	t.str['getVelocity']			= function () { return NotImplemented(pre+'getVelocity'); }
	t.str['getVolume']				= function () { return NotImplemented(pre+'getVolume'); }
	t.str['pause']					= function () { return NotImplemented(pre+'pause'); }
	t.str['resume']					= function () { return NotImplemented(pre+'resume'); }
	t.str['rewind']					= function () { return NotImplemented(pre+'rewind'); }
	t.str['setOrientation']			= function () { return NotImplemented(pre+'setOrientation'); }
	t.str['setPosition']			= function () { return NotImplemented(pre+'setPosition'); }
	t.str['setVelocity']			= function () { return NotImplemented(pre+'setVelocity'); }
	t.str['setVolume']				= function () { return NotImplemented(pre+'setVolume'); }
	t.str['stop']					= function () { return NotImplemented(pre+'stop'); }
}

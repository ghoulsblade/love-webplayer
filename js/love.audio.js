function Love_Audio_Init () {}

function Love_Audio_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.audio.";
	
	G.str['love'].str['audio'] = t;
	
	// love.audio.newSource(path)
	t.str['newSource']		= function (path) { return [Love_Audio_MakeSourceHandle(new cLoveAudioSource(path))]; }
	//~ t.str['newSource']				= function () { return NotImplemented(pre+'newSource'); }
	
	// love.audio.play(sourceobj, number)
	t.str['play']			= function (src,num) { if (src && src._data) src._data.love_audio_play(); } // MainPrint("audio.play called");
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

function Love_Audio_MakeSourceHandle (o) {
	var t = lua_newtable();
	var pre = "love.audio.source.";
	t._data = o;
	t.str['type']				= function (t) { return t._data.type			(); }
	t.str['typeOf']				= function (t) { return t._data.typeOf			(); }
	t.str['getDirection']		= function (t) { return t._data.getDirection	(); }
	t.str['getPitch']			= function (t) { return t._data.getPitch		(); }
	t.str['getPosition']		= function (t) { return t._data.getPosition		(); }
	t.str['getVelocity']		= function (t) { return t._data.getVelocity		(); }
	t.str['getVolume']			= function (t) { return t._data.getVolume		(); }
	t.str['isLooping']			= function (t) { return t._data.isLooping		(); }
	t.str['isPaused']			= function (t) { return t._data.isPaused		(); }
	t.str['isStatic']			= function (t) { return t._data.isStatic		(); }
	t.str['isStopped']			= function (t) { return t._data.isStopped		(); }
	t.str['pause']				= function (t) { return t._data.pause			(); }
	t.str['play']				= function (t) { return t._data.play			(); }
	t.str['resume']				= function (t) { return t._data.resume			(); }
	t.str['rewind']				= function (t) { return t._data.rewind			(); }
	t.str['setDirection']		= function (t) { return t._data.setDirection	(); }
	t.str['setLooping']			= function (t) { return t._data.setLooping		(); }
	t.str['setPitch']			= function (t) { return t._data.setPitch		(); }
	t.str['setPosition']		= function (t) { return t._data.setPosition		(); }
	t.str['setVelocity']		= function (t) { return t._data.setVelocity		(); }
	t.str['setVolume']			= function (t) { return t._data.setVolume		(); }
	t.str['stop']				= function (t) { return t._data.stop			(); }

	return t;
}

function cLoveAudioSource (path) {
	this.path = path;
	var pre = "love.audio.source.";
	
	this.play				= function () { MainPrint("love.audio.source:play() called path="+String(this.path)); }	// called as object method
	this.love_audio_play	= function () { MainPrint("love.audio.play(source) called path="+String(this.path)); }	// called as api function
	
	this.type			= function () { return NotImplemented(pre+'type'); }			
	this.typeOf			= function () { return NotImplemented(pre+'typeOf'); }
	this.getDirection	= function () { return NotImplemented(pre+'getDirection'); }
	this.getPitch		= function () { return NotImplemented(pre+'getPitch'); }
	this.getPosition	= function () { return NotImplemented(pre+'getPosition'); }
	this.getVelocity	= function () { return NotImplemented(pre+'getVelocity'); }
	this.getVolume		= function () { return NotImplemented(pre+'getVolume'); }
	this.isLooping		= function () { return NotImplemented(pre+'isLooping'); }
	this.isPaused		= function () { return NotImplemented(pre+'isPaused'); }
	this.isStatic		= function () { return NotImplemented(pre+'isStatic'); }
	this.isStopped		= function () { return NotImplemented(pre+'isStopped'); }
	this.pause			= function () { return NotImplemented(pre+'pause'); }
	//~ this.play			= function () { return NotImplemented(pre+'play'); }
	this.resume			= function () { return NotImplemented(pre+'resume'); }
	this.rewind			= function () { return NotImplemented(pre+'rewind'); }
	this.setDirection	= function () { return NotImplemented(pre+'setDirection'); }
	this.setLooping		= function () { return NotImplemented(pre+'setLooping'); }
	this.setPitch		= function () { return NotImplemented(pre+'setPitch'); }
	this.setPosition	= function () { return NotImplemented(pre+'setPosition'); }
	this.setVelocity	= function () { return NotImplemented(pre+'setVelocity'); }
	this.setVolume		= function () { return NotImplemented(pre+'setVolume'); }
	this.stop			= function () { return NotImplemented(pre+'stop'); }			
}

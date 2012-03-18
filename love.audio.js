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
	t.str['type']				= function (t) { t._data.type			(); return NotImplemented(pre+'type'); }
	t.str['typeOf']				= function (t) { t._data.typeOf			(); return NotImplemented(pre+'typeOf'); }
	t.str['getDirection']		= function (t) { t._data.getDirection	(); return NotImplemented(pre+'getDirection'); }
	t.str['getPitch']			= function (t) { t._data.getPitch		(); return NotImplemented(pre+'getPitch'); }
	t.str['getPosition']		= function (t) { t._data.getPosition	(); return NotImplemented(pre+'getPosition'); }
	t.str['getVelocity']		= function (t) { t._data.getVelocity	(); return NotImplemented(pre+'getVelocity'); }
	t.str['getVolume']			= function (t) { t._data.getVolume		(); return NotImplemented(pre+'getVolume'); }
	t.str['isLooping']			= function (t) { t._data.isLooping		(); return NotImplemented(pre+'isLooping'); }
	t.str['isPaused']			= function (t) { t._data.isPaused		(); return NotImplemented(pre+'isPaused'); }
	t.str['isStatic']			= function (t) { t._data.isStatic		(); return NotImplemented(pre+'isStatic'); }
	t.str['isStopped']			= function (t) { t._data.isStopped		(); return NotImplemented(pre+'isStopped'); }
	t.str['pause']				= function (t) { t._data.pause			(); return NotImplemented(pre+'pause'); }
	t.str['play']				= function (t) { t._data.play			(); return NotImplemented(pre+'play'); }
	t.str['resume']				= function (t) { t._data.resume			(); return NotImplemented(pre+'resume'); }
	t.str['rewind']				= function (t) { t._data.rewind			(); return NotImplemented(pre+'rewind'); }
	t.str['setDirection']		= function (t) { t._data.setDirection	(); return NotImplemented(pre+'setDirection'); }
	t.str['setLooping']			= function (t) { t._data.setLooping		(); return NotImplemented(pre+'setLooping'); }
	t.str['setPitch']			= function (t) { t._data.setPitch		(); return NotImplemented(pre+'setPitch'); }
	t.str['setPosition']		= function (t) { t._data.setPosition	(); return NotImplemented(pre+'setPosition'); }
	t.str['setVelocity']		= function (t) { t._data.setVelocity	(); return NotImplemented(pre+'setVelocity'); }
	t.str['setVolume']			= function (t) { t._data.setVolume		(); return NotImplemented(pre+'setVolume'); }
	t.str['stop']				= function (t) { t._data.stop			(); return NotImplemented(pre+'stop'); }

	return t;
}

function cLoveAudioSource (path) {
	this.path = path;
	
	this.play				= function () { MainPrint("love.audio.source:play() called path="+String(this.path)); }	// called as object method
	this.love_audio_play	= function () { MainPrint("love.audio.play(source) called path="+String(this.path)); }	// called as api function
	
	this.type			= function () {}
	this.typeOf			= function () {}
	this.getDirection	= function () {}
	this.getPitch		= function () {}
	this.getPosition	= function () {}
	this.getVelocity	= function () {}
	this.getVolume		= function () {}
	this.isLooping		= function () {}
	this.isPaused		= function () {}
	this.isStatic		= function () {}
	this.isStopped		= function () {}
	this.pause			= function () {}
	this.resume			= function () {}
	this.rewind			= function () {}
	this.setDirection	= function () {}
	this.setLooping		= function () {}
	this.setPitch		= function () {}
	this.setPosition	= function () {}
	this.setVelocity	= function () {}
	this.setVolume		= function () {}
	this.stop			= function () {}
}

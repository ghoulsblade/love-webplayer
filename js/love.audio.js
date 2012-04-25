// NOTE: http://www.w3schools.com/html5/html5_audio.asp
// NOTE: html5 audio via javascript (only ref-like thing i found for js methods): http://www.position-absolute.com/articles/introduction-to-the-html5-audio-tag-javascript-manipulation/
// NOTE: html5 audio detailed spec including js ? : http://dev.w3.org/html5/spec/single-page.html#audio  http://dev.w3.org/html5/spec/the-audio-element.html#the-audio-element
// NOTE: differnt w3 sound thingies http://www.w3schools.com/html/html_sounds.asp

function Love_Audio_Init () {}

function Love_Audio_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.audio.";
	
	G.str['love'].str['audio'] = t;
	
	// love.audio.newSource(path)
	t.str['newSource']		= function (path,srctype) { return [Love_Audio_MakeSourceHandle(new cLoveAudioSource(path,srctype))]; }
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
	t.str['type']				= function (t		) { return t._data.type			(); }
	t.str['typeOf']				= function (t		) { return t._data.typeOf		(); }
	t.str['getDirection']		= function (t		) { return t._data.getDirection	(); }
	t.str['getPitch']			= function (t		) { return t._data.getPitch		(); }
	t.str['getPosition']		= function (t		) { return t._data.getPosition	(); }
	t.str['getVelocity']		= function (t		) { return t._data.getVelocity	(); }
	t.str['getVolume']			= function (t		) { return t._data.getVolume	(); }
	t.str['isLooping']			= function (t		) { return t._data.isLooping	(); }
	t.str['isPaused']			= function (t		) { return t._data.isPaused		(); }
	t.str['isStatic']			= function (t		) { return t._data.isStatic		(); }
	t.str['isStopped']			= function (t		) { return t._data.isStopped	(); }
	t.str['pause']				= function (t		) { return t._data.pause		(); }
	t.str['play']				= function (t		) { return t._data.play			(); }
	t.str['resume']				= function (t		) { return t._data.resume		(); }
	t.str['rewind']				= function (t		) { return t._data.rewind		(); }
	t.str['setDirection']		= function (t		) { return t._data.setDirection	(); }
	t.str['setLooping']			= function (t,bLoop	) { return t._data.setLooping	(bLoop); }
	t.str['setPitch']			= function (t		) { return t._data.setPitch		(); }
	t.str['setPosition']		= function (t		) { return t._data.setPosition	(); }
	t.str['setVelocity']		= function (t		) { return t._data.setVelocity	(); }
	t.str['setVolume']			= function (t,vol	) { return t._data.setVolume	(vol); }
	t.str['stop']				= function (t		) { return t._data.stop			(); }

	return t;
}

function cLoveAudioSource (path,srctype) {
	this.path = path;
	var pre = "love.audio.source.";
	
	this.constructor = function (path,srctype) {
		//~ MainPrint("cLoveAudioSource",path);
		this.path = path;
		this.srctype =srctype;
		
		// html example
		//~ <audio loop="loop" autoplay="autoplay">
		  //~ <source src="media/music/001_SiENcE_-_ANThology.ogg" type="audio/ogg" />
		  //~ <source src="media/music/001_SiENcE_-_ANThology.mp3" type="audio/mpeg" />
		  //~ Your browser does not support the audio element.
		//~ </audio>
		
		var bUseJS = true;
		
		// html5 element add via html
		if (2 == 1) {
			bUseJS = false;
			var code = "";
			var fileext = path.substr(path.length-4).toLowerCase();
			var mime = "audio/wav";
			if (fileext == ".wav") mime = "audio/wav";
			if (fileext == ".ogg") mime = "audio/ogg";
			if (fileext == ".mp3") mime = "audio/mpeg";
			MainPrint("love.audio.newSource",path,fileext,"mime=",mime);
			code += '<audio loop="loop" autoplay="autoplay">';
			code += '<source src="'+path+'" type="'+mime+'" />';
			code += 'Your browser does not support the audio element.';
			code += '</audio>';
			//~ element.innerHTML = code;
			var outel = document.getElementById('output');
			if (outel) outel.innerHTML = code;
		}
		
		
		// html5 element add via js
		if (bUseJS) {
		    var element = document.createElement('audio');
			var myself = this;
			this.element = element;
			element.addEventListener("canplaythrough", function() { myself.callback_canplaythrough(); }, true);
			//~ element.setAttribute('autoplay', "autoplay");
			//~ element.addEventListener("load", function() {
			  //~ element.play();
			//~ }, true);
			element.setAttribute('src', path);
			//~ element.load();
			//~ element.play();



			/*
			var element = document.createElement('audio');
			if (!element) return;
			
			MainPrint("cLoveAudioSource 01");
			this.element = element;
			MainPrint("cLoveAudioSource 02",path);
			element.src = path;
			MainPrint("cLoveAudioSource 03");
			element.load();
			MainPrint("cLoveAudioSource 04");
			element.addEventListener("load", function() { element.play(); }, true);
			MainPrint("cLoveAudioSource 05");

			if (srctype == "stream") ... 
			if (srctype == "static") ... 
			*/
		}
	}
	
	// called on 
	this.callback_canplaythrough = function () {} 
	//~ this.callback_canplaythrough = function () { MainPrint("callback_canplaythrough",this.path); } 
	
	
	this._play = function () {
		if (!this.element) return;
		var element = this.element;
		if (element.play) {
			if (element.readyState >= element.HAVE_ENOUGH_DATA) {
				//~ MainPrint("audio:play()",element.readyState,element.networkState,this.path);
				element.play();
			} else {
				//~ MainPrint("audio:play() delayed...",element.readyState,element.networkState,this.path);
				this.callback_canplaythrough = function () {
					//~ MainPrint("audio:play() delayed exec!!!",element.readyState,element.networkState,this.path);
					element.play();
				}
				element.load();
			}
		}
		// loadeddata
		// canplay  at least part of data loaded)
		// canplaythrough =
		
	}
	
	this.play				= function () { // called as object method
		this._play();
		//~ MainPrint("love.audio.source:play() called path="+String(this.path)); 
	} 
	
	this.love_audio_play	= function () { // called as api function
		this._play();
		//~ MainPrint("love.audio.play(source) called path="+String(this.path)); 
	}	
	
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
	this.rewind			= function () {
		if (!this.element) return;
		if (this.element.currentTime != null)
			this.element.currentTime = 0;
		//~ return NotImplemented(pre+'rewind');
	}
	this.setDirection	= function () { return NotImplemented(pre+'setDirection'); }
	this.setLooping		= function (bLoop) { 
		if (!this.element) return;
		if (bLoop == null) return;
		MainPrint("setLooping",this.path,bLoop);
		this.element.loop = bLoop ? true : false;
		//~ this.element.setAttribute('loop',"loop");
		//~ return NotImplemented(pre+'setLooping');
	}
	this.setPitch		= function () { return NotImplemented(pre+'setPitch'); }
	this.setPosition	= function (x,y,z) { return NotImplemented(pre+'setPosition'); }
	this.setVelocity	= function () { return NotImplemented(pre+'setVelocity'); }
	this.setVolume		= function (fVol) { // fVol=1.0 means normal volume
		if (!this.element) return;
		if (fVol == null) return; // setting volume=null turns the sound to noise on chrome 2012-04-25
		if (this.element.volume != null)
			this.element.volume = fVol; 
		// html5 volume=1.0=loudest http://dev.w3.org/html5/spec/media-elements.html#dom-media-volume
		//~ return NotImplemented(pre+'setVolume');
	}
	this.stop			= function () {
		if (!this.element) return;
		if (this.element.stop) this.element.stop();
		//~ return NotImplemented(pre+'stop');
	}
	this.constructor (path,srctype);	
}






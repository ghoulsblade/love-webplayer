// NOTE: http://www.w3schools.com/html5/html5_audio.asp
// NOTE: html5 audio via javascript (only ref-like thing i found for js methods): http://www.position-absolute.com/articles/introduction-to-the-html5-audio-tag-javascript-manipulation/
// NOTE: html5 audio detailed spec including js ? : http://dev.w3.org/html5/spec/single-page.html#audio  http://dev.w3.org/html5/spec/the-audio-element.html#the-audio-element
// NOTE: differnt w3 sound thingies http://www.w3schools.com/html/html_sounds.asp
// http://localhost/love-webplayer/ludumdare201204/
// http://ghoulsblade.schattenkind.net/love-webplayer/ludumdare201204/

function Love_Audio_Init () {}

function Love_Audio_CreateTable (G) {
	var t = {};
	var pre = "love.audio.";
	
	// love.audio.newSource(path)
	t['newSource']		= function (path,srctype) { return [new cLoveAudioSource(path,srctype)]; }
	//~ t['newSource']				= function () { return NotImplemented(pre+'newSource'); }
	
	// love.audio.play(sourceobj, number)
	t['play']			= function (src,num) { if (src && src._data) src._data.love_audio_play(); return LuaNil; } // MainPrint("audio.play called");
	//~ t['play']					= function () { return NotImplemented(pre+'play'); }
	
	// TODO: "play" overloads
	// TODO: "newSource" overloads
	
	t['getNumSources']			= function () { return NotImplemented(pre+'getNumSources'); }
	t['getOrientation']			= function () { return NotImplemented(pre+'getOrientation'); }
	t['getPosition']			= function () { return NotImplemented(pre+'getPosition'); }
	t['getVelocity']			= function () { return NotImplemented(pre+'getVelocity'); }
	t['getVolume']				= function () { return NotImplemented(pre+'getVolume'); }
	t['pause']					= function () { return NotImplemented(pre+'pause'); }
	t['resume']					= function () { return NotImplemented(pre+'resume'); }
	t['rewind']					= function () { return NotImplemented(pre+'rewind'); }
	t['setOrientation']			= function () { return NotImplemented(pre+'setOrientation'); }
	t['setPosition']			= function () { return NotImplemented(pre+'setPosition'); }
	t['setVelocity']			= function () { return NotImplemented(pre+'setVelocity'); }
	t['setVolume']				= function () { return NotImplemented(pre+'setVolume'); }
	t['stop']					= function () { return NotImplemented(pre+'stop'); }

    Lua.inject(t, null, 'love.audio');
}

function ReadyState2Txt (element) {
	if (element.readyState == element.HAVE_NOTHING) return "HAVE_NOTHING";
	if (element.readyState == element.HAVE_METADATA) return "HAVE_METADATA";
	if (element.readyState == element.HAVE_CURRENT_DATA) return "HAVE_CURRENT_DATA";
	if (element.readyState == element.HAVE_FUTURE_DATA) return "HAVE_FUTURE_DATA";
	if (element.readyState == element.HAVE_ENOUGH_DATA) return "HAVE_ENOUGH_DATA";
	return "["+element.readyState+"]";
}

function NetState2Txt (element) {
	if (element.networkState == element.NETWORK_EMPTY) return "NETWORK_EMPTY";
	if (element.networkState == element.NETWORK_IDLE) return "NETWORK_IDLE";
	if (element.networkState == element.NETWORK_LOADING) return "NETWORK_LOADING";
	if (element.networkState == element.NETWORK_NO_SOURCE) return "NETWORK_NO_SOURCE";
	return "["+element.networkState+"]";
}

function cLoveAudioSource (path,srctype) {
    var self = this;
	self.path = path;
	var pre = "love.audio.source.";
	
	self.constructor = function (path,srctype) {
		//~ MainPrint("cLoveAudioSource",path);
		self.path = path;
		self.srctype =srctype;
        self.__handle = true; // Only pass into Lua by reference
		
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
			var myself = self;
			self.element = element;
			element.addEventListener("loadeddata"		, function() { myself.callback_loadeddata();		});
			element.addEventListener("canplay"			, function() { myself.callback_canplay();			});
			element.addEventListener("canplaythrough"	, function() { myself.callback_canplaythrough();	});
			element.addEventListener("ended"			, function() { myself.callback_ended();				});
			element.addEventListener("abort"			, function() { myself.callback_abort();				});
			element.addEventListener("error"			, function() { myself.callback_error();				});
			element.addEventListener("emptied"			, function() { myself.callback_emptied();			});
			//~ element.setAttribute('autoplay', "autoplay");
			//~ element.addEventListener("load", function() {
			  //~ element.play();
			//~ });
			//~ element.setAttribute('src', path);
			element.preload = "auto"; // http://dev.w3.org/html5/spec/single-page.html#attr-media-preload
			element.buffered = "auto"; // http://dev.w3.org/html5/spec/single-page.html#dom-media-buffered
			element.src = path;
			//~ element.load();
			//~ element.play();



			/*
			var element = document.createElement('audio');
			if (!element) return;
			
			MainPrint("cLoveAudioSource 01");
			self.element = element;
			MainPrint("cLoveAudioSource 02",path);
			element.src = path;
			MainPrint("cLoveAudioSource 03");
			element.load();
			MainPrint("cLoveAudioSource 04");
			element.addEventListener("load", function() { element.play(); });
			MainPrint("cLoveAudioSource 05");

			if (srctype == "stream") ... 
			if (srctype == "static") ... 
			*/
		}
	}
	
	// called on 
	self.callback_loadeddata		= function () {} // readystate = HAVE_CURRENT_DATA reached
	self.callback_canplay			= function () {} // readystate = HAVE_FUTURE_DATA reached
	self.callback_canplaythrough	= function () {} // readystate = HAVE_ENOUGH_DATA reached
	self.callback_ended				= function () {}
	self.callback_abort				= function () {}
	self.callback_error				= function () {}
	self.callback_emptied			= function () {}
	
	//~ self.callback_loadeddata		= function () { MainPrint("callback_loadeddata",self.path); } 
	//~ self.callback_canplay			= function () { MainPrint("callback_canplay",self.path); } 
	//~ self.callback_canplaythrough	= function () { MainPrint("callback_canplaythrough",self.path); } 
	//~ self.callback_abort				= function () { MainPrint("callback_abort",self.path); } 
	//~ self.callback_error				= function () { MainPrint("callback_error",self.path); } 
	//~ self.callback_emptied			= function () { MainPrint("callback_emptied",self.path); } 
	//~ self.callback_ended				= function () { MainPrint("callback_ended",self.path); } 
	
	
	self._play = function () {
		if (!self.element) return;
		var element = self.element;
		if (!element.play) return;
		//~ if (element.readyState >= element.HAVE_CURRENT_DATA && !element.ended && !element.paused) {
			//~ element.currentTime = 0; // rewind if still playing ? 
		//~ } else 
		if (element.readyState >= element.HAVE_ENOUGH_DATA) {
			element.play();
		} else if (element.readyState >= element.HAVE_CURRENT_DATA && element.networkState == element.NETWORK_IDLE) {
			//~ MainPrint("audio:play()",ReadyState2Txt(element),NetState2Txt(element),self.path);
			element.play();
			//~ element.currentTime = 0;
		} else {
			
			//~ MainPrint("audio:play() delayed...",ReadyState2Txt(element),NetState2Txt(element),self.path);
			self.callback_canplaythrough = function () {
				//~ MainPrint("audio:play() delayed exec",ReadyState2Txt(element),NetState2Txt(element),self.path);
				element.play();
			}
			if (element.networkState == element.NETWORK_NO_SOURCE) {
				//~ MainPrint("audio:play() delay due to NETWORK_NO_SOURCE",ReadyState2Txt(element),NetState2Txt(element),self.path);
				window.setTimeout(function () {
					// try again after a few sek
					if (element.networkState == element.NETWORK_NO_SOURCE) {
						//~ MainPrint("audio:play() timeout struck...",ReadyState2Txt(element),NetState2Txt(element),self.path);
						element.load();
					}
					}, 5*1000);
				element.src = self.path;
				//~ element.setAttribute('src', self.path);
			}
		}
	}
	
	self.play				= function () { // called as object method
		self._play();
		//~ MainPrint("love.audio.source:play() called path="+String(self.path)); 
	} 
	
	self.love_audio_play	= function () { // called as api function
		self._play();
		//~ MainPrint("love.audio.play(source) called path="+String(self.path)); 
	}	
	
	self.type			= function () { return NotImplemented(pre+'type'); }			
	self.typeOf			= function () { return NotImplemented(pre+'typeOf'); }
	self.getDirection	= function () { return NotImplemented(pre+'getDirection'); }
	self.getPitch		= function () { return NotImplemented(pre+'getPitch'); }
	self.getVelocity	= function () { return NotImplemented(pre+'getVelocity'); }
	self.getPosition	= function () { return [self.element ? (self.element.setVolume) : 0]; }
	self.getVolume		= function () { return [self.element ? (self.element.setVolume) : 0]; }
	self.isLooping		= function () { return [self.element ? (self.element.loop) : false]; }
	self.isPaused		= function () { return [self.element ? (self.element.paused) : false]; }
	self.isStatic		= function () { return NotImplemented(pre+'isStatic'); }
	self.isStopped		= function () { return [self.element ? (self.element.ended || self.element.paused) : false]; }
	self.pause			= function () { return NotImplemented(pre+'pause'); }
	self.resume			= function () { return NotImplemented(pre+'resume'); }
	self.rewind			= function () {
		if (!self.element) return;
		if (self.element.currentTime != null)
			self.element.currentTime = 0;
	}
	self.setDirection	= function () { return NotImplemented(pre+'setDirection'); }
	self.setLooping		= function (bLoop) { 
		if (!self.element) return;
		if (bLoop == null) return;
		self.element.loop = bLoop ? true : false;
	}
	self.setPitch		= function () { return NotImplemented(pre+'setPitch'); }
	self.setPosition	= function (x,y,z) { return NotImplemented(pre+'setPosition'); }
	self.setVelocity	= function () { return NotImplemented(pre+'setVelocity'); }
	self.setVolume		= function (_, fVol) { // fVol=1.0 means normal volume
		if (!self.element) return;
		if (fVol == null) return; // setting volume=null turns the sound to noise on chrome 2012-04-25
		if (self.element.volume != null)
			self.element.volume = fVol;  // html5 volume=1.0=loudest http://dev.w3.org/html5/spec/media-elements.html#dom-media-volume
	}
	self.stop			= function () {
		if (!self.element) return;
		if (self.element.stop) self.element.stop();
	}
	self.constructor (path,srctype);	
}






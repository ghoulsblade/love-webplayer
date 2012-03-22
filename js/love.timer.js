var gTimerSecondsSinceLastFrame = 1; // variables outside Love_Timer_CreateTable since that might be run multiple times (one for every lua file)
var frames = 0;
var lastFrame = 0;
var prevFps = 0;
var fpsFrequency = 1;
var fps = 0;

/// init lua api
function Love_Timer_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.timer.";
	lastFrame = MyGetTicks();
	prevFps = MyGetTicks();

	G.str['love'].str['timer'] = t;
	
	t.str['getDelta']		= function ()
	{
		return [gTimerSecondsSinceLastFrame];
	}

	t.str['getFPS']			= function ()
	{
		return [fps];
	}

	t.str['getMicroTime']	= function ()
	{
		return [MyGetTicks() / 1000.0]; //XXX: Not real microseconds
	}

	t.str['getTime']		= function ()
	{
		return [MyGetTicks() / 1000.0];
	}

	t.str['sleep']			= function () { return NotImplemented(pre+'sleep'); }
	t.str['step']			= function ()
	{
		var t = MyGetTicks();
		gTimerSecondsSinceLastFrame = (t - lastFrame) / 1000.0;
		lastFrame = t;

		frames++;
		var timeSinceLast = t - prevFps;
		if (timeSinceLast >= fpsFrequency)
		{
			fps = (frames / timeSinceLast) | 0; // |0 means cast to int ;)
			prevFps = t;
			frames = 0;
		}
	}
}

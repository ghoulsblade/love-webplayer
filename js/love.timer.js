/// init lua api
function Love_Timer_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.timer.";
	var lastFrame = MyGetTicks();
	var dt = 0;
	var frames = 0;
	var prevFps = MyGetTicks();
	var fpsFrequency = 1;
	var fps = 0;

	G.str['love'].str['timer'] = t;
	
	t.str['getDelta']		= function ()
	{
		return [dt];
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
		dt = (t - lastFrame) / 1000.0;
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

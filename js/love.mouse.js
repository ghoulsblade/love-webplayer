var gMouseX = 0;
var gMouseY = 0;
var gMouseDown = [false, false, false, false, false];
var gMouseButtonNames = ["l", "m", "r", "wu", "wd"];

function Love_Mouse_Init()
{
	var elementId = "#"+gWebGLCanvasId;
	var element = $(elementId);
	element.mousemove(function(e)
	{
		var tempX = e.pageX - element.offset().left;
		var tempY = e.pageY - element.offset().top;
		if (tempX >= 0 && tempX < gScreenWidth)
			gMouseX = tempX;
		if (tempY >= 0 && tempY < gScreenHeight)
			gMouseY = tempY;
	});
	element.mousedown(function(e)
	{
		gMouseDown[e.which-1] = true;
		push_event("mousepressed", gMouseX, gMouseY, gMouseButtonNames[e.which-1]);
	});
	element.mouseup(function(e)
	{
		gMouseDown[e.which-1] = false;
		push_event("mousereleased", gMouseX, gMouseY, gMouseButtonNames[e.which-1]);
	});
	element.contextmenu(function()
	{
		return false;
	});
	window.onmousewheel = function(ev)
	{
		var btn = 4;
		if (ev.wheelDelta > 0)
			btn = 3;
		push_event("mousepressed", gMouseX, gMouseY, gMouseButtonNames[btn]);
		push_event("mousereleased", gMouseX, gMouseY, gMouseButtonNames[btn]);
	};
}

/// init lua api
function Love_Mouse_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.mouse.";

	G.str['love'].str['mouse'] = t;
	
	t.str['getPosition']	= function () { return [gMouseX, gMouseY]; }
	t.str['getX']			= function () { return [gMouseX]; }
	t.str['getY']			= function () { return [gMouseY]; }
	t.str['isDown']			= function (btn)
	{
		btn = gMouseButtonNames.indexOf(btn);
		if (btn == -1)
			return [false]; // Non-existing button
		return [gMouseDown[btn]];
	}
	t.str['isGrabbed']		= function () { return [false];}
	t.str['isVisible']		= function () { return [true]; }
	t.str['setGrab']		= function () { return NotImplemented(pre+'setGrab'); }
	t.str['setPosition']	= function () { return NotImplemented(pre+'setPosition'); }
	t.str['setVisible']		= function () { return NotImplemented(pre+'setVisible'); }
}

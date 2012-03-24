var gMouseX = 0;
var gMouseY = 0;
var gMouseDown = [false, false, false];
var gMouseButtonNames = ["left", "middle", "right"];

//document.captureEvents(Event.MOUSEMOVE);
document.onmousemove = function(e)
{
	var tempX = e.pageX;
	var tempY = e.pageY;
	if (tempX >= 0 && tempX < gScreenWidth)
		gMouseX = tempX;
	if (tempY >= 0 && tempY < gScreenHeight)
		gMouseY = tempY;
};
document.onmousedown = function(e)
{
	gMouseDown[e.button] = true;
	push_event("mousepressed", gMouseX, gMouseY, gMouseButtonNames[e.button]);
};
document.onmouseup = function(e)
{
	gMouseDown[e.button] = false;
	push_event("mousereleased", gMouseX, gMouseY, gMouseButtonNames[e.button]);
};

/// init lua api
function Love_Mouse_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.mouse.";

	G.str['love'].str['mouse'] = t;
	
	t.str['getPosition']	= function () { return [gMouseX, gMouseY]; }
	t.str['getX']			= function () { return [gMouseX]; }
	t.str['getY']			= function () { return [gMouseY]; }
	t.str['isDown']			= function () { return [gMouseDown]; } // Only left clicks, sorry!
	t.str['isGrabbed']		= function () { return [false];}
	t.str['isVisible']		= function () { return [true]; }
	t.str['setGrab']		= function () { return NotImplemented(pre+'setGrab'); }
	t.str['setPosition']	= function () { return NotImplemented(pre+'setPosition'); }
	t.str['setVisible']		= function () { return NotImplemented(pre+'setVisible'); }
}

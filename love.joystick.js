
/// init lua api
function Love_Joystick_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.joystick.";

	G.str['love'].str['joystick'] = t;
	
	t.str['close']				= function () { return NotImplemented(pre+'close'); }
	t.str['getAxes']			= function () { return NotImplemented(pre+'getAxes'); }
	t.str['getAxis']			= function () { return NotImplemented(pre+'getAxis'); }
	t.str['getBall']			= function () { return NotImplemented(pre+'getBall'); }
	t.str['getHat']				= function () { return NotImplemented(pre+'getHat'); }
	t.str['getName']			= function () { return NotImplemented(pre+'getName'); }
	t.str['getNumAxes']			= function () { return NotImplemented(pre+'getNumAxes'); }
	t.str['getNumBalls']		= function () { return NotImplemented(pre+'getNumBalls'); }
	t.str['getNumButtons']		= function () { return NotImplemented(pre+'getNumButtons'); }
	t.str['getNumHats']			= function () { return NotImplemented(pre+'getNumHats'); }
	t.str['getNumJoysticks']	= function () { return NotImplemented(pre+'getNumJoysticks'); }
	t.str['isDown']				= function () { return NotImplemented(pre+'isDown'); }
	t.str['isOpen']				= function () { return NotImplemented(pre+'isOpen'); }
	t.str['open']				= function () { return NotImplemented(pre+'open'); }
}

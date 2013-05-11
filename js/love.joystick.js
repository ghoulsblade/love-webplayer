
/// init lua api
function Love_Joystick_CreateTable () {
	var t = {};
	var pre = "love.joystick.";

	t['close'] = function (joystick) { return NotImplemented(pre+'close'); }
	t['getAxes'] = function (joystick) {
		var gamepad;
		if (GamepadState) gamepad = GamepadState[joystick - 1];
		if (typeof gamepad == 'undefined') {
			return [0, 0, 0, 0];
		}
		return [gamepad.leftStickX, gamepad.leftStickY,
				gamepad.rightStickX, gamepad.rightStickY];
	}
	t['getAxis'] = function (joystick, axis) {
		var gamepad;
		if (GamepadState) gamepad = GamepadState[joystick - 1];
		if (typeof gamepad == 'undefined') {
			return [0];
		}
		switch(axis) {
			case 1:
				return [gamepad.leftStickX];
			case 2:
				return [gamepad.leftStickY];
			case 3:
				return [gamepad.rightStickX];
			case 4:
				return [gamepad.rightStickY];
		}
		return [0];
	}
	t['getBall'] = function (joystick, ball) { return NotImplemented(pre+'getBall'); }
	t['getHat'] = function (joystick, hat) { return NotImplemented(pre+'getHat'); }
	t['getName'] = function (joystick) {
		var gamepad;
		if (GamepadState) gamepad = GamepadState[joystick - 1];
		if (typeof gamepad == 'undefined') {
			return [""];
		}
		return [gamepad.name]
	}
	t['getNumAxes'] = function (joystick) { return NotImplemented(pre+'getNumAxes'); }
	t['getNumBalls'] = function (joystick) { return NotImplemented(pre+'getNumBalls'); }
	t['getNumButtons'] = function (joystick) { return NotImplemented(pre+'getNumButtons'); }
	t['getNumHats'] = function (joystick) { return NotImplemented(pre+'getNumHats'); }
	t['getNumJoysticks'] = function () {
		var count = 0;
		if (GamepadState) for (var i in GamepadState) {
			var gamepad = GamepadState[i];
			if (typeof gamepad != 'undefined') {
				count += 1;
			}
		}
		return [count];
	}
	t['isDown'] = function (joystick, button) {
		var gamepad;
		if (GamepadState) gamepad = GamepadState[joystick - 1];
		if (typeof gamepad == 'undefined') {
			return [false];
		}
		switch (button) {
			case 1:
				return [gamepad.faceButton0 != 0];
			case 2:
				return [gamepad.faceButton1 != 0];
			case 3:
				return [gamepad.faceButton2 != 0];
			case 4:
				return [gamepad.faceButton3 != 0];
		}
		return [false];
	}
	t['isOpen'] = function (joystick) {
		var gamepad;
		if (GamepadState) gamepad = GamepadState[joystick - 1];
		if (typeof gamepad == 'undefined') {
			return [false];
		}
		return [true];
	}
	t['open'] = function (joystick) { return NotImplemented(pre+'open'); }

    Lua.inject(t, null, 'love.joystick');
}

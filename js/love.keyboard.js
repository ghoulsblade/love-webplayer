
/// init lua api
function Love_Keyboard_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.keyboard.";

	G.str['love'].str['keyboard'] = t;
	
	t.str['getKeyRepeat']		= function () { return NotImplemented(pre+'getKeyRepeat'); }
	t.str['isDown']				= function (key) {
		return [keyState[key]];
	}
	t.str['setKeyRepeat']		= function () { return NotImplemented(pre+'setKeyRepeat'); }
}

keyState = {};
jQuery.hotkeys.specialKeys[32] = ' ';
jQuery.hotkeys.specialKeys[46] = 'delete';
  
function keyName(event) {
  return jQuery.hotkeys.specialKeys[event.which] ||
    String.fromCharCode(event.which).toLowerCase();
}

$(document).bind("keydown", function(event) {
  if (keyName(event) == "f5") return true;
  push_event("keypressed",keyName(event), keyName(event))
  keyState[keyName(event)] = true;
  return false;
});

$(document).bind("keyup", function(event) {
  if (keyName(event) == "f5") return true;
  push_event("keyreleased",keyName(event), keyName(event))
  keyState[keyName(event)] = false;
  return false;
});
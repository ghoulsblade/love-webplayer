
/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['newBody']				= function () { return NotImplemented(pre+'newBody'); }
	t.str['newCircleShape']			= function () { return NotImplemented(pre+'newCircleShape'); }
	t.str['newDistanceJoint']		= function () { return NotImplemented(pre+'newDistanceJoint'); }
	t.str['newGearJoint']			= function () { return NotImplemented(pre+'newGearJoint'); }
	t.str['newMouseJoint']			= function () { return NotImplemented(pre+'newMouseJoint'); }
	t.str['newPolygonShape']		= function () { return NotImplemented(pre+'newPolygonShape'); }
	t.str['newPrismaticJoint']		= function () { return NotImplemented(pre+'newPrismaticJoint'); }
	t.str['newPulleyJoint']			= function () { return NotImplemented(pre+'newPulleyJoint'); }
	t.str['newRectangleShape']		= function () { return NotImplemented(pre+'newRectangleShape'); }
	t.str['newRevoluteJoint']		= function () { return NotImplemented(pre+'newRevoluteJoint'); }
	t.str['newWorld']				= function () { return NotImplemented(pre+'newWorld'); }
}

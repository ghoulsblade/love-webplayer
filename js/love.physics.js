// physics/box2d api, see also js/Box2dWeb-2.1.a.3.min.js from http://code.google.com/p/box2dweb/

/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['newWorld'			] = function () { return (new cLovePhysicsWorld()			).GetLuaHandle(); } //	Creates a new World.
	t.str['newBody'				] = function () { return (new cLovePhysicsBody()			).GetLuaHandle(); } //	Creates a new body.
	t.str['newCircleShape'		] = function () { return (new cLovePhysicsCircleShape()		).GetLuaHandle(); } //	Creates a circle shape.
	t.str['newRectangleShape'	] = function () { return (new cLovePhysicsRectangleShape()	).GetLuaHandle(); } //	Shorthand for creating rectangluar PolygonShapes.
	
	
	t.str['getDistance'			] = function () { return NotImplemented(pre+'getDistance'		); } //	Returns the two closest points between two fixtures and their distance.
	t.str['getMeter'			] = function () { return NotImplemented(pre+'getMeter'			); } //	Returns the meter scale factor.
	t.str['newChainShape'		] = function () { return NotImplemented(pre+'newChainShape'		); } //	Creates a new ChainShape.
	t.str['newDistanceJoint'	] = function () { return NotImplemented(pre+'newDistanceJoint'	); } //	Creates a distance joint between two bodies.
	t.str['newEdgeShape'		] = function () { return NotImplemented(pre+'newEdgeShape'		); } //	Creates a new EdgeShape.
	t.str['newFixture'			] = function () { return NotImplemented(pre+'newFixture'		); } //	Creates and attaches a fixture.
	t.str['newFrictionJoint'	] = function () { return NotImplemented(pre+'newFrictionJoint'	); } //	A FrictionJoint applies friction to a body.
	t.str['newGearJoint'		] = function () { return NotImplemented(pre+'newGearJoint'		); } //	Create a gear joint connecting two joints.
	t.str['newMouseJoint'		] = function () { return NotImplemented(pre+'newMouseJoint'		); } //	Create a joint between a body and the mouse.
	t.str['newPolygonShape'		] = function () { return NotImplemented(pre+'newPolygonShape'	); } //	Creates a new PolygonShape.
	t.str['newPrismaticJoint'	] = function () { return NotImplemented(pre+'newPrismaticJoint'	); } //	Creates a prismatic joints between two bodies.
	t.str['newPulleyJoint'		] = function () { return NotImplemented(pre+'newPulleyJoint'	); } //	Creates a pulley joint to join two bodies to each other and the ground.
	t.str['newRevoluteJoint'	] = function () { return NotImplemented(pre+'newRevoluteJoint'	); } //	Creates a pivot joint between two bodies.
	t.str['newRopeJoint'		] = function () { return NotImplemented(pre+'newRopeJoint'		); } //	Creates a joint between two bodies that enforces a max distance between them.
	t.str['newWeldJoint'		] = function () { return NotImplemented(pre+'newWeldJoint'		); } //	A WeldJoint essentially glues two bodies together.
	t.str['newWheelJoint'		] = function () { return NotImplemented(pre+'newWheelJoint'		); } //	Creates a wheel joint.
	t.str['setMeter'			] = function () { return NotImplemented(pre+'setMeter'			); } //	Sets the meter scale factor.

}

// ***** ***** ***** ***** ***** cLovePhysicsWorld

function cLovePhysicsWorld () {
	this.path = path;
	var pre = "love.physics.World.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		//~ t.str['somefun']				= function (t		) { return t._data.somefun			(); }
		t.str['setGravity']				= function (t) { return t._data.setGravity(); }
		t.str['setMeter']				= function (t) { return t._data.setMeter(); }
		t.str['setCallbacks']			= function (t) { return t._data.setCallbacks(); }
		t.str['update']					= function (t) { return t._data.update(); }
		t.str['getBodyCount']			= function (t) { return t._data.getBodyCount(); }
		return t;
	}
	this.setGravity		= function () { return NotImplemented(pre+'setGravity'); }		
	this.setMeter		= function () { return NotImplemented(pre+'setMeter'); }		
	this.setCallbacks	= function () { return NotImplemented(pre+'setCallbacks'); }		
	this.update			= function () { return NotImplemented(pre+'update'); }		
	this.getBodyCount	= function () { NotImplemented(pre+'getBodyCount'); return [0]; }	
	this.constructor();
}


// ***** ***** ***** ***** ***** cLovePhysicsBody

function cLovePhysicsBody () {
	this.path = path;
	var pre = "love.physics.Body.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['setMassFromShapes']		= function (t) { return t._data.setMassFromShapes	(); }
		t.str['setMass']				= function (t) { return t._data.setMass	(); }
		t.str['setFixedRotation']		= function (t) { return t._data.setFixedRotation	(); }
		t.str['setAngularDamping']		= function (t) { return t._data.setAngularDamping	(); }
		t.str['setLinearDamping']		= function (t) { return t._data.setLinearDamping	(); }
		t.str['setLinearVelocity']		= function (t) { return t._data.setLinearVelocity	(); }
		t.str['setAngle']				= function (t) { return t._data.setAngle	(); }
		t.str['applyImpulse']			= function (t) { return t._data.applyImpulse	(); }
		t.str['applyForce']				= function (t) { return t._data.applyForce	(); }
		t.str['destroy']				= function (t) { return t._data.destroy	(); }
		t.str['getX']					= function (t) { return t._data.getX		(); }
		t.str['getY']					= function (t) { return t._data.getY		(); }
		t.str['getAngle']				= function (t) { return t._data.getAngle	(); }
		t.str['getMass']				= function (t) { return t._data.getMass		(); }
		t.str['getInertia']				= function (t) { return t._data.getInertia	(); }
		t.str['getWorldPoint']			= function (t) { return t._data.getWorldPoint	(); }
		t.str['getLocalCenter']			= function (t) { return t._data.getLocalCenter	(); }
		t.str['getWorldCenter']			= function (t) { return t._data.getWorldCenter	(); }
		t.str['getLinearVelocity']		= function (t) { return t._data.getLinearVelocity	(); }
		t.str['getLinearDamping']		= function (t) { return t._data.getLinearDamping	(); }
		
		return t;
	}
	
	
	this.setMassFromShapes		= function () { return NotImplemented(pre+'setMassFromShapes'	); }		
	this.setMass				= function () { return NotImplemented(pre+'setMass'				); }		
	this.setFixedRotation		= function () { return NotImplemented(pre+'setFixedRotation'	); }		
	this.setAngularDamping		= function () { return NotImplemented(pre+'setAngularDamping'	); }		
	this.setLinearDamping		= function () { return NotImplemented(pre+'setLinearDamping'	); }		
	this.setLinearVelocity		= function () { return NotImplemented(pre+'setLinearVelocity'	); }
	this.setAngle				= function () { return NotImplemented(pre+'setAngle'			); }
	this.applyImpulse			= function () { return NotImplemented(pre+'applyImpulse'		); }
	this.applyForce				= function () { return NotImplemented(pre+'applyForce'			); }
	this.destroy				= function () { return NotImplemented(pre+'destroy'				); }
	
	this.getX					= function () { NotImplemented(pre+'getX'				); return [0]; }
	this.getY					= function () { NotImplemented(pre+'getY'				); return [0]; }
	this.getAngle				= function () { NotImplemented(pre+'getAngle'			); return [0]; }
	this.getMass				= function () { NotImplemented(pre+'getMass'			); return [0]; }
	this.getInertia				= function () { NotImplemented(pre+'getInertia'			); return [0]; }
	this.getLinearDamping		= function () { NotImplemented(pre+'getLinearDamping'	); return [0]; }
	
	this.getWorldPoint			= function () { NotImplemented(pre+'getWorldPoint'		); return [0,0]; }
	this.getLocalCenter			= function () { NotImplemented(pre+'getLocalCenter'		); return [0,0]; }
	this.getWorldCenter			= function () { NotImplemented(pre+'getWorldCenter'		); return [0,0]; }
	this.getLinearVelocity		= function () { NotImplemented(pre+'getLinearVelocity'	); return [0,0]; }
	
	
		/*
	local x = body:getX()
	local y = body:getY()
	local r = body:getAngle()
	local m = body:getMass() * factor
	local i = body:getInertia( )
	local d = body:getLinearDamping(0.1)
	local x,y = bodyA:getWorldPoint( self.chain_anchor_x,self.chain_anchor_y )
	local x,y = body:getLocalCenter()
	local x,y = body:getWorldCenter( )
	local x,y = body:getLinearVelocity()
	
	body:setMassFromShapes()
	body:setMass(x,y,m,i)
	body:setFixedRotation(true)
	body:setAngularDamping(gPlayerAngularDamp) end
	body:setLinearDamping(gPlayerLinearDamping) end
	body:setLinearVelocity(vxn,vyn)
	body:applyImpulse(dx*f,dy*f)
	body:applyForce( fx, fy)
	body:applyForce(0, -gGravityY * body:getMass() * pdt * gPlayerCounterGravFactor, x,y)
	body:setAngle(0)
	body:destroy()
	
		*/
	
	this.constructor();
}


// ***** ***** ***** ***** ***** cLovePhysicsCircleShape

function cLovePhysicsCircleShape () {
	this.path = path;
	var pre = "love.physics.CircleShape.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['setCategory']			= function (t		) { return t._data.setCategory		(); }
		t.str['setMask']				= function (t		) { return t._data.setMask			(); }
		t.str['setData']				= function (t		) { return t._data.setData			(); }
		t.str['destroy']				= function (t		) { return t._data.destroy			(); }
		t.str['getBoundingBox']			= function (t		) { return t._data.getBoundingBox	(); }
		return t;
	}
	this.setCategory		= function () {}
	this.setMask			= function () {}
	this.setData			= function () {}
	this.destroy			= function () {}
	this.getBoundingBox		= function () { return [0,0,0,0]; }
	
	this.constructor();
}

// ***** ***** ***** ***** ***** cLovePhysicsRectangleShape

function cLovePhysicsRectangleShape () {
	this.path = path;
	var pre = "love.physics.RectangleShape.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['setCategory']			= function (t		) { return t._data.setCategory		(); }
		t.str['setMask']				= function (t		) { return t._data.setMask			(); }
		t.str['setData']				= function (t		) { return t._data.setData			(); }
		t.str['destroy']				= function (t		) { return t._data.destroy			(); }
		t.str['getBoundingBox']			= function (t		) { return t._data.getBoundingBox	(); }
		return t;
	}
	this.setCategory		= function () {}
	this.setMask			= function () {}
	this.setData			= function () {}
	this.destroy			= function () {}
	this.getBoundingBox		= function () { return [0,0,0,0]; }
	
	this.constructor();
}


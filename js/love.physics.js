// physics/box2d api, see also js/Box2dWeb-2.1.a.3.min.js from http://code.google.com/p/box2dweb/

/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['newWorld'			] = function () { return [(new cLovePhysicsWorld()			).GetLuaHandle()]; } //	Creates a new World.
	t.str['newBody'				] = function () { return [(new cLovePhysicsBody()			).GetLuaHandle()]; } //	Creates a new body.
	t.str['newCircleShape'		] = function () { return [(new cLovePhysicsCircleShape()	).GetLuaHandle()]; } //	Creates a circle shape.
	t.str['newRectangleShape'	] = function () { return [(new cLovePhysicsRectangleShape()	).GetLuaHandle()]; } //	Shorthand for creating rectangluar PolygonShapes.
	t.str['newFixture'			] = function () { return [(new cLovePhysicsFixture()		).GetLuaHandle()]; } //	Creates and attaches a fixture.
	
	
	t.str['getDistance'			] = function () { return NotImplemented(pre+'getDistance'		); } //	Returns the two closest points between two fixtures and their distance.
	t.str['getMeter'			] = function () { return NotImplemented(pre+'getMeter'			); } //	Returns the meter scale factor.
	t.str['newChainShape'		] = function () { return NotImplemented(pre+'newChainShape'		); } //	Creates a new ChainShape.
	t.str['newDistanceJoint'	] = function () { return NotImplemented(pre+'newDistanceJoint'	); } //	Creates a distance joint between two bodies.
	t.str['newEdgeShape'		] = function () { return NotImplemented(pre+'newEdgeShape'		); } //	Creates a new EdgeShape.
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

// ***** ***** ***** ***** ***** cLovePhysicsFixture

function cLovePhysicsFixture (body, shape, density) {
	var pre = "love.physics.Fixture.";
	
	this.constructor = function (body, shape, density) {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['destroy']				= function (t) { return t._data.destroy(); }
		t.str['getBody']				= function (t) { return t._data.getBody(); }
		t.str['getBoundingBox']			= function (t) { return t._data.getBoundingBox(); }
		t.str['getCategory']			= function (t) { return t._data.getCategory(); }
		t.str['getDensity']				= function (t) { return t._data.getDensity(); }
		t.str['getFilterData']			= function (t) { return t._data.getFilterData(); }
		t.str['getFriction']			= function (t) { return t._data.getFriction(); }
		t.str['getGroupIndex']			= function (t) { return t._data.getGroupIndex(); }
		t.str['getMask']				= function (t) { return t._data.getMask(); }
		t.str['getMassData']			= function (t) { return t._data.getMassData(); }
		t.str['getRestitution']			= function (t) { return t._data.getRestitution(); }
		t.str['getShape']				= function (t) { return t._data.getShape(); }
		t.str['getUserData']			= function (t) { return t._data.getUserData(); }
		t.str['isSensor']				= function (t) { return t._data.isSensor(); }
		t.str['rayCast']				= function (t) { return t._data.rayCast(); }
		t.str['setCategory']			= function (t) { return t._data.setCategory(); }
		t.str['setDensity']				= function (t) { return t._data.setDensity(); }
		t.str['setFilterData']			= function (t) { return t._data.setFilterData(); }
		t.str['setFriction']			= function (t) { return t._data.setFriction(); }
		t.str['setGroupIndex']			= function (t) { return t._data.setGroupIndex(); }
		t.str['setMask']				= function (t) { return t._data.setMask(); }
		t.str['setRestitution']			= function (t) { return t._data.setRestitution(); }
		t.str['setSensor']				= function (t) { return t._data.setSensor(); }
		t.str['setUserData']			= function (t) { return t._data.setUserData(); }
		t.str['testPoint']				= function (t) { return t._data.testPoint(); }

		return t;
	}
	
	this.destroy				= function () { return NotImplemented(pre+'destroy'); }			
	this.getBody				= function () { return NotImplemented(pre+'getBody'); }			
	this.getBoundingBox			= function () { return NotImplemented(pre+'getBoundingBox'); }	
	this.getCategory			= function () { return NotImplemented(pre+'getCategory'); }		
	this.getDensity				= function () { return NotImplemented(pre+'getDensity'); }		
	this.getFilterData			= function () { return NotImplemented(pre+'getFilterData'); }	
	this.getFriction			= function () { return NotImplemented(pre+'getFriction'); }		
	this.getGroupIndex			= function () { return NotImplemented(pre+'getGroupIndex'); }	
	this.getMask				= function () { return NotImplemented(pre+'getMask'); }			
	this.getMassData			= function () { return NotImplemented(pre+'getMassData'); }		
	this.getRestitution			= function () { return NotImplemented(pre+'getRestitution'); }	
	this.getShape				= function () { return NotImplemented(pre+'getShape'); }			
	this.getUserData			= function () { return NotImplemented(pre+'getUserData'); }		
	this.isSensor				= function () { return NotImplemented(pre+'isSensor'); }			
	this.rayCast				= function () { return NotImplemented(pre+'rayCast'); }			
	this.setCategory			= function () { return NotImplemented(pre+'setCategory'); }		
	this.setDensity				= function () { return NotImplemented(pre+'setDensity'); }		
	this.setFilterData			= function () { return NotImplemented(pre+'setFilterData'); }	
	this.setFriction			= function () { return NotImplemented(pre+'setFriction'); }		
	this.setGroupIndex			= function () { return NotImplemented(pre+'setGroupIndex'); }	
	this.setMask				= function () { return NotImplemented(pre+'setMask'); }			
	this.setRestitution			= function () { return NotImplemented(pre+'setRestitution'); }	
	this.setSensor				= function () { return NotImplemented(pre+'setSensor'); }		
	this.setUserData			= function () { return NotImplemented(pre+'setUserData'); }		
	this.testPoint				= function () { return NotImplemented(pre+'testPoint'); }		
	
	this.constructor(body, shape, density);
}

// ***** ***** ***** ***** ***** cLovePhysicsWorld

function cLovePhysicsWorld () {
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
	var pre = "love.physics.Body.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getX'							]		= function (t) { return t._data.getX									(); }
		t.str['getY'							]		= function (t) { return t._data.getY									(); }
		t.str['getAngle'						]		= function (t) { return t._data.getAngle								(); }
		t.str['getMass'							]		= function (t) { return t._data.getMass								(); }
		t.str['getInertia'						]		= function (t) { return t._data.getInertia								(); }
		t.str['getLinearDamping'				]		= function (t) { return t._data.getLinearDamping						(); }
		t.str['getWorldPoint'					]		= function (t) { return t._data.getWorldPoint							(); }
		t.str['getLocalCenter'					]		= function (t) { return t._data.getLocalCenter							(); }
		t.str['getWorldCenter'					]		= function (t) { return t._data.getWorldCenter							(); }
		t.str['getLinearVelocity'				]		= function (t) { return t._data.getLinearVelocity						(); }
		t.str['applyAngularImpulse'				]		= function (t) { return t._data.applyAngularImpulse					(); }
		t.str['applyForce'						]		= function (t) { return t._data.applyForce								(); }
		t.str['applyImpulse'					]		= function (t) { return t._data.applyImpulse							(); }
		t.str['applyLinearImpulse'				]		= function (t) { return t._data.applyLinearImpulse						(); }
		t.str['applyTorque'						]		= function (t) { return t._data.applyTorque							(); }
		t.str['destroy'							]		= function (t) { return t._data.destroy								(); }
		t.str['getAllowSleeping'				]		= function (t) { return t._data.getAllowSleeping						(); }
		t.str['getAngularDamping'				]		= function (t) { return t._data.getAngularDamping						(); }
		t.str['getAngularVelocity'				]		= function (t) { return t._data.getAngularVelocity						(); }
		t.str['getFixtureList'					]		= function (t) { return t._data.getFixtureList							(); }
		t.str['getGravityScale'					]		= function (t) { return t._data.getGravityScale						(); }
		t.str['getLinearVelocityFromLocalPoint'	]		= function (t) { return t._data.getLinearVelocityFromLocalPoint		(); }
		t.str['getLinearVelocityFromWorldPoint'	]		= function (t) { return t._data.getLinearVelocityFromWorldPoint		(); }
		t.str['getLocalPoint'					]		= function (t) { return t._data.getLocalPoint							(); }
		t.str['getLocalVector'					]		= function (t) { return t._data.getLocalVector							(); }
		t.str['getMassData'						]		= function (t) { return t._data.getMassData							(); }
		t.str['getPosition'						]		= function (t) { return t._data.getPosition							(); }
		t.str['getType'							]		= function (t) { return t._data.getType								(); }
		t.str['getWorldPoints'					]		= function (t) { return t._data.getWorldPoints							(); }
		t.str['getWorldVector'					]		= function (t) { return t._data.getWorldVector							(); }
		t.str['isActive'						]		= function (t) { return t._data.isActive								(); }
		t.str['isAwake'							]		= function (t) { return t._data.isAwake								(); }
		t.str['isBullet'						]		= function (t) { return t._data.isBullet								(); }
		t.str['isDynamic'						]		= function (t) { return t._data.isDynamic								(); }
		t.str['isFixedRotation'					]		= function (t) { return t._data.isFixedRotation						(); }
		t.str['isFrozen'						]		= function (t) { return t._data.isFrozen								(); }
		t.str['isSleeping'						]		= function (t) { return t._data.isSleeping								(); }
		t.str['isSleepingAllowed'				]		= function (t) { return t._data.isSleepingAllowed						(); }
		t.str['isStatic'						]		= function (t) { return t._data.isStatic								(); }
		t.str['putToSleep'						]		= function (t) { return t._data.putToSleep								(); }
		t.str['resetMassData'					]		= function (t) { return t._data.resetMassData							(); }
		t.str['setActive'						]		= function (t) { return t._data.setActive								(); }
		t.str['setAllowSleeping'				]		= function (t) { return t._data.setAllowSleeping						(); }
		t.str['setAngle'						]		= function (t) { return t._data.setAngle								(); }
		t.str['setAngularDamping'				]		= function (t) { return t._data.setAngularDamping						(); }
		t.str['setAngularVelocity'				]		= function (t) { return t._data.setAngularVelocity						(); }
		t.str['setAwake'						]		= function (t) { return t._data.setAwake								(); }
		t.str['setBullet'						]		= function (t) { return t._data.setBullet								(); }
		t.str['setFixedRotation'				]		= function (t) { return t._data.setFixedRotation						(); }
		t.str['setGravityScale'					]		= function (t) { return t._data.setGravityScale						(); }
		t.str['setInertia'						]		= function (t) { return t._data.setInertia								(); }
		t.str['setLinearDamping'				]		= function (t) { return t._data.setLinearDamping						(); }
		t.str['setLinearVelocity'				]		= function (t) { return t._data.setLinearVelocity						(); }
		t.str['setMass'							]		= function (t) { return t._data.setMass								(); }
		t.str['setMassData'						]		= function (t) { return t._data.setMassData							(); }
		t.str['setMassFromShapes'				]		= function (t) { return t._data.setMassFromShapes						(); }
		t.str['setPosition'						]		= function (t) { return t._data.setPosition							(); }
		t.str['setSleepingAllowed'				]		= function (t) { return t._data.setSleepingAllowed						(); }
		t.str['setType'							]		= function (t) { return t._data.setType								(); }
		t.str['setX'							]		= function (t) { return t._data.setX									(); }
		t.str['setY'							]		= function (t) { return t._data.setY									(); }
		t.str['wakeUp'							]		= function (t) { return t._data.wakeUp									(); }
		
		return t;
	}
	
	this.getX								= function () { 	   NotImplemented(pre+'getX'							); return [0]; }
	this.getY								= function () { 	   NotImplemented(pre+'getY'							); return [0]; }
	this.getAngle							= function () { 	   NotImplemented(pre+'getAngle'						); return [0]; }
	this.getMass							= function () { 	   NotImplemented(pre+'getMass'							); return [0]; }
	this.getInertia							= function () { 	   NotImplemented(pre+'getInertia'						); return [0]; }
	this.getLinearDamping					= function () { 	   NotImplemented(pre+'getLinearDamping'				); return [0]; }
	this.getWorldPoint						= function () { 	   NotImplemented(pre+'getWorldPoint'					); return [0,0]; }
	this.getLocalCenter						= function () { 	   NotImplemented(pre+'getLocalCenter'					); return [0,0]; }
	this.getWorldCenter						= function () { 	   NotImplemented(pre+'getWorldCenter'					); return [0,0]; }
	this.getLinearVelocity					= function () { 	   NotImplemented(pre+'getLinearVelocity'				); return [0,0]; }
	this.applyAngularImpulse				= function () { return NotImplemented(pre+'applyAngularImpulse'				); }
	this.applyForce							= function () { return NotImplemented(pre+'applyForce'						); }
	this.applyImpulse						= function () { return NotImplemented(pre+'applyImpulse'					); }
	this.applyLinearImpulse					= function () { return NotImplemented(pre+'applyLinearImpulse'				); }
	this.applyTorque						= function () { return NotImplemented(pre+'applyTorque'						); }
	this.destroy							= function () { return NotImplemented(pre+'destroy'							); }
	this.getAllowSleeping					= function () { return NotImplemented(pre+'getAllowSleeping'				); }
	this.getAngularDamping					= function () { return NotImplemented(pre+'getAngularDamping'				); }
	this.getAngularVelocity					= function () { return NotImplemented(pre+'getAngularVelocity'				); }
	this.getFixtureList						= function () { return NotImplemented(pre+'getFixtureList'					); }
	this.getGravityScale					= function () { return NotImplemented(pre+'getGravityScale'					); }
	this.getLinearVelocityFromLocalPoint	= function () { return NotImplemented(pre+'getLinearVelocityFromLocalPoint'	); }
	this.getLinearVelocityFromWorldPoint	= function () { return NotImplemented(pre+'getLinearVelocityFromWorldPoint'	); }
	this.getLocalPoint						= function () { return NotImplemented(pre+'getLocalPoint'					); }
	this.getLocalVector						= function () { return NotImplemented(pre+'getLocalVector'					); }
	this.getMassData						= function () { return NotImplemented(pre+'getMassData'						); }
	this.getPosition						= function () { return NotImplemented(pre+'getPosition'						); }
	this.getType							= function () { return NotImplemented(pre+'getType'							); }
	this.getWorldPoints						= function () { return NotImplemented(pre+'getWorldPoints'					); }
	this.getWorldVector						= function () { return NotImplemented(pre+'getWorldVector'					); }
	this.isActive							= function () { return NotImplemented(pre+'isActive'						); }
	this.isAwake							= function () { return NotImplemented(pre+'isAwake'							); }
	this.isBullet							= function () { return NotImplemented(pre+'isBullet'						); }
	this.isDynamic							= function () { return NotImplemented(pre+'isDynamic'						); }
	this.isFixedRotation					= function () { return NotImplemented(pre+'isFixedRotation'					); }
	this.isFrozen							= function () { return NotImplemented(pre+'isFrozen'						); }
	this.isSleeping							= function () { return NotImplemented(pre+'isSleeping'						); }
	this.isSleepingAllowed					= function () { return NotImplemented(pre+'isSleepingAllowed'				); }
	this.isStatic							= function () { return NotImplemented(pre+'isStatic'						); }
	this.putToSleep							= function () { return NotImplemented(pre+'putToSleep'						); }
	this.resetMassData						= function () { return NotImplemented(pre+'resetMassData'					); }
	this.setActive							= function () { return NotImplemented(pre+'setActive'						); }
	this.setAllowSleeping					= function () { return NotImplemented(pre+'setAllowSleeping'				); }
	this.setAngle							= function () { return NotImplemented(pre+'setAngle'						); }
	this.setAngularDamping					= function () { return NotImplemented(pre+'setAngularDamping'				); }
	this.setAngularVelocity					= function () { return NotImplemented(pre+'setAngularVelocity'				); }
	this.setAwake							= function () { return NotImplemented(pre+'setAwake'						); }
	this.setBullet							= function () { return NotImplemented(pre+'setBullet'						); }
	this.setFixedRotation					= function () { return NotImplemented(pre+'setFixedRotation'				); }
	this.setGravityScale					= function () { return NotImplemented(pre+'setGravityScale'					); }
	this.setInertia							= function () { return NotImplemented(pre+'setInertia'						); }
	this.setLinearDamping					= function () { return NotImplemented(pre+'setLinearDamping'				); }
	this.setLinearVelocity					= function () { return NotImplemented(pre+'setLinearVelocity'				); }
	this.setMass							= function () { return NotImplemented(pre+'setMass'							); }
	this.setMassData						= function () { return NotImplemented(pre+'setMassData'						); }
	this.setMassFromShapes					= function () { return NotImplemented(pre+'setMassFromShapes'				); }
	this.setPosition						= function () { return NotImplemented(pre+'setPosition'						); }
	this.setSleepingAllowed					= function () { return NotImplemented(pre+'setSleepingAllowed'				); }
	this.setType							= function () { return NotImplemented(pre+'setType'							); }
	this.setX								= function () { return NotImplemented(pre+'setX'							); }
	this.setY								= function () { return NotImplemented(pre+'setY'							); }
	this.wakeUp								= function () { return NotImplemented(pre+'wakeUp'							); }
	
	
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




// ***** ***** ***** ***** ***** cLovePhysicsShape

function Shape_Stubs (o,pre) {
	o.computeAABB		= function () { return NotImplemented(pre+'computeAABB'			); }
	o.computeMass		= function () { return NotImplemented(pre+'computeMass'			); }
	o.destroy			= function () { return NotImplemented(pre+'destroy'				); }
	o.getBody			= function () { return NotImplemented(pre+'getBody'				); }
	o.getBoundingBox	= function () { return NotImplemented(pre+'getBoundingBox'		); return [0,0,0,0]; }
	o.getCategory		= function () { return NotImplemented(pre+'getCategory'			); }
	o.getCategoryBits	= function () { return NotImplemented(pre+'getCategoryBits'		); }
	o.getChildCount		= function () { return NotImplemented(pre+'getChildCount'		); }
	o.getData			= function () { return NotImplemented(pre+'getData'				); }
	o.getDensity		= function () { return NotImplemented(pre+'getDensity'			); }
	o.getFilterData		= function () { return NotImplemented(pre+'getFilterData'		); }
	o.getFriction		= function () { return NotImplemented(pre+'getFriction'			); }
	o.getMask			= function () { return NotImplemented(pre+'getMask'				); }
	o.getRestitution	= function () { return NotImplemented(pre+'getRestitution'		); }
	o.getType			= function () { return NotImplemented(pre+'getType'				); }
	o.isSensor			= function () { return NotImplemented(pre+'isSensor'			); }
	o.rayCast			= function () { return NotImplemented(pre+'rayCast'				); }
	o.setCategory		= function () { return NotImplemented(pre+'setCategory'			); }
	o.setData			= function () { return NotImplemented(pre+'setData'				); }
	o.setDensity		= function () { return NotImplemented(pre+'setDensity'			); }
	o.setFilterData		= function () { return NotImplemented(pre+'setFilterData'		); }
	o.setFriction		= function () { return NotImplemented(pre+'setFriction'			); }
	o.setMask			= function () { return NotImplemented(pre+'setMask'				); }
	o.setRestitution	= function () { return NotImplemented(pre+'setRestitution'		); }
	o.setSensor			= function () { return NotImplemented(pre+'setSensor'			); }
	o.testPoint			= function () { return NotImplemented(pre+'testPoint'			); }
	o.testSegment		= function () { return NotImplemented(pre+'testSegment'			); }
}
function Shape_LuaMethods (t) {
	t.str['computeAABB'		] = function (t) { return t._data.computeAABB		(); }
	t.str['computeMass'		] = function (t) { return t._data.computeMass		(); }
	t.str['destroy'			] = function (t) { return t._data.destroy			(); }
	t.str['getBody'			] = function (t) { return t._data.getBody			(); }
	t.str['getBoundingBox'	] = function (t) { return t._data.getBoundingBox	(); }
	t.str['getCategory'		] = function (t) { return t._data.getCategory		(); }
	t.str['getCategoryBits'	] = function (t) { return t._data.getCategoryBits	(); }
	t.str['getChildCount'	] = function (t) { return t._data.getChildCount		(); }
	t.str['getData'			] = function (t) { return t._data.getData			(); }
	t.str['getDensity'		] = function (t) { return t._data.getDensity		(); }
	t.str['getFilterData'	] = function (t) { return t._data.getFilterData		(); }
	t.str['getFriction'		] = function (t) { return t._data.getFriction		(); }
	t.str['getMask'			] = function (t) { return t._data.getMask			(); }
	t.str['getRestitution'	] = function (t) { return t._data.getRestitution	(); }
	t.str['getType'			] = function (t) { return t._data.getType			(); }
	t.str['isSensor'		] = function (t) { return t._data.isSensor			(); }
	t.str['rayCast'			] = function (t) { return t._data.rayCast			(); }
	t.str['setCategory'		] = function (t) { return t._data.setCategory		(); }
	t.str['setData'			] = function (t) { return t._data.setData			(); }
	t.str['setDensity'		] = function (t) { return t._data.setDensity		(); }
	t.str['setFilterData'	] = function (t) { return t._data.setFilterData		(); }
	t.str['setFriction'		] = function (t) { return t._data.setFriction		(); }
	t.str['setMask'			] = function (t) { return t._data.setMask			(); }
	t.str['setRestitution'	] = function (t) { return t._data.setRestitution	(); }
	t.str['setSensor'		] = function (t) { return t._data.setSensor			(); }
	t.str['testPoint'		] = function (t) { return t._data.testPoint			(); }
	t.str['testSegment'		] = function (t) { return t._data.testSegment		(); }
}

// ***** ***** ***** ***** ***** cLovePhysicsCircleShape

function cLovePhysicsCircleShape () {
	var pre = "love.physics.CircleShape.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getPoints'		] = function (t) { return t._data.getPoints			(); }
		t.str['getLocalCenter'	] = function (t) { return t._data.getLocalCenter	(); }
		t.str['getRadius'		] = function (t) { return t._data.getRadius			(); }
		t.str['getWorldCenter'	] = function (t) { return t._data.getWorldCenter	(); }
		t.str['setRadius'		] = function (t) { return t._data.setRadius			(); }
		
		Shape_LuaMethods(t);
		return t;
	}
	Shape_Stubs(this,pre);
	this.getPoints				= function () { 	   NotImplemented(pre+'getPoints'		); return [0,0,0,0]; }
	this.getLocalCenter			= function () { 	   NotImplemented(pre+'getLocalCenter'	); return [0,0]; }
	this.getRadius				= function () { 	   NotImplemented(pre+'getRadius'		); return [0]; }
	this.getWorldCenter			= function () { 	   NotImplemented(pre+'getWorldCenter'	); return [0,0]; }
	this.setRadius				= function () { return NotImplemented(pre+'setRadius'		); }
	
	this.constructor();
}

// ***** ***** ***** ***** ***** cLovePhysicsRectangleShape

function cLovePhysicsRectangleShape () {
	var pre = "love.physics.RectangleShape.";
	
	this.constructor = function () {}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getPoints'] = function (t) { return t._data.getPoints	(); }
		Shape_LuaMethods(t);
		return t;
	}
	Shape_Stubs(this,pre);
	this.getPoints			= function () { NotImplemented(pre+'getPoints'			); return [0,0,0,0]; }
	
	this.constructor();
}


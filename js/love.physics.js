// physics/box2d api, see also js/Box2dWeb-2.1.a.3.min.js from http://code.google.com/p/box2dweb/
// first implementation is 0.8 api, maybe later implement 0.7.2 api ? or solve with adult lib
// Box2DWeb demos : http://lib.ivank.net/?p=demos&d=box2D  

var		b2Vec2			= Box2D.Common.Math.b2Vec2
	,	b2Settings		= Box2D.Common.b2Settings
	,	b2BodyDef		= Box2D.Dynamics.b2BodyDef
	,	b2Body			= Box2D.Dynamics.b2Body
	,	b2FixtureDef	= Box2D.Dynamics.b2FixtureDef
	,	b2Fixture		= Box2D.Dynamics.b2Fixture
	,	b2World			= Box2D.Dynamics.b2World
	,	b2MassData		= Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape	= Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw		= Box2D.Dynamics.b2DebugDraw
	;
	
var gPhysForceScale = 1.0;
var gPhysImpulseScale = 1.0;
var gPhysPosScale = 1.0;
var gPhysPosScaleI = 1.0/gPhysPosScale;
function Love_Physics_SetMeter (m) { 
	//~ gPhysForceScale = m;
	gPhysImpulseScale = m*m;
	gPhysPosScale = 1.0; 
	gPhysPosScaleI = 1.0/gPhysPosScale; 
	b2Settings.b2_maxTranslation = 2.0*m;   
    b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
	MainPrint("meter",m,gPhysPosScale,gPhysPosScaleI);
}

/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['newWorld'			] = function (xg, yg, sleep					) { return [(new cLovePhysicsWorld(xg, yg, sleep)						).GetLuaHandle()]; } //	Creates a new World.
	t.str['newBody'				] = function (world, x, y, type				) { return [(new cLovePhysicsBody(world, x, y, type)					).GetLuaHandle()]; } //	Creates a new body.
	t.str['newFixture'			] = function (body, shape, density			) { return [(new cLovePhysicsFixture(body, shape, density)				).GetLuaHandle()]; } //	Creates and attaches a fixture.
	t.str['newCircleShape'		] = function (a,b,c							) { return [(new cLovePhysicsCircleShape(a,b,c)							).GetLuaHandle()]; } //	Creates a circle shape.
	t.str['newRectangleShape'	] = function (x, y, width, height, angle	) { return [(new cLovePhysicsRectangleShape(x, y, width, height, angle)	).GetLuaHandle()]; } //	Shorthand for creating rectangluar PolygonShapes.
	t.str['newPolygonShape'		] = function (								) { return [(new cLovePhysicsPolygonShape(arguments)					).GetLuaHandle()]; } //	Creates a new PolygonShape.
	
	
	t.str['getDistance'			] = function () { return NotImplemented(pre+'getDistance'		); } //	Returns the two closest points between two fixtures and their distance.
	t.str['getMeter'			] = function () { return NotImplemented(pre+'getMeter'			); } //	Returns the meter scale factor.
	t.str['newChainShape'		] = function () { return NotImplemented(pre+'newChainShape'		); } //	Creates a new ChainShape.
	t.str['newDistanceJoint'	] = function () { return NotImplemented(pre+'newDistanceJoint'	); } //	Creates a distance joint between two bodies.
	t.str['newEdgeShape'		] = function () { return NotImplemented(pre+'newEdgeShape'		); } //	Creates a new EdgeShape.
	t.str['newFrictionJoint'	] = function () { return NotImplemented(pre+'newFrictionJoint'	); } //	A FrictionJoint applies friction to a body.
	t.str['newGearJoint'		] = function () { return NotImplemented(pre+'newGearJoint'		); } //	Create a gear joint connecting two joints.
	t.str['newMouseJoint'		] = function () { return NotImplemented(pre+'newMouseJoint'		); } //	Create a joint between a body and the mouse.
	t.str['newPrismaticJoint'	] = function () { return NotImplemented(pre+'newPrismaticJoint'	); } //	Creates a prismatic joints between two bodies.
	t.str['newPulleyJoint'		] = function () { return NotImplemented(pre+'newPulleyJoint'	); } //	Creates a pulley joint to join two bodies to each other and the ground.
	t.str['newRevoluteJoint'	] = function () { return NotImplemented(pre+'newRevoluteJoint'	); } //	Creates a pivot joint between two bodies.
	t.str['newRopeJoint'		] = function () { return NotImplemented(pre+'newRopeJoint'		); } //	Creates a joint between two bodies that enforces a max distance between them.
	t.str['newWeldJoint'		] = function () { return NotImplemented(pre+'newWeldJoint'		); } //	A WeldJoint essentially glues two bodies together.
	t.str['newWheelJoint'		] = function () { return NotImplemented(pre+'newWheelJoint'		); } //	Creates a wheel joint.
	t.str['setMeter'			] = function (m) { Love_Physics_SetMeter(m); return LuaNil; } //	Sets the meter scale factor.  (affects forces, coords, impulse, mass etc..)
}

// ***** ***** ***** ***** ***** cLovePhysicsFixture

function cLovePhysicsFixture (body, shape, density) {
	var pre = "love.physics.Fixture.";
	
	this.constructor = function (body, shape, density) {
		if (density == null) density = 1.0;
		var fixDef = new b2FixtureDef;
		fixDef.density = density;
		fixDef.friction = 0.20000000298023; // default love (at meter=100)
		fixDef.restitution = 0; // default love (at meter=100)
		fixDef.shape = shape._data._shape;
		this._fixture = body._data._body.CreateFixture(fixDef);
	}
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

function cLovePhysicsWorld (xg, yg, sleep) {
	var pre = "love.physics.World.";
	
	this.constructor = function (xg, yg, bsleep) {
		this._world = new b2World(
			new b2Vec2(	(xg != null) ? (gPhysForceScale*xg) : 0, 
						(yg != null) ? (gPhysForceScale*yg) : 0 ),    // gravity
			(bsleep != null) ? bsleep : true );		//allow sleep
		MainPrint("world grav = ",(xg != null) ? xg : 0,(yg != null) ? yg : 0 , (bsleep != null) ? bsleep : true );
	}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		//~ t.str['somefun']				= function (t		) { return t._data.somefun			(); }
		t.str['setGravity']				= function (t,x,y) { t._data._world.SetGravity(new b2Vec2(gPhysForceScale*x,gPhysForceScale*y)); return LuaNil; }		
		t.str['setMeter']				= function (t) { Love_Physics_SetMeter(m); return LuaNil; }		
		t.str['setCallbacks']			= function (t) { return NotImplemented(pre+'setCallbacks'); }	// note : this.m_contactManager.m_contactListener
		t.str['update']					= function (t,dt) { return t._data.update(dt); }
		t.str['getBodyCount']			= function (t) { NotImplemented(pre+'getBodyCount'); return [0]; }	 // m_bodyCount
		return t;
	}	
	this.update			= function (dt) {
		//~ MainPrint("world.update(dt=",dt);
		try {
			//~ dt = 1 / 60;
			this._world.Step( dt  ,  8  ,  6 ); // frame-rate,velocity iterations,position iterations
			//~ this._world.DrawDebugData();
			this._world.ClearForces();
		} catch (e) { MainPrint("exception during World.update:"+e); }
	}		
	this.constructor(xg, yg, sleep);
}


// ***** ***** ***** ***** ***** cLovePhysicsBody

function Love2BodyType (txt) {
	if (txt == "static"		) return b2Body.b2_staticBody	; // = 0;
	if (txt == "kinematic"	) return b2Body.b2_kinematicBody; // = 1;
	if (txt == "dynamic"	) return b2Body.b2_dynamicBody	; // = 2;		
	return null;
}

function BodyType2Love (v) {
    if (txt == b2Body.b2_staticBody		) return "static"	;
    if (txt == b2Body.b2_kinematicBody	) return "kinematic";
    if (txt == b2Body.b2_dynamicBody	) return "dynamic"	;
	return null;
}
	

function cLovePhysicsBody (world, x, y, btype) {
	var pre = "love.physics.Body.";
	
	this.constructor = function (world, x, y, btype) {
		var bodyDef = new b2BodyDef;
		bodyDef.type = Love2BodyType(btype);
		//~ bodyDef.linearDamping = 0.0;
		//~ MainPrint(pre+"new:","'"+btype+"'",bodyDef.type);
		bodyDef.position.x = (x != null) ? (gPhysPosScaleI*x) : 0;
		bodyDef.position.y = (y != null) ? (gPhysPosScaleI*y) : 0;
		this._body = world._data._world.CreateBody(bodyDef);
		//~ MainPrint("body linearDamping",this._body.GetLinearDamping());
		this._world = world._data._world;
	}
	
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getX'							]		= function (t) { return t._data.getX									(); }
		t.str['getY'							]		= function (t) { return t._data.getY									(); }
		t.str['getAngle'						]		= function (t) { return t._data.getAngle								(); }
		t.str['getInertia'						]		= function (t) { return t._data.getInertia								(); }
		t.str['getLinearDamping'				]		= function (t) { return t._data.getLinearDamping						(); }
		t.str['getWorldPoint'					]		= function (t) { return t._data.getWorldPoint							(); }
		t.str['getLocalCenter'					]		= function (t) { return t._data.getLocalCenter							(); }
		t.str['getWorldCenter'					]		= function (t) { return t._data.getWorldCenter							(); }
		t.str['getLinearVelocity'				]		= function (t) { return t._data.getLinearVelocity						(); }
		t.str['applyAngularImpulse'				]		= function (t) { return t._data.applyAngularImpulse					(); }
		t.str['applyTorque'						]		= function (t) { return t._data.applyTorque							(); }
		
		
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
		t.str['setMass'							]		= function (t) { return t._data.setMass								(); }
		t.str['setMassData'						]		= function (t) { return t._data.setMassData							(); }
		t.str['setMassFromShapes'				]		= function (t) { return t._data.setMassFromShapes						(); }
		t.str['setSleepingAllowed'				]		= function (t) { return t._data.setSleepingAllowed						(); }
		t.str['setX'							]		= function (t) { return t._data.setX									(); }
		t.str['setY'							]		= function (t) { return t._data.setY									(); }
		t.str['wakeUp'							]		= function (t) { return t._data.wakeUp									(); }
		
		t.str['destroy'							]		= function (t			) { t._data._world.DestroyBody(t._data._body); return LuaNil; }
		t.str['setPosition'						]		= function (t,x,y		) { return t._data._body.SetPosition(new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)); return LuaNil; }
		t.str['getMass'							]		= function (t			) { return [t._data._body.GetMass()]; }
		t.str['setType'							]		= function (t,btype		) { return t._data._body.SetType(Love2BodyType(btype)); return LuaNil; }
		t.str['setLinearVelocity'				]		= function (t,x,y		) { return t._data._body.SetLinearVelocity(new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)); return LuaNil; }
		t.str['applyForce'						]		= function (t,fx,fy,x,y	) { var o = t._data._body; return o.ApplyForce(new b2Vec2(gPhysForceScale*fx,gPhysForceScale*fy),(x != null) ? (new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)) : (o.GetWorldCenter())); }
		t.str['applyLinearImpulse'				]		= function (t,ix,iy,x,y	) { var o = t._data._body; MainPrint("impulse",gPhysImpulseScale*ix,gPhysImpulseScale*iy); return o.ApplyImpulse(new b2Vec2(gPhysImpulseScale*ix,gPhysImpulseScale*iy),(x != null) ? (new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)) : (o.GetWorldCenter())); }
		t.str['applyImpulse'					]		= function (t) { return t._data.applyImpulse							(); }
		//~ t.str['applyLinearImpulse'				]		= function (t) { return t._data.applyLinearImpulse						(); }
		// TODO: applyForce/applyLinearImpulse : which is right :  GetWorldCenter, not GetLocalCenter : http://lib.ivank.net/?p=demos&d=box2D
		/*
		[21:35:23.243] NotImplemented:love.physics.Body.getAngle @ http://localhost/love-webplayer/js/main.js:61
		[21:35:23.499] NotImplemented:love.physics.Body.applyForce @ http://localhost/love-webplayer/js/main.js:61
		[21:35:23.513] NotImplemented:love.physics.Body.getLinearVelocity @ http://localhost/love-webplayer/js/main.js:61
		[21:35:23.596] NotImplemented:love.physics.Body.destroy @ http://localhost/love-webplayer/js/main.js:61
		[21:35:24.649] NotImplemented:love.physics.Body.resetMassData @ http://localhost/love-webplayer/js/main.js:61
		[21:35:24.649] NotImplemented:love.physics.Fixture.setDensity @ http://localhost/love-webplayer/js/main.js:61
		[21:35:24.642] NotImplemented:love.physics.newRevoluteJoint @ http://localhost/love-webplayer/js/main.js:61
		[21:35:24.653] NotImplemented:love.physics.newWeldJoint @ http://localhost/love-webplayer/js/main.js:61
		*/
		return t;
	}
	
	this.getX								= function () { return [this._body.GetPosition().x*gPhysPosScale]; }
	this.getY								= function () { return [this._body.GetPosition().y*gPhysPosScale]; }
	this.getPosition						= function () { var p = this._body.GetPosition(); return [p.x*gPhysPosScale,p.y*gPhysPosScale]; }
	this.getAngle							= function () { return [this._body.GetAngle()]; }
	this.getMass							= function () { return [this._body.GetMass()]; }
	this.getInertia							= function () { 	   NotImplemented(pre+'getInertia'						); return [0]; }
	this.getLinearDamping					= function () { 	   NotImplemented(pre+'getLinearDamping'				); return [0]; }
	this.getWorldPoint						= function () { 	   NotImplemented(pre+'getWorldPoint'					); return [0,0]; }
	this.getLocalCenter						= function () { 	   NotImplemented(pre+'getLocalCenter'					); return [0,0]; }
	this.getWorldCenter						= function () { 	   NotImplemented(pre+'getWorldCenter'					); return [0,0]; }
	this.getLinearVelocity					= function () { 	   NotImplemented(pre+'getLinearVelocity'				); return [0,0]; }
	this.applyAngularImpulse				= function () { return NotImplemented(pre+'applyAngularImpulse'				); }
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
	this.setMassData						= function () { return NotImplemented(pre+'setMassData'						); }
	this.setMassFromShapes					= function () { return NotImplemented(pre+'setMassFromShapes'				); }
	this.setSleepingAllowed					= function () { return NotImplemented(pre+'setSleepingAllowed'				); }
	this.setX								= function () { return NotImplemented(pre+'setX'							); }
	this.setY								= function () { return NotImplemented(pre+'setY'							); }
	this.wakeUp								= function () { return NotImplemented(pre+'wakeUp'							); }
	
	this.setMass							= function () { return NotImplemented(pre+'setMass'							); }
	
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
	
	this.constructor(world, x, y, btype);
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

function cLovePhysicsCircleShape (a,b,c) {
	var pre = "love.physics.CircleShape.";
	
	/// (x,y,radius)  or  (radius)
	this.constructor = function (a,b,c) {
		var x		= (c != null) ? a : 0;
		var y		= (c != null) ? b : 0;
		var radius	= (c != null) ? c : a;
		this._shape = new b2CircleShape(gPhysPosScaleI*radius);
		this._shape.SetLocalPosition(new b2Vec2(gPhysPosScaleI*x, gPhysPosScaleI*y));
	}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getLocalCenter'	] = function (t) { return t._data.getLocalCenter	(); }
		t.str['getRadius'		] = function (t) { return t._data.getRadius			(); }
		t.str['getWorldCenter'	] = function (t) { return t._data.getWorldCenter	(); }
		t.str['setRadius'		] = function (t) { return t._data.setRadius			(); }
		
		Shape_LuaMethods(t);
		return t;
	}
	Shape_Stubs(this,pre);
	this.getLocalCenter			= function () { 	   NotImplemented(pre+'getLocalCenter'	); return [0,0]; }
	this.getWorldCenter			= function () { 	   NotImplemented(pre+'getWorldCenter'	); return [0,0]; }
	this.setRadius				= function () { return NotImplemented(pre+'setRadius'		); }
	
	this.getRadius				= function () { return [this._shape.GetRadius()*gPhysPosScale]; }
	
	this.constructor(a,b,c);
}

// ***** ***** ***** ***** ***** cLovePhysicsRectangleShape

function cLovePhysicsRectangleShape (x, y, width, height, angle) {
	var pre = "love.physics.RectangleShape.";
	
	/// (width, height) or (x, y, width, height, angle)
	this.constructor = function (x, y, width, height, angle) {
		if (height == null) {
			width = x;
			height = y;
			x = 0;
			y = 0;
		}
		if (angle == null) angle = 0;
		this._shape = new b2PolygonShape;
		//~ this._shape.SetAsBox(width, height);
		this._shape.SetAsOrientedBox(gPhysPosScaleI*width*0.5, gPhysPosScaleI*height*0.5,new b2Vec2(gPhysPosScaleI*x, gPhysPosScaleI*y),angle);
	}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getPoints'] = function (t) { var o = t._data._shape; return Box2D_VertexList_ToLua(o.GetVertices(),o.GetVertexCount()); }
		Shape_LuaMethods(t);
		return t;
	}
	Shape_Stubs(this,pre);
	
	this.constructor(x, y, width, height, angle);
}


// ***** ***** ***** ***** ***** cLovePhysicsPolygonShape


function Box2D_VertexList_ToLua (vlist,len) { 
	var res = [];
	for (var i=0;i<len;++i) { res.push(vlist[i].x*gPhysPosScale); res.push(vlist[i].y*gPhysPosScale); } // e.g. m_vertices
	return res;
}


function cLovePhysicsPolygonShape (arr) {
	var pre = "love.physics.PolygonShape.";
	
	/// ( x1, y1, x2, y2, x3, y3, ... )
	this.constructor = function (myfloats) {
		this._shape = new b2PolygonShape;
		
		var vertices = [];
		for (var i=0;i<myfloats.length-1;i+=2) vertices.push(new b2Vec2(gPhysPosScaleI*myfloats[i],gPhysPosScaleI*myfloats[i+1]));
		
		
		this._shape.SetAsArray(vertices);
	}
	this.GetLuaHandle = function () {
		var t = lua_newtable();
		t._data = this;
		t.str['getPoints'] = function (t) { var o = t._data._shape; return Box2D_VertexList_ToLua(o.GetVertices(),o.GetVertexCount()); }
		Shape_LuaMethods(t);
		return t;
	}
	Shape_Stubs(this,pre);
	
	this.constructor(arr);
}

// ***** ***** ***** ***** ***** rest

// todo 2012-10-10 slow speed :b2Island.prototype.Solve = function (step, gravity, allowSleep) {    m_linearDamping
// 2012-10-10  i think i found the reason for slowness :   Box2D.Common.b2Settings.b2_maxTranslation = 2.0;   
	  
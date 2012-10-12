// physics/box2d api, see also js/Box2dWeb-2.1.a.3.min.js from http://code.google.com/p/box2dweb/
// first implementation is 0.8 api, maybe later implement 0.7.2 api ? or solve with adult lib
// Box2DWeb demos : http://lib.ivank.net/?p=demos&d=box2D  

var		b2Vec2					= Box2D.Common.Math.b2Vec2
	,	b2Settings				= Box2D.Common.b2Settings
	,	b2BodyDef				= Box2D.Dynamics.b2BodyDef
	,	b2Body					= Box2D.Dynamics.b2Body
	,	b2FixtureDef			= Box2D.Dynamics.b2FixtureDef
	,	b2Fixture				= Box2D.Dynamics.b2Fixture
	,	b2World					= Box2D.Dynamics.b2World
	,	b2MassData				= Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape			= Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape			= Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw				= Box2D.Dynamics.b2DebugDraw
    ,	b2RevoluteJoint 		= Box2D.Dynamics.Joints.b2RevoluteJoint
	,	b2RevoluteJointDef		= Box2D.Dynamics.Joints.b2RevoluteJointDef
	,	b2WeldJoint				= Box2D.Dynamics.Joints.b2WeldJoint
	,	b2WeldJointDef			= Box2D.Dynamics.Joints.b2WeldJointDef
	;
	
var gPhysGravityScale = 1.0;
var gPhysForceScale = 1.0;
var gPhysImpulseScale = 1.0;
var gPhysPosScale = 1.0;
var gPhysPosScaleI = 1.0/gPhysPosScale;
function Love_Physics_SetMeter (m) { 
	gPhysForceScale = m*m;
	gPhysImpulseScale = m*m;
	gPhysPosScale = 1.0; 
	gPhysPosScaleI = 1.0/gPhysPosScale; 
	b2Settings.b2_maxTranslation = 2.0*m; // otherwise too slow
    b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
	MainPrint("meter",m,gPhysPosScale,gPhysPosScaleI);
}

/// init lua api
function Love_Physics_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.physics.";

	G.str['love'].str['physics'] = t;
	
	t.str['newWorld'			] = function (xg, yg, sleep							) { return [(new cLovePhysicsWorld(xg, yg, sleep)								).GetLuaHandle()]; } //	Creates a new World.
	t.str['newBody'				] = function (world, x, y, type						) { return [(new cLovePhysicsBody(world, x, y, type)							).GetLuaHandle()]; } //	Creates a new body.
	t.str['newFixture'			] = function (body, shape, density					) { return [(new cLovePhysicsFixture(body, shape, density)						).GetLuaHandle()]; } //	Creates and attaches a fixture.
	t.str['newCircleShape'		] = function (a,b,c									) { return [(new cLovePhysicsCircleShape(a,b,c)									).GetLuaHandle()]; } //	Creates a circle shape.
	t.str['newRectangleShape'	] = function (x, y, width, height, angle			) { return [(new cLovePhysicsRectangleShape(x, y, width, height, angle)			).GetLuaHandle()]; } //	Shorthand for creating rectangluar PolygonShapes.
	t.str['newPolygonShape'		] = function (										) { return [(new cLovePhysicsPolygonShape(arguments)							).GetLuaHandle()]; } //	Creates a new PolygonShape.
	t.str['newRevoluteJoint'	] = function (body1, body2, x, y, collideConnected	) { return [(new cLovePhysicsRevoluteJoint(body1, body2, x, y, collideConnected)).GetLuaHandle()]; } //	Creates a pivot joint between two bodies.
	t.str['newWeldJoint'		] = function (body1, body2, x, y, collideConnected	) { return [(new cLovePhysicsWeldJoint(body1, body2, x, y, collideConnected)).GetLuaHandle()]; } //	A WeldJoint essentially glues two bodies together.
	
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
	t.str['newRopeJoint'		] = function () { return NotImplemented(pre+'newRopeJoint'		); } //	Creates a joint between two bodies that enforces a max distance between them.
	t.str['newWheelJoint'		] = function () { return NotImplemented(pre+'newWheelJoint'		); } //	Creates a wheel joint.
	t.str['setMeter'			] = function (m) { Love_Physics_SetMeter(m); return LuaNil; } //	Sets the meter scale factor.  (affects forces, coords, impulse, mass etc..)
}

// ***** ***** ***** ***** ***** cLovePhysicsFixture
cLovePhysicsFixture.prototype.pre = "love.physics.Fixture.";

function LovePhysicsFixture_FromBox2D (fix) { return fix.loveHandle; }

function cLovePhysicsFixture (body, shape, density) {
	this.constructor(body, shape, density);
}


cLovePhysicsFixture.prototype.constructor = function (body, shape, density) {
	if (density == null) density = 1.0;
	var fixDef = new b2FixtureDef;
	fixDef.density = density;
	fixDef.friction = 0.20000000298023; // default love (at meter=100)
	fixDef.restitution = 0; // default love (at meter=100)
	fixDef.shape = shape._data._shape;
	this._fixture = body._data._body.CreateFixture(fixDef);
	this._fixture.loveHandle = this;
	this._loveUserData = null;
	body._data._fixtureHandle = this;
	body._data._shapeHandle = shape;
}


var t = lua_newtable();
cLovePhysicsFixture.prototype.Metatable = lua_newtable();
cLovePhysicsFixture.prototype.Metatable.str['__index'] = t;
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
t.str['isSensor']				= function (t) { return t._data.isSensor(); }
t.str['rayCast']				= function (t) { return t._data.rayCast(); }
t.str['setDensity']				= function (t) { return t._data.setDensity(); }
t.str['setFilterData']			= function (t) { return t._data.setFilterData(); }
t.str['setFriction']			= function (t) { return t._data.setFriction(); }
t.str['setGroupIndex']			= function (t) { return t._data.setGroupIndex(); }
t.str['setRestitution']			= function (t) { return t._data.setRestitution(); }
t.str['setSensor']				= function (t) { return t._data.setSensor(); }
t.str['testPoint']				= function (t) { return t._data.testPoint(); }


t.str['setMask']				= function (t,a,b,c,d,e,f,g) { t._data._fixture.m_filter.maskBits		= Lua2Box2DMask([a,b,c,d,e,f,g]); return LuaNil; }
t.str['setCategory']			= function (t,a,b,c,d,e,f,g) { t._data._fixture.m_filter.categoryBits	= Lua2Box2DCategory([a,b,c,d,e,f,g]); return LuaNil; }

function Lua2Box2DMask		(arr) { var res = 0x0000; for (var i=0;i<arr.length;++i) res |= 2 << arr[i]; return res; } //~ this.filter.categoryBits = 0x0001;
function Lua2Box2DCategory	(arr) { return 0xFFFF ^ Lua2Box2DMask(arr); } //~ this.filter.maskBits = 0xFFFF;

t.str['getUserData']			= function (t) { return [t._data._loveUserData]; }
t.str['setUserData']			= function (t,v) { t._data._loveUserData = v; return LuaNil; }


cLovePhysicsFixture.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}


cLovePhysicsFixture.prototype.destroy				= function () { return NotImplemented(this.pre+'destroy'); }			
cLovePhysicsFixture.prototype.getBody				= function () { return NotImplemented(this.pre+'getBody'); }			
cLovePhysicsFixture.prototype.getBoundingBox			= function () { return NotImplemented(this.pre+'getBoundingBox'); }	
cLovePhysicsFixture.prototype.getCategory			= function () { return NotImplemented(this.pre+'getCategory'); }		
cLovePhysicsFixture.prototype.getDensity				= function () { return NotImplemented(this.pre+'getDensity'); }		
cLovePhysicsFixture.prototype.getFilterData			= function () { return NotImplemented(this.pre+'getFilterData'); }	
cLovePhysicsFixture.prototype.getFriction			= function () { return NotImplemented(this.pre+'getFriction'); }		
cLovePhysicsFixture.prototype.getGroupIndex			= function () { return NotImplemented(this.pre+'getGroupIndex'); }	
cLovePhysicsFixture.prototype.getMask				= function () { return NotImplemented(this.pre+'getMask'); }			
cLovePhysicsFixture.prototype.getMassData			= function () { return NotImplemented(this.pre+'getMassData'); }		
cLovePhysicsFixture.prototype.getRestitution			= function () { return NotImplemented(this.pre+'getRestitution'); }	
cLovePhysicsFixture.prototype.getShape				= function () { return NotImplemented(this.pre+'getShape'); }		
cLovePhysicsFixture.prototype.isSensor				= function () { return NotImplemented(this.pre+'isSensor'); }			
cLovePhysicsFixture.prototype.rayCast				= function () { return NotImplemented(this.pre+'rayCast'); }			
cLovePhysicsFixture.prototype.setDensity				= function () { return NotImplemented(this.pre+'setDensity'); }		
cLovePhysicsFixture.prototype.setFilterData			= function () { return NotImplemented(this.pre+'setFilterData'); }	
cLovePhysicsFixture.prototype.setFriction			= function () { return NotImplemented(this.pre+'setFriction'); }		
cLovePhysicsFixture.prototype.setGroupIndex			= function () { return NotImplemented(this.pre+'setGroupIndex'); }	
cLovePhysicsFixture.prototype.setRestitution			= function () { return NotImplemented(this.pre+'setRestitution'); }	
cLovePhysicsFixture.prototype.setSensor				= function () { return NotImplemented(this.pre+'setSensor'); }		
cLovePhysicsFixture.prototype.testPoint				= function () { return NotImplemented(this.pre+'testPoint'); }		


// ***** ***** ***** ***** ***** cLovePhysicsWorld
cLovePhysicsWorld.prototype.pre = "love.physics.World.";

gMainWorld = null;

function cLovePhysicsWorld (xg, yg, sleep) {
	this.constructor(xg, yg, sleep);
}
	
cLovePhysicsWorld.prototype.constructor = function (xg, yg, bsleep) {
	this._world = new b2World(
		new b2Vec2(	(xg != null) ? (gPhysGravityScale*xg) : 0, 
					(yg != null) ? (gPhysGravityScale*yg) : 0 ),    // gravity
		(bsleep != null) ? bsleep : true );		//allow sleep
	MainPrint("world grav = ",(xg != null) ? xg : 0,(yg != null) ? yg : 0 , (bsleep != null) ? bsleep : true );
	
	var b2ContactListener = Box2D.Dynamics.b2ContactListener.b2_defaultListener;
	gMainWorld = this;
	
	b2ContactListener.BeginContact = function (contact) {
		if (!gMainWorld || gMainWorld.beginContact == null) return;
		var fixA = LovePhysicsFixture_FromBox2D(contact.GetFixtureA());
		var fixB = LovePhysicsFixture_FromBox2D(contact.GetFixtureB());
		gMainWorld.beginContact(fixA.GetLuaHandle(),fixB.GetLuaHandle(),LuaNil);
	}
	//~ b2ContactListener.prototype.BeginContact = function (contact) { MainPrint("BeginContact"); }
}

cLovePhysicsWorld.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	//~ t.str['somefun']				= function (t		) { return t._data.somefun			(); }
	t.str['setGravity']				= function (t,x,y) { t._data._world.SetGravity(new b2Vec2(gPhysGravityScale*x,gPhysGravityScale*y)); return LuaNil; }		
	t.str['setMeter']				= function (t) { Love_Physics_SetMeter(m); return LuaNil; }		
	t.str['setCallbacks']			= function (t, beginContact, endContact, preSolve, postSolve) { // World:setCallbacks( beginContact, endContact, preSolve, postSolve )
		t._data.beginContact = beginContact;
		//~ MainPrint("setCallbacks",beginContact);
		// lua Phys_OnCollision (fixA,fixB,contact) fixA:getUserData()
		// note : this.m_contactManager.m_contactListener
		// note : Box2D.Dynamics.b2ContactListener
		// note : Box2D.Dynamics.b2ContactListener.b2_defaultListener = new b2ContactListener();
		// Box2dWeb-2.1.a.3.js:5080: b2ContactListener.prototype.BeginContact = function (contact) {}
		// Box2dWeb-2.1.a.3.js:5081: b2ContactListener.prototype.EndContact = function (contact) {}
		// Box2dWeb-2.1.a.3.js:5082: b2ContactListener.prototype.PreSolve = function (contact, oldManifold) {}
		// Box2dWeb-2.1.a.3.js:5083: b2ContactListener.prototype.PostSolve = function (contact, impulse) {}
		return NotImplemented(t._data.pre+'setCallbacks (only beginContact)'); 
	}	
	t.str['update']					= function (t,dt) { return t._data.update(dt); }
	t.str['getBodyCount']			= function (t) { return [t._data._world.m_bodyCount]; }
	return t;
}	

cLovePhysicsWorld.prototype.update			= function (dt) {
	//~ MainPrint("world.update(dt=",dt);
	try {
		//~ dt = 1 / 60;
		this._world.Step( dt  ,  8  ,  6 ); // frame-rate,velocity iterations,position iterations
		//~ this._world.DrawDebugData();
		this._world.ClearForces();
	} catch (e) { MainPrint("exception during World.update:"+e); }
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
	this.constructor(world, x, y, btype);
}

cLovePhysicsBody.prototype.pre = "love.physics.Body.";

cLovePhysicsBody.prototype.constructor = function (world, x, y, btype) {
	var bodyDef = new b2BodyDef;
	bodyDef.type = Love2BodyType(btype);
	//~ bodyDef.linearDamping = 0.0;
	//~ MainPrint(this.pre+"new:","'"+btype+"'",bodyDef.type);
	bodyDef.position.x = (x != null) ? (gPhysPosScaleI*x) : 0;
	bodyDef.position.y = (y != null) ? (gPhysPosScaleI*y) : 0;
	this._body = world._data._world.CreateBody(bodyDef);
	//~ MainPrint("body linearDamping",this._body.GetLinearDamping());
	this._world = world._data._world;
}


cLovePhysicsBody.prototype.Destroy = function () {
	if (this._shapeHandle) {
		this._shapeHandle._shape = null;
		this._shapeHandle = null;
	}
	if (this._fixtureHandle) {
		var box2DFix = this._fixtureHandle._fixture;
		this._fixtureHandle._fixture.loveHandle = null;
		this._fixtureHandle._fixture = null;
		this._fixtureHandle._loveUserData = null;
		this._fixtureHandle = null;
		this._body.DestroyFixture(box2DFix);
	}
	this._world.DestroyBody(this._body); 
	this._body = null; 
	this._world = null; 
	//~ delete this._body;
}

var t = lua_newtable();
cLovePhysicsBody.prototype.Metatable = lua_newtable();
cLovePhysicsBody.prototype.Metatable.str['__index'] = t;

t.str['getX'							]		= function (t) { return t._data.getX									(); }
t.str['getY'							]		= function (t) { return t._data.getY									(); }
t.str['getAngle'						]		= function (t) { return t._data.getAngle								(); }
t.str['getInertia'						]		= function (t) { return t._data.getInertia								(); }
t.str['getLinearDamping'				]		= function (t) { return t._data.getLinearDamping						(); }
t.str['getWorldPoint'					]		= function (t) { return t._data.getWorldPoint							(); }
t.str['getLocalCenter'					]		= function (t) { return t._data.getLocalCenter							(); }
t.str['getWorldCenter'					]		= function (t) { return t._data.getWorldCenter							(); }
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
t.str['applyImpulse'					]		= function (t) { return t._data.applyImpulse							(); }

t.str['destroy'							]		= function (t			) { t._data.Destroy(); t.str = null; return LuaNil; }
t.str['setPosition'						]		= function (t,x,y		) { return t._data._body.SetPosition(new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)); return LuaNil; }
t.str['getMass'							]		= function (t			) { return [t._data._body.GetMass()]; }
t.str['setType'							]		= function (t,btype		) { return t._data._body.SetType(Love2BodyType(btype)); return LuaNil; }
t.str['setLinearVelocity'				]		= function (t,x,y		) { return t._data._body.SetLinearVelocity(new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)); return LuaNil; }
t.str['applyForce'						]		= function (t,fx,fy,x,y	) { var o = t._data._body; return o.ApplyForce(new b2Vec2(gPhysForceScale*fx,gPhysForceScale*fy),(x != null) ? (new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)) : (o.GetWorldCenter())); }
t.str['applyLinearImpulse'				]		= function (t,ix,iy,x,y	) { var o = t._data._body; return o.ApplyImpulse(new b2Vec2(gPhysImpulseScale*ix,gPhysImpulseScale*iy),(x != null) ? (new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y)) : (o.GetWorldCenter())); }
t.str['getLinearVelocity'				]		= function (t			) { var v = t._data._body.GetLinearVelocity(); return [v.x,v.y]; }
t.str['setBullet'						]		= function (t,v			) { return t._data._body.SetBullet(v); }


//~ t.str['applyLinearImpulse'				]		= function (t) { return t._data.applyLinearImpulse						(); }
// TODO: applyForce/applyLinearImpulse : which is right :  GetWorldCenter, not GetLocalCenter : http://lib.ivank.net/?p=demos&d=box2D
/*
[21:35:24.649] NotImplemented:love.physics.Body.resetMassData @ http://localhost/love-webplayer/js/main.js:61
[21:35:24.649] NotImplemented:love.physics.Fixture.setDensity @ http://localhost/love-webplayer/js/main.js:61
[21:35:24.642] NotImplemented:love.physics.newRevoluteJoint @ http://localhost/love-webplayer/js/main.js:61
[21:35:24.653] NotImplemented:love.physics.newWeldJoint @ http://localhost/love-webplayer/js/main.js:61
*/

cLovePhysicsBody.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}



cLovePhysicsBody.prototype.getX								= function () { return [this._body.GetPosition().x*gPhysPosScale]; }
cLovePhysicsBody.prototype.getY								= function () { return [this._body.GetPosition().y*gPhysPosScale]; }
cLovePhysicsBody.prototype.getPosition						= function () { var p = this._body.GetPosition(); return [p.x*gPhysPosScale,p.y*gPhysPosScale]; }
cLovePhysicsBody.prototype.getAngle							= function () { return [this._body.GetAngle()]; }
cLovePhysicsBody.prototype.getMass							= function () { return [this._body.GetMass()]; }
cLovePhysicsBody.prototype.getInertia							= function () { 	   NotImplemented(this.pre+'getInertia'						); return [0]; }
cLovePhysicsBody.prototype.getLinearDamping					= function () { 	   NotImplemented(this.pre+'getLinearDamping'				); return [0]; }
cLovePhysicsBody.prototype.getWorldPoint						= function () { 	   NotImplemented(this.pre+'getWorldPoint'					); return [0,0]; }
cLovePhysicsBody.prototype.getLocalCenter						= function () { 	   NotImplemented(this.pre+'getLocalCenter'					); return [0,0]; }
cLovePhysicsBody.prototype.getWorldCenter						= function () { 	   NotImplemented(this.pre+'getWorldCenter'					); return [0,0]; }
cLovePhysicsBody.prototype.getLinearVelocity					= function () { 	   NotImplemented(this.pre+'getLinearVelocity'				); return [0,0]; }
cLovePhysicsBody.prototype.applyAngularImpulse				= function () { return NotImplemented(this.pre+'applyAngularImpulse'				); }
cLovePhysicsBody.prototype.applyImpulse						= function () { return NotImplemented(this.pre+'applyImpulse'					); }
cLovePhysicsBody.prototype.applyLinearImpulse					= function () { return NotImplemented(this.pre+'applyLinearImpulse'				); }
cLovePhysicsBody.prototype.applyTorque						= function () { return NotImplemented(this.pre+'applyTorque'						); }
cLovePhysicsBody.prototype.destroy							= function () { return NotImplemented(this.pre+'destroy'							); }
cLovePhysicsBody.prototype.getAllowSleeping					= function () { return NotImplemented(this.pre+'getAllowSleeping'				); }
cLovePhysicsBody.prototype.getAngularDamping					= function () { return NotImplemented(this.pre+'getAngularDamping'				); }
cLovePhysicsBody.prototype.getAngularVelocity					= function () { return NotImplemented(this.pre+'getAngularVelocity'				); }
cLovePhysicsBody.prototype.getFixtureList						= function () { return NotImplemented(this.pre+'getFixtureList'					); }
cLovePhysicsBody.prototype.getGravityScale					= function () { return NotImplemented(this.pre+'getGravityScale'					); }
cLovePhysicsBody.prototype.getLinearVelocityFromLocalPoint	= function () { return NotImplemented(this.pre+'getLinearVelocityFromLocalPoint'	); }
cLovePhysicsBody.prototype.getLinearVelocityFromWorldPoint	= function () { return NotImplemented(this.pre+'getLinearVelocityFromWorldPoint'	); }
cLovePhysicsBody.prototype.getLocalPoint						= function () { return NotImplemented(this.pre+'getLocalPoint'					); }
cLovePhysicsBody.prototype.getLocalVector						= function () { return NotImplemented(this.pre+'getLocalVector'					); }
cLovePhysicsBody.prototype.getMassData						= function () { return NotImplemented(this.pre+'getMassData'						); }
cLovePhysicsBody.prototype.getType							= function () { return NotImplemented(this.pre+'getType'							); }
cLovePhysicsBody.prototype.getWorldPoints						= function () { return NotImplemented(this.pre+'getWorldPoints'					); }
cLovePhysicsBody.prototype.getWorldVector						= function () { return NotImplemented(this.pre+'getWorldVector'					); }
cLovePhysicsBody.prototype.isActive							= function () { return NotImplemented(this.pre+'isActive'						); }
cLovePhysicsBody.prototype.isAwake							= function () { return NotImplemented(this.pre+'isAwake'							); }
cLovePhysicsBody.prototype.isBullet							= function () { return NotImplemented(this.pre+'isBullet'						); }
cLovePhysicsBody.prototype.isDynamic							= function () { return NotImplemented(this.pre+'isDynamic'						); }
cLovePhysicsBody.prototype.isFixedRotation					= function () { return NotImplemented(this.pre+'isFixedRotation'					); }
cLovePhysicsBody.prototype.isFrozen							= function () { return NotImplemented(this.pre+'isFrozen'						); }
cLovePhysicsBody.prototype.isSleeping							= function () { return NotImplemented(this.pre+'isSleeping'						); }
cLovePhysicsBody.prototype.isSleepingAllowed					= function () { return NotImplemented(this.pre+'isSleepingAllowed'				); }
cLovePhysicsBody.prototype.isStatic							= function () { return NotImplemented(this.pre+'isStatic'						); }
cLovePhysicsBody.prototype.putToSleep							= function () { return NotImplemented(this.pre+'putToSleep'						); }
cLovePhysicsBody.prototype.resetMassData						= function () { return NotImplemented(this.pre+'resetMassData'					); }
cLovePhysicsBody.prototype.setActive							= function () { return NotImplemented(this.pre+'setActive'						); }
cLovePhysicsBody.prototype.setAllowSleeping					= function () { return NotImplemented(this.pre+'setAllowSleeping'				); }
cLovePhysicsBody.prototype.setAngle							= function () { return NotImplemented(this.pre+'setAngle'						); }
cLovePhysicsBody.prototype.setAngularDamping					= function () { return NotImplemented(this.pre+'setAngularDamping'				); }
cLovePhysicsBody.prototype.setAngularVelocity					= function () { return NotImplemented(this.pre+'setAngularVelocity'				); }
cLovePhysicsBody.prototype.setAwake							= function () { return NotImplemented(this.pre+'setAwake'						); }
cLovePhysicsBody.prototype.setBullet							= function () { return NotImplemented(this.pre+'setBullet'						); }
cLovePhysicsBody.prototype.setFixedRotation					= function () { return NotImplemented(this.pre+'setFixedRotation'				); }
cLovePhysicsBody.prototype.setGravityScale					= function () { return NotImplemented(this.pre+'setGravityScale'					); }
cLovePhysicsBody.prototype.setInertia							= function () { return NotImplemented(this.pre+'setInertia'						); }
cLovePhysicsBody.prototype.setLinearDamping					= function () { return NotImplemented(this.pre+'setLinearDamping'				); }
cLovePhysicsBody.prototype.setMassData						= function () { return NotImplemented(this.pre+'setMassData'						); }
cLovePhysicsBody.prototype.setMassFromShapes					= function () { return NotImplemented(this.pre+'setMassFromShapes'				); }
cLovePhysicsBody.prototype.setSleepingAllowed					= function () { return NotImplemented(this.pre+'setSleepingAllowed'				); }
cLovePhysicsBody.prototype.setX								= function () { return NotImplemented(this.pre+'setX'							); }
cLovePhysicsBody.prototype.setY								= function () { return NotImplemented(this.pre+'setY'							); }
cLovePhysicsBody.prototype.wakeUp								= function () { return NotImplemented(this.pre+'wakeUp'							); }
cLovePhysicsBody.prototype.setMass							= function () { return NotImplemented(this.pre+'setMass'							); }







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





// ***** ***** ***** ***** ***** cLovePhysicsShape
cShapeBase.prototype.pre = "love.physics.Shape.";


function cShapeBase () {}

cShapeBase.prototype.computeAABB		= function () { return NotImplemented(this.pre+'computeAABB'			); }
cShapeBase.prototype.computeMass		= function () { return NotImplemented(this.pre+'computeMass'			); }
cShapeBase.prototype.destroy			= function () { return NotImplemented(this.pre+'destroy'				); }
cShapeBase.prototype.getBody			= function () { return NotImplemented(this.pre+'getBody'				); }
cShapeBase.prototype.getBoundingBox		= function () { return NotImplemented(this.pre+'getBoundingBox'		); return [0,0,0,0]; }
cShapeBase.prototype.getCategory		= function () { return NotImplemented(this.pre+'getCategory'			); }
cShapeBase.prototype.getCategoryBits	= function () { return NotImplemented(this.pre+'getCategoryBits'		); }
cShapeBase.prototype.getChildCount		= function () { return NotImplemented(this.pre+'getChildCount'		); }
cShapeBase.prototype.getData			= function () { return NotImplemented(this.pre+'getData'				); }
cShapeBase.prototype.getDensity			= function () { return NotImplemented(this.pre+'getDensity'			); }
cShapeBase.prototype.getFilterData		= function () { return NotImplemented(this.pre+'getFilterData'		); }
cShapeBase.prototype.getFriction		= function () { return NotImplemented(this.pre+'getFriction'			); }
cShapeBase.prototype.getMask			= function () { return NotImplemented(this.pre+'getMask'				); }
cShapeBase.prototype.getRestitution		= function () { return NotImplemented(this.pre+'getRestitution'		); }
cShapeBase.prototype.getType			= function () { return NotImplemented(this.pre+'getType'				); }
cShapeBase.prototype.isSensor			= function () { return NotImplemented(this.pre+'isSensor'			); }
cShapeBase.prototype.rayCast			= function () { return NotImplemented(this.pre+'rayCast'				); }
cShapeBase.prototype.setCategory		= function () { return NotImplemented(this.pre+'setCategory'			); }
cShapeBase.prototype.setData			= function () { return NotImplemented(this.pre+'setData'				); }
cShapeBase.prototype.setDensity			= function () { return NotImplemented(this.pre+'setDensity'			); }
cShapeBase.prototype.setFilterData		= function () { return NotImplemented(this.pre+'setFilterData'		); }
cShapeBase.prototype.setFriction		= function () { return NotImplemented(this.pre+'setFriction'			); }
cShapeBase.prototype.setMask			= function () { return NotImplemented(this.pre+'setMask'				); }
cShapeBase.prototype.setRestitution		= function () { return NotImplemented(this.pre+'setRestitution'		); }
cShapeBase.prototype.setSensor			= function () { return NotImplemented(this.pre+'setSensor'			); }
cShapeBase.prototype.testPoint			= function () { return NotImplemented(this.pre+'testPoint'			); }
cShapeBase.prototype.testSegment		= function () { return NotImplemented(this.pre+'testSegment'			); }

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
cLovePhysicsCircleShape.prototype = new cShapeBase;
cLovePhysicsCircleShape.prototype.pre = "love.physics.CircleShape.";


function cLovePhysicsCircleShape (a,b,c) {
	this.constructor(a,b,c);
}
	
	
var t = lua_newtable();
cLovePhysicsCircleShape.prototype.Metatable = lua_newtable();
cLovePhysicsCircleShape.prototype.Metatable.str['__index'] = t;
Shape_LuaMethods(t);
t.str['getLocalCenter'	] = function (t) { return t._data.getLocalCenter	(); }
t.str['getRadius'		] = function (t) { return t._data.getRadius			(); }
t.str['getWorldCenter'	] = function (t) { return t._data.getWorldCenter	(); }
t.str['setRadius'		] = function (t) { return t._data.setRadius			(); }
	

/// (x,y,radius)  or  (radius)
cLovePhysicsCircleShape.prototype.constructor = function (a,b,c) {
	var x		= (c != null) ? a : 0;
	var y		= (c != null) ? b : 0;
	var radius	= (c != null) ? c : a;
	this._shape = new b2CircleShape(gPhysPosScaleI*radius);
	this._shape.SetLocalPosition(new b2Vec2(gPhysPosScaleI*x, gPhysPosScaleI*y));
}

cLovePhysicsCircleShape.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}
cLovePhysicsCircleShape.prototype.getLocalCenter			= function () { 	   NotImplemented(this.pre+'getLocalCenter'	); return [0,0]; }
cLovePhysicsCircleShape.prototype.getWorldCenter			= function () { 	   NotImplemented(this.pre+'getWorldCenter'	); return [0,0]; }
cLovePhysicsCircleShape.prototype.setRadius					= function () { return NotImplemented(this.pre+'setRadius'		); }

cLovePhysicsCircleShape.prototype.getRadius					= function () { return [this._shape.GetRadius()*gPhysPosScale]; }



// ***** ***** ***** ***** ***** cLovePhysicsRectangleShape
cLovePhysicsRectangleShape.prototype = new cShapeBase;
cLovePhysicsRectangleShape.prototype.pre = "love.physics.RectangleShape.";


function cLovePhysicsRectangleShape (x, y, width, height, angle) {
	this.constructor(x, y, width, height, angle);
}


	
var t = lua_newtable();
cLovePhysicsRectangleShape.prototype.Metatable = lua_newtable();
cLovePhysicsRectangleShape.prototype.Metatable.str['__index'] = t;
Shape_LuaMethods(t);
t.str['getPoints'] = function (t) { var o = t._data._shape; return Box2D_VertexList_ToLua(o.GetVertices(),o.GetVertexCount()); }

/// (width, height) or (x, y, width, height, angle)
cLovePhysicsRectangleShape.prototype.constructor = function (x, y, width, height, angle) {
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

cLovePhysicsRectangleShape.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}
	


// ***** ***** ***** ***** ***** cLovePhysicsPolygonShape
cLovePhysicsPolygonShape.prototype = new cShapeBase;
cLovePhysicsPolygonShape.prototype.pre = "love.physics.PolygonShape.";


function Box2D_VertexList_ToLua (vlist,len) { 
	var res = [];
	for (var i=0;i<len;++i) { res.push(vlist[i].x*gPhysPosScale); res.push(vlist[i].y*gPhysPosScale); } // e.g. m_vertices
	return res;
}

function cLovePhysicsPolygonShape (arr) {
	this.constructor(arr);
}

var t = lua_newtable();
cLovePhysicsPolygonShape.prototype.Metatable = lua_newtable();
cLovePhysicsPolygonShape.prototype.Metatable.str['__index'] = t;
Shape_LuaMethods(t);
t.str['getPoints'] = function (t) { var o = t._data._shape; return Box2D_VertexList_ToLua(o.GetVertices(),o.GetVertexCount()); }

/// ( x1, y1, x2, y2, x3, y3, ... )
cLovePhysicsPolygonShape.prototype.constructor = function (myfloats) {
	this._shape = new b2PolygonShape;
	
	var vertices = [];
	for (var i=0;i<myfloats.length-1;i+=2) vertices.push(new b2Vec2(gPhysPosScaleI*myfloats[i],gPhysPosScaleI*myfloats[i+1]));
	
	
	this._shape.SetAsArray(vertices);
}

cLovePhysicsPolygonShape.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}
	


// ***** ***** ***** ***** ***** cJointBase
cJointBase.prototype.pre = "love.physics.Join.";


function cJointBase () {}

cShapeBase.prototype.destroy			= function () {
	if (this._joint) { t._world.DestroyJoint(this._joint); this._joint = null; }
}

function Joint_LuaMethods (t) {
	t.str['destroy'			] = function (t) { return t._data.destroy			(); }
}


// ***** ***** ***** ***** ***** cLovePhysicsRevoluteJoint
cLovePhysicsRevoluteJoint.prototype = new cJointBase;
cLovePhysicsRevoluteJoint.prototype.pre = "love.physics.RevoluteJoint.";


function cLovePhysicsRevoluteJoint (body1, body2, x, y, collideConnected) {
	this.constructor(body1, body2, x, y, collideConnected);
}

var t = lua_newtable();
cLovePhysicsRevoluteJoint.prototype.Metatable = lua_newtable();
cLovePhysicsRevoluteJoint.prototype.Metatable.str['__index'] = t;
Joint_LuaMethods(t);


cLovePhysicsRevoluteJoint.prototype.constructor = function (body1, body2, x, y, collideConnected) {
	var def = new b2RevoluteJointDef;
	def.Initialize(body1._data._body,body2._data._body,new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y));
	def.collideConnected = (collideConnected == null) ? false : collideConnected;
	this._world = body1._data._world;
	this._joint = this._world.CreateJoint(def); // calls new b2RevoluteJoint(def);
}

cLovePhysicsRevoluteJoint.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}
	


// ***** ***** ***** ***** ***** cLovePhysicsWeldJoint
cLovePhysicsWeldJoint.prototype = new cJointBase;
cLovePhysicsWeldJoint.prototype.pre = "love.physics.WeldJoint.";


function cLovePhysicsWeldJoint (body1, body2, x, y, collideConnected) {
	this.constructor(body1, body2, x, y, collideConnected);
}

var t = lua_newtable();
cLovePhysicsWeldJoint.prototype.Metatable = lua_newtable();
cLovePhysicsWeldJoint.prototype.Metatable.str['__index'] = t;
Joint_LuaMethods(t);


cLovePhysicsWeldJoint.prototype.constructor = function (body1, body2, x, y, collideConnected) {
	var def = new b2WeldJointDef;
	def.Initialize(body1._data._body,body2._data._body,new b2Vec2(gPhysPosScaleI*x,gPhysPosScaleI*y));
	def.collideConnected = (collideConnected == null) ? false : collideConnected;
	this._world = body1._data._world;
	this._joint = this._world.CreateJoint(def); // calls new b2WeldJoint(def);
}

cLovePhysicsWeldJoint.prototype.GetLuaHandle = function () {
	var t = lua_newtable();
	t._data = this;
	t.metatable = this.Metatable;
	return t;
}
	

	
// ***** ***** ***** ***** ***** rest

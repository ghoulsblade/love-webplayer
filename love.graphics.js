var gl;
var gWebGLCanvasId;
var shaderProgram;

/// called on startup after pageload
function Love_Graphics_Init (id_canvas) {
	gWebGLCanvasId = id_canvas;
	canvas = document.getElementById(id_canvas);
	initWebGL(canvas);      // Initialize the GL context  
	if (!gl) return; // WebGL available and working  
	MainInitScene();
}

/// init lua api
function Love_Graphics_CreateTable (G) {
	var t = lua_newtable();

	G.str['love'].str['graphics'] = t;
	
	// love.graphics.newImage(path)
	t.str['newImage']	= function (path) { MainPrint("graphics.newImage called "+path); return lua_newtable(); }
	
	// love.graphics.setBackgroundColor(r,g,b)
	t.str['setBackgroundColor']	= function (r,g,b) {
		MainPrint("graphics.setBackgroundColor called",r,g,b);
		gl.clearColor(r/255.0, g/255.0, b/255.0, 1.0);
	}
	
	// love.graphics.setColor(r,g,b,a)
	t.str['setColor']	= function (r,g,b,a) { MainPrint("graphics.setColor called"); }
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	t.str['draw']		= function (drawable, x, y, r, sx, sy, ox, oy ) {} //  MainPrint("graphics.draw called"); 
}

/// called every frame (before love.update and love.draw)
function Love_Graphics_Step_Start() {

}
/// called every frame (after love.update and love.draw)
function Love_Graphics_Step_End() {

	MainDrawScene();
}

// ***** ***** ***** ***** ***** webgl stuff 


function MainInitScene () {
	gl.clearColor(0.8, 0.8, 1.0, 1.0);  // Set clear color to black, fully opaque  
	gl.clearDepth(1.0);                 // Clear everything  
	//~ gl.enable(gl.TEXTURE_2D); // needed for chrome@archlinux(fkrauthan,26.12.2010)
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing  
	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things  
	gl.enable(gl.CULL_FACE); 
	//~ gl.activeTexture(gl.TEXTURE0);
	//~ gl.projGuiMatrix = new J3DIMatrix4(); // needed for gui

	// shaders
	if (1) {
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");

		// Create the shader program
		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		
		// Bind attributes
		//~ var attribs = [ "vNormal", "vColor", "vPosition"];
		//~ for (var i in attribs)
			//~ gl.bindAttribLocation (shaderProgram, i, attribs[i]);
			
		gl.linkProgram(shaderProgram);
		
		// If creating the shader program failed, alert
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Unable to initialize the shader program.");
			return;
			// note : this happens on win-vista missing drivers (directx for angle or opengl) for webgl in firefox beta8
		}

		gl.useProgram(shaderProgram);


		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

		shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
		shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.my_uTranslate = gl.getUniformLocation(shaderProgram, "uTranslate");
		shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
		shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
		shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
		shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
		if (shaderProgram.my_uTranslate == null || shaderProgram.my_uTranslate == -1) alert("shader error : couldn't find uTranslate");
		
		
		/* old shader init pre chrome archlinux fix

		// Set some uniform variables for the shaders
		//~ gl.uniform3f(gl.getUniformLocation(shaderProgram, "lightDir"), 0, 0, 1);
		gl.uniform1i(gl.getUniformLocation(shaderProgram, "sampler2d"), 0);
		
		gl.mvMatrix = new J3DIMatrix4();
		gl.mvpMatrix = new J3DIMatrix4();
		gl.u_modelViewProjMatrixLoc = gl.getUniformLocation(shaderProgram, "u_modelViewProjMatrix");
		gl.u_MaterialColorLoc = gl.getUniformLocation(shaderProgram, "u_MaterialColor");
		SetMaterialColor(1,1,1,1);

		//~ vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		//~ gl.enableVertexAttribArray(vertexPositionAttribute);
		*/
	}
	
	// mapdata
	
	//~ gTex_Tools		= loadImageTexture(gl, "gfx/tools.gif", true);
	
	//~ LoadMapData();
	//~ InitPlayerPos(gCamPos[0],gCamPos[1],gCamPos[2]);
	//~ PlayerToolInit();
	//~ OtherPlayerInit();
}

function SetMaterialColor (r,g,b,a) { gl.uniform4f(gl.u_MaterialColorLoc,r,g,b,a ? a : 1); }

function MySetTranslateUniform (x,y,z) { gl.uniform3f(shaderProgram.my_uTranslate,x,y,z); }

// lesson07 matrix ops
var mvMatrix;
function loadIdentity() { mvMatrix = Matrix.I(4); }
function multMatrix(m) { mvMatrix = mvMatrix.x(m); }
var pMatrix;
function perspective(fovy, aspect, znear, zfar) { pMatrix = makePerspective(fovy, aspect, znear, zfar); }

function mvTranslate(v) {
	var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}

function mvRotate(ang, v) {
	var arad = ang * Math.PI / 180.0;
	var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
	multMatrix(m);
}

function matrixGetDummy() { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; }

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(matrixGetDummy()));
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(matrixGetDummy()));
	gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, new Float32Array(matrixGetDummy()));
}


function MainDrawScene() {
	UtilReshapeCanvas(gl,gWebGLCanvasId); // resize+viewport+cam perspective
	gl.enable(gl.CULL_FACE);
	if (shaderProgram == null) return;
	
	SetMaterialColor(1,1,1,1);
	MySetTranslateUniform(0,0,0);
	
		
	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
	//~ var a = 90.0 * kDeg2Rad * min(0.2,gSecondsSinceLastFrame); // per second   angle in radians
	//~ if (gPressedKeys.left	) gCamAng[0] -= a;
	//~ if (gPressedKeys.right	) gCamAng[0] += a;
	//~ if (gPressedKeys.up		) gCamAng[1] -= a;
	//~ if (gPressedKeys.down	) gCamAng[1] += a;
	
	//~ if (gbMapLoadFinished) {
		//~ var vw = gMyCanvasWidth;
		//~ var vh = gMyCanvasHeight;
		//~ var fmx = (gMouseX - vw/2);
		//~ var fmy = (gMouseY - vh/2);
		//~ var nomove = 50; // pixels
		//~ fmx = sgn(fmx) * max(0,abs(fmx) - nomove);
		//~ fmy = sgn(fmy) * max(0,abs(fmy) - nomove);
		//~ var as = 90.0 * kDeg2Rad * min(0.2,gSecondsSinceLastFrame) / 200.0; // per 200 pixel
		//~ gCamAng[0] += fmx * as;
		//~ gCamAng[1] = min(90*kDeg2Rad,max(-90*kDeg2Rad,gCamAng[1] + fmy * as));
	//~ }
	
	
	var s = 5.0 * gSecondsSinceLastFrame;
	var ax = 0;
	var az = 0;
	//~ if (gPressedKeys.a) ax -= s;
	//~ if (gPressedKeys.d) ax += s;
	//~ if (gPressedKeys.f) gCamPos[1] -= s;
	//~ if (gPressedKeys.r) gCamPos[1] += s;
	//~ if (gPressedKeys.w) az -= s;
	//~ if (gPressedKeys.s) az += s;
	
	//~ var bJumpKeyDown = gPressedKeys.r || gPressedKeys.space;
	
	//~ var rx = -az * Math.sin(gCamAng[0]) + ax * Math.cos(gCamAng[0]);
	//~ var rz =  az * Math.cos(gCamAng[0]) + ax * Math.sin(gCamAng[0]);
	
	//~ PlayerMove(rx,rz,bJumpKeyDown);
	//~ gCamPos[0] = GetPlayerCamX();
	//~ gCamPos[1] = GetPlayerCamY();
	//~ gCamPos[2] = GetPlayerCamZ();
	
	//~ PlayerToolStep();
	
	//~ var view = GetPlayerViewRay();
	
	//~ MyDebugPrint("playerpos:"+floor(gCamPos[0]*10)/10+","+floor(gCamPos[1]*10)/10+","+floor(gCamPos[2]*10)/10+" ang="+
					//~ floor(gCamAng[0]/kDeg2Rad*10)/10+","+
					//~ floor(gCamAng[1]/kDeg2Rad*10)/10);
					//+" viewRay: " + view.vx + "," + view.vy + "," + view.vz);
	

	// cam/object movement
	if (1) {
        //~ currentAngle += incAngle;
        //~ if (currentAngle > 360)
            //~ currentAngle -= 360;
			
        // Make a model/view matrix.
        //~ gl.mvMatrix.makeIdentity();
        //~ gl.mvMatrix.rotate(gCamAng[1]/kDeg2Rad, 1,0,0); // param in degree
        //~ gl.mvMatrix.rotate(gCamAng[0]/kDeg2Rad, 0,1,0); // param in degree
        //~ gl.mvMatrix.translate(-gCamPos[0],-gCamPos[1],-gCamPos[2]);
		
		
		
        //~ gl.mvMatrix.rotate(currentAngle, 0,1,0);

        // Construct the model-view * projection matrix and pass it in
        //~ gl.mvpMatrix.load(gl.perspectiveMatrix);
			//~ gl.mvpMatrix.multiply(gl.mvMatrix);
			//~ gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);


		// Establish the perspective with which we want to view the
		// scene. Our field of view is 45 degrees, with a width/height
		// ratio of 640:480, and we only want to see objects between 0.1 units
		// and 100 units away from the camera.
		//~ perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

		//~ gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);
		
		// Set the drawing position to the "identity" point, which is the center of the scene.
		//~ loadIdentity();

		// Now move the drawing position a bit to where we want to start drawing the square.
		//~ mvTranslate([-0.0, 0.0, -6.0]);
		//~ mvTranslate([-1.0, 0.0, -0.9]);
	}

	
	if (1) {
		//~ perspective(45, gMyCanvasWidth / gMyCanvasHeight, 0.1, 100.0);
		//~ loadIdentity();

		//~ mvRotate(gCamAng[1]/kDeg2Rad, [1, 0, 0]);
		//~ mvRotate(gCamAng[0]/kDeg2Rad, [0, 1, 0]);
		
		//~ mvTranslate([-gCamPos[0],-gCamPos[1],-gCamPos[2]]);
		
        //~ gl.mvMatrix.rotate(gCamAng[1]/kDeg2Rad, 1,0,0); // param in degree
        //~ gl.mvMatrix.rotate(gCamAng[0]/kDeg2Rad, 0,1,0); // param in degree
        //~ gl.mvMatrix.translate(-gCamPos[0],-gCamPos[1],-gCamPos[2]);

		gl.activeTexture(gl.TEXTURE0);
		//~ gl.bindTexture(gl.TEXTURE_2D, crateTexture);
		gl.uniform1i(shaderProgram.samplerUniform, 0);

		//~ var lighting = document.getElementById("lighting").checked;
		var lighting = false;
		gl.uniform1i(shaderProgram.useLightingUniform, lighting);

		setMatrixUniforms();
	}
	
	
	// render geometry
	if (1) {
		//~ RenderMapSectors(gCamPos[0],gCamPos[1],gCamPos[2]);
		
		//~ for (var i=0;i<gRenderObjects.length;++i) gRenderObjects[i].Draw(gl);
		//~ for (var i=0;i<gRenderObjectsAlpha.length;++i) gRenderObjectsAlpha[i].Draw(gl);
		
		//~ PlayerToolDraw_Marker();
		//~ RenderOtherPlayers();
		//~ RenderParticles();
	}
	
	//~ Collision_DebugStep(gMouseX,gMouseY);
	
	//~ PlayerToolDraw_InHand();
	
	gl.flush(); // finish/swapbuffer (optional?)
	//~ MyDebugPrintFinish();
}




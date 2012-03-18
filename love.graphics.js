var gl;
var gWebGLCanvasId;
var shaderProgram;

/// called on startup after pageload
function Love_Graphics_Init (id_canvas) {
	gWebGLCanvasId = id_canvas;
	canvas = document.getElementById(id_canvas);
	initWebGL(canvas);      // Initialize the GL context  
	if (!gl) return; // WebGL available and working  
	LoveRender_Init();
	MyCheckGLError();
	MainInitScene();
	MyCheckGLError();
}

/// init lua api
function Love_Graphics_CreateTable (G) {
	var t = lua_newtable();

	G.str['love'].str['graphics'] = t;
	
	// love.graphics.newImage(path)
	t.str['newImage']	= function (path) { return [new cLoveImage(path)]; }
	
	// love.graphics.setBackgroundColor(r,g,b)
	t.str['setBackgroundColor']	= function (r,g,b) {
		//~ MainPrint("graphics.setBackgroundColor called",r,g,b);
		gl.clearColor(r/255.0, g/255.0, b/255.0, 1.0);
	}
	
	// love.graphics.setColor(r,g,b,a)
	t.str['setColor']	= function (r,g,b,a) { setColor(r,g,b,a); } //  MainPrint("graphics.setColor called");
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	t.str['draw']		= function (drawable, x, y, r, sx, sy, ox, oy ) {
		if (drawable.IsImage())
				DrawSprite(drawable.GetTextureID(),drawable.GetWidth(),drawable.GetHeight(),x,y,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
		else	drawable.RenderSelf(x,y,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
	}
}

function setColor (r,g,b,a) {
	MainPrint("graphics.setColor called "+r+","+g+","+b+","+a);
	//~ a = 200;
	gl.uniform4f(shaderProgram.materialColorUniform,(r || 255.0)/255.0, (g || 255.0)/255.0, (b || 255.0)/255.0, (a || 255.0)/255.0);
}

/// called every frame (before love.update and love.draw)
function Love_Graphics_Step_Start() {
	if (shaderProgram == null) return;
	UtilReshapeCanvas(gl,gWebGLCanvasId); // resize+viewport+cam perspective
	
	if (shaderProgram != null) {
		SetMaterialColor(1,1,1,1);
		MySetTranslateUniform(0,0,0);
	}
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	resetTransformMatrix();
	//~ perspective(45, gMyCanvasWidth / gMyCanvasHeight, 0.1, 100.0);
	//~ loadIdentity();
	MyCheckGLError();
}

/// called every frame (after love.update and love.draw)
function Love_Graphics_Step_End() {
	if (shaderProgram == null) return;
	MyCheckGLError();
	gl.flush(); // finish/swapbuffer (optional?)
}

/*
notes
var lighting = false;
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, crateTexture);
gl.uniform1i(shaderProgram.samplerUniform, 0);
gl.uniform1i(shaderProgram.useLightingUniform, lighting);
*/

// ***** ***** ***** ***** ***** love sprites

function DrawLoveSprite(tex, x, y, r, sx, sy, ox, oy) {
	
}

// ***** ***** ***** ***** ***** cImage

function cLoveImage (path) {
	var bPixelArt = false;
	//~ var bPixelArt = true;
	this.path = path;
	this.tex = loadImageTexture(gl, path, bPixelArt);
	
	this.GetTextureID	= function () { return this.tex; }
	this.IsImage		= function () { return true; }
	this.GetWidth		= function () { return this.tex.image.width; }
	this.GetHeight		= function () { return this.tex.image.height; }
}

// ***** ***** ***** ***** ***** webgl stuff 


function MainInitScene () {
	gl.clearColor(1,1,1,1);  // Set clear color to black, fully opaque  
	gl.clearDepth(1.0);                 // Clear everything  
	//~ gl.enable(gl.TEXTURE_2D); // needed for chrome@archlinux(fkrauthan,26.12.2010)
	//~ gl.enable(gl.DEPTH_TEST);           // Enable depth testing  
	//~ gl.depthFunc(gl.LEQUAL);            // Near things obscure far things  
	gl.disable(gl.CULL_FACE); 
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//~ gl.blendFuncSeparate(gl.SRC_COLOR, gl.DST_COLOR ,gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//~ gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ZERO ,gl.ONE, gl.ZERO);
	//~ gl.blendEquation(gl.FUNC_ADD);
	gl.blendEquationSeparate(gl.FUNC_ADD,gl.FUNC_ADD);
	//~ gl.blendEquationSeparate(gl.BLEND_SRC_RGB,gl.BLEND_SRC_ALPHA );
	//~ const GLenum FUNC_ADD                       = 0x8006;
    //~ const GLenum BLEND_EQUATION                 = 0x8009;
    //~ const GLenum BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
    //~ const GLenum BLEND_EQUATION_ALPHA           = 0x883D;
	
	//~ gl.texEnvf(gl.TEXTURE_ENV, gl.TEXTURE_ENV_MODE, gl.REPLACE);
	    //~ const GLenum SRC_COLOR                      = 0x0300;
    //~ const GLenum ONE_MINUS_SRC_COLOR            = 0x0301;
	    //~ const GLenum DST_COLOR                      = 0x0306;
    //~ const GLenum ONE_MINUS_DST_COLOR            = 0x0307;
	    //~ const GLenum BLEND_SRC_ALPHA                = 0x80CB;
    //~ const GLenum CONSTANT_COLOR                 = 0x8001;
    //~ const GLenum ONE_MINUS_CONSTANT_COLOR       = 0x8002;
    //~ const GLenum BLEND_COLOR                    = 0x8005;
	    //~ void blendColor(GLclampf red, GLclampf green, GLclampf blue, GLclampf alpha);
		    //~ void blendEquation(GLenum mode);
    //~ void blendEquationSeparate(GLenum modeRGB, GLenum modeAlpha);
	    //~ void blendFunc(GLenum sfactor, GLenum dfactor);
    //~ void blendFuncSeparate(GLenum srcRGB, GLenum dstRGB, 
                           //~ GLenum srcAlpha, GLenum dstAlpha);
	
	
		//~ t.set("setBlendMode",		new VarArgFunction() { @Override public Varargs invoke(Varargs args) { setBlendMode(Str2BlendMode(args.checkjstring(1))); return LuaValue.NONE; } });
		//~ t.set("setColorMode",		new VarArgFunction() { @Override public Varargs invoke(Varargs args) { setColorMode(Str2ColorMode(args.checkjstring(1))); return LuaValue.NONE; } });
		
	//~ gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	//~ gl.activeTexture(gl.TEXTURE0);
	//~ gl.projGuiMatrix = new J3DIMatrix4(); // needed for gui

	MyCheckGLError();
	
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

		//~ shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		//~ gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

		shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

		shaderProgram.pMatrixUniform			= gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform			= gl.getUniformLocation(shaderProgram, "uMVMatrix");
		shaderProgram.nMatrixUniform			= gl.getUniformLocation(shaderProgram, "uNMatrix");
		shaderProgram.samplerUniform			= gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.my_uTranslate				= gl.getUniformLocation(shaderProgram, "uTranslate");
		shaderProgram.useLightingUniform		= gl.getUniformLocation(shaderProgram, "uUseLighting");
		shaderProgram.ambientColorUniform		= gl.getUniformLocation(shaderProgram, "uAmbientColor");
		shaderProgram.materialColorUniform		= gl.getUniformLocation(shaderProgram, "uMaterialColor");
		shaderProgram.lightingDirectionUniform	= gl.getUniformLocation(shaderProgram, "uLightingDirection");
		shaderProgram.directionalColorUniform	= gl.getUniformLocation(shaderProgram, "uDirectionalColor");
		if (shaderProgram.my_uTranslate == null || shaderProgram.my_uTranslate == -1) alert("shader error : couldn't find uTranslate");
	
		gl.uniform4f(shaderProgram.materialColorUniform,1,1,1,1);
		
		MyCheckGLError();
	
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

/*
// lesson07 matrix ops
var mvMatrix;
var pMatrix;
function loadIdentity() { mvMatrix = Matrix.I(4); }
function multMatrix(m) { mvMatrix = mvMatrix.x(m); }
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

*/

var gPerspective;
function matrixGetIdentity() { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; }
function matrixGetSimple(tx,ty,tz, sx,sy,sz) { return [ sx,0,0,0, 0,sy,0,0, 0,0,sz,0, tx,ty,tz,1 ]; }

function setMatrixUniforms() {
    //~ gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    //~ gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
	
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,  false, new Float32Array(gPerspective)); // perspective
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(matrixGetIdentity())); // modelview
	gl.uniformMatrix4fv(shaderProgram.nMatrixUniform,  false, new Float32Array(matrixGetIdentity())); // normal (unused)
}

function resetTransformMatrix	() {
	//~ perspective(45, gMyCanvasWidth / gMyCanvasHeight, 0.1, 100.0);
	// init pixel coordinatesystem
	//~ loadIdentity(); //~ gl.glLoadIdentity();
	//~ gl.glTranslatef(-1,1,0);
	//~ if (bResolutionOverrideActive) {
		//~ gl.glScalef(2f/(mfResolutionOverrideX),-2f/(mfResolutionOverrideY),1);
	//~ } else {
		//~ gl.glScalef(2f/(vm.mfScreenW),-2f/(vm.mfScreenH),1);
	//~ }
	var w = gMyCanvasWidth;
	var h = gMyCanvasHeight;
	gPerspective = matrixGetIdentity();
	gPerspective = matrixGetSimple(-1.0,1.0,0.0, 2/w,-2/h,1);
	setMatrixUniforms();
}




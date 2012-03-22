// see also love.render.js
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
	var pre = "love.graphics.";

	G.str['love'].str['graphics'] = t;
	
	// note: pass through variable argument list ? myfun.apply(null,arguments) http://stackoverflow.com/questions/676721/calling-dynamic-function-with-dynamic-parameters-in-javascript
	
	// love.graphics.newImage(path)
	t.str['newImage']			= function (path) { return [Love_Graphics_MakeImageHandle(new cLoveImage(path))]; }
	t.str['newImageFont']		= function (image, glyphs) { // see love.font.js
		if ((typeof image) == "string") {
			return [Love_Graphics_MakeImageFontHandle(new cLoveImageFont(new cLoveImage(path), glyphs))]; 
		} else {
			return [Love_Graphics_MakeImageFontHandle(new cLoveImageFont(image, glyphs))]; 
		}
	}
	t.str['newQuad']			= function (x, y, width, height, sw, sh) { return [Love_Graphics_MakeQuadHandle(new cLoveQuad(x, y, width, height, sw, sh))]; }
	t.str['drawq']				= function (image, quad, x, y, r, sx, sy, ox, oy) {
		var o = image._data;
		var q = quad._data;
		DrawSpriteQ(o.GetTextureID(),q,q.w,q.h,x,y,r||0,sx||1,(sy||sx)||1,ox||0,oy||0); 
		return []; 
	}
	
	// love.graphics.setBackgroundColor(r,g,b)
	t.str['setBackgroundColor']	= function (r,g,b,a) { 
		if ((typeof r) != "number") {
			var rgb = r;
			r = rgb.uints[0];
			g = rgb.uints[1];
			b = rgb.uints[2];
			a = rgb.uints[3] || 255;
		}
		gl.clearColor(r/255.0, g/255.0, b/255.0, (a||255)/255.0); 
	}
	
	// love.graphics.setColor(r,g,b,a)
	t.str['setColor']	= function (r,g,b,a) { 
		//  MainPrint("graphics.setColor called");
		if ((typeof r) != "number") {
			var rgb = r;
			r = rgb.uints[0];
			g = rgb.uints[1];
			b = rgb.uints[2];
			a = rgb.uints[3] || 255;
		}
		setColor(r,g,b,a); 
	}
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	t.str['draw']		= function (drawable, x, y, r, sx, sy, ox, oy ) {
		var o = drawable._data;
		if (o.IsImage())
				DrawSprite(o.GetTextureID(),o.getWidth(),o.getHeight(),x,y,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
		else	o.RenderSelf(x,y,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
	}
	
	t.str['setMode']			= function (width, height, fullscreen, vsync, fsaa) { MainPrint("setMode",width, height, fullscreen||false, vsync||true, fsaa||0); return NotImplemented(pre+'setMode'); }
	
	// TODO : "newImage" overloads
	// TODO : "draw" overloads
	
	t.str['scale']				= function (sx,sy,sz) { GLModelViewScale(sx || 1,sy || 1,sz || 1); return []; }
	
	t.str['getWidth']			= function () { return [gMyCanvasWidth]; }
	t.str['getHeight']			= function () { return [gMyCanvasHeight]; }
	
	t.str['print']				= function () { return NotImplemented(pre+'print'); }
	t.str['printf']				= function () { return NotImplemented(pre+'printf'); }
	
	t.str['checkMode']			= function () { return NotImplemented(pre+'checkMode'); }
	t.str['circle']				= function () { return NotImplemented(pre+'circle'); }
	t.str['clear']				= function () { return NotImplemented(pre+'clear'); }
	t.str['getBackgroundColor']	= function () { return NotImplemented(pre+'getBackgroundColor'); }
	t.str['getBlendMode']		= function () { return NotImplemented(pre+'getBlendMode'); }
	t.str['getCaption']			= function () { return NotImplemented(pre+'getCaption'); }
	t.str['getColor']			= function () { return NotImplemented(pre+'getColor'); }
	t.str['getColorMode']		= function () { return NotImplemented(pre+'getColorMode'); }
	t.str['getFont']			= function () { return NotImplemented(pre+'getFont'); }
	t.str['getLineStipple']		= function () { return NotImplemented(pre+'getLineStipple'); }
	t.str['getLineStyle']		= function () { return NotImplemented(pre+'getLineStyle'); }
	t.str['getLineWidth']		= function () { return NotImplemented(pre+'getLineWidth'); }
	t.str['getMaxPointSize']	= function () { return NotImplemented(pre+'getMaxPointSize'); }
	t.str['getModes']			= function () { return NotImplemented(pre+'getModes'); }
	t.str['getPointSize']		= function () { return NotImplemented(pre+'getPointSize'); }
	t.str['getPointStyle']		= function () { return NotImplemented(pre+'getPointStyle'); }
	t.str['getScissor']			= function () { return NotImplemented(pre+'getScissor'); }
	t.str['isCreated']			= function () { return NotImplemented(pre+'isCreated'); }
	t.str['line']				= function () { return NotImplemented(pre+'line'); }
	t.str['newFont']			= function () { return NotImplemented(pre+'newFont'); }
	t.str['newFramebuffer']		= function () { return NotImplemented(pre+'newFramebuffer'); }
	t.str['newParticleSystem']	= function () { return NotImplemented(pre+'newParticleSystem'); }
	t.str['newScreenshot']		= function () { return NotImplemented(pre+'newScreenshot'); }
	t.str['newSpriteBatch']		= function () { return NotImplemented(pre+'newSpriteBatch'); }
	t.str['point']				= function () { return NotImplemented(pre+'point'); }
	t.str['polygon']			= function () { return NotImplemented(pre+'polygon'); }
	t.str['pop']				= function () { return NotImplemented(pre+'pop'); }
	t.str['present']			= function () { return NotImplemented(pre+'present'); }
	t.str['push']				= function () { return NotImplemented(pre+'push'); }
	t.str['quad']				= function () { return NotImplemented(pre+'quad'); }
	t.str['rectangle']			= function () { return NotImplemented(pre+'rectangle'); }
	t.str['reset']				= function () { return NotImplemented(pre+'reset'); }
	t.str['rotate']				= function () { return NotImplemented(pre+'rotate'); }
	t.str['setBlendMode']		= function () { return NotImplemented(pre+'setBlendMode'); }
	t.str['setCaption']			= function () { return NotImplemented(pre+'setCaption'); }
	t.str['setColorMode']		= function () { return NotImplemented(pre+'setColorMode'); }
	t.str['setFont']			= function () { return NotImplemented(pre+'setFont'); }
	t.str['setIcon']			= function () { return NotImplemented(pre+'setIcon'); }
	t.str['setLine']			= function () { return NotImplemented(pre+'setLine'); }
	t.str['setLineStipple']		= function () { return NotImplemented(pre+'setLineStipple'); }
	t.str['setLineStyle']		= function () { return NotImplemented(pre+'setLineStyle'); }
	t.str['setLineWidth']		= function () { return NotImplemented(pre+'setLineWidth'); }
	t.str['setPoint']			= function () { return NotImplemented(pre+'setPoint'); }
	t.str['setPointSize']		= function () { return NotImplemented(pre+'setPointSize'); }
	t.str['setPointStyle']		= function () { return NotImplemented(pre+'setPointStyle'); }
	t.str['setRenderTarget']	= function () { return NotImplemented(pre+'setRenderTarget'); }
	t.str['setScissor']			= function () { return NotImplemented(pre+'setScissor'); }
	t.str['toggleFullscreen']	= function () { return NotImplemented(pre+'toggleFullscreen'); }
	t.str['translate']			= function () { return NotImplemented(pre+'translate'); }
	t.str['triangle']			= function () { return NotImplemented(pre+'triangle'); }

}

function setColor (r,g,b,a) {
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

// ***** ***** ***** ***** ***** cLoveImage


function Love_Graphics_MakeImageHandle (o) {
	var t = lua_newtable();
	var pre = "love.graphics.image.";
	t._data = o;
	
	t.str['getHeight']			= function (t) { return [t._data.getHeight		()]; }	// Returns the height of the Image.
	t.str['getWidth']			= function (t) { return [t._data.getWidth		()]; }	// Returns the width of the Image.
	
	t.str['getFilter']			= function (t) { return NotImplemented(pre+'getFilter'); }	// Gets the filter mode for an image.
	t.str['getWrap']			= function (t) { return NotImplemented(pre+'getWrap'); }	// Gets the wrapping properties of an Image.
	t.str['setFilter']			= function (t) { return NotImplemented(pre+'setFilter'); }	// Sets the filter mode for an image.
	t.str['setWrap']			= function (t) { return NotImplemented(pre+'setWrap'); }	// Sets the wrapping properties of an Image.
	
	t.str['type']				= function (t) { return ["Image"]; 					}	// Gets the type of the object as a string.  // TODO: lowercase ???
	t.str['typeOf']				= function (t) { return NotImplemented(pre+'typeOf'); }	// Checks whether an object is of a certain type.
	
	return t;
}

function cLoveImage (path) {
	var bPixelArt = false;
	//~ var bPixelArt = true;
	this.path = path;
	this.tex = loadImageTexture(gl, path, bPixelArt);
	this.bPreLoadWarningPrinted = false;
	
	this.GetTextureID	= function () { return this.tex; }
	this.IsImage		= function () { return true; }

	this.ensureLoaded	= function () {
		//~ MainPrint("img:ensureLoaded() complete=",this.tex.image.complete);
		if (!this.tex.image.complete) {
			//~ MainPrint("img:ensureLoaded() waiting for download to complete: path",this.path);
			//~ while (!this.tex.image.complete) alert("waiting for images to load...\nplease press 'ok' =)\n(no sleep() in javascript and setTimeout doesn't block)"); // seems there's no thread.sleep() in javascript that can block execution of subsequent code. 
			// setTimeout is not an option since it would need restructuring of the lua code that we don't have control over
			if (!this.bPreLoadWarningPrinted) {
				this.bPreLoadWarningPrinted = true;
				MainPrintToHTMLConsole("Warning, image("+this.path+"):getWidth()/getHeight() accessed before loaded, try reload/F5. "+
					"This could change game behaviour and cannot be reliably prevented at js/lua runtime alone, list img files in index.html : &lt;body onload=\"MainOnLoad(['img1.png','img2.png'])\"&gt; to fix");
			}
		}
	}
	this.getWidth		= function () { this.ensureLoaded(); return this.tex.image.width; }
	this.getHeight		= function () { this.ensureLoaded(); return this.tex.image.height; }

}



// ***** ***** ***** ***** ***** cLoveQuad

function Love_Graphics_MakeQuadHandle (o) {
	var t = lua_newtable();
	var pre = "love.graphics.quad.";
	t._data = o;
	
	t.str['flip']				= function (t) { return NotImplemented(pre+'flip'); }	// Flips this quad horizontally, vertically, or both.
	t.str['getViewport']		= function (t) { return NotImplemented(pre+'getViewport'); }	// Gets the current viewport of this Quad.
	t.str['setViewport']		= function (t) { return NotImplemented(pre+'setViewport'); }	// Sets the texture coordinates according to a viewport.

	t.str['type']				= function (t) { return NotImplemented(pre+'type'); }	// Gets the type of the object as a string.
	t.str['typeOf']				= function (t) { return NotImplemented(pre+'typeOf'); }	// Checks whether an object is of a certain type.
	
	return t;
}

function cLoveQuad (x, y, width, height, sw, sh) {

	this.UpdateTexCoordBuffer = function () {
		var		u0 = this.x/this.sw;
		var		v0 = this.y/this.sh;
		var		u1 = (this.x+this.w)/this.sw;
		var		v1 = (this.y+this.h)/this.sh;
		var		a;
		if (this.bFlippedX) { a = u0; u0 = u1; u1 = a; }
		if (this.bFlippedY) { a = v0; v0 = v1; v1 = a; }
		UpdateGlFloatBuffer(gl,this.vb_Tex,[u0,v0, u1,v0, u0,v1, u1,v1],gl.STATIC_DRAW);
	}
	
	this.setViewport = function (x,y,w,h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.UpdateTexCoordBuffer();
	}
	
	this.sw = sw;
	this.sh = sh;
	this.vb_Tex = MakeGlFloatBuffer(gl,[0,0, 10,0, 0,10, 10,10],gl.STATIC_DRAW);
	this.setViewport(x,y,width,height);
	
	// TODO
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
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,  gl.ZERO,  gl.ONE); // rgb=blended alpha=keep-destination
	// alpha,1-alpha,0,1 = replace ?   not available in webgl: gl.texEnvf(gl.TEXTURE_ENV, gl.TEXTURE_ENV_MODE, gl.REPLACE);
	gl.blendEquation(gl.FUNC_ADD); // = blendEquationSeparate(add,add)
	
	// todo : love.setBlendMode/setColorMode see love-android-java
	//~ t.set("setBlendMode",		new VarArgFunction() { @Override public Varargs invoke(Varargs args) { setBlendMode(Str2BlendMode(args.checkjstring(1))); return LuaValue.NONE; } });
	//~ t.set("setColorMode",		new VarArgFunction() { @Override public Varargs invoke(Varargs args) { setColorMode(Str2ColorMode(args.checkjstring(1))); return LuaValue.NONE; } });
		
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

var gGLMatrix_ModelView;
var gGLMatrix_Perspective;
function matrixGetIdentity() { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; }
function matrixGetSimple(tx,ty,tz, sx,sy,sz) { return [ sx,0,0,0, 0,sy,0,0, 0,0,sz,0, tx,ty,tz,1 ]; }

function GLModelViewScale (sx,sy,sz) {
	gGLMatrix_ModelView[0*4+0] *= sx;
	gGLMatrix_ModelView[1*4+1] *= sy;
	gGLMatrix_ModelView[2*4+2] *= sz;
	setMatrixUniforms();
}

function setMatrixUniforms() {
    //~ gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    //~ gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
	
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,  false, new Float32Array(gGLMatrix_Perspective)); // perspective
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(gGLMatrix_ModelView)); // modelview
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
	gGLMatrix_ModelView = matrixGetIdentity();
	gGLMatrix_Perspective = matrixGetIdentity();
	gGLMatrix_Perspective = matrixGetSimple(-1.0,1.0,0.0, 2/w,-2/h,1);
	setMatrixUniforms();
}




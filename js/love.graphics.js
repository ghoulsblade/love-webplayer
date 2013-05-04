// see also love.render.js
var gl;
var shaderProgram;
var gMaterialColor = [1,1,1,1];
var mFont;
var mDefaultFont;
var gLineWidth = 1; // or mLineWidth?

/// called on startup after pageload
function Love_Graphics_Init () {
	canvas = document.getElementById(gWebGLCanvasId);
	initWebGL(canvas);      // Initialize the GL context  
	if (!gl) return; // WebGL available and working  
	LoveRender_Init();
	MyCheckGLError();
	MainInitScene();
	MyCheckGLError();
	
	mDefaultFont = makeDefaultFont();
	mFont = mDefaultFont;
	MyCheckGLError();
}

function MyDefault (x,def) { return (x == undefined) ? def : x; }

/// init lua api
function Love_Graphics_CreateTable () {
	var t = {};
	var pre = "love.graphics.";

	// note: pass through variable argument list ? myfun.apply(null,arguments) http://stackoverflow.com/questions/676721/calling-dynamic-function-with-dynamic-parameters-in-javascript
	
	// love.graphics.newImage(path)
	t['newImage']			= function (a) { return [new cLoveImage(a)]; }
	
	// font = love.graphics.newImageFont( image, glyphs )
	// font = love.graphics.newImageFont( filename, glyphs )
	t['newImageFont']		= function (image_or_filename, glyphs) { // see love.font.js
		return [new cLoveImageFont(image_or_filename, glyphs)]; 
	}
	
	// font = love.graphics.newFont( filename, size=12 )
	// font = love.graphics.newFont( size ) // This variant uses the default font (Vera Sans) with a custom size. 
	t['newFont']			= function (a,b) { 
		return [new cLoveWebFont(a,b)]; 
	}
	
	t['newQuad']			= function (x, y, width, height, sw, sh) { return [new cLoveQuad(x, y, width, height, sw, sh)]; }
	t['drawq']				= function (image, quad, x, y, r, sx, sy, ox, oy) {
		var o = image;
		var q = quad;
		DrawSpriteQ(o.GetTextureID(),q,q.w,q.h,x,y,r||0,sx||1,(sy||sx)||1,ox||0,oy||0);
		return LuaNil;
	}
	
	// love.graphics.setBackgroundColor(r,g,b)
	t['setBackgroundColor']	= function (r,g,b,a) { 
		if ((typeof r) != "number") {
			var rgb = r;
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
			a = MyDefault(rgb[3],255);
		}
		gl.clearColor(r/255.0, g/255.0, b/255.0, MyDefault(a,255)/255.0);
		return LuaNil;
	}
	
	// love.graphics.setColor(r,g,b,a)
	t['setColor']	= function (r,g,b,a) { 
		//  MainPrint("graphics.setColor called");
		if ((typeof r) != "number") {
			var rgb = r;
			r = rgb[0];
			g = rgb[1];
			b = rgb[2];
			a = MyDefault(rgb[3],255);
		}
		setColor(r,g,b,a);
		return LuaNil;
	}
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	t['draw']		= function (drawable, x, y, r, sx, sy, ox, oy ) {
		var o = drawable;
		if (o.IsImage())
				DrawSprite(o.GetTextureID(),o.getWidth(),o.getHeight(),x || 0,y || 0,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
		else	o.RenderSelf(x || 0,y || 0,r || 0.0,sx || 1.0,sy || 1.0,ox || 0.0,oy || 0.0);
		return LuaNil;
	}
	
	t['setMode']			= function (width, height, fullscreen, vsync, fsaa)
	{
		gScreenWidth = width || gScreenWidth;
		gScreenHeight = height || gScreenHeight;
		var canvas = document.getElementById(gWebGLCanvasId);
		if (canvas)
		{
			canvas.width = gScreenWidth;
			canvas.height = gScreenHeight;
		}
		// fullscreen||false, (vsync == undefined)?true:vsync, fsaa||0
		return LuaNil;
	}
	
	// TODO : "newImage" overloads
	// TODO : "draw" overloads
	
	t['rectangle']			= function (mode, x, y, w, h) { renderRectangle(mode, x, y, w, h); return LuaNil; }
	t['circle']				= function (mode, x, y, radius, segments) { renderCircle(mode, x, y, radius, segments || 10); return LuaNil; }
	t['arc']				= function (mode, x, y, radius, angle1, angle2, segments) { renderArc(mode, x, y, radius, angle1, angle2, segments || 10); return LuaNil; }
	t['triangle']			= function (mode, x1, y1, x2, y2, x3, y3) { renderTriangle(mode, x1, y1, x2, y2, x3, y3); return LuaNil; }
	t['polygon']			= function () { renderPolygon(arguments[0],arguments); return LuaNil; }
	t['quad']				= function (mode, x1, y1, x2, y2, x3, y3, x4, y4) { renderQuad(mode, x1, y1, x2, y2, x3, y3, x4, y4); return LuaNil; }
	t['line']				= function (x1, y1, x2, y2) { if (arguments.length > 4) renderPolyLine(arguments); else renderLine(x1, y1, x2, y2); return LuaNil; }
	t['point']				= function (x,y) { renderPoint(x, y); return LuaNil; }
	t['clear']				= function () { gl.clear(gl.COLOR_BUFFER_BIT); return LuaNil; } // 	Clears the screen to background color.
	
	t['reset']				= function () { 
		//~ Calling reset makes the 
		setColor(255,255,255,255); // current drawing color white, 
		gl.clearColor(0,0,0,1); // the current background color black, 
		// the window title empty 
		setScissor();// and removes any scissor settings. 
		// It sets the BlendMode to alpha and ColorMode to modulate. 
		// It also sets both the point and line drawing modes to smooth and their sizes to 1.0 . 
		// Finally, it removes any stipple settings. 
		return NotImplemented(pre+'reset');
	}
	t['scale']				= function (sx,sy) { GLModelViewScale(sx || 1,sy || 1,1); return LuaNil; }
	t['translate']			= function (tx,ty) { GLModelViewTranslate(tx || 0,ty || 0,0); return LuaNil; }
	t['rotate']				= function () { return NotImplemented(pre+'rotate'); }
	t['push']				= function () { GLModelViewPush(); }
	t['pop']				= function () { GLModelViewPop(); }
	
	t['getWidth']			= function () { return [gMyCanvasWidth]; }
	t['getHeight']			= function () { return [gMyCanvasHeight]; }
	
	t['print']				= function (s, x, y, r, sx, sy)		{ if (mFont != null) mFont.print(String(s), x, y, r||0, sx||1, (sy||sx)||1 ); return LuaNil; }
	t['printf']				= function (s, x, y, limit, align )	{ if (mFont != null) mFont.printf(String(s), x, y, limit, align || "left"); return LuaNil; }
	t['setFont']			= function (x) { mFont = (x == undefined) ? mDefaultFont : x; return LuaNil; }
	//~ t['setFont']			= function (x) { mFont = mDefaultFont; return LuaNil; }
	
	t['newFramebuffer']		= function () { return NotImplemented(pre+'newFramebuffer'); }
	t['newParticleSystem']	= function () { return NotImplemented(pre+'newParticleSystem'); }
	t['newScreenshot']		= function () { return NotImplemented(pre+'newScreenshot'); }
	t['newSpriteBatch']		= function () { return NotImplemented(pre+'newSpriteBatch'); }
	
	t['present']			= function () { return NotImplemented(pre+'present'); } // Displays the results of drawing operations on the screen.  (in custom love.run)
	t['isCreated']			= function () { return NotImplemented(pre+'isCreated'); }
	t['checkMode']			= function () { return NotImplemented(pre+'checkMode'); }
	t['toggleFullscreen']	= function () { return NotImplemented(pre+'toggleFullscreen'); }
	
	t['getBackgroundColor']	= function () { return NotImplemented(pre+'getBackgroundColor'); }
	t['getBlendMode']		= function () { return [gBlendMode]; }
	t['getCaption']			= function () { return NotImplemented(pre+'getCaption'); }
	t['getColor']			= function () { return NotImplemented(pre+'getColor'); }
	t['getColorMode']		= function () { return NotImplemented(pre+'getColorMode'); }
	t['getFont']			= function () { return NotImplemented(pre+'getFont'); }
	t['getLineStipple']		= function () { return NotImplemented(pre+'getLineStipple'); }
	t['getLineStyle']		= function () { return NotImplemented(pre+'getLineStyle'); }
	t['getLineWidth']		= function () { return [gLineWidth]; }
	t['getMaxPointSize']	= function () { return NotImplemented(pre+'getMaxPointSize'); }
	t['getModes']			= function () { return NotImplemented(pre+'getModes'); }
	t['getPointSize']		= function () { return NotImplemented(pre+'getPointSize'); }
	t['getPointStyle']		= function () { return NotImplemented(pre+'getPointStyle'); }
	t['getScissor']			= function () { return NotImplemented(pre+'getScissor'); }
	
	t['setBlendMode']		= function (mode) { setBlendMode(mode); return LuaNil; }
	t['setCaption']			= function (caption)
	{
		document.title = caption;
        return LuaNil;
	}
	t['setColorMode']		= function () { return NotImplemented(pre+'setColorMode'); }
	t['setIcon']			= function () { return NotImplemented(pre+'setIcon'); }
	t['setLine']			= function () { return NotImplemented(pre+'setLine'); }
	t['setLineStipple']		= function () { return NotImplemented(pre+'setLineStipple'); }
	t['setLineStyle']		= function () { return NotImplemented(pre+'setLineStyle'); }
	t['setLineWidth']		= function (width) { gLineWidth = width; gl.lineWidth(width); return LuaNil; }
	t['setPoint']			= function () { return NotImplemented(pre+'setPoint'); }
	t['setPointSize']		= function () { return NotImplemented(pre+'setPointSize'); }
	t['setPointStyle']		= function () { return NotImplemented(pre+'setPointStyle'); }
	t['setRenderTarget']	= function () { return NotImplemented(pre+'setRenderTarget'); }
	
	t['setScissor']			= function (left, top, width, height) { setScissor(left, top, width, height); }
	
	if (gEnableLove080) {
		t['setDefaultImageFilter']	= function () { return NotImplemented(pre+'setDefaultImageFilter'); }
	}

    Lua.inject(t, null, 'love.graphics');

}

var mScissorEnabled = false;
var mScissorBox = {};
function setScissor (left, top, width, height) {
	if (left) {
		mScissorBox.left = left;
		mScissorBox.top = top;
		mScissorBox.width = width;
		mScissorBox.height = height;
		mScissorEnabled = true;
		
		gl.scissor(
				mScissorBox.left, 
				(gMyCanvasHeight - (mScissorBox.top + mScissorBox.height)), // Compensates for the fact that our y-coordinate is reverse of OpenGLs.
				mScissorBox.width, 
				mScissorBox.height);
		gl.enable(gl.SCISSOR_TEST);
	} else {
		mScissorEnabled = false;
		gl.disable(gl.SCISSOR_TEST);
	}
}

function restoreScissorState() {
	if (mScissorEnabled)
			setScissor(mScissorBox.left, mScissorBox.top, mScissorBox.width, mScissorBox.height);
	else	setScissor();
}

function setColor (r,g,b,a) {
	gl.uniform4f(shaderProgram.materialColorUniform,(r == undefined) ? 1 : (r/255.0),(g == undefined) ? 1 : (g/255.0),(b == undefined) ? 1 : (b/255.0),(a == undefined) ? 1 : (a/255.0));
}

/// called every frame (before love.update and love.draw)
function Love_Graphics_Step_Start() {
	if (shaderProgram == null) return;
	UtilReshapeCanvas(gl,gWebGLCanvasId); // resize+viewport+cam perspective
	
	if (shaderProgram != null) {
		SetMaterialColor(1,1,1,1);
		MySetTranslateUniform(0,0,0);
	}
	
	
	gl.disable(gl.SCISSOR_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT);
	restoreScissorState();
	
	//~ bVertexBuffersSprite = false;
	//~ setVertexBuffersToSprite();
	
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
gl.bindTexture(gl.TEXTURE_2D, crateTexture); gLastGLTexture = crateTexture;
gl.uniform1i(shaderProgram.samplerUniform, 0);
gl.uniform1i(shaderProgram.useLightingUniform, lighting);
*/

// ***** ***** ***** ***** ***** cLoveImage

function Love_Graphics_MakeImageHandle (o) {
	var t = {};
	var pre = "love.graphics.image.";
	t._data = o;
	
	t['getHeight']			= function (t) { return [t._data.getHeight		()]; }	// Returns the height of the Image.
	t['getWidth']			= function (t) { return [t._data.getWidth		()]; }	// Returns the width of the Image.
	
	t['getFilter']			= function (t) { return [t._data.mode_filter_min,t._data.mode_filter_mag]; }	// Gets the filter mode for an image.
	t['getWrap']			= function (t) { return [t._data.mode_warp_h,t._data.mode_warp_v]; }	// Gets the wrapping properties of an Image.
	t['setFilter']			= function (t,smin,smag) { t._data.setFilter(smin,smag); }	// Sets the filter mode for an image.
	t['setWrap']			= function (t,h,v) { t._data.setWrap(h,v); }	// Sets the wrapping properties of an Image.
	
	t['type']				= function (t) { return ["Image"]; 					}	// Gets the type of the object as a string.  // TODO: lowercase ???
	t['typeOf']				= function (t) { return NotImplemented(pre+'typeOf'); }	// Checks whether an object is of a certain type.
	
	return t;
}

function cLoveImage (a) {
    var self = this; // So that all functions are "bound"
	var bPixelArt = false;
	self.bPreLoadWarningPrinted = false;
	self.mode_filter_min = "linear"; // linear,nearest
	self.mode_filter_mag = "linear"; // linear,nearest
	self.mode_warp_h = "clamp"; // clamp,repeat
	self.mode_warp_v = "clamp"; // clamp,repeat
	self.bIsFromCanvas = false;
    self.__handle = true; // Only pass into Lua by reference
	
	if ((typeof a) == "string") {	
		// load image from path
		var path = a;
		self.path = path;
		self.tex = loadImageTexture(gl, path, bPixelArt);
	} else if ((typeof a) == "object") {
		if (a._data && a._data.canvas) {
			// load image from imagedata
			var imgdata = a._data;
			self.bIsFromCanvas = true;
			self.path = "(imgdata)";
			var texture = gl.createTexture();
			self.tex = texture;
			doLoadImageTexture(gl, imgdata.canvas, texture, bPixelArt);
			//~ MainPrint("cLoveImage from imgdata:",imgdata.canvas.width);
			self.width = imgdata.canvas.width;
			self.height = imgdata.canvas.height;
		} else {
			MainPrint("cLoveImage unexpcected constructor obj:",a);
		}
	} else {
		MainPrint("cLoveImage unexpcected constructor param:",a);
	}
	
	self.setFilter		= function (smin,smag) {
		self.mode_filter_min = smin;
		self.mode_filter_mag = smag;
		self.UpdateTexParams();
	}
	self.setWrap		= function (h,v) {
		self.mode_warp_h = h;
		self.mode_warp_v = v;
		self.UpdateTexParams();
	}
	self.UpdateTexParams		= function () {
		updateTextureParams(gl,self.tex,
			(self.mode_filter_min == "linear")?gl.LINEAR:gl.NEAREST,
			(self.mode_filter_mag == "linear")?gl.LINEAR:gl.NEAREST,
			(self.mode_warp_h == "clamp")?gl.CLAMP_TO_EDGE:gl.REPEAT,
			(self.mode_warp_v == "clamp")?gl.CLAMP_TO_EDGE:gl.REPEAT );
	}
	
	self.GetTextureID	= function () { return self.tex; }
	self.IsImage		= function () { return true; }

	self.ensureLoaded	= function () {
		//~ MainPrint("img:ensureLoaded() complete=",self.tex.image.complete);
		if (!self.tex.image.complete) {
			//~ MainPrint("img:ensureLoaded() waiting for download to complete: path",self.path);
			//~ while (!self.tex.image.complete) alert("waiting for images to load...\nplease press 'ok' =)\n(no sleep() in javascript and setTimeout doesn't block)"); // seems there's no thread.sleep() in javascript that can block execution of subsequent code. 
			// setTimeout is not an option since it would need restructuring of the lua code that we don't have control over
			if (!self.bPreLoadWarningPrinted) {
				self.bPreLoadWarningPrinted = true;
				MainPrintToHTMLConsole("Warning, image("+self.path+"):getWidth()/getHeight() accessed before loaded, try reload/F5. "+
					"This could change game behaviour and cannot be reliably prevented at js/lua runtime alone, list img files in index.html : &lt;body onload=\"MainOnLoad(['img1.png','img2.png'])\"&gt; to fix");
			}
		}
	}
	self.getWidth		= function () { if (self.bIsFromCanvas) return self.width; self.ensureLoaded(); return self.tex.image.width; }
	self.getHeight		= function () { if (self.bIsFromCanvas) return self.height; self.ensureLoaded(); return self.tex.image.height; }

}



// ***** ***** ***** ***** ***** cLoveQuad

function cLoveQuad (x, y, width, height, sw, sh) {
    var self = this;
    self.__handle = true;

	self.UpdateTexCoordBuffer = function () {
		var		u0 = self.x/self.sw;
		var		v0 = self.y/self.sh;
		var		u1 = (self.x+self.w)/self.sw;
		var		v1 = (self.y+self.h)/self.sh;
		var		a;
		if (self.bFlippedX) { a = u0; u0 = u1; u1 = a; }
		if (self.bFlippedY) { a = v0; v0 = v1; v1 = a; }
		UpdateGlFloatBuffer(gl,self.vb_Tex,[u0,v0, u1,v0, u0,v1, u1,v1],gl.DYNAMIC_DRAW);
	}
	
	self.setViewport = function (x,y,w,h) {
		self.x = x;
		self.y = y;
		self.w = w;
		self.h = h;
		self.UpdateTexCoordBuffer();
	}
	
	self.sw = sw;
	self.sh = sh;
	self.vb_Tex = MakeGlFloatBuffer(gl,[0,0, 10,0, 0,10, 10,10],gl.DYNAMIC_DRAW);
	self.setViewport(x,y,width,height);
	
	// TODO
}

// ***** ***** ***** ***** ***** webgl stuff 

/// download code via synchronous ajax... sjax? ;)
function LoadShaderCode (url) {
	var mycode;
	UtilAjaxGet(url,function (code) { mycode = code; },true);
	return mycode;
}

function MyLoadShader (mode,code) {
	var shader = gl.createShader(mode);
	gl.shaderSource(shader, code);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw gl.getShaderInfoLog(shader);
	return shader;
}

function MainInitScene () {
	gl.clearColor(0,0,0,1);  // Set clear color to black, fully opaque  
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
	try {
		//~ var fragmentShader = gShaderCode_Fragment_NoTex ? MyLoadShader(gl.FRAGMENT_SHADER,gShaderCode_Fragment_NoTex) : getShader(gl, "shader-fs");
		var fragmentShader = gShaderCode_Fragment ? MyLoadShader(gl.FRAGMENT_SHADER,gShaderCode_Fragment) : getShader(gl, "shader-fs");
		var vertexShader = gShaderCode_Vertex ? MyLoadShader(gl.VERTEX_SHADER,gShaderCode_Vertex) : getShader(gl, "shader-vs");
		
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
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) throw ("Unable to initialize the shader program.");
		// note : this happens on win-vista missing drivers (directx for angle or opengl) for webgl in firefox beta8

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
		shaderProgram.uFragOverrideAddColor			= gl.getUniformLocation(shaderProgram, "uFragOverrideAddColor");
		if (shaderProgram.my_uTranslate == null || shaderProgram.my_uTranslate == -1) alert("shader error : couldn't find uTranslate");
	
		gl.uniform4f(shaderProgram.materialColorUniform,1,1,1,1);
		gl.uniform4f(shaderProgram.uFragOverrideAddColor,0,0,0,0);
		
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
	} catch (e) {
		LoveFatalError("error during shader init:"+String(e));
		return;
	}
	
	//~ gTex_Tools		= loadImageTexture(gl, "gfx/tools.gif", true);
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
var gGLMatrix_Normals;

function GLModelViewScale (sx,sy,sz) {
	matrix4Scale(gGLMatrix_ModelView,sx,sy,sz);
	setMatrixUniforms_MV();
}

function GLModelViewTranslate (tx,ty,tz) {
	matrix4Translate(gGLMatrix_ModelView,tx,ty,tz);
	setMatrixUniforms_MV();
}

var gLoveMatrix_Stack = [];
function GLModelViewPush () { gLoveMatrix_Stack.push(matrix4Clone(gGLMatrix_ModelView)); }
function GLModelViewPop () {
	if (gLoveMatrix_Stack.length <= 0) { MainPrint("ERROR: GLModelViewPop: stack empty"); return; }
	var m = gLoveMatrix_Stack.pop();
	matrixSet(gGLMatrix_ModelView,m);
	setMatrixUniforms_MV();
}

var gBlendMode = 'alpha';
function setBlendMode(mode) {
	gBlendMode = mode;
	if(mode == 'additive') {
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	}
	else if(mode == 'alpha') {
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}
	else if(mode == 'multiplicative') {
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
	}
	else if(mode == 'premultiplied') {
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	}
	else if(mode == 'subtractive') {
		gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT); // or FUNC_SUBTRACT? (this is per the LoVE sources)
		gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
	}
}

function setMatrixUniforms_MV() {	
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(gGLMatrix_ModelView)); // modelview
}

function setMatrixUniforms() {	
	setMatrixUniforms_MV();
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,  false, new Float32Array(gGLMatrix_Perspective)); // perspective
	gl.uniformMatrix4fv(shaderProgram.nMatrixUniform,  false, new Float32Array(gGLMatrix_Normals)); // normal (unused) also when modelview?
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
	gGLMatrix_ModelView = matrix4GetIdentity();
	gGLMatrix_Perspective = matrix4GetTranslateScale(-1.0,1.0,0.0, 2/w,-2/h,1);
	gGLMatrix_Normals = matrix4GetIdentity();
	setMatrixUniforms();
}




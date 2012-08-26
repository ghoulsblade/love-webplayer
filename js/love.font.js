var kDefaultImageFontURL;
if (window.location.host == "ghoulsblade.schattenkind.net") kDefaultImageFontURL = "http://ghoulsblade.schattenkind.net/love-webplayer/iyfct/gfx/imgfont.png";
if (window.location.host == "localhost" && window.location.pathname.substring(0,16) == "/love-webplayer/") kDefaultImageFontURL = "http://localhost/love-webplayer/iyfct/gfx/imgfont.png";
// otherwise : error:cross domain security. we'll have to canvas-draw sth.

/// init lua api
function Love_Font_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.font.";

	G.str['love'].str['font'] = t;
	
	t.str['newFontData']	= function () { return NotImplemented(pre+'newFontData'); }
	t.str['newGlyphData']	= function () { return NotImplemented(pre+'newGlyphData'); }
	t.str['newRasterizer']	= function () { return NotImplemented(pre+'newRasterizer'); }
}


// ***** ***** ***** ***** ***** cLoveFont

var g_mVB_Pos_font;
var g_mVB_Tex_font;
var g_mVB_Pos2_font;
var g_mVB_Tex2_font;
var AlignMode = {};
AlignMode.CENTER = "center";
AlignMode.LEFT = "left";
AlignMode.RIGHT = "right";

function Love_Graphics_MakeFontHandle (o) {
	var t = lua_newtable();
	var pre = "love.graphics.font.";
	t._data = o;
	
	t.str['getHeight']			= function (t) { return [t._data.font_h]; }	// Gets the height of the Font in pixels.
	t.str['getLineHeight']		= function (t) { return [t._data.line_h]; }	// Gets the line height.
	t.str['getWidth']			= function (t,txt) { return [t._data.getLineW(txt)]; }	// Determines the horizontal size a line of text needs.
	t.str['getWrap']			= function (t) { NotImplemented(pre+'getWrap'); return [1]; }	// Returns how many lines text would be wrapped to.
	t.str['setLineHeight']		= function (t,line_h) { t._data.line_h = line_h; }	// Sets the line height.
	t.str['type']				= function (t) { return ["Font"]; }	// Gets the type of the object as a string.
	t.str['typeOf']				= function (t,x) { return [x == "Object" || x == "Font"]; }	// Checks whether an object is of a certain type.
	
	return t;
}

function GlyphInfo (w,movex,u0,u1) {
	this.w = w;
	this.movex = movex;
	this.u0 = u0;
	this.v0 = 0;
	this.u1 = u1;
	this.v1 = 1;
};

function cLoveFont (caller_name,a,b) {
	this.TAG = "love.graphics.font";
	this.kMaxGlyphsPerString = 1024*8; // limit not really needed in webgl, keep code for porting code to other platforms
	this.kMaxVerticesPerString = this.kMaxGlyphsPerString * 6;
	
	this.w_space = 0; // TODO: set from letter 'a' ? 
	this.font_h = 12; // TODO: set from letter 'a' ? probably just the height of the whole image
	this.line_h = 1.5; ///< Gets the line height. This will be the value previously set by Font:setLineHeight, or 1.0 by default. 
	this.bForceLowerCase = false;
	this.mGlyphInfos = {};
	this.imgGetPixelContext = null;
	
	this.prepareImgForGetPixel = function (img) {
		var newCanvas = document.createElement('canvas');
		newCanvas.width = img.width;
		newCanvas.height = img.height;
		var context = newCanvas.getContext('2d');
		context.drawImage(img, 0, 0);
		this.imgGetPixelContext = context;
		//~ document.getElementById("output").appendChild(newCanvas);
		// NOTE:getpixel : http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
		// NOTE:getpixel : http://stackoverflow.com/questions/1041399/how-to-use-javascript-or-jquery-to-read-a-pixel-of-an-image
		// NOTE:getpixel : http://stackoverflow.com/questions/4154223/get-pixel-from-bitmap
	}
	this.getPixel = function(x,y) { 
		var data = this.imgGetPixelContext.getImageData(x, y, 1, 1).data; 
		//~ if (x == 0 && y == 0) MainPrint("font pixel0,0=",this.img.path,typeof data,data);
		//~ return data ? (data[0] + 256*(data[1] + 256*(data[2] + 256*data[3]))) : 0;
		return data ? (data[0] + 256*(data[1] + 256*(data[2]))) : 0;
	}

	/// constructor
	this.init_default_font = function (image_or_filename,glyphs) {
		// TODO: "Vera Sans"  12 . but until ttf/canvas font stuff works, just use standard image font 
		if (kDefaultImageFontURL) {
			this.init_image_font(kDefaultImageFontURL," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·");
			this.bForceLowerCase = true;
		}
	}
	
	this.init_image_font = function (image_or_filename,glyphs) {
		this.glyphs = glyphs;
		var img;
		if ((typeof image_or_filename) == "string")
				img = new cLoveImage(image_or_filename);
		else	img = image_or_filename._data;
		this.prepareImgForGetPixel(img.tex.image);
		this.init(img, glyphs);
	}
	
	this.constructor = function (caller_name,a,b) {
		if (caller_name == "initDefaultFont") {
			if (!kDefaultImageFontURL) MainPrint("warning:kDefaultImageFontURL not set for this hostname/path (needed for cross-domain image-load), default font disabled");
			// otherwise : error:cross domain security. we'll have to canvas-draw sth.
			this.init_default_font();
		}
		if (caller_name == "newImageFont") {
			// font = love.graphics.newImageFont( image, glyphs )
			// font = love.graphics.newImageFont( filename, glyphs )
			// Creates a new font by loading a specifically formatted image.  : https://love2d.org/wiki/ImageFontFormat
			this.init_image_font(a,b);
		} else if (caller_name == "newFont") {
			// font = love.graphics.newFont( filename, size=12 )
			// font = love.graphics.newFont( size=12 ) // This variant uses the default font (Vera Sans) with a custom size. 
			var filename;
			var size;
			if ((typeof a) == "string") {
				filename = a;
				size = (b == undefined) ? 12 : b;
			} else {
				//~ filename = "Vera Sans";
				size = (a == undefined) ? 12 : a;
			}
			NotImplemented('love.graphics.newFont (ttf)');
			this.init_default_font(); // fallback
		}
	}
	
	this.getGlyphInfo = function (c) { return this.mGlyphInfos[c]; }
	
	
	/*
	/// ttf font
	public LuanObjFont (LuanGraphics g, String ttf_filename, int iSize) throws IOException { 
		super(g.vm);
		
		File ttfFile = g.vm.getStorage().forceGetFileFromLovePath(ttf_filename);
		FontRasterizer r = new FontRasterizer(ttfFile);
		
//		String glyphs = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
		String glyphs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		
		Bitmap b = r.renderBitmapFont(glyphs, iSize, 1, Color.MAGENTA, Color.TRANSPARENT, Color.WHITE);
		
		init(g, new LuanObjImage(g, b), glyphs);
	}
	
	/// ttf font, default ttf_filename to verdana sans
	public LuanObjFont (LuanGraphics g,int iSize) throws IOException { this(g); this.g = g; NotImplemented("font:ttf with size"); } 
	
	/// fall back to image font in resources
	public LuanObjFont (LuanGraphics g) throws IOException { this(g,new LuanObjImage(g, R.raw.imgfont_w)," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·"); this.g = g; bForceLowerCase = true; } 
	
	/// imageFont
	public LuanObjFont (LuanGraphics g,String filename,String glyphs) throws FileNotFoundException { this(g,new LuanObjImage(g,filename),glyphs); }
	*/
	
	
	this.init = function (img, glyphs) {
		this.img = img;
		// TODO
		
		/*
		The imagefont file is an image file in a format that L�ve can load. It can contain transparent pixels, so a PNG file is preferable, and it also needs to contain spacer color that will separate the different font glyphs.
		The upper left pixel of the image file is always taken to be the spacer color. All columns that have this color as their uppermost pixel are interpreted as separators of font glyphs. The areas between these separators are interpreted as the actual font glyphs.
		The width of the separator areas affect the spacing of the font glyphs. It is possible to have more areas in the image than are required for the font in the love.graphics.newImageFont() call. The extra areas are ignored. 
		*/
		var col = this.getPixel(0,0);
		var x = 0;
		var imgw = img.getWidth();
		this.font_h = img.getHeight();
		this.w_space = 0;
		while (x < imgw && this.getPixel(x,0) == col) ++x; // skip first separator column
			
		//~ if (pLog != null) pLog.println("FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		//~ MainPrint(this.TAG,"FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		
		for (var i=0;i<glyphs.length;++i) {
			var c = glyphs.charAt(i);
			
			// calc the size of the glyph
			var w = 1;
			while (x+w < imgw && this.getPixel(x+w,0) != col) ++w;
				
			// calc the size of the separator
			var spacing = 0;
			while (x+w+spacing < imgw && this.getPixel(x+w+spacing,0) == col) ++spacing;
			
			// register glyph
			//~ MainPrint(this.TAG,"glyph:"+c+":x="+x+",w="+w+",spacing="+spacing);
			this.mGlyphInfos[c] = new GlyphInfo(w,w+spacing,x/imgw,(x+w)/imgw);
			
			//~ if (pLog != null) pLog.println("glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			//~ MainPrint(this.TAG,"glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			
			if (this.w_space == 0) this.w_space = w;
			x += w+spacing;
		}
		
		var gi = this.getGlyphInfo(' '); 
		if (gi != null) this.w_space = gi.movex;
	}
	
	
	this.isWhiteSpace = function (c) { return c == ' ' || c == '\t' || c == '\r' || c == '\n'; }
	this.getGlyphMoveX = function (c) { 
		if (c == ' ') return this.w_space;
		if (c == '\t') return 4*this.w_space;
		
		var gi = this.getGlyphInfo(c); 
		if (gi != null) return gi.movex;
		
		return 0;
	}
	
	// render buffer 
	
	//~ private FloatBuffer	mVB_Pos;
	//~ private FloatBuffer	mVB_Tex;
	//~ private float[]		mVB_Pos2;
	//~ private float[]		mVB_Tex2;
	//~ int					mBufferVertices;
	
	this.prepareBuffer = function (maxglyphs) { this.prepareBuffer(maxglyphs,0); }
	this.prepareBuffer = function (maxglyphs,fRotate) {
		if (maxglyphs > this.kMaxGlyphsPerString) {
			NotImplemented("font: really really long text");
		}
		
		// alloc/resize float buffers
		if (g_mVB_Pos_font == null) {
			g_mVB_Pos_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
			g_mVB_Tex_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
			g_mVB_Pos2_font = [this.kMaxVerticesPerString*2];
			g_mVB_Tex2_font = [this.kMaxVerticesPerString*2];
		}
		this.mVB_Pos = g_mVB_Pos_font;
		this.mVB_Tex = g_mVB_Tex_font;
		this.mVB_Pos2 = g_mVB_Pos2_font;
		this.mVB_Tex2 = g_mVB_Tex2_font;
		
		this.mBufferVertices = 0;
	}
	
	
	this.addCharToBuffer  = function (c,draw_x,draw_y) { this.addCharToBufferS(c,draw_x,draw_y,1,1); }
	this.addCharToBufferS = function (c,draw_x,draw_y, sx, sy) {
		var gi = this.getGlyphInfo(c);
		if (gi == null) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Tex = null"); return; }
			
		// add geometry to float buffers if possible
		
		var ax = draw_x;
		var ay = draw_y;
		var vx_x = gi.w*sx;
		var vx_y = 0; // todo : rotate ?
		var vy_x = 0; // todo : rotate ?
		var vy_y = this.font_h*sy;
		var mVB_Tex2 = this.mVB_Tex2;
		var mVB_Pos2 = this.mVB_Pos2;
		
		
		// triangle1  lt-rt-lb
		if (this.mBufferVertices < this.kMaxVerticesPerString) {
			var i = this.mBufferVertices*2;
			this.mBufferVertices += 6;
			
			mVB_Tex2[i+0] = gi.u0; mVB_Pos2[i+0] = ax;
			mVB_Tex2[i+1] = gi.v0; mVB_Pos2[i+1] = ay;
			mVB_Tex2[i+2] = gi.u1; mVB_Pos2[i+2] = ax + vx_x;
			mVB_Tex2[i+3] = gi.v0; mVB_Pos2[i+3] = ay + vx_y;
			mVB_Tex2[i+4] = gi.u0; mVB_Pos2[i+4] = ax + vy_x;
			mVB_Tex2[i+5] = gi.v1; mVB_Pos2[i+5] = ay + vy_y;
			
			// triangle2 lb-rt-rb
			mVB_Tex2[i+6] = gi.u0;  mVB_Pos2[i+6] = ax + vy_x;
			mVB_Tex2[i+7] = gi.v1;  mVB_Pos2[i+7] = ay + vy_y;
			mVB_Tex2[i+8] = gi.u1;  mVB_Pos2[i+8] = ax + vx_x;
			mVB_Tex2[i+9] = gi.v0;  mVB_Pos2[i+9] = ay + vx_y;
			mVB_Tex2[i+10] = gi.u1; mVB_Pos2[i+10] = ax + vx_x + vy_x;
			mVB_Tex2[i+11] = gi.v1; mVB_Pos2[i+11] = ay + vx_y + vy_y;
		}
	}
	
	this.drawBuffer = function () {
		if (this.mBufferVertices == 0) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"drawBuffer:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"drawBuffer:mVB_Tex = null"); return; }
		if (this.img == null) { MainPrint(this.TAG,"drawBuffer:img = null"); return; }
		UpdateGlFloatBufferLen(gl,this.mVB_Pos,this.mVB_Pos2,this.mBufferVertices*2,gl.DYNAMIC_DRAW);
		UpdateGlFloatBufferLen(gl,this.mVB_Tex,this.mVB_Tex2,this.mBufferVertices*2,gl.DYNAMIC_DRAW);
		setVertexBuffersToCustom(this.mVB_Pos,this.mVB_Tex);
		gl.bindTexture(gl.TEXTURE_2D, this.img.GetTextureID()); gLastGLTexture = this.img.GetTextureID();
		gl.drawArrays(gl.TRIANGLES, 0, this.mBufferVertices);
	}
	
	this.print = function (text, param_x, param_y, r, sx, sy) {
		if (r != 0) NotImplemented("love.graphics.print !rotation!");
		if (this.bForceLowerCase) text = text.toLowerCase();
		
		var len = text.length;
		this.prepareBuffer(len,r);
		var x = param_x;
		var y = param_y;
		// TODO: rotate code here rather than in prepareBuffer? x,y
		for (var i=0;i<len;++i) {
			var c = text.charAt(i);
			var draw_x = x;
			var draw_y = y;
			if (!this.isWhiteSpace(c)) {
				var mx = this.getGlyphMoveX(c)*sx;
				x += mx;
			} else {
				if (c == ' ' ) x += this.getGlyphMoveX(c)*sx;
				if (c == '\t') x += this.getGlyphMoveX(c)*sx;
				if (c == '\n') {
					x = param_x;
					y += this.line_h*this.font_h*sy;
				}
			}
			this.addCharToBufferS(c,draw_x,draw_y,sx,sy);
		}
		this.drawBuffer();
	}
	
	
	
	/// NOTE: not related to c printf, rather wordwrap etc
	this.printf = function (text, param_x, param_y, limit, align) {
		if (this.bForceLowerCase) text = text.toLowerCase();
		var len = text.length;
		this.prepareBuffer(len);
		var x = param_x; // TODO: align here
		var y = param_y;
		var bAlignRecalcNeeded = true;
		// TODO: wrap ignores word boundaries for now, lookahead ? 
		//~ MainPrint(this.TAG,"printf:"+param_x+","+param_y+","+limit+","+Align2Text(align)+" :"+text);
		for (var i=0;i<len;++i) {
			var c = text.charAt(i);
			if (bAlignRecalcNeeded) {
				bAlignRecalcNeeded = false;
				if (align != AlignMode.LEFT) {
					var linew = this.getLineW((i > 0) ? text : text.substring(i)); // getLineW automatically stops at newline
					//~ MainPrint(this.TAG,"printf:["+i+"] linew="+linew+","+Align2Text(align)+" :"+text); 
					if (linew > limit) linew = limit; // small inaccuracy here, but shouldn't matter much
					if (align == AlignMode.RIGHT) x += (limit - linew); 
					if (align == AlignMode.CENTER) x += (limit - linew)/2; // text is in the middle between param_x and param_x+limit
				}
			}
			
			var draw_x = x;
			var draw_y = y;
			if (!this.isWhiteSpace(c)) {
				var mx = this.getGlyphMoveX(c);
				if (x + mx < param_x + limit) {
					x += mx;
				} else {
					draw_x = param_x; // TODO: align here
					draw_y = y + this.line_h*this.font_h;
					x = draw_x + mx;
					y = draw_y;
					bAlignRecalcNeeded = true;
				}
			} else {
				if (c == ' ' ) x += this.getGlyphMoveX(c);
				if (c == '\t') x += this.getGlyphMoveX(c);
				if (c == '\n') {
					x = param_x; // TODO: align here
					y += this.line_h*this.font_h;
					bAlignRecalcNeeded = true;
				}
			}
			this.addCharToBuffer(c,draw_x,draw_y);
		}
		// TODO: center/right align line-wise : getLineW(substr(... till next newline))
		this.drawBuffer();
	}
	
	/// doesn't support newlines
	this.getLineW = function (text) {
		var x = 0;
		for (var i=0;i<text.length;++i) {
			var c = text.charAt(i);
			x += this.getGlyphMoveX(c);
			if (c == '\n') return x; // early out
		}
		return x;
	}
	
	this.constructor(caller_name,a,b);
}

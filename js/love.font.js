var kDefaultImageFontURL;
if (window.location.host == "ghoulsblade.schattenkind.net") kDefaultImageFontURL = "http://ghoulsblade.schattenkind.net/love-webplayer/iyfct/gfx/imgfont.png";
if (window.location.host == "localhost" && window.location.pathname.substring(0,16) == "/love-webplayer/") kDefaultImageFontURL = "http://localhost/love-webplayer/iyfct/gfx/imgfont.png";
// otherwise : error:cross domain security. we'll have to canvas-draw sth.

/// init lua api
function Love_Font_CreateTable () {
	var t = {};
	var pre = "love.font.";

	t['newFontData']	= function () { return NotImplemented(pre+'newFontData'); }
	t['newGlyphData']	= function () { return NotImplemented(pre+'newGlyphData'); }
	t['newRasterizer']	= function () { return NotImplemented(pre+'newRasterizer'); }

    Lua.inject(t, null, 'love.font');
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

function GlyphInfo (w,movex,u0,u1) {
	this.w = w;
	this.movex = movex;
	this.u0 = u0;
	this.v0 = 0;
	this.u1 = u1;
	this.v1 = 1;
};

function cLoveFont (caller_name,a,b) {
    var self = this;
    self.__handle = true;
	self.TAG = "love.graphics.font";
	self.kMaxGlyphsPerString = 1024*8; // limit not really needed in webgl, keep code for porting code to other platforms
	self.kMaxVerticesPerString = self.kMaxGlyphsPerString * 6;
	
	self.w_space = 0; // TODO: set from letter 'a' ? 
	self.font_h = 12; // TODO: set from letter 'a' ? probably just the height of the whole image
	self.line_h = 1.5; ///< Gets the line height. This will be the value previously set by Font:setLineHeight, or 1.0 by default. 
	self.bForceLowerCase = false;
	self.mGlyphInfos = {};
	self.imgGetPixelContext = null;
	
	self.prepareImgForGetPixel = function (img) {
		var newCanvas = document.createElement('canvas');
		newCanvas.width = img.width;
		newCanvas.height = img.height;
		var context = newCanvas.getContext('2d');
		context.drawImage(img, 0, 0);
		self.imgGetPixelContext = context;
		//~ document.getElementById("output").appendChild(newCanvas);
		// NOTE:getpixel : http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
		// NOTE:getpixel : http://stackoverflow.com/questions/1041399/how-to-use-javascript-or-jquery-to-read-a-pixel-of-an-image
		// NOTE:getpixel : http://stackoverflow.com/questions/4154223/get-pixel-from-bitmap
	}
	self.getPixel = function(x,y) { 
		var data = self.imgGetPixelContext.getImageData(x, y, 1, 1).data; 
		//~ if (x == 0 && y == 0) MainPrint("font pixel0,0=",self.img.path,typeof data,data);
		//~ return data ? (data[0] + 256*(data[1] + 256*(data[2] + 256*data[3]))) : 0;
		return data ? (data[0] + 256*(data[1] + 256*(data[2]))) : 0;
	}

	/// constructor
	self.init_default_font = function (image_or_filename,glyphs) {
		// TODO: "Vera Sans"  12 . but until ttf/canvas font stuff works, just use standard image font 
		if (kDefaultImageFontURL) {
			self.init_image_font(kDefaultImageFontURL," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·");
			self.bForceLowerCase = true;
		}
	}
	
	self.init_image_font = function (image_or_filename,glyphs) {
		self.glyphs = glyphs;
		var img;
		if ((typeof image_or_filename) == "string")
				img = new cLoveImage(image_or_filename);
		else	img = image_or_filename;
		self.prepareImgForGetPixel(img.tex.image);
		self.init(img, glyphs);
	}
	
	self.constructor = function (caller_name,a,b) {
		if (caller_name == "initDefaultFont") {
			if (!kDefaultImageFontURL) MainPrint("warning:kDefaultImageFontURL not set for self hostname/path (needed for cross-domain image-load), default font disabled");
			// otherwise : error:cross domain security. we'll have to canvas-draw sth.
			self.init_default_font();
		}
		if (caller_name == "newImageFont") {
			// font = love.graphics.newImageFont( image, glyphs )
			// font = love.graphics.newImageFont( filename, glyphs )
			// Creates a new font by loading a specifically formatted image.  : https://love2d.org/wiki/ImageFontFormat
			self.init_image_font(a,b);
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
			self.init_default_font(); // fallback
		}
	}
	
	self.getGlyphInfo = function (c) { return self.mGlyphInfos[c]; }
	
	
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
	public LuanObjFont (LuanGraphics g,int iSize) throws IOException { self(g); self.g = g; NotImplemented("font:ttf with size"); } 
	
	/// fall back to image font in resources
	public LuanObjFont (LuanGraphics g) throws IOException { self(g,new LuanObjImage(g, R.raw.imgfont_w)," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·"); self.g = g; bForceLowerCase = true; } 
	
	/// imageFont
	public LuanObjFont (LuanGraphics g,String filename,String glyphs) throws FileNotFoundException { self(g,new LuanObjImage(g,filename),glyphs); }
	*/
	
	
	self.init = function (img, glyphs) {
		self.img = img;
		// TODO
		
		/*
		The imagefont file is an image file in a format that L�ve can load. It can contain transparent pixels, so a PNG file is preferable, and it also needs to contain spacer color that will separate the different font glyphs.
		The upper left pixel of the image file is always taken to be the spacer color. All columns that have self color as their uppermost pixel are interpreted as separators of font glyphs. The areas between these separators are interpreted as the actual font glyphs.
		The width of the separator areas affect the spacing of the font glyphs. It is possible to have more areas in the image than are required for the font in the love.graphics.newImageFont() call. The extra areas are ignored. 
		*/
		var col = self.getPixel(0,0);
		var x = 0;
		var imgw = img.getWidth();
		self.font_h = img.getHeight();
		self.w_space = 0;
		while (x < imgw && self.getPixel(x,0) == col) ++x; // skip first separator column
			
		//~ if (pLog != null) pLog.println("FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		//~ MainPrint(self.TAG,"FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		
		for (var i=0;i<glyphs.length;++i) {
			var c = glyphs.charAt(i);
			
			// calc the size of the glyph
			var w = 1;
			while (x+w < imgw && self.getPixel(x+w,0) != col) ++w;
				
			// calc the size of the separator
			var spacing = 0;
			while (x+w+spacing < imgw && self.getPixel(x+w+spacing,0) == col) ++spacing;
			
			// register glyph
			//~ MainPrint(self.TAG,"glyph:"+c+":x="+x+",w="+w+",spacing="+spacing);
			self.mGlyphInfos[c] = new GlyphInfo(w,w+spacing,x/imgw,(x+w)/imgw);
			
			//~ if (pLog != null) pLog.println("glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			//~ MainPrint(self.TAG,"glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			
			if (self.w_space == 0) self.w_space = w;
			x += w+spacing;
		}
		
		var gi = self.getGlyphInfo(' '); 
		if (gi != null) self.w_space = gi.movex;
	}
	
	
	self.isWhiteSpace = function (c) { return c == ' ' || c == '\t' || c == '\r' || c == '\n'; }
	self.getGlyphMoveX = function (c) { 
		if (c == ' ') return self.w_space;
		if (c == '\t') return 4*self.w_space;
		
		var gi = self.getGlyphInfo(c); 
		if (gi != null) return gi.movex;
		
		return 0;
	}
	
	// render buffer 
	
	//~ private FloatBuffer	mVB_Pos;
	//~ private FloatBuffer	mVB_Tex;
	//~ private float[]		mVB_Pos2;
	//~ private float[]		mVB_Tex2;
	//~ int					mBufferVertices;
	
	self.prepareBuffer = function (maxglyphs) { self.prepareBuffer(maxglyphs,0); }
	self.prepareBuffer = function (maxglyphs,fRotate) {
		if (maxglyphs > self.kMaxGlyphsPerString) {
			NotImplemented("font: really really long text");
		}
		
		// alloc/resize float buffers
		if (g_mVB_Pos_font == null) {
			g_mVB_Pos_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
			g_mVB_Tex_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
			g_mVB_Pos2_font = [self.kMaxVerticesPerString*2];
			g_mVB_Tex2_font = [self.kMaxVerticesPerString*2];
		}
		self.mVB_Pos = g_mVB_Pos_font;
		self.mVB_Tex = g_mVB_Tex_font;
		self.mVB_Pos2 = g_mVB_Pos2_font;
		self.mVB_Tex2 = g_mVB_Tex2_font;
		
		self.mBufferVertices = 0;
	}
	
	
	self.addCharToBuffer  = function (c,draw_x,draw_y) { self.addCharToBufferS(c,draw_x,draw_y,1,1); }
	self.addCharToBufferS = function (c,draw_x,draw_y, sx, sy) {
		var gi = self.getGlyphInfo(c);
		if (gi == null) return;
		if (self.mVB_Pos == null) { MainPrint(self.TAG,"addCharToBufferS:mVB_Pos = null"); return; }
		if (self.mVB_Tex == null) { MainPrint(self.TAG,"addCharToBufferS:mVB_Tex = null"); return; }
			
		// add geometry to float buffers if possible
		
		var ax = draw_x;
		var ay = draw_y;
		var vx_x = gi.w*sx;
		var vx_y = 0; // todo : rotate ?
		var vy_x = 0; // todo : rotate ?
		var vy_y = self.font_h*sy;
		var mVB_Tex2 = self.mVB_Tex2;
		var mVB_Pos2 = self.mVB_Pos2;
		
		
		// triangle1  lt-rt-lb
		if (self.mBufferVertices < self.kMaxVerticesPerString) {
			var i = self.mBufferVertices*2;
			self.mBufferVertices += 6;
			
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
	
	self.drawBuffer = function () {
		if (self.mBufferVertices == 0) return;
		if (self.mVB_Pos == null) { MainPrint(self.TAG,"drawBuffer:mVB_Pos = null"); return; }
		if (self.mVB_Tex == null) { MainPrint(self.TAG,"drawBuffer:mVB_Tex = null"); return; }
		if (self.img == null) { MainPrint(self.TAG,"drawBuffer:img = null"); return; }
		UpdateGlFloatBufferLen(gl,self.mVB_Pos,self.mVB_Pos2,self.mBufferVertices*2,gl.DYNAMIC_DRAW);
		UpdateGlFloatBufferLen(gl,self.mVB_Tex,self.mVB_Tex2,self.mBufferVertices*2,gl.DYNAMIC_DRAW);
		setVertexBuffersToCustom(self.mVB_Pos,self.mVB_Tex);
		gl.bindTexture(gl.TEXTURE_2D, self.img.GetTextureID()); gLastGLTexture = self.img.GetTextureID();
		gl.drawArrays(gl.TRIANGLES, 0, self.mBufferVertices);
	}
	
	self.print = function (text, param_x, param_y, r, sx, sy) {
		if (r != 0) NotImplemented("love.graphics.print !rotation!");
		if (self.bForceLowerCase) text = text.toLowerCase();
		
		var len = text.length;
		self.prepareBuffer(len,r);
		var x = param_x;
		var y = param_y;
		// TODO: rotate code here rather than in prepareBuffer? x,y
		for (var i=0;i<len;++i) {
			var c = text.charAt(i);
			var draw_x = x;
			var draw_y = y;
			if (!self.isWhiteSpace(c)) {
				var mx = self.getGlyphMoveX(c)*sx;
				x += mx;
			} else {
				if (c == ' ' ) x += self.getGlyphMoveX(c)*sx;
				if (c == '\t') x += self.getGlyphMoveX(c)*sx;
				if (c == '\n') {
					x = param_x;
					y += self.line_h*self.font_h*sy;
				}
			}
			self.addCharToBufferS(c,draw_x,draw_y,sx,sy);
		}
		self.drawBuffer();
	}
	
	
	
	/// NOTE: not related to c printf, rather wordwrap etc
	self.printf = function (text, param_x, param_y, limit, align) {
		if (self.bForceLowerCase) text = text.toLowerCase();
		var len = text.length;
		self.prepareBuffer(len);
		var x = param_x; // TODO: align here
		var y = param_y;
		var bAlignRecalcNeeded = true;
		// TODO: wrap ignores word boundaries for now, lookahead ? 
		//~ MainPrint(self.TAG,"printf:"+param_x+","+param_y+","+limit+","+Align2Text(align)+" :"+text);
		for (var i=0;i<len;++i) {
			var c = text.charAt(i);
			if (bAlignRecalcNeeded) {
				bAlignRecalcNeeded = false;
				if (align != AlignMode.LEFT) {
					var linew = self.getLineW((i > 0) ? text : text.substring(i)); // getLineW automatically stops at newline
					//~ MainPrint(self.TAG,"printf:["+i+"] linew="+linew+","+Align2Text(align)+" :"+text); 
					if (linew > limit) linew = limit; // small inaccuracy here, but shouldn't matter much
					if (align == AlignMode.RIGHT) x += (limit - linew); 
					if (align == AlignMode.CENTER) x += (limit - linew)/2; // text is in the middle between param_x and param_x+limit
				}
			}
			
			var draw_x = x;
			var draw_y = y;
			if (!self.isWhiteSpace(c)) {
				var mx = self.getGlyphMoveX(c);
				if (x + mx < param_x + limit) {
					x += mx;
				} else {
					draw_x = param_x; // TODO: align here
					draw_y = y + self.line_h*self.font_h;
					x = draw_x + mx;
					y = draw_y;
					bAlignRecalcNeeded = true;
				}
			} else {
				if (c == ' ' ) x += self.getGlyphMoveX(c);
				if (c == '\t') x += self.getGlyphMoveX(c);
				if (c == '\n') {
					x = param_x; // TODO: align here
					y += self.line_h*self.font_h;
					bAlignRecalcNeeded = true;
				}
			}
			self.addCharToBuffer(c,draw_x,draw_y);
		}
		// TODO: center/right align line-wise : getLineW(substr(... till next newline))
		self.drawBuffer();
	}
	
	/// doesn't support newlines
	self.getLineW = function (text) {
		var x = 0;
		for (var i=0;i<text.length;++i) {
			var c = text.charAt(i);
			x += self.getGlyphMoveX(c);
			if (c == '\n') return x; // early out
		}
		return x;
	}

    self.getWidth  = function (text) { return [self.getLineW(text)]; }
    self.getHeight = function () { return [self.font_h]; }
    self.getLineHeight = function () { return [self.line_h]; }
    self.setLineHeight = function (line_h) { self.line_h = line_h; return []; }
    self.getWrap   = function () { NotImplemented(pre+'getWrap'); return [1]; }
    self.type      = function () { return ["Font"]; }
    self.typeOf    = function (x) { return [x == "Object" || x == "Font"]; }
	
	self.constructor(caller_name,a,b);
}

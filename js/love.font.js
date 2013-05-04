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

function GlyphInfo (w,movex,u0,u1, tex) {
	this.w = w;
	this.movex = movex;
	this.u0 = u0;
	this.v0 = 0;
	this.u1 = u1;
	this.v1 = 1;
    this.tex = tex;
};

function VertexBuffer (max_glyphs, max_vertices, font_height, texture) {

	// render buffer 
	
	//~ private FloatBuffer	mVB_Pos;
	//~ private FloatBuffer	mVB_Tex;
	//~ private float[]		mVB_Pos2;
	//~ private float[]		mVB_Tex2;
	//~ int					num_vertices;

    this.max_glyphs   = max_glyphs;   // Max glyphs per string
    this.max_vertices = max_vertices; // Max vertices per string
    this.font_height  = font_height;  // Height of the font
    this.texture      = texture;      // Texture to ultimately apply

    // alloc/resize float buffers
    if (g_mVB_Pos_font == null) {
        g_mVB_Pos_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
        g_mVB_Tex_font = MakeGlFloatBuffer(gl,[],gl.DYNAMIC_DRAW);
        g_mVB_Pos2_font = [this.max_vertices*2];
        g_mVB_Tex2_font = [this.max_vertices*2];
    }
    this.mVB_Pos = g_mVB_Pos_font;
    this.mVB_Tex = g_mVB_Tex_font;
    this.mVB_Pos2 = g_mVB_Pos2_font;
    this.mVB_Tex2 = g_mVB_Tex2_font;
    
    this.num_vertices = 0; // Current number of vertices

	this.add_glyph = function (gi, draw_x,draw_y, sx,sy) {
		if (gi == null) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Tex = null"); return; }
			
		var ax = draw_x;
		var ay = draw_y;
		var vx_x = gi.w*sx;
		var vx_y = 0; // todo : rotate ?
		var vy_x = 0; // todo : rotate ?
		var vy_y = this.font_height * sy;
		var mVB_Tex2 = this.mVB_Tex2;
		var mVB_Pos2 = this.mVB_Pos2;
		
		// add geometry to float buffers if possible
		if (this.num_vertices < this.max_vertices) {
			var i = this.num_vertices*2;
			this.num_vertices += 6;
			
            // triangle1  lt-rt-lb
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

	this.draw = function () {
		if (this.num_vertices == 0) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"drawBuffer:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"drawBuffer:mVB_Tex = null"); return; }
		if (this.texture == null) { MainPrint(this.TAG,"drawBuffer:texture = null"); return; }

		UpdateGlFloatBufferLen(gl,this.mVB_Pos,this.mVB_Pos2,this.num_vertices*2,gl.DYNAMIC_DRAW);
		UpdateGlFloatBufferLen(gl,this.mVB_Tex,this.mVB_Tex2,this.num_vertices*2,gl.DYNAMIC_DRAW);

		setVertexBuffersToCustom(this.mVB_Pos,this.mVB_Tex);

		gl.bindTexture(gl.TEXTURE_2D, this.texture); gLastGLTexture = this.texture;
		gl.drawArrays(gl.TRIANGLES, 0, this.num_vertices);
	}
}

function cLoveFont () {
    // Required functions:
    //  * compute_glyph  : Turn a unicode glyph into a GlyphInfo object.

    this.font_h = 12;
    this.line_h = 1.0;

    this._glyph_cache = {};
    this._texture_cache = {};
}
cLoveFont.prototype.__handle      = true;
cLoveFont.prototype.getWidth      = function (self, text) { return [self.get_line_width(text)]; }
cLoveFont.prototype.getHeight     = function (self) { return [self.font_h]; }
cLoveFont.prototype.getLineHeight = function (self) { return [self.line_h]; }
cLoveFont.prototype.setLineHeight = function (self, line_h) { self.line_h = line_h; return []; }
cLoveFont.prototype.getWrap       = function (self) { NotImplemented(pre+'getWrap'); return [1]; }
cLoveFont.prototype.type          = function (self) { return ["Font"]; }
cLoveFont.prototype.typeOf        = function (self, x) { return [x == "Object" || x == "Font"]; }

cLoveFont.prototype.set_glyph     = function (str, info) {
    this._glyph_cache[str] = info;
}
cLoveFont.prototype.get_glyph     = function (str) {
    if (!(str in this._glyph_cache)) {
        this.set_glyph(this.compute_glyph(str));
    }
    return this._glyph_cache[str];
}
cLoveFont.prototype.get_line_width = function(str) {
    // For now, naively assume each code point is one glyph
    var width = 0;
    var record_width = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char != '\n') {
            var glyph = this.get_glyph(str.charAt(i));
            width += glyph ? glyph.movex : 0;
        } else {
            width = 0;
        }
        record_width = (width > record_width) ? width : record_width;
    }
    return record_width;
}
cLoveFont.prototype.isWhiteSpace    = function (c) { 
    return c == ' ' || c == '\t' || c == '\r' || c == '\n';
}
cLoveFont.prototype.make_context_2D = function (width, height) {
    var newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    return newCanvas.getContext('2d');
}

function makeDefaultFont() {
    // TODO: Vera Sans 12pt TTF
    if (!kDefaultImageFontURL) {
        MainPrint("warning:kDefaultImageFontURL not set for self hostname/path (needed for cross-domain image-load), default font disabled");
    } else {
        var font = new cLoveImageFont(kDefaultImageFontURL," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·");
        font.bForceLowerCase = true;
        return font;
    }
}

function cLoveWebFont(a, b) {
    var fontface;
    var size;

    if (typeof a == "string") {
        fontface = a;
        size = b;
    } else {
        size = a;
    }

    this.__proto__ = new cLoveFont();
    this.fontface = fontface || "Vera Sans";
    this.size = size || 12;
    this.compute_glyph = function (str) {
        return null;
    }
}

function cLoveImageFont (a,b) {
    var self = this;
    self.__proto__ = new cLoveFont();
	self.TAG = "love.graphics.font";
	self.kMaxGlyphsPerString = 1024*8; // limit not really needed in webgl, keep code for porting code to other platforms
	self.kMaxVerticesPerString = self.kMaxGlyphsPerString * 6;
	
	self.w_space = 0; // TODO: set from letter 'a' ? 
	self.bForceLowerCase = false;
	self.imgGetPixelContext = null;

	self.constructor = function (image_or_filename,glyphs) {
		self.glyphs = glyphs;
		var img;
		if ((typeof image_or_filename) == "string")
				img = new cLoveImage(image_or_filename);
		else	img = image_or_filename;
		self.prepareImgForGetPixel(img.tex.image);
		self.init(img, glyphs);
	}

    // GLYPH SCANNING =========================================================

	self.prepareImgForGetPixel = function (img) {
		self.imgGetPixelContext = self.make_context_2D(img.width, img.height);
		self.imgGetPixelContext.drawImage(img, 0, 0);

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
			self.set_glyph(c, new GlyphInfo(w,w+spacing,x/imgw,(x+w)/imgw));
			
			//~ if (pLog != null) pLog.println("glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			//~ MainPrint(self.TAG,"glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			
			if (self.w_space == 0) self.w_space = w;
			x += w+spacing;
		}
		
		var gi = self.get_glyph(' '); 
		if (gi != null) self.w_space = gi.movex;
	}

    // UTIL ===================================================================

    // Can't compute glyphs on the fly
    self.compute_glyph = function () { return null }
	
	self.getGlyphMoveX = function (c) { 
		if (c == ' ') return self.w_space;
		if (c == '\t') return 4*self.w_space;
		
		var gi = self.get_glyph(c); 
		if (gi != null) return gi.movex;
		
		return 0;
	}

    // RENDERING ==============================================================
	
	self.print = function (text, param_x, param_y, r, sx, sy) {
		if (r != 0) NotImplemented("love.graphics.print !rotation!");
		if (self.bForceLowerCase) text = text.toLowerCase();
		
		var len = text.length;
        var buffer = new VertexBuffer(
            self.kMaxGlyphsPerString,
            self.kMaxVerticesPerString,
            self.font_h,
            self.img.GetTextureID()
        );
		var x = param_x;
		var y = param_y;
		// TODO: rotate code here rather than in prepareBuffer? x,y
		for (var i=0;i<len;++i) {
			var c = text.charAt(i);
			var draw_x = x;
			var draw_y = y;
			if (c != '\n') {
				x += self.getGlyphMoveX(c)*sx;
			} else {
                x = param_x;
                y += self.line_h*self.font_h*sy;
			}
			buffer.add_glyph(self.get_glyph(c), draw_x,draw_y, sx,sy);
		}
		buffer.draw();
	}
	
	/// NOTE: not related to c printf, rather wordwrap etc
	self.printf = function (text, param_x, param_y, limit, align) {
		if (self.bForceLowerCase) text = text.toLowerCase();
		var len = text.length;
        var buffer = new VertexBuffer(
            self.kMaxGlyphsPerString,
            self.kMaxVerticesPerString,
            self.font_h,
            self.img.GetTextureID()
        );
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
					var linew = self.get_line_width((i > 0) ? text : text.substring(i));
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
			buffer.add_glyph(self.get_glyph(c), draw_x,draw_y, 1,1);
		}
		// TODO: center/right align line-wise : get_line_width(substr(... till next newline))
		buffer.draw();
	}
	
	self.constructor(a,b);
}

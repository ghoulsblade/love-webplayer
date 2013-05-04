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

function powerOfTwo(target) {
    var position = 1;
    while (position < target)
        position *= 2;
    return position;
}

function GlyphInfo (str, w,movex,u0,u1, tex) {
	this.str = str;
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

    this.draw_x = 0;
    this.draw_y = 0;

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

    this.move = function (x, y) {
        this.draw_x += x;
        this.draw_y += y;
    }
	this.add_glyph = function (gi) {
		if (gi == null) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"addCharToBufferS:mVB_Tex = null"); return; }
			
		var ax = this.draw_x;
		var ay = this.draw_y;
		var vx_x = gi.w;
		var vx_y = 0; // todo : rotate ?
		var vy_x = 0; // todo : rotate ?
		var vy_y = this.font_height;
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

	this.draw = function (draw_x, draw_y, scale_x, scale_y, rotate) {
		if (this.num_vertices == 0) return;
		if (this.mVB_Pos == null) { MainPrint(this.TAG,"drawBuffer:mVB_Pos = null"); return; }
		if (this.mVB_Tex == null) { MainPrint(this.TAG,"drawBuffer:mVB_Tex = null"); return; }
		if (this.texture == null) { MainPrint(this.TAG,"drawBuffer:texture = null"); return; }

		UpdateGlFloatBufferLen(gl,this.mVB_Pos,this.mVB_Pos2,this.num_vertices*2,gl.DYNAMIC_DRAW);
		UpdateGlFloatBufferLen(gl,this.mVB_Tex,this.mVB_Tex2,this.num_vertices*2,gl.DYNAMIC_DRAW);

        // Transform
        GLModelViewPush();
        var base = matrix4Clone(gGLMatrix_ModelView); // Existing transformations
        resetTransformMatrix(); // Translate on base coordinates
        GLModelViewTranslate(draw_x, draw_y, 1);
        matrix4Mult(gGLMatrix_ModelView, base); // Apply existing transformation on top
        setMatrixUniforms_MV();

        // Draw
		setVertexBuffersToCustom(this.mVB_Pos,this.mVB_Tex);
		gl.bindTexture(gl.TEXTURE_2D, this.texture); gLastGLTexture = this.texture;
		gl.drawArrays(gl.TRIANGLES, 0, this.num_vertices);

        // Reset transform
        GLModelViewPop();
	}

    this.clear = function () {
        this.draw_x = this.draw_y = this.num_vertices = 0;
    }
}

function cLoveFont () {
    // Required functions:
    //  * compute_glyph  : Turn a unicode glyph into a GlyphInfo object.
    //  * _move          : Move all buffers
    //  * _draw          : Draw all buffers

    this.font_h = 12;
    this.line_h = 1.0;

    this._glyph_cache = {};
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
        this.set_glyph(str, this.compute_glyph(str));
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
// Return array of [width, str] pairs for each line
cLoveFont.prototype.split_lines = function (text, max_width) { 
    var len = text.length;
    var lines = [];
    var last_cut = 0;

    // TODO: wrap ignores word boundaries for now, lookahead ? 
    for (var i=0;i<len;++i) {
        // Scout ahead for danger
        var substring = text.substring(last_cut, i+1);
        var linew = this.get_line_width(substring);
        if (linew > max_width || text.charAt(i) == '\n') {
            // Backtrack
            var substring = text.substring(last_cut, i);
            var linew = this.get_line_width(substring);
            lines.push([max_width-linew, substring]);

            if (text.charAt(i) == '\n') i++; // Skip
            last_cut = i;
        }
    }
    var substring = text.substring(last_cut, i);
    if (substring) {
        var linew = this.get_line_width(substring);
        lines.push([max_width-linew, substring]);
    }

    return lines;
}
cLoveFont.prototype.isWhiteSpace    = function (c) { 
    return c == ' ' || c == '\t' || c == '\r' || c == '\n';
}
cLoveFont.prototype.make_context_2D = function (width, height) {
    var newCanvas = document.createElement('canvas');
    newCanvas.width  = powerOfTwo(width);
    newCanvas.height = powerOfTwo(height);
    return newCanvas.getContext('2d');
}
cLoveFont.prototype.print = function (text, param_x, param_y, r, sx, sy) {
    if (r != 0) NotImplemented("love.graphics.print !rotation!");
    if (this.bForceLowerCase) text = text.toLowerCase();
    
    var len = text.length;
    for (var i=0;i<len;++i) {
        var c  = text.charAt(i);
        var gi = this.get_glyph(c);
        if (!gi) break;
        var buffer = gi.tex.buffer;

        buffer.add_glyph(gi);
        if (c != '\n') {
            this._move(gi.movex, 0);
        } else {
            this._move(-buffer.draw_x, self.line_h*self.font_h);
        }
    }
    this._draw(param_x, param_y);
}
// NOTE: not related to c printf, rather wordwrap etc
cLoveFont.prototype.printf = function (text, param_x, param_y, limit, align) {
    //~ MainPrint(self.TAG,"printf:"+param_x+","+param_y+","+limit+","+Align2Text(align)+" :"+text);
    if (this.bForceLowerCase) text = text.toLowerCase();
    var lines = this.split_lines(text, limit);

    // Add a line at a time
    for (var i=0;i<lines.length;++i) {

        var line_data  = lines[i];
        var line_extra = line_data[0];
        var line_text  = line_data[1];

        var line_leftspace = 0;
        if (align == AlignMode.RIGHT) {
            line_leftspace = line_extra;
        } else if (align == AlignMode.CENTER) {
            line_leftspace = line_extra * 0.5;
        }
        var buffer = this.buffer || this.textures[0].buffer;
        this._move(-buffer.draw_x + line_leftspace, 0);

        for (var ci in line_text) {
            var c  = line_text.charAt(ci);
            var gi = this.get_glyph(c);

            gi.tex.buffer.add_glyph(gi);
            this._move(gi.movex, 0);
        }

        this._move(0, this.line_h*this.font_h);
    }
    this._draw(param_x, param_y);
}

function makeDefaultFont() {
    return new cLoveWebFont("Vera Sans", 12);
}

function cLoveWebFont(a, b) {
    var fontface;
    var self = this;
    self.kMaxGlyphsPerString = 1024;
    self.kMaxVerticesPerString = 1024;

    if (typeof a == "string") {
        fontface = a;
        size = b;
    } else {
        size = a;
    }

    self.Texture = function () {
        this.padding_vertical = 2; // TODO: Figure out better way to calculate
        this.ctx = self.make_context_2D(
            self.texture_width,
            self.line_h*self.font_h+this.padding_vertical
        );
        this.ctx.font    = self.font_h + "pt " + self.fontface;
        this.ctx.textBaseline = "alphabetic";
        this.height = this.ctx.canvas.height;

        this.width_total = self.texture_width;
        this.width_used  = 0;
        this.image  = loadCanvasTexture(gl, this.ctx.canvas);
        this.buffer = new VertexBuffer(
            self.kMaxGlyphsPerString,
            self.kMaxVerticesPerString,
            this.height,
            this.image
        );

        this.refresh_buffer_texture = function () {
            this.image = loadCanvasTexture(gl, this.ctx.canvas);
            this.buffer.texture = this.image;
        }

        this.make_glyph = function (str) {
            var width = this.glyph_width(str);
            var glyph = new GlyphInfo(str, width, width,
                                      this.width_used/this.width_total,
                                      (this.width_used+width)/this.width_total,
                                      this);
            this.ctx.fillText(str, this.width_used, self.font_h);
            this.width_used += width;
            this.refresh_buffer_texture(); // TODO: Call less frequently
			return glyph;
        }

        this.glyph_width = function (str) {
            return this.ctx.measureText(str).width;
        }
    }

    this.__proto__ = new cLoveFont();
    this.fontface = fontface || "Vera Sans";
    this.font_h = size || 12;
    this.texture_width = 1024;
    this.textures = [];

    this.compute_glyph = function (str) {
        var tex = null;
        for (var texid in this.textures) {
            var prospect = this.textures[texid];
            if (prospect.glyph_width(str) + prospect.width_used <= prospect.width_total) {
                tex = prospect;
                break;
            }
        }
        if (!tex) {
            tex = new self.Texture();
            this.textures.push(tex);
        }
        return tex.make_glyph(str);
    }

    self._move = function (x, y) {
        for (var texid in self.textures) {
            self.textures[texid].buffer.move(x, y);
        }
    }
    self._draw = function (x, y) {
        for (var texid in self.textures) {
            var buffer_n = self.textures[texid].buffer;
            buffer_n.draw(x, y);
            buffer_n.clear();
        }
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
        self.buffer = new VertexBuffer(
            self.kMaxGlyphsPerString,
            self.kMaxVerticesPerString,
            self.font_h,
            self.img.GetTextureID()
        );
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
			self.set_glyph(c, new GlyphInfo(c, w,w+spacing,x/imgw,(x+w)/imgw, self));
			
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

    self._move = function(x,y) {
        self.buffer.move(x,y);
    }
    self._draw = function(x,y) {
        self.buffer.draw(x,y);
        self.buffer.clear();
    }
	
	self.getGlyphMoveX = function (c) { 
		if (c == ' ') return self.w_space;
		if (c == '\t') return 4*self.w_space;
		
		var gi = self.get_glyph(c); 
		if (gi != null) return gi.movex;
		
		return 0;
	}
	
	
	self.constructor(a,b);
}

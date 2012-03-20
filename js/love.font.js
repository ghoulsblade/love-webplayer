
/// init lua api
function Love_Font_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.font.";

	G.str['love'].str['font'] = t;
	
	t.str['newFontData']	= function () { return NotImplemented(pre+'newFontData'); }
	t.str['newGlyphData']	= function () { return NotImplemented(pre+'newGlyphData'); }
	t.str['newRasterizer']	= function () { return NotImplemented(pre+'newRasterizer'); }
}


// ***** ***** ***** ***** ***** cLoveImageFont


function Love_Graphics_MakeImageFontHandle (o) {
	var t = lua_newtable();
	var pre = "love.graphics.imagefont.";
	t._data = o;
	
	t.str['getHeight']			= function (t) { return NotImplemented(pre+'getHeight'); }	// Gets the height of the Font in pixels.
	t.str['getLineHeight']		= function (t) { return NotImplemented(pre+'getLineHeight'); }	// Gets the line height.
	t.str['getWidth']			= function (t) { return NotImplemented(pre+'getWidth'); }	// Determines the horizontal size a line of text needs.
	t.str['getWrap']			= function (t) { return NotImplemented(pre+'getWrap'); }	// Returns how many lines text would be wrapped to.
	t.str['setLineHeight']		= function (t) { return NotImplemented(pre+'setLineHeight'); }	// Sets the line height.
	t.str['type']				= function (t) { return NotImplemented(pre+'type'); }	// Gets the type of the object as a string.
	t.str['typeOf']				= function (t) { return NotImplemented(pre+'typeOf'); }	// Checks whether an object is of a certain type.
	
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

function cLoveImageFont (img, glyphs, size) {
	this.kMaxGlyphsPerString = 1024;
	
	this.w_space = 0; // TODO: set from letter 'a' ? 
	this.font_h = 0; // TODO: set from letter 'a' ? probably just the height of the whole image
	this.line_h = 1.5; ///< Gets the line height. This will be the value previously set by Font:setLineHeight, or 1.0 by default. 
	this.bForceLowerCase = false;
	this.mGlyphInfos = {};
	
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
	public LuanObjFont (LuanGraphics g,int iSize) throws IOException { this(g); this.g = g; g.vm.NotImplemented("font:ttf with size"); } 
	
	/// fall back to image font in resources
	public LuanObjFont (LuanGraphics g) throws IOException { this(g,new LuanObjImage(g, R.raw.imgfont_w)," abcdefghijklmnopqrstuvwxyz0123456789.!'-:·"); this.g = g; bForceLowerCase = true; } 
	
	/// imageFont
	public LuanObjFont (LuanGraphics g,String filename,String glyphs) throws FileNotFoundException { this(g,new LuanObjImage(g,filename),glyphs); }
	*/
	
	
	this.init = function (img, glyphs) {
		this.img = img;
		// TODO
		// NOTE:getpixel : http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
		// NOTE:getpixel : http://stackoverflow.com/questions/1041399/how-to-use-javascript-or-jquery-to-read-a-pixel-of-an-image
		// NOTE:getpixel : http://stackoverflow.com/questions/4154223/get-pixel-from-bitmap
		
		/*
		The imagefont file is an image file in a format that L�ve can load. It can contain transparent pixels, so a PNG file is preferable, and it also needs to contain spacer color that will separate the different font glyphs.
		The upper left pixel of the image file is always taken to be the spacer color. All columns that have this color as their uppermost pixel are interpreted as separators of font glyphs. The areas between these separators are interpreted as the actual font glyphs.
		The width of the separator areas affect the spacing of the font glyphs. It is possible to have more areas in the image than are required for the font in the love.graphics.newImageFont() call. The extra areas are ignored. 
		*/
		/*
		int col = img.getColAtPos(0,0);
		int x = 0;
		int imgw = (int)img.mWidth;
		font_h = (int)img.mHeight;
		w_space = 0f;
		while (x < imgw && img.getColAtPos(x,0) == col) ++x; // skip first separator column
			
		//~ if (pLog != null) pLog.println("FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		//~ LoveVM.LoveLog(TAG,"FontConstr: img="+img.getDebugSource()+" col="+col+" w="+imgw+" h="+font_h+" x0="+x); // TODO: remove, DEBUG only
		
		for (int i=0;i<glyphs.length();++i) {
			char c = glyphs.charAt(i);
			
			// calc the size of the glyph
			int w = 1;
			while (x+w < imgw && img.getColAtPos(x+w,0) != col) ++w;
				
			// calc the size of the separator
			int spacing = 0;
			while (x+w+spacing < imgw && img.getColAtPos(x+w+spacing,0) == col) ++spacing;
			
			// register glyph
			//~ LoveVM.LoveLog(TAG,"glyph:"+c+":x="+x+",w="+w+",spacing="+spacing);
			mGlyphInfos.put(c,new GlyphInfo(w,w+spacing,(float)x/(float)imgw,(float)(x+w)/(float)imgw));
			
			//~ if (pLog != null) pLog.println("glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			//~ LoveVM.LoveLog(TAG,"glyph="+c+" x="+x+" w="+w+" spacing="+spacing); // TODO: remove, DEBUG only
			
			if (w_space == 0f) w_space = w;
			x += w+spacing;
		}
		
		GlyphInfo gi = getGlyphInfo(' '); 
		if (gi != null) w_space = gi.movex;
		*/
	}
	
	
	/*
	public boolean isWhiteSpace (char c) { return c == ' ' || c == '\t' || c == '\r' || c == '\n'; }
	public float getGlyphMoveX (char c) { 
		if (c == ' ') return w_space;
		if (c == '\t') return 4f*w_space;
		
		GlyphInfo gi = getGlyphInfo(c); 
		if (gi != null) return gi.movex;
		
		return 0f;
	}
	
	
	// render buffer 
	
	private FloatBuffer	mVB_Pos;
	private FloatBuffer	mVB_Tex;
	private float[]		mVB_Pos2;
	private float[]		mVB_Tex2;
	
	int					mBufferVertices;
	
	public void prepareBuffer (int maxglyphs) { prepareBuffer(maxglyphs,0f); }
	public void prepareBuffer (int maxglyphs,float fRotate) {
		// alloc/resize float buffers
		//~ mVB_Pos = LuanGraphics.LuanCreateBuffer(maxglyphs*6*2); // TODO: memleak?  reuse/clear existing possible ? 
		//~ mVB_Tex = LuanGraphics.LuanCreateBuffer(maxglyphs*6*2);
		//~ mVB_Pos2 = new float[maxglyphs*6*2];
		//~ mVB_Tex2 = new float[maxglyphs*6*2];
		
		if (g.mVB_Pos_font == null) {
			g.mVB_Pos_font = LuanGraphics.LuanCreateBuffer(kMaxGlyphsPerString*6*2); // TODO: memleak?  reuse/clear existing possible ? 
			g.mVB_Tex_font = LuanGraphics.LuanCreateBuffer(kMaxGlyphsPerString*6*2);
			g.mVB_Pos2_font = new float[kMaxGlyphsPerString*6*2];
			g.mVB_Tex2_font = new float[kMaxGlyphsPerString*6*2];
		}
		mVB_Pos = g.mVB_Pos_font; // TODO: memleak?  reuse/clear existing possible ? 
		mVB_Tex = g.mVB_Tex_font;
		mVB_Pos2 = g.mVB_Pos2_font;
		mVB_Tex2 = g.mVB_Tex2_font;
		
		
		
		mBufferVertices = 0;
	}
	public void addCharToBuffer(char c,float draw_x,float draw_y) { addCharToBuffer(c,draw_x,draw_y,1f,1f); }
	public void addCharToBuffer(char c,float draw_x,float draw_y, float sx, float sy) {
		GlyphInfo gi = getGlyphInfo(c);
		if (gi == null) return;
		if (mVB_Pos == null) { LoveVM.LoveLog(TAG,"addCharToBuffer:mVB_Pos = null"); return; }
		if (mVB_Tex == null) { LoveVM.LoveLog(TAG,"addCharToBuffer:mVB_Tex = null"); return; }
			
		// add geometry to float buffers if possible
		
		float ax = draw_x;
		float ay = draw_y;
		float vx_x = gi.w*sx;
		float vx_y = 0f; // todo : rotate ?
		float vy_x = 0f; // todo : rotate ?
		float vy_y = font_h*sy;
		
		int i = mBufferVertices*2;
		mBufferVertices += 6;
		
		// triangle1  lt-rt-lb
		if (mBufferVertices < kMaxGlyphsPerString) {
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
	
	public void drawBuffer () {
		if (mVB_Pos == null) { LoveVM.LoveLog(TAG,"drawBuffer:mVB_Pos = null"); return; }
		if (mVB_Tex == null) { LoveVM.LoveLog(TAG,"drawBuffer:mVB_Tex = null"); return; }
		if (g == null) { LoveVM.LoveLog(TAG,"drawBuffer:g = null"); return; }
		GL10 gl = g.getGL();
		if (gl == null) { LoveVM.LoveLog(TAG,"drawBuffer:gl = null"); return; }
		if (img == null) { LoveVM.LoveLog(TAG,"drawBuffer:img = null"); return; }
		// TODO: send geometry to ogre
		//~ mVB_Pos.position(0); // set the buffer to read the first coordinate
		//~ mVB_Tex.position(0); // set the buffer to read the first coordinate
		LuanGraphics.LuanFillBuffer(mVB_Pos,mVB_Pos2,mBufferVertices*2);
		LuanGraphics.LuanFillBuffer(mVB_Tex,mVB_Tex2,mBufferVertices*2);
		g.setVertexBuffersToCustom(mVB_Pos,mVB_Tex);
		gl.glBindTexture(GL10.GL_TEXTURE_2D, img.GetTextureID());
		gl.glDrawArrays(GL10.GL_TRIANGLES, 0, mBufferVertices);
	}
	
	public void print		(String text, float param_x, float param_y, float r, float sx, float sy) {
		if (r != 0f) g.vm.NotImplemented("love.graphics.print !rotation!");
		if (bForceLowerCase) text = text.toLowerCase();
		
		int len = text.length();
		prepareBuffer(len,r);
		float x = param_x;
		float y = param_y;
		// TODO: rotate code here rather than in prepareBuffer? x,y
		for (int i=0;i<len;++i) {
			char c = text.charAt(i);
			float draw_x = x;
			float draw_y = y;
			if (!isWhiteSpace(c)) {
				float mx = getGlyphMoveX(c);
				x += mx;
			} else {
				if (c == ' ' ) x += getGlyphMoveX(c);
				if (c == '\t') x += getGlyphMoveX(c);
				if (c == '\n') {
					x = param_x;
					y += line_h*font_h;
				}
			}
			addCharToBuffer(c,draw_x,draw_y,sx,sy);
		}
		drawBuffer();
	}
	
	
	
	/// NOTE: not related to c printf, rather wordwrap etc
	public void printf		(String text, float param_x, float param_y, float limit, AlignMode align) {
		if (bForceLowerCase) text = text.toLowerCase();
		int len = text.length();
		prepareBuffer(len);
		float x = param_x; // TODO: align here
		float y = param_y;
		boolean bAlignRecalcNeeded = true;
		// TODO: wrap ignores word boundaries for now, lookahead ? 
		//~ LoveVM.LoveLog(TAG,"printf:"+param_x+","+param_y+","+limit+","+Align2Text(align)+" :"+text); 
		for (int i=0;i<len;++i) {
			char c = text.charAt(i);
			if (bAlignRecalcNeeded) {
				bAlignRecalcNeeded = false;
				if (align != AlignMode.LEFT) {
					float linew = getLineW((i > 0) ? text : text.substring(i)); // getLineW automatically stops at newline
					//~ LoveVM.LoveLog(TAG,"printf:["+i+"] linew="+linew+","+Align2Text(align)+" :"+text); 
					if (linew > limit) linew = limit; // small inaccuracy here, but shouldn't matter much
					if (align == AlignMode.RIGHT) x += (limit - linew); 
					if (align == AlignMode.CENTER) x += (limit - linew)/2f; // text is in the middle between param_x and param_x+limit
				}
			}
			
			float draw_x = x;
			float draw_y = y;
			if (!isWhiteSpace(c)) {
				float mx = getGlyphMoveX(c);
				if (x + mx < param_x + limit) {
					x += mx;
				} else {
					draw_x = param_x; // TODO: align here
					draw_y = y + line_h*font_h;
					x = draw_x + mx;
					y = draw_y;
					bAlignRecalcNeeded = true;
				}
			} else {
				if (c == ' ' ) x += getGlyphMoveX(c);
				if (c == '\t') x += getGlyphMoveX(c);
				if (c == '\n') {
					x = param_x; // TODO: align here
					y += line_h*font_h;
					bAlignRecalcNeeded = true;
				}
			}
			addCharToBuffer(c,draw_x,draw_y);
		}
		// TODO: center/right align line-wise : getLineW(substr(... till next newline))
		drawBuffer();
	}
	
	/// doesn't support newlines
	public float getLineW (String text) {
		float x = 0f;
		for (int i=0;i<text.length();++i) {
			char c = text.charAt(i);
			x += getGlyphMoveX(c);
			if (c == '\n') return x; // early out
		}
		return x;
	}
	*/
	
	if (size) {
	
	} else {
		/// imageFont
		this.glyphs = glyphs;
		this.init(img, glyphs);
	}
}

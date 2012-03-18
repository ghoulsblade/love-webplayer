
/// init lua api
function Love_Font_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.font.";

	G.str['love'].str['font'] = t;
	
	t.str['newFontData']	= function () { return NotImplemented(pre+'newFontData'); }
	t.str['newGlyphData']	= function () { return NotImplemented(pre+'newGlyphData'); }
	t.str['newRasterizer']	= function () { return NotImplemented(pre+'newRasterizer'); }
}

function Love_LoadGraphics (G) {
	var t = lua_newtable();

	G.str['love'].str['graphics'] = t;
	
	// love.graphics.newImage(path)
	t.str['newImage']	= function (path) { MainPrint("graphics.newImage called "+path); return lua_newtable(); }
	
	// love.graphics.setBackgroundColor(r,g,b)
	t.str['setBackgroundColor']	= function (r,g,b) { MainPrint("graphics.setBackgroundColor called"); }
	
	// love.graphics.setColor(r,g,b,a)
	t.str['setColor']	= function (r,g,b,a) { MainPrint("graphics.setColor called"); }
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	t.str['draw']		= function (drawable, x, y, r, sx, sy, ox, oy ) { MainPrint("graphics.draw called"); }
}

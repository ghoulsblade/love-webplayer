function Love_LoadGraphics (G) {

	G.str['love'].str['graphics'] = lua_newtable();
	
	// love.graphics.newImage(path)
	G.str['love'].str['graphics'].str['newImage']	= function (path) { MainPrint("graphics.newImage called "+path); return lua_newtable(); }
	
	// love.graphics.setBackgroundColor(r,g,b)
	G.str['love'].str['graphics'].str['setBackgroundColor']	= function (r,g,b) { MainPrint("graphics.setBackgroundColor called"); }
	
	// love.graphics.setColor(r,g,b,a)
	G.str['love'].str['graphics'].str['setColor']	= function (r,g,b,a) { MainPrint("graphics.setColor called"); }
	
	//~ love.graphics.draw(drawable, x, y, r, sx, sy, ox, oy )
	G.str['love'].str['graphics'].str['draw']	= function (drawable, x, y, r, sx, sy, ox, oy ) { MainPrint("graphics.draw called"); }
}

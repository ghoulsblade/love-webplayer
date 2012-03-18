
/// init lua api
function Love_Image_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.image.";

	G.str['love'].str['image'] = t;
	
	t.str['SOMEFUN']	= function () { return NotImplemented(pre+"SOMEFUN"); }
}

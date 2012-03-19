
/// init lua api
function Love_Image_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.image.";

	G.str['love'].str['image'] = t;
	
	t.str['newEncodedImageData']	= function () { return NotImplemented(pre+'newEncodedImageData'); }
	t.str['newImageData']			= function () { return NotImplemented(pre+'newImageData'); }
}

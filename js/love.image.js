
/// init lua api
function Love_Image_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.image.";

	G.str['love'].str['image'] = t;
	
	t.str['newEncodedImageData']	= function (path) { NotImplemented(pre+'newEncodedImageData');	return [Love_Image_MakeImageDataHandle(new cImageData(path))]; }
	t.str['newImageData']			= function (path) { NotImplemented(pre+'newImageData');			return [Love_Image_MakeImageDataHandle(new cImageData(path))]; }
}

function Love_Image_MakeImageDataHandle (o) {
	var t = lua_newtable();
	var pre = "love.imagedata:";
	t._data = o;

	t.str['getPointer']		= function (t) { return NotImplemented(pre+'getPointer'	); } // Gets a pointer to the Data.
	t.str['getSize']		= function (t) { return NotImplemented(pre+'getSize'	); } // Gets the size of the Data.
	t.str['encode']			= function (t) { return NotImplemented(pre+'encode' 	); } // Encodes ImageData.
	t.str['getHeight']		= function (t) { return NotImplemented(pre+'getHeight'	); } // Gets the height of the ImageData.
	t.str['getPixel']		= function (t) { NotImplemented(pre+'getPixel'	); return [0,0,0,0]; } // Gets the pixel at the specified position.
	t.str['getString']		= function (t) { return NotImplemented(pre+'getString'	); } // Gets the full ImageData as a string.
	t.str['getWidth']		= function (t) { return NotImplemented(pre+'getWidth'	); } // Gets the width of the ImageData.
	t.str['mapPixel']		= function (t) { return NotImplemented(pre+'mapPixel'	); } // Transform an image by applying a function to every pixel.
	t.str['paste']			= function (t) { return NotImplemented(pre+'paste'		); } // Paste into ImageData from another source ImageData.
	t.str['setPixel']		= function (t) { return NotImplemented(pre+'setPixel'	); } // Sets the color of a pixel.

	t.str['type']		= function (t) { return ["ImageData"]; }	// Gets the type of the object as a string.
	t.str['typeOf']		= function (t,x) { return [x == "Object" || x == "Data" || x == "ImageData"]; }	// Checks whether an object is of a certain type.
	
	return t;
}

function cImageData(path) {
}


/// init lua api
function Love_Image_CreateTable (G) {
	var t = lua_newtable();
	var pre = "love.image.";

	G.str['love'].str['image'] = t;
	
	t.str['newEncodedImageData']	= function (path) { NotImplemented(pre+'newEncodedImageData');	return [Love_Image_MakeImageDataHandle(new cImageData(path))]; }
	t.str['newImageData']			= function (a,b) { return [Love_Image_MakeImageDataHandle(new cImageData(a,b))]; }
}

function Love_Image_MakeImageDataHandle (o) {
	var t = lua_newtable();
	var pre = "love.imagedata:";
	t._data = o;

	t.str['getWidth']		= function (t) { return [t._data.getWidth()]; } // Gets the width of the ImageData.
	t.str['getHeight']		= function (t) { return [t._data.getHeight()]; } // Gets the height of the ImageData.
	
	t.str['getPointer']		= function (t) { return NotImplemented(pre+'getPointer'	); } // Gets a pointer to the Data.
	t.str['getSize']		= function (t) { return NotImplemented(pre+'getSize'	); } // Gets the size of the Data.
	t.str['encode']			= function (t) { return NotImplemented(pre+'encode' 	); } // Encodes ImageData.
	t.str['getPixel']		= function (t) { NotImplemented(pre+'getPixel'	); return [0,0,0,0]; } // Gets the pixel at the specified position.
	t.str['getString']		= function (t) { return NotImplemented(pre+'getString'	); } // Gets the full ImageData as a string.
	t.str['mapPixel']		= function (t) { return NotImplemented(pre+'mapPixel'	); } // Transform an image by applying a function to every pixel.
	t.str['paste']			= function (t,source, dx, dy, sx, sy, sw, sh) { t._data.paste(source._data, dx, dy, sx, sy, sw, sh); } // Paste into ImageData from another source ImageData.
	t.str['setPixel']		= function (t) { return NotImplemented(pre+'setPixel'	); } // Sets the color of a pixel.

	t.str['type']			= function (t) { return ["ImageData"]; }	// Gets the type of the object as a string.
	t.str['typeOf']			= function (t,x) { return [x == "Object" || x == "Data" || x == "ImageData"]; }	// Checks whether an object is of a certain type.
	
	t.str['webDebugShow']		= function () { if (t._data.canvas) document.getElementById("output").appendChild(t._data.canvas);  } // shows canvas at bottom of page
	
	return t;
}

function cImageData(a,b) {
	this.canvas = null;
	this.context = null;
	
	this.paste = function (source, dx, dy, sx, sy, sw, sh) {
		if (!source.canvas) { MainPrint("cImageData:paste source has no canvas"); return; }
		if (!this.context) { MainPrint("cImageData:paste this has no canvas-context"); return; }
		// drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) 
		var dw = sw;
		var dh = sh;
		this.context.drawImage(source.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
	}
	
	this.getWidth = function () { return (this.canvas)?(this.canvas.width):0; }
	this.getHeight = function () { return (this.canvas)?(this.canvas.height):0; }
	
	// NOTE : http://www.w3.org/TR/2dcontext/#drawing-images-to-the-canvas
	this.CreateCanvas = function (w,h) {
		var newCanvas = document.createElement('canvas');
		newCanvas.width = w;
		newCanvas.height = h;
		var context = newCanvas.getContext('2d');
		this.canvas = newCanvas;
		this.context = context;
	}
	
	this.constructor = function (a,b) {
		// construct image from path
		if ((typeof a) == "string") {
			var path = a;
			this.path = path;
			var img = GetPreLoadedImage(path);
			if (img) {
			} else {
				img = new Image();
				img.onload = function() {}
				img.src = path;
				if (!img.complete) {
					//~ MainPrint("img:ensureLoaded() waiting for download to complete: path",this.path);
					//~ while (!this.tex.image.complete) alert("waiting for images to load...\nplease press 'ok' =)\n(no sleep() in javascript and setTimeout doesn't block)"); // seems there's no thread.sleep() in javascript that can block execution of subsequent code. 
					// setTimeout is not an option since it would need restructuring of the lua code that we don't have control over
					if (!this.bPreLoadWarningPrinted) {
						this.bPreLoadWarningPrinted = true;
						MainPrintToHTMLConsole("Warning, imageData("+this.path+") width/height accessed before loaded, try reload/F5. "+
							"This could change game behaviour and cannot be reliably prevented at js/lua runtime alone, list img files in index.html : &lt;body onload=\"MainOnLoad(['img1.png','img2.png'])\"&gt; to fix");
					}
				}
			}
			
			// create canvas and draw image into it
			this.CreateCanvas(img.width,img.height);
			this.context.drawImage(img, 0, 0);
		}
		
		// construct blank from w,h  
		if ((typeof a) == "number" && (typeof b) == "number") {
			var w = a;
			var h = b;
			this.CreateCanvas(w,h);
		}
	}
	
	
	
	this.constructor(a,b);
}

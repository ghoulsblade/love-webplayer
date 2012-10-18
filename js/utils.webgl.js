var kFloatSize = 4; // 4; // sizeof(GLfloat) doesn't seem to work...
var gGLErrorAlertsStopped = false;
var gl;

// ***** ***** ***** ***** ***** gl init


// from https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
function create3DContext (canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
}

// Initialize WebGL, returning the GL context or null if WebGL isn't available or could not be initialized.
function initWebGL(canvas) {
	gl = null;
	// http://www.khronos.org/webgl/wiki/FAQ#What_is_the_recommended_way_to_initialize_WebGL.3F
	try {
		if (!window["WebGLRenderingContext"]) {
			// the browser doesn't even know what WebGL is
			window.location = "http://get.webgl.org";
		} else {
			gl = create3DContext(canvas);
			if (!gl) {
				// browser supports WebGL but initialization failed.
				window.location = "http://get.webgl.org/troubleshooting";
			}
		}
	} catch(e) { }

	// If we don't have a GL context, give up now
	if (!gl) LoveFatalError("Unable to initialize WebGL. Your browser may not support it.");
}  

// Loads a shader program by scouring the current document, looking for a script with the specified ID.
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);

	// Didn't find an element with the specified ID; abort.
	if (!shaderScript) return null;

	// Walk through the source element's children, building the
	// shader source string.
	var theSource = "";
	var currentChild = shaderScript.firstChild;

	while(currentChild) {
		if (currentChild.nodeType == 3) {
			theSource += currentChild.textContent;
		}

		currentChild = currentChild.nextSibling;
	}

	// Now figure out what type of shader script we have,
	// based on its MIME type.
	var shader;

	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;  // Unknown shader type
	}

	// Send the source to the shader object
	gl.shaderSource(shader, theSource);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


// ***** ***** ***** ***** ***** textures

// Load the image at the passed url, place it in a new WebGLTexture object and return the WebGLTexture.
function loadImageTexture(gl, url, bPixelArt)
{
    var texture = gl.createTexture();
    texture.image = GetPreLoadedImage(url);
	if (texture.image) {
		doLoadImageTexture(gl, texture.image, texture, bPixelArt);
	} else {
		texture.image = new Image();
		texture.image.onload = function() { doLoadImageTexture(gl, texture.image, texture, bPixelArt); }
		texture.image.src = url;
	}
    return texture;
}

function doLoadImageTexture(gl, image, texture, bPixelArt)
{
	//~ gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // chrome test

    gl.bindTexture(gl.TEXTURE_2D, texture); gLastGLTexture = texture;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //~ //gl.generateMipmap(gl.TEXTURE_2D)
	if (bPixelArt) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
    gl.bindTexture(gl.TEXTURE_2D, null); gLastGLTexture = null;
}

function updateTextureParams (gl, iTexID, fmin,fmag,wraph,wrapv) {
    gl.bindTexture(gl.TEXTURE_2D, iTexID); gLastGLTexture = iTexID;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fmin);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, fmag);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wraph);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapv);
    gl.bindTexture(gl.TEXTURE_2D, null); gLastGLTexture = null;
}


// ***** ***** ***** ***** ***** canvas resize 

gMyCanvasWidth = -1;
gMyCanvasHeight = -1;
	
function UtilReshapeCanvas(gl,id)
{
	var canvas = document.getElementById(id);
	if (canvas.width == gMyCanvasWidth && canvas.height == gMyCanvasHeight)
		return;

	gMyCanvasWidth = canvas.width;
	gMyCanvasHeight = canvas.height;
	//~ MainPrint("UtilReshapeCanvas",gMyCanvasWidth,gMyCanvasHeight);
	MyOnReshapeCanvas(gMyCanvasWidth,gMyCanvasHeight);
}

function MyOnReshapeCanvas (width,height) {
	// Set the viewport and projection matrix for the scene
	gl.viewport(0, 0, width, height);
	//~ gl.perspectiveMatrix = new J3DIMatrix4();
	//~ var fNear = 0.1;
	//~ var fFar = 100.0;
	//~ gl.perspectiveMatrix.perspective(45, width/height, fNear, fFar);
        //~ void perspective(in float fovy, in float aspect,    // multiply the matrix by the passed perspective values on the right
                         //~ in float zNear, in float zFar);
	//~ gl.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);
}

// ***** ***** ***** ***** ***** gl buffer utils

// buffer examples : https://developer.mozilla.org/en/WebGL/Creating_3D_objects_using_WebGL
// WebGLFloatArray->Float32Array,WebGLUnsignedShortArray->Uint16Array ref : https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/doc/spec/TypedArray-spec.html

function DestroyGlBuffer (gl,buffer) { gl.deleteBuffer(buffer); }
function MakeGlFloatBuffer (gl,arr,mode) { // arr= [1,2,3,...] mode= gl.STATIC_DRAW
	var res = gl.createBuffer();
	UpdateGlFloatBuffer(gl,res,arr,mode);
	return res;
}

function OpenGLError2Txt (ecode) {
	switch (ecode) {
		case gl.NO_ERROR:			return "NO_ERROR";
		case gl.INVALID_ENUM:		return "INVALID_ENUM";
		case gl.INVALID_VALUE:		return "INVALID_VALUE";
		case gl.INVALID_OPERATION:	return "INVALID_OPERATION";
		case gl.OUT_OF_MEMORY:		return "OUT_OF_MEMORY";
		default: return "unknown["+String(ecode)+"]";
	}
}

function MyGetStackTrace () {
	var mye = false;
	try { 
		//~ throw "MyGetStack";
		this.undef();
	} catch (e) {
		mye = e;
	}
	return mye ? mye.stack : "??";
}

gIgnoreFirstOutOfMemory = true;

function MyCheckGLError (where) {
	if (gGLErrorAlertsStopped) return;
	var e = gl.getError(); 
	if (e != gl.NO_ERROR) {
		if (gIgnoreFirstOutOfMemory && e == gl.OUT_OF_MEMORY) { gIgnoreFirstOutOfMemory = false; return; }
		gGLErrorAlertsStopped = true;
		alert("MyCheckGLError("+(where?where:"")+") : gl.getError() : "+e+" : "+OpenGLError2Txt(e)+" stack="+MyGetStackTrace());
	}
}

function UpdateGlFloatBufferLen (gl,buffer,arr,len,mode) { UpdateGlFloatBuffer(gl,buffer,arr.slice(0,len),mode); }

function UpdateGlFloatBuffer (gl,buffer,arr,mode) { // arr= [1,2,3,...] mode= gl.STATIC_DRAW

	//~ if (!gl) alert("DrawSpriteAux:gl missing");
	//~ if (!buffer) alert("DrawSpriteAux:spriteVB_Pos missing");
	//~ if (!arr) alert("DrawSpriteAux:spritePosFloats missing");
	//~ if (!mode) alert("DrawSpriteAux:mode missing");
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),mode); // WebGLFloatArray->Float32Array
	//~ MyCheckGLError("UpdateGlFloatBuffer");
	// TODO : using new Float32Array all the time will drain memory?
	// usage example:
	// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	// gl.vertexAttribPointer(0, entries_per_vertex, gl.FLOAT, false, 0, 0);
	// gl.drawArrays(gl.TRIANGLE_STRIP, 0, number_of_vertices); // if drawn without indices
}

function MakeGlIndexBuffer (gl,arr,mode) { // arr= [1,2,3,...] mode= gl.STATIC_DRAW
	var res = gl.createBuffer();
	UpdateGlIndexBuffer(gl,res,arr,mode);
	return res;
}

function UpdateGlIndexBuffer (gl,buffer,arr,mode) { // arr= [1,2,3,...] mode= gl.STATIC_DRAW
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr),mode); // WebGLUnsignedShortArray->Uint16Array
	MyCheckGLError("UpdateGlIndexBuffer");
	// TODO : using new Uint16Array all the time will drain memory?
	// usage example:
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);  
	// gl.drawElements(gl.TRIANGLES, number_of_indices_in_res, gl.UNSIGNED_SHORT, 0);  
}

// ***** ***** ***** ***** ***** renderable

kFloatsPerVertex = 8;
function cRenderable (gl,texture,arr_vertex,arr_index) {
	this.texture = texture;
	this.buf_vertex	= MakeGlFloatBuffer(gl,arr_vertex,gl.STATIC_DRAW); // gBox_VertexData
	this.buf_index	= MakeGlIndexBuffer(gl,arr_index,gl.STATIC_DRAW); // gBox_Indices
	this.num_index	= arr_index.length; // gBox_IndicesNum
	
	this.UpdateGeometry = function (gl,texture,arr_vertex,arr_index) {
		this.texture = texture;
		UpdateGlFloatBuffer(gl,this.buf_vertex,arr_vertex,gl.STATIC_DRAW); // gBox_VertexData
		UpdateGlIndexBuffer(gl,this.buf_index,arr_index,gl.STATIC_DRAW); // gBox_Indices
		this.num_index	= arr_index.length; // gBox_IndicesNum
	}
	
	this.Destroy = function (gl) {
		if (gl == null) alert("WARNING! cRenderable.Destroy(gl) called with gl = null!");
		if (this.buf_vertex != null) { DestroyGlBuffer(gl,this.buf_vertex); this.buf_vertex = null; }
		if (this.buf_index != null) { DestroyGlBuffer(gl,this.buf_index); this.buf_index = null; }
	}
	
	this.Draw = function (gl) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture); gLastGLTexture = this.texture;
		//~ gl.enableVertexAttribArray(0); // TODO : removed durign chrome testung
		//~ gl.enableVertexAttribArray(1); // TODO : removed durign chrome testung
		// old : shaderProgram.vertexPositionAttribute = 0
		// old : shaderProgram.vertexNormalAttribute = 1
		// old : shaderProgram.textureCoordAttribute = 2
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buf_vertex);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 8*kFloatSize, 0*kFloatSize);
		//~ gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute  , 3, gl.FLOAT, false, 8*kFloatSize, 3*kFloatSize);
		gl.vertexAttribPointer(shaderProgram.textureCoordAttribute  , 2, gl.FLOAT, false, 8*kFloatSize, 6*kFloatSize);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buf_index);  
		gl.drawElements(gl.TRIANGLES, this.num_index, gl.UNSIGNED_SHORT, 0);
	}
}


// ***** ***** ***** ***** ***** Matrix utility functions

/// returns an independent copy of the 4x4 matrix
function matrix4Clone(m) { return m.slice(0); }

/// returns a 4x4 identity matrix
function matrix4GetIdentity() { return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ]; }

/// returns a 4x4 matrix with scale & translate
function matrix4GetTranslateScale(tx,ty,tz, sx,sy,sz) { return [ sx,0,0,0, 0,sy,0,0, 0,0,sz,0, tx,ty,tz,1 ]; }

/// modifies m  (m x n 4x4 matrix mult)
function matrix4Mult(m,n) {
	var o = matrix4Clone(m); // copy of old state
	for (var i=0;i<4;++i) for (var j=0;j<4;++j) { var sum = 0; for (var c=0;c<4;++c) sum += o[i*4+c] * n[c*4+j]; m[i*4+j] = sum; }
}

/// modifies m
function matrixSet(m,n) { for (var i=0;i<4*4;++i) m[i] = n[i]; }

/// modifies m
function matrix4SetIdentity(m) { for (var i=0;i<4;++i) for (var j=0;j<4;++j) m[i*4+j] = (i==j)?1:0; }

/// modifies m
function matrix4Scale(m,sx,sy,sz) {
	// optimized version of: matrix4Mult(m,matrix4GetTranslateScale(0,0,0,sx,sy,sz));
	m[0*4+0] *= sx; m[0*4+1] *= sy; m[0*4+2] *= sz;
	m[1*4+0] *= sx; m[1*4+1] *= sy; m[1*4+2] *= sz;
	m[2*4+0] *= sx; m[2*4+1] *= sy; m[2*4+2] *= sz;
	m[3*4+0] *= sx; m[3*4+1] *= sy; m[3*4+2] *= sz;
}

/// modifies m
function matrix4Translate(m,tx,ty,tz) {
	//~ matrix4Mult(m,matrix4GetTranslateScale(tx,ty,tz,1,1,1)); // optimized version below
	//~ matrixPrintOptimizeMult(matrix4GetTranslateScale("tx","ty","tz",1,1,1));
	m[0*4+0] += m[0*4+3] * tx;
	m[0*4+1] += m[0*4+3] * ty;
	m[0*4+2] += m[0*4+3] * tz;
	m[1*4+0] += m[1*4+3] * tx;
	m[1*4+1] += m[1*4+3] * ty;
	m[1*4+2] += m[1*4+3] * tz;
	m[2*4+0] += m[2*4+3] * tx;
	m[2*4+1] += m[2*4+3] * ty;
	m[2*4+2] += m[2*4+3] * tz;
	m[3*4+0] += m[3*4+3] * tx;
	m[3*4+1] += m[3*4+3] * ty;
	m[3*4+2] += m[3*4+3] * tz;
}


var matrixPrintOptimizeMult_AlreadyPrinted = false; 
function matrixPrintOptimizeMult (n) {
	if (matrixPrintOptimizeMult_AlreadyPrinted) return;
	matrixPrintOptimizeMult_AlreadyPrinted = true;
	var out = "";
	for (var i=0;i<4;++i) for (var j=0;j<4;++j) {
		var oute = "m["+i+"*4+"+j+"] = ";
		var first = true;
		for (var c=0;c<4;++c) {
			if (n[c*4+j] != 0) {
				if (!first) oute += " + "; first = false;
				oute += "o["+i+"*4+"+c+"]";
				if (n[c*4+j] != 1) oute += " * "+n[c*4+j];
			}
		}
		if (first) oute += "0";
		oute += ";\n";
		
		// skip if just  x=x;
		if (oute == "m["+i+"*4+"+j+"] = o["+i+"*4+"+j+"];\n") oute = ""; // unchanged
		
		// "x = x + bla" -> "x += bla"
		var selfadd = "m["+i+"*4+"+j+"] = o["+i+"*4+"+j+"] + ";
		if (oute.substr(0,selfadd.length) == selfadd) oute = "m["+i+"*4+"+j+"] += "+oute.substr(selfadd.length);
		
		// output
		out += oute;
	}
	MainPrint(out);
}

//	m[i*4+j]      	[  1, 0, 0, 0 ]  ---> j+
//	              	[  0, 1, 0, 0 ]
//	              	[  0, 0, 1, 0 ]
//	              	[ tx,ty,tz, 1 ]
//	[ o, o, o, o ] 
//	[ o, o, o, o ]	
//	[ o, o, o, o ]	
//	[ o, o, o, o ]	
//    |
//   \|/ i		

var kFloatSize = 4; // 4; // sizeof(GLfloat) doesn't seem to work...
var gGLErrorAlertsStopped = false;

// ***** ***** ***** ***** ***** gl init

// Initialize WebGL, returning the GL context or null if WebGL isn't available or could not be initialized.
function initWebGL(canvas) {  
	gl = null;  
	try {  
		gl = canvas.getContext("experimental-webgl");  
	} catch(e) { }
	// If we don't have a GL context, give up now  
	if (!gl) alert("Unable to initialize WebGL. Your browser may not support it.");  
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

gTexturesToLoad = new Array();
function CheckAllTexturesLoaded () {
	var c_full = 0;
	var c_loaded = 0;
	for (var i=0;i<gTexturesToLoad.length;++i) { 
		++c_full; 
		if (gTexturesToLoad[i].bMyLoadSuccess) ++c_loaded;
	}
	alert("texture load check "+c_loaded+"/"+c_full+" : "+((c_loaded == c_full)?"ok":"!!!ERROR!!!"));
}



// Load the image at the passed url, place it in a new WebGLTexture object and return the WebGLTexture.
function loadImageTexture(gl, url, bPixelArt)
{
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.bMyLoadSuccess = false;
	gTexturesToLoad.push(texture.image);
    texture.image.onload = function() { doLoadImageTexture(gl, texture.image, texture, bPixelArt); }
	
    texture.image.src = url;
    return texture;
}

function doLoadImageTexture(gl, image, texture, bPixelArt)
{
	image.bMyLoadSuccess = true;
	//~ gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // chrome test

    gl.bindTexture(gl.TEXTURE_2D, texture);
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
    gl.bindTexture(gl.TEXTURE_2D, null);
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

function MyCheckGLError () {
	if (gGLErrorAlertsStopped) return;
	var e = gl.getError(); 
	if (e != gl.NO_ERROR) {
		gGLErrorAlertsStopped = true;
		alert("MyCheckGLError : gl.getError() : "+e+" : "+OpenGLError2Txt(e)+" stack="+MyGetStackTrace());
	}
}

function UpdateGlFloatBuffer (gl,buffer,arr,mode) { // arr= [1,2,3,...] mode= gl.STATIC_DRAW

	//~ if (!gl) alert("DrawSpriteAux:gl missing");
	//~ if (!buffer) alert("DrawSpriteAux:spriteVB_Pos missing");
	//~ if (!arr) alert("DrawSpriteAux:spritePosFloats missing");
	//~ if (!mode) alert("DrawSpriteAux:mode missing");
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),mode); // WebGLFloatArray->Float32Array
	var e = gl.getError(); if (e != gl.NO_ERROR) alert("UpdateGlFloatBuffer : gl.getError() : "+e+" : "+OpenGLError2Txt(e)+" stack="+MyGetStackTrace());
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
	var e = gl.getError(); if (e != gl.NO_ERROR) alert("UpdateGlIndexBuffer : gl.getError() : "+e+" : "+OpenGLError2Txt(e)+" stack="+MyGetStackTrace());
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
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
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

/*
function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  //~ var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  //~ gl.uniformMatrix4fv(pUniform, false, new WebGLFloatArray(perspectiveMatrix.flatten()));

  //~ var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  //~ gl.uniformMatrix4fv(mvUniform, false, new WebGLFloatArray(mvMatrix.flatten()));
  
  var mvUniform = gl.getUniformLocation(shaderProgram, "u_modelViewProjMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new WebGLFloatArray(mvMatrix.flatten()));
}
*/

var spriteTexFloats = [ 0.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0 ];
var spritePosFloats = [ 0.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0 ];
var spriteIdxFloats = [ 0,1,2,3 ];
var spriteVB_Pos;
var spriteVB_Tex;
var bLoveRenderInitDone = false;
var DrawMode = {};
var Math_PI = Math.PI;
DrawMode.FILL = "fill";
DrawMode.LINE = "line";

var mVB_BasicGeo;
var mVB_BasicGeo_TexCoord;
var kMaxBasicGeoVertices = 128;
var mi_BasicGeo_Vertices = 0;
var mFB_BasicGeo = [];
	
//~ NOTE: glTexCoordPointer not in wbgl, see vertexAttribPointer(shaderProgram.textureCoordAttribute  , 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);

//~ function DrawSprite	(int iTextureID,LuanObjQuad quad,float w,float h,float x,float y,float r,float sx,float sy,float ox,float oy) {
	//~ DrawSpriteAux	(iTextureID,quad.vb_Tex,w,h,x,y,r,sx,sy,ox,oy);
//~ }

function LoveRender_Init () {
	spriteVB_Tex = MakeGlFloatBuffer(gl,spriteTexFloats,gl.DYNAMIC_DRAW);
	spriteVB_Pos = MakeGlFloatBuffer(gl,spritePosFloats,gl.DYNAMIC_DRAW);
	var arr = []; for (var i=0;i<kMaxBasicGeoVertices*2;++i) arr[i] = 0;
	mVB_BasicGeo_TexCoord = MakeGlFloatBuffer(gl,arr,gl.DYNAMIC_DRAW);
	mVB_BasicGeo = MakeGlFloatBuffer(gl,arr,gl.DYNAMIC_DRAW);
	bLoveRenderInitDone = true;
}

function DrawSpriteQ	(iTextureID,quad,w,h,x,y,r,sx,sy,ox,oy) {
	DrawSpriteAux	(iTextureID,quad.vb_Tex,w,h,x,y,r,sx,sy,ox,oy);
}

function DrawSprite	(iTextureID,w,h,x,y,r,sx,sy,ox,oy) {
	DrawSpriteAux	(iTextureID,spriteVB_Tex,w,h,x,y,r,sx,sy,ox,oy);
}

function DrawSpriteAux	(iTextureID,vb_texcoords,w,h,x,y,r,sx,sy,ox,oy) {
	if (!bLoveRenderInitDone) return;
	var mycos = cos(r);
	var mysin = sin(r);
	
	// coord sys with 0,0 = left,top, and +,+ = right,bottom
	// vx_ x/y = clockwise rotation starting at the right   (rot=0 : x=1,y=0)
	// vy_ x/y = clockwise rotation starting at the bottom  (rot=0 : x=0,y=1)
	
	var vx_x = w*mycos; // rot= 0:1  90:0  180:-1   270:0  = cos
	var vx_y = w*mysin; // rot= 0:0  90:1  180:0   270:-1  = sin
	
	var vy_x = -h*mysin; // rot= 0:0  90:-1  180:0   270:1  = -sin
	var vy_y =  h*mycos; // rot= 0:1  90:0  180:-1   270:0  = cos

	vx_x *= sx;
	vx_y *= sx;
	
	vy_x *= sy;
	vy_y *= sy;
	
	//~ Log("DrawSprite vx="+vx_x+","+vx_y+" vy="+vy_x+","+vy_y);
	
	//~ float x0 = -0.5f*vx_x -0.5f*vy_x; // center
	//~ float y0 = -0.5f*vx_y -0.5f*vy_y; 
	
	var x0 = x - vx_x*ox/w - vy_x*oy/h; // top-left ?
	var y0 = y - vx_y*ox/w - vy_y*oy/h; 
	//~ Log(" + "+x0+","+y0+"  "+vx_x+","+vx_y+"  "+vy_x+","+vy_y);
	
	spritePosFloats[0*2 + 0] = x0; 
	spritePosFloats[0*2 + 1] = y0; 
	
	spritePosFloats[1*2 + 0] = x0 + vx_x; 
	spritePosFloats[1*2 + 1] = y0 + vx_y; 
	
	spritePosFloats[2*2 + 0] = x0 + vy_x;  
	spritePosFloats[2*2 + 1] = y0 + vy_y;  
	
	spritePosFloats[3*2 + 0] = x0 + vx_x + vy_x;  
	spritePosFloats[3*2 + 1] = y0 + vx_y + vy_y;  
	
	UpdateGlFloatBuffer(gl,spriteVB_Pos,spritePosFloats,gl.DYNAMIC_DRAW);
	
	if (gLastGLTexture != iTextureID) { gl.bindTexture(gl.TEXTURE_2D, iTextureID); gLastGLTexture = iTextureID; }
	setVertexBuffers_Aux(spriteVB_Pos,vb_texcoords);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
	//~ var spriteIB;
	//~ spriteIB	 = MakeGlIndexBuffer(gl,spriteIdxFloats,gl.STATIC_DRAW); // gBox_Indices
	//~ gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteIB);  
	//~ gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
}

// ***** ***** ***** ***** ***** geometric BasicGeo_*


function BasicGeo_Prepare (vnum) {
	//~ assert(vnum <= kMaxBasicGeoVertices);
	if (!(vnum <= kMaxBasicGeoVertices)) alert("BasicGeo_Prepare too many vertices");
	mi_BasicGeo_Vertices = 0;
}

function BasicGeo_Vertex (x,y) {
	var i = mi_BasicGeo_Vertices*2;
	++mi_BasicGeo_Vertices;
	mFB_BasicGeo[i  ] = x;
	mFB_BasicGeo[i+1] = y;
}

/// mode: e.g. GL10.GL_TRIANGLES
///  GL_POINTS, GL_LINE_STRIP,GL_LINE_LOOP, GL_LINES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN, and GL_TRIANGLES
function BasicGeo_Draw (mode) {
	//~ assert(mi_BasicGeo_Vertices <= kMaxBasicGeoVertices);
	if (!(mi_BasicGeo_Vertices <= kMaxBasicGeoVertices)) alert("BasicGeo_Draw : incomplete");
	//~ MainPrint(mFB_BasicGeo.slice(0,mi_BasicGeo_Vertices*2));
	
	UpdateGlFloatBufferLen(gl,mVB_BasicGeo,mFB_BasicGeo,mi_BasicGeo_Vertices*2,gl.DYNAMIC_DRAW);
	
	gl.bindTexture(gl.TEXTURE_2D, null); gLastGLTexture = null;
	setVertexBuffersToCustom(mVB_BasicGeo,mVB_BasicGeo_TexCoord);
	gl.uniform4f(shaderProgram.uFragOverrideAddColor,1,1,1,1);
	// gl.flush(); // finish/swapbuffer (optional?)   didn't help webgl OUT_OF_MEMORY error
	// MyCheckGLError("BasicGeo_Draw 05 mi_BasicGeo_Vertices="+String(mi_BasicGeo_Vertices));
	gl.drawArrays(mode, 0, mi_BasicGeo_Vertices); //  gl.getError() : 1285 : OUT_OF_MEMORY   here with mi_BasicGeo_Vertices=2
	// MyCheckGLError("BasicGeo_Draw 06 mi_BasicGeo_Vertices="+String(mi_BasicGeo_Vertices));  
	gl.uniform4f(shaderProgram.uFragOverrideAddColor,0,0,0,0);
}

// ***** ***** ***** ***** ***** setVertexBuffersToCustom etc

var bVertexBuffersSprite;

function setVertexBuffersToCustom (vb_Pos,vb_Tex) { setVertexBuffers_Aux(vb_Pos,vb_Tex); }

function setVertexBuffers_Aux(vb_Pos,vb_Tex) {
	bVertexBuffersSprite = false;
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_Pos);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_Tex);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute  , 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);
}

// ***** ***** ***** ***** ***** geometric primitives

function renderRectangle(mode, x, y, w, h) {
	if (mode == DrawMode.FILL) {
		BasicGeo_Prepare(4);
		BasicGeo_Vertex(x  ,y  );
		BasicGeo_Vertex(x+w,y  );
		BasicGeo_Vertex(x+w,y+h);
		BasicGeo_Vertex(x  ,y+h);
		BasicGeo_Draw(gl.TRIANGLE_FAN);
	} else {
		BasicGeo_Prepare(5);
		BasicGeo_Vertex(x  ,y  );
		BasicGeo_Vertex(x+w,y  );
		BasicGeo_Vertex(x+w,y+h);
		BasicGeo_Vertex(x  ,y+h);
		BasicGeo_Vertex(x  ,y  );
		BasicGeo_Draw(gl.LINE_STRIP);
	}
}

function renderCircle(mode, x, y, radius, segments ) {
	BasicGeo_Prepare(segments);
	for (var i=0;i<segments;++i) {
		var ang = Math_PI * 2 * (i) / (segments);
		var x1 = x + radius * sin(ang);
		var y1 = y + radius * cos(ang);
		BasicGeo_Vertex(x1,y1);
	}
	BasicGeo_Draw((mode == DrawMode.FILL) ? gl.TRIANGLE_FAN : gl.LINE_LOOP);
}

function renderArc(mode, x, y, radius, angle1, angle2, segments ) {
	BasicGeo_Prepare(segments);
	for (var i=0;i<segments;++i) {
		var ang = -0.5*Math_PI + angle1 + (angle2 - angle1) * (i) / (segments-1); // TODO : not yet tested
		var x1 = x + radius * sin(ang);
		var y1 = y + radius * cos(ang);
		BasicGeo_Vertex(x1,y1);
	}
	BasicGeo_Draw((mode == DrawMode.FILL) ? gl.TRIANGLE_FAN : gl.LINE_LOOP);
}

function renderTriangle(mode, x1, y1, x2, y2, x3, y3) {
	if (mode == DrawMode.FILL) {
		BasicGeo_Prepare(3);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Vertex(x2,y2);
		BasicGeo_Vertex(x3,y3);
		BasicGeo_Draw(gl.TRIANGLES);
	} else {
		BasicGeo_Prepare(4);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Vertex(x2,y2);
		BasicGeo_Vertex(x3,y3);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Draw(gl.LINE_STRIP);
	}
}

//~ gDebugBlockRenderPoly = false;
function renderPolygon(mode,myargs) {
	var arr;
	//~ if (gDebugBlockRenderPoly) return;
	if ((typeof myargs[1]) == "object") { // table
		var t = myargs[1];
		ensure_arraymode(t);
		arr = [];
		for (var i=0;t.uints[i] != null;++i) arr.push(t.uints[i]);
		//~ MainPrint("renderPolygon arr=",arr);
	} else {
		arr = [];
		for (var i=1;i<myargs.length;++i) arr.push(myargs[i]);
	}
	//~ MainPrint("renderPolygon mode=",mode,"numvert=",arr.length,"verts=",arr);
	//~ LoveFatalError("polygon debug stop");
	//~ gDebugBlockRenderPoly = true;
	if (mode == DrawMode.FILL) {
		BasicGeo_Prepare(arr.length/2);
		for (var i=0;i<2*(arr.length/2);i+=2) BasicGeo_Vertex(arr[i],arr[i+1]);
		BasicGeo_Draw(gl.TRIANGLE_FAN);
	} else {
		BasicGeo_Prepare(arr.length/2+1);
		for (var i=0;i<2*(arr.length/2);i+=2) BasicGeo_Vertex(arr[i],arr[i+1]);
		BasicGeo_Vertex(arr[0],arr[1]);
		BasicGeo_Draw(gl.LINE_STRIP);
	}
}

function renderQuad(mode, x1, y1, x2, y2, x3, y3, x4, y4) {
	if (mode == DrawMode.FILL) {
		BasicGeo_Prepare(4);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Vertex(x2,y2);
		BasicGeo_Vertex(x3,y3);
		BasicGeo_Vertex(x4,y4);
		BasicGeo_Draw(gl.TRIANGLE_FAN);
	} else {
		BasicGeo_Prepare(5);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Vertex(x2,y2);
		BasicGeo_Vertex(x3,y3);
		BasicGeo_Vertex(x4,y4);
		BasicGeo_Vertex(x1,y1);
		BasicGeo_Draw(gl.LINE_STRIP);
	}
}

function renderPolyLine(arr) {
	BasicGeo_Prepare(arr.length/2);
	for (var i=0;i<2*(arr.length/2);i+=2) BasicGeo_Vertex(arr[i],arr[i+1]);
	BasicGeo_Draw(gl.LINE_STRIP);
}

function renderLine(x1, y1, x2, y2) {
	BasicGeo_Prepare(2);
	BasicGeo_Vertex(x1,y1);
	BasicGeo_Vertex(x2,y2);
	BasicGeo_Draw(gl.LINE_STRIP);
}

function renderPoint(x, y) {
	BasicGeo_Prepare(1);
	BasicGeo_Vertex(x  ,y  );
	BasicGeo_Draw(gl.POINTS);
}

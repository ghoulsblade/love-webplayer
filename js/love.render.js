var spriteTexFloats = [ 0.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0 ];
var spritePosFloats = [ 0.0,0.0, 1.0,0.0, 0.0,1.0, 1.0,1.0 ];
var spriteIdxFloats = [ 0,1,2,3 ];
var spriteVB_Pos;
var spriteVB_Tex;
var spriteIB;
var bLoveRenderInitDone = false;
//~ NOTE: glTexCoordPointer not in wbgl, see vertexAttribPointer(shaderProgram.textureCoordAttribute  , 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);

//~ function DrawSprite	(int iTextureID,LuanObjQuad quad,float w,float h,float x,float y,float r,float sx,float sy,float ox,float oy) {
	//~ DrawSpriteAux	(iTextureID,quad.vb_Tex,w,h,x,y,r,sx,sy,ox,oy);
//~ }

function LoveRender_Init () {
	spriteVB_Tex = MakeGlFloatBuffer(gl,spriteTexFloats,gl.STATIC_DRAW);
	spriteVB_Pos = MakeGlFloatBuffer(gl,spritePosFloats,gl.STATIC_DRAW);
	spriteIB	 = MakeGlIndexBuffer(gl,spriteIdxFloats,gl.STATIC_DRAW); // gBox_Indices
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
	
	UpdateGlFloatBuffer(gl,spriteVB_Pos,spritePosFloats,gl.STATIC_DRAW);
	
	gl.bindTexture(gl.TEXTURE_2D, iTextureID);
	gl.bindBuffer(gl.ARRAY_BUFFER, spriteVB_Pos);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);
	gl.bindBuffer(gl.ARRAY_BUFFER, vb_texcoords);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute  , 2, gl.FLOAT, false, 0*kFloatSize, 0*kFloatSize);
	//~ gl.drawArrays(gl.GL_TRIANGLE_STRIP, 0, 4); DOESN'T WORK?
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteIB);  
	gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
}

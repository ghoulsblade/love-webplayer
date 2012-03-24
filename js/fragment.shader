
#ifdef GL_ES
precision highp float;
#endif
// old: precision mediump float;
// old: uniform vec4 u_MaterialColor;

varying vec2 vTextureCoord;
//~ varying vec3 vLightWeighting;

uniform sampler2D uSampler;
uniform vec4 uMaterialColor;
uniform vec4 uFragOverrideAddColor;

void main(void) {
	vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	textureColor.rgba += uFragOverrideAddColor.rgba; // allows setting a color other than (0,0,0,!!0!!) when using bindTexture(gl.TEXTURE_2D, null); 
	//~ if (textureColor.a < .5) discard;
	if (textureColor.a <= .0) discard;
	//~ gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);
	gl_FragColor = vec4(textureColor.rgb * uMaterialColor.rgb, textureColor.a * uMaterialColor.a);
	//~ gl_FragColor = vec4(textureColor.rgb * uMaterialColor.rgb,textureColor.a * 200.0/255.0);
	//~ gl_FragColor = vec4(textureColor.rgb, 0.5);
	//~ gl_FragColor = textureColor * uMaterialColor;
	//~ gl_FragColor = uMaterialColor;
	//~ gl_FragColor = vec4(textureColor.rgb, 0.5);
	//~ gl_FragColor = vec4(0,1,0,0.5);
	//~ old: vec4 color = texture2D(sampler2d, v_texCoord);
	//~ old: if (color.a < .5) discard;
	//~ old: gl_FragColor = color * u_MaterialColor;
}

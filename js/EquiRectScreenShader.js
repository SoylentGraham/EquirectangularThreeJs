
THREE.EquiRectScreenShader = {
	
FACE_UP:		0,
FACE_LEFT:		1,
FACE_FORWARD:	2,
FACE_RIGHT:		3,
FACE_BACK:		4,
FACE_DOWN:		5,
	/*
	 
	 #define FACE_UP		0
	 #define FACE_LEFT		1
	 #define FACE_FORWARD	2
	 #define FACE_RIGHT	3
	 #define FACE_BACK		4
	 #define FACE_DOWN		5
	 */
TextureWidth:	256,
TextureHeight:	256,
TextureFormat:  { format: THREE.RGBFormat, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter },
	
	
uniforms: {
	
	"tDiffuse": { type: "t", value: null },
	"uvFace":	{ type: "v4v", value: [	new THREE.Vector4(0,0,0,0),
									   new THREE.Vector4(0,0,0,0),
									   new THREE.Vector4(0,0,1,1),
									   new THREE.Vector4(0,0,0,0),
									   new THREE.Vector4(0,0,0,0),
									   new THREE.Vector4(0,0,0,0),
									   ] },
	"tFace":	{	type: "tv", value:	[ new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat ),
										 new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat  ),
										 new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat  ),
										 new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat  ),
										 new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat  ),
										 new THREE.WebGLRenderTarget( this.TextureWidth, this.TextureHeight, this.TextureFormat ),
										 ] },
},
	
vertexShader: [
			   
			   "varying vec2 vUv;",
			   
			   "void main() {",
			   
			   "vUv = uv;",
			   "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			   
			   "}"
			   ].join("\n"),
	
fragmentShader: [
				 
				 "uniform vec4 uvFace[6];",
				 "uniform sampler2D tFace[6];",
				 "uniform sampler2D tDiffuse;",
				 "varying vec2 vUv;",
				 "#define M_PI 3.1415926535897932384626433832795",
				 
				 "vec2 GetLatLonRad(float x,float y,float w,float h) {",
					"float lat = ((h-y) / h) * 1.0;",
					"float lon = (x / w) * 2.0;",
					"lon = (lon - 1.0) * M_PI;",
					"lat = (lat - 0.5) * M_PI;",
					"return vec2( lat,lon );",
				 "}",
				 
				 "vec3 GetViewVectorFromLatLonRad(vec2 LatLon) {",
					"float las = sin(LatLon.x);",
					"float lac = cos(LatLon.x);",
					"float los = sin(LatLon.y);",
					"float loc = cos(LatLon.y);",
					"return vec3( los * lac, las, loc * lac );",
				 "}",

				 "#define FACE_UP		0",
				 "#define FACE_LEFT		1",
				 "#define FACE_FORWARD	2",
				 "#define FACE_RIGHT	3",
				 "#define FACE_BACK		4",
				 "#define FACE_DOWN		5",
				 
				 "vec4 Sample(sampler2D Texture,vec2 Uv,vec4 UvMult) {",
					"Uv *= UvMult.zw;",
					"Uv += UvMult.xy;",
					"return texture2D( Texture, Uv );",
				 "}",
				 
				 "vec4 SampleFace(int Face,vec2 FaceUv) {",
					//	'[]' : Index expression must be constant
				//	"if ( Face == FACE_UP )			return vec4(1,0,0,1);",
				//	"if ( Face == FACE_LEFT )		return vec4(0,1,0,1);",
				//	"if ( Face == FACE_FORWARD )	return Sample( tDiffuse, FaceUv, uvFace[FACE_FORWARD] );",
				 //	"if ( Face == FACE_FORWARD )	return vec4(0,0,1,1);",
				//	"if ( Face == FACE_RIGHT )		return vec4(1,1,0,1);",
				//	"if ( Face == FACE_BACK )		return vec4(0,1,1,1);",
				///	"if ( Face == FACE_DOWN )		return vec4(1,0,1,1);",

					"if ( Face == FACE_UP )			return Sample( tFace[FACE_UP], FaceUv, uvFace[FACE_UP] );",
					"if ( Face == FACE_LEFT )		return Sample( tFace[FACE_LEFT], FaceUv, uvFace[FACE_LEFT] );",
					"if ( Face == FACE_FORWARD )	return Sample( tDiffuse, FaceUv, uvFace[FACE_FORWARD] );",
					"if ( Face == FACE_RIGHT )		return Sample( tFace[FACE_RIGHT], FaceUv, uvFace[FACE_RIGHT] );",
					"if ( Face == FACE_BACK )		return Sample( tFace[FACE_BACK], FaceUv, uvFace[FACE_BACK] );",
					"if ( Face == FACE_DOWN )		return Sample( tFace[FACE_DOWN], FaceUv, uvFace[FACE_DOWN] );",
					"return vec4( 1, 0, 1, 1 );",
				 "}",
				 
				 "vec4 SampleLatLonRad(vec2 LatLon) {",
					"vec3 View = GetViewVectorFromLatLonRad(LatLon);	vec3 coords = View;",
					"int Face = FACE_FORWARD;",
					"vec2 FaceUv;",
					"vec3 Viewa = abs( View );	float ax=Viewa.x;	float ay=Viewa.y;	float az=Viewa.z;	",
					"if (ax > ay && ax > az)",
					"{//	facing x",
						"FaceUv.x = View.z / ax;",
						"FaceUv.y = -View.y / ax;",
						"Face = (0.0 < View.x) ? FACE_RIGHT : FACE_LEFT;",
						"if (0.0 < View.x)",
							"FaceUv.x = -FaceUv.x;",
				 	"}",
				 	"else if (ay > ax && ay > az)",
				 	"{//	facing y",
				 		"FaceUv.x = View.x / ay;",
				 		"FaceUv.y = View.z / ay;",
						"Face = (0.0 < View.y) ? FACE_UP : FACE_DOWN;",	//	py/ny
				 		"if (0.0 >= View.y)",
							"FaceUv.y = -FaceUv.y;",
				 	"}",
				 	"else",
				 	"{//	must be facing z",
				 		"FaceUv.x = View.x / az;",
				 		"FaceUv.y = -View.y / az;",
						"Face = (0.0 < View.z) ? FACE_FORWARD : FACE_BACK;",	//	px/nx
				 		"if (0.0 >= View.z)",
							"FaceUv.x = -FaceUv.x;",
					"}",
					//	turn -1..1 to 0...1 for uv
					"FaceUv += vec2(1,1);",
					"FaceUv *= vec2(0.5,0.5);",
					"return SampleFace( Face, FaceUv );",
				 "}",
				 
				 "void main() {",
				 
				 "vec2 LatLon = GetLatLonRad( vUv.x, vUv.y, 1.0, 1.0 );",
				 
				 //	debug view vector
				 "vec3 View = GetViewVectorFromLatLonRad(LatLon);",
				 "View += vec3(1.0,1.0,1.0);",
				 "View *= vec3(0.5,0.5,0.5);",
				 "View *= vec3(0,0,0);",
				 "vec4 texel = vec4( View.x, View.y, View.z, 1 );",
				 "texel += SampleLatLonRad( LatLon );",
				 
				 //"vec4 texel = SampleLatLonRad( LatLon );",
				 
				 //	just read texture
				 //"vec4 texel = texture2D( tDiffuse, vUv );",
				 
				 "gl_FragColor = texel;",
				 
				 "}"
				 
				 ].join("\n")
	
};


function EquiRectScreenShader_InitDebugTextures(Shader)
{
}

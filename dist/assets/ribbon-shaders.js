// Refraction shader from maximeheckel.com, adapted to vanilla Three.js.
export const vertexShader = `#define GLSLIFY 1
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

void main() {

  vec3 pos = position;
  vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
  vec4 mvPosition = viewMatrix * worldPos;
	
  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  vec3 normal = normalize( transformedNormal );

  vNormal = normal;
  vViewPos = -mvPosition.xyz;
}`;
export const fragmentShader = `#define GLSLIFY 1
uniform float uTransparent;
uniform vec2 winResolution;
uniform float uRefractPower;
uniform sampler2D uSceneTex;
uniform vec3 uLight;

varying vec3 vNormal;
varying vec3 vViewPos;

#define PI 3.141592653589793

float ggx( float dNH, float roughness ) {
	
	float a2 = roughness * roughness;
	a2 = a2 * a2;
	float dNH2 = dNH * dNH;

	if( dNH2 <= 0.0 ) return 0.0;

	return a2 / ( PI * pow( dNH2 * ( a2 - 1.0 ) + 1.0, 2.0) );
}

float random(vec2 p){
	return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

const int LOOP = 4;

void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec2 refractNormal = vNormal.xy * (1.0 - vNormal.z * 0.85);
  vec3 refractCol = vec3( 0.0 );

  for ( int i = 0; i < LOOP; i ++ ) {
    float noiseIntensity = 0.015;

    float noise = random(uv) * noiseIntensity;

    float slide = float(i) / float(LOOP) * 0.1 + noise;
 
    vec2 refractUvR = uv - refractNormal * ( uRefractPower + slide * 1.0 ) * uTransparent;
    vec2 refractUvG = uv - refractNormal * ( uRefractPower + slide * 2.0 ) * uTransparent;
    vec2 refractUvB = uv - refractNormal * ( uRefractPower + slide * 3.0 ) * uTransparent;
 
    refractCol.r += texture2D( uSceneTex, refractUvR ).r;
    refractCol.g += texture2D( uSceneTex, refractUvG ).g;
    refractCol.b += texture2D( uSceneTex, refractUvB ).b;
  }

  refractCol /= float( LOOP );

  float shininess = 10.0;

  // vec3 lightVector = normalize(vec3(-0.0, 5.0, 0.0 ));
  vec3 lightVector = normalize(uLight);
  vec3 viewVector = normalize( vViewPos );
  vec3 normalVector = normalize( vNormal );

  vec3 halfVector = normalize(viewVector + lightVector);

  float NdotL = dot(normalVector, lightVector);
  float NdotH = dot(normalVector, halfVector);

  float kDiffuse = max(0.0, NdotL);

  float NdotH2 = NdotH * NdotH;
  float kSpecular = pow(NdotH2, shininess);

  refractCol += (kSpecular + kDiffuse * 0.05);

  gl_FragColor = vec4(refractCol, 1.0);
}

`;

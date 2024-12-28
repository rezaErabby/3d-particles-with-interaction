varying vec3 vPosition;

uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {

float depth = vPosition.z * 0.5 +  0.5 * 0.3 +0.3;

vec3 mixedColor = mix(uColor1,uColor2,depth);
 gl_FragColor = vec4(mixedColor, depth);
}
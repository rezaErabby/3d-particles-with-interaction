varying vec3 vPosition;
attribute vec3 aRandom;
uniform float uTime;
uniform float uScale;

void main() {
  vec3 pos = position;

  pos.x += sin(uTime * 4. * aRandom.x) * 0.01;
  pos.y += cos(uTime * 4. * aRandom.y) * 0.01;
  pos.z += cos(uTime * 4. * aRandom.z) * 0.01;

  pos.x *= uScale + (sin(pos.y * 4.0 + uTime * 4.0) * (1. - uScale));
  pos.y *= uScale + (sin(pos.z * 4.0 + uTime * 4.0) * (1. - uScale));
  pos.z *= uScale + (sin(pos.x * 4.0 + uTime * 4.0) * (1. - uScale));

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 8.0 / -mvPosition.z;

  vPosition = position;
}
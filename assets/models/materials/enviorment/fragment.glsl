uniform sampler2D envMap;
uniform vec3 color;

varying vec3 vReflect;

vec2 sampleSphericalMap(vec3 v) {
  vec2 uv = vec2(
    atan(v.z, v.x) / (2.0 * 3.1415926) + 0.5,
    asin(v.y) / 3.1415926 + 0.5
  );
  return uv;
}

void main() {
  vec2 uv = sampleSphericalMap(normalize(vReflect));
  vec3 envColor = texture2D(envMap, uv).rgb;

  gl_FragColor = vec4(envColor, 1.0);
}

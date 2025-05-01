// fragment.glsl
uniform samplerCube envMap;

varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  vec4 envColor = textureCube(envMap, normal);
  gl_FragColor = vec4(pow(envColor.rgb,vec3(1.0/2.2)), 1.0);
}

// fragment.glsl
uniform samplerCube envMap;
uniform samplerCube altEnvMap;
uniform bool irradianceMap;

varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  vec4 envColor = textureCube(envMap, normal);
  if (irradianceMap) {
    envColor = textureCube(altEnvMap, normal);
  }
  gl_FragColor = vec4(pow(envColor.rgb,vec3(1.0/2.2)), 1.0);
}
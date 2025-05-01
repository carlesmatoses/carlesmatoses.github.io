// fragment.glsl
uniform sampler2D tex_diffuse;
uniform samplerCube envMap;
uniform vec3 color; 

varying vec2 vUv; 
varying vec3 vNormal;


void main() {
  vec3 normal = normalize(vNormal);
  vec3 texColor = texture2D(tex_diffuse, vUv).rgb;
  vec3 envColor = textureCube(envMap, normal).rgb;
  
  vec3 finalColor = envColor;

  gl_FragColor = vec4(pow(finalColor, vec3(1.0/2.2)), 1.0);
}

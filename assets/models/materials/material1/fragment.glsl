// fragment.glsl
uniform sampler2D tex_diffuse;
uniform sampler2D shadowMap;
uniform samplerCube envMap;
uniform float factor;

varying vec2 vUv; 
varying vec3 vNormal;


void main() {
  vec3 normal = normalize(vNormal);
  vec3 texColor = texture2D(tex_diffuse, vUv).rgb;
  vec3 shadowColor = texture2D(shadowMap, vec2(vUv.x, 1.0-vUv.y)).rgb;
  vec3 envColor = textureCube(envMap, normal).rgb;
  
  vec3 finalColor = envColor*pow(shadowColor,vec3(1.2));
  finalColor = mix(envColor,finalColor,factor);

  gl_FragColor = vec4(pow(finalColor, vec3(1.0/2.2)), 1.0);
}

// fragment.glsl
uniform sampler2D tex_diffuse;
uniform sampler2D shadowMap;
uniform samplerCube envMap;
uniform float shadow;
uniform float global_illumination;

varying vec2 vUv; 
varying vec3 vNormal;


void main() {
  vec3 normal = normalize(vNormal);
  vec3 texColor = texture2D(tex_diffuse, vUv).rgb;
  vec3 shadowColor = texture2D(shadowMap, vec2(vUv.x, 1.0-vUv.y)).rgb;
  vec3 envColor = textureCube(envMap, normal).rgb;
  
  // calculate global illumination
  vec3 color = texColor*mix(envColor,vec3(1.0),1.0-global_illumination);

  // calculate shadow
  shadowColor = mix(vec3(1.0), shadowColor, shadow);
  vec3 finalColor = color*shadowColor;

  gl_FragColor = vec4(pow(finalColor, vec3(1.0/2.2)), 1.0);
}

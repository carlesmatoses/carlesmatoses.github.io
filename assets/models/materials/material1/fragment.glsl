// fragment.glsl
uniform sampler2D tex_diffuse;
uniform sampler2D shadowMap;
uniform sampler2D AOMap;
uniform samplerCube envMap;

uniform float shadow;
uniform float AO;
uniform float global_illumination;

varying vec2 vUv; 
varying vec3 vNormal;


void main() {
  // Base color
  vec3 normal = normalize(vNormal);
  vec3 _color = texture2D(tex_diffuse, vUv).rgb;

  // add global illumination
  vec3 envColor = textureCube(envMap, normal).rgb;
  _color = _color*mix(vec3(1.0), envColor, global_illumination);

  // Multiply it by shadow
  vec3 shadowColor = texture2D(shadowMap, vec2(vUv.x, 1.0-vUv.y)).rgb;
  _color = _color*mix(vec3(1.0), shadowColor, shadow);

  // calculate AO
  vec3 AOColor = texture2D(AOMap, vec2(vUv.x, 1.0-vUv.y)).rgb;
  _color = _color*mix(vec3(1.0), AOColor, AO);
  

  gl_FragColor = vec4(pow(_color, vec3(1.0/2.2)), 1.0);
}

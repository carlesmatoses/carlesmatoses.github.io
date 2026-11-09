// fragment.glsl
varying vec3 vNormal;
varying vec3 vPosition; // world space position from vertex shader
vec3 lightPos = vec3(10.0, 10.0, 10.0); // position of the light source
uniform float diffuse_component; 
uniform float specular_component;
uniform float shininess;
// uniform vec3 cameraPosition; // Three.js provides this

void main() {
  // Light intensities
  vec3 is = vec3(1.0, 1.0, 1.0); 
  vec3 id = vec3(1.0, 1.0, 1.0);
  vec3 ia = vec3(0.1, 0.1, 0.1);
  
  // Material reflectance coefficients
  vec3 ks = vec3(specular_component); // specular reflectance
  vec3 kd = vec3(diffuse_component); // diffuse reflectance
  vec3 ka = vec3(0.1); // ambient reflectance
  float alpha = shininess;  // shininess

  // Compute vectors
  vec3 Lm = normalize(lightPos - vPosition);
  vec3 normal = normalize(vNormal);
  vec3 Rm = reflect(-Lm, normal);
  vec3 Vm = normalize(cameraPosition - vPosition);
  
  // Phong reflection model
  vec3 ambient = ia * ka;
  vec3 diffuse = id * kd * max(dot(normal, Lm), 0.0);
  vec3 specular = is * ks * pow(max(dot(Rm, Vm), 0.0), alpha);
  
  vec3 phong = ambient + diffuse + specular;

  // Apply gamma correction for display
  gl_FragColor = vec4(pow(phong, vec3(1.0/2.2)), 1.0);
}
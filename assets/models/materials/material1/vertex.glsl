// vertex.glsl
varying vec2 vUv; 
varying vec3 vNormal; 

void main() {
  vUv = uv;

  float angle = 0.0;
  mat4 rotationMatrix = mat4(
    vec4(cos(radians(angle)), 0.0, sin(radians(angle)), 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(-sin(radians(angle)), 0.0, cos(radians(angle)), 0.0),
    vec4(0.0, 0.0, 0.0, 1.0)
  );

  vNormal = normalize(mat3(modelMatrix*rotationMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * rotationMatrix * vec4(position, 1.0);
}

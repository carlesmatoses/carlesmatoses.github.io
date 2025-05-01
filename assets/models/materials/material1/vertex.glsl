// vertex.glsl
varying vec2 vUv; 
varying vec3 vNormal; 

void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);

  // Rotate the object 90 degrees on the Y axis
  mat4 rotationMatrix = mat4(
    vec4(cos(radians(90.0)), 0.0, sin(radians(90.0)), 0.0),
    vec4(0.0, 1.0, 0.0, 0.0),
    vec4(-sin(radians(90.0)), 0.0, cos(radians(90.0)), 0.0),
    vec4(0.0, 0.0, 0.0, 1.0)
  );

  gl_Position = projectionMatrix * modelViewMatrix * rotationMatrix * vec4(position, 1.0);
}

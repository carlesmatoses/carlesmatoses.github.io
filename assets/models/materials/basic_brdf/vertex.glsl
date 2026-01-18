varying vec3 vNormal;
varying vec3 vPosition; // world space position

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0); // Scale the sphere by 1.5
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
  vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);

  vNormal = worldNormal;
  vPosition = worldPosition.xyz; // pass world position to fragment shader

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}

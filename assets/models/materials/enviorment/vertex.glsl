varying vec3 vReflect;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position * 10.0, 1.0); // Scale the sphere by 1.5
  vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
  vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);

  vReflect = reflect(cameraToVertex, worldNormal);

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}

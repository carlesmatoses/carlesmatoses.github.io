// vertex.glsl
varying vec2 vUv; // Store UV coordinates for the fragment shader
varying vec3 vNormal; // Store the transformed normal for the fragment shader

void main() {
  vUv = uv; // Pass UV coordinates to fragment shader
  vNormal = normalize(normalMatrix * normal); // Transform and normalize the normal vector
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

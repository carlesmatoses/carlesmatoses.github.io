// fragment.glsl
uniform sampler2D tex_diffuse; // The diffuse texture
uniform vec3 color; // A color to apply to the texture
uniform vec3 vNormal
varying vec2 vUv; // UV coordinates passed from vertex shader

void main() {
  vec4 texColor = texture2D(tex_diffuse, vUv); // Sample the texture at the UV coordinates
  gl_FragColor = texColor * vec4(color, 1.0); // Multiply the texture color by the uniform color
}

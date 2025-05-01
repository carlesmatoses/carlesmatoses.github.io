// viewer.js
// Assumes the following scripts are loaded in your HTML:
// <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/examples/js/loaders/GLTFLoader.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/three@0.152.2/examples/js/controls/OrbitControls.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.glb-viewer').forEach(container => {
    const id = container.dataset.id;
    const modelNames = JSON.parse(container.dataset.models || '[]');
    const materialNames = JSON.parse(container.dataset.materials || '[]');

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#c0c0c0');

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // OrbitControls setup
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // Optional: Add a light if your shaders require lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    // scene.add(light);

    // Load models and apply shader materials
    modelNames.forEach((modelName, index) => {
      const materialName = materialNames[index];
      const loader = new THREE.GLTFLoader();
      console.log('Loading model:', modelName, 'with material:', materialName);
      loader.load(
        `/assets/models/${modelName}.glb`,
        gltf => {
          const object = gltf.scene;

          // Load shader files
          Promise.all([
            fetch(`/assets/models/materials/${materialName}/vertex.glsl`).then(r => r.text()),
            fetch(`/assets/models/materials/${materialName}/fragment.glsl`).then(r => r.text()),
            fetch(`/assets/models/materials/${materialName}/uniforms.json`).then(r => r.json())
          ]).then(([vertexShader, fragmentShader, uniforms]) => {
            const shaderMaterial = new THREE.ShaderMaterial({
              vertexShader,
              fragmentShader,
              uniforms: formatUniforms(uniforms, `/assets/models/materials/${materialName}`),
              lights: false // Set to true if shaders expect lighting uniforms
            });

            object.traverse(child => {
              if (child.isMesh) child.material = shaderMaterial;
            });

            scene.add(object);
          }).catch(err => {
            console.error('Shader loading error:', err);
          });
        },
        undefined,
        error => {
          console.error('GLB loading error:', error);
        }
      );
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  });
});

function formatUniforms(uniformData, materialPath) {
  
  const formatted = {};
  const data = uniformData.uniforms || uniformData;

  for (const key in data) {
    const entry = data[key];

    // Handle texture loading based on the file extension
    if (entry.type === 'sampler2D') {
      const texturePath = `${materialPath}/${entry.value}`;
      const extension = texturePath.split('.').pop().toLowerCase();

      let texture;

      // Choose the appropriate loader based on extension
      if (['hdr', 'exr'].includes(extension)) {
        const loader = extension === 'exr' ? new THREE.EXRLoader() : new THREE.RGBELoader();
        texture = loader.load(texturePath, (loadedTexture) => {
          loadedTexture.mapping = THREE.EquirectangularReflectionMapping; // For HDR or EXR
          formatted[key] = { value: loadedTexture };
        });
        // texture = loader.load(texturePath);
        formatted[key] = { value: texture };

      } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
        const loader = new THREE.TextureLoader();
        texture = loader.load(texturePath);
        formatted[key] = { value: texture };
      } else {
        console.warn(`Unsupported texture format: ${extension}`);
      }
    } else {
      formatted[key] = { value: entry.value };
    }
  }

  return formatted;
}

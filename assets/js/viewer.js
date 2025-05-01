// viewer.js

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
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace ;
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
    
      loader.load(
        `/assets/models/${modelName}.glb`,
        async (gltf) => {
          const object = gltf.scene;
    
          try {
            // Load shader files and uniforms
            const [vertexShader, fragmentShader, uniformsJson] = await Promise.all([
              fetch(`/assets/models/materials/${materialName}/vertex.glsl`).then(r => r.text()),
              fetch(`/assets/models/materials/${materialName}/fragment.glsl`).then(r => r.text()),
              fetch(`/assets/models/materials/${materialName}/uniforms.json`).then(r => r.json())
            ]);
    
            // Format uniforms (async)
            const materialPath = `/assets/models/materials/${materialName}`;
            const uniforms = await formatUniformsAsync(uniformsJson, materialPath, renderer);
    
            const shaderMaterial = new THREE.ShaderMaterial({
              vertexShader,
              fragmentShader,
              uniforms,
              lights: false,
              side: THREE.DoubleSide
            });
    
            // Apply shader material to all meshes in the model
            object.traverse(child => {
              if (child.isMesh) child.material = shaderMaterial;
            });
    
            scene.add(object);
          } catch (err) {
            console.error('Error loading shader or uniforms:', err);
          }
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

/**
 * Async utility to format shader uniforms from a JSON definition.
 */
async function formatUniformsAsync(uniformData, materialPath, renderer) {
  const formatted = {};
  const data = uniformData.uniforms || uniformData;

  for (const key of Object.keys(data)) {
    const { type, value, wrap } = data[key]; // Destructure `wrap` if present

    if (type === 'sampler2D') {
      const texture = await loadTexture2D(`${materialPath}/${value}`);
      
      // Apply wrapping if specified
      if (wrap) {
        const wrapType = getWrapType(wrap);
        texture.wrapS = wrapType;
        texture.wrapT = wrapType;
      }

      formatted[key] = { value: texture };
    } 
    else if (type === 'samplerCube') {
      formatted[key] = { value: await loadEquirectAsCube(`${materialPath}/${value}`, renderer) };
    } 
    else {
      formatted[key] = { value }; // Pass through raw values (vec3, float, etc.)
    }
  }

  return formatted;
}

function getWrapType(wrap) {
  switch (wrap.toLowerCase()) {
    case 'repeat':
      return THREE.RepeatWrapping;
    case 'mirroredrepeat':
      return THREE.MirroredRepeatWrapping;
    case 'clamp':
    case 'clamptoedge':
      return THREE.ClampToEdgeWrapping;
    default:
      console.warn(`Unknown wrap type: ${wrap}. Defaulting to ClampToEdgeWrapping.`);
      return THREE.ClampToEdgeWrapping;
  }
}

function getFileExtension(path) {
  return path.split('.').pop().toLowerCase();
}

function loadTexture2D(path) {
  return new Promise((resolve, reject) => {
    const ext = getFileExtension(path);

    let loader;
    if (ext === 'hdr') loader = new RGBELoader();
    else if (ext === 'exr') loader = new THREE.EXRLoader();
    else loader = new THREE.TextureLoader();

    loader.load(
      path,
      (texture) => {
        // if (ext === 'hdr' || ext === 'exr') {
        //   texture.mapping = THREE.EquirectangularReflectionMapping;
        // }
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

function loadEquirectAsCube(path, renderer) {
  return new Promise((resolve, reject) => {
    const ext = getFileExtension(path);
    const loader = ext === 'exr' ? new THREE.EXRLoader() : new THREE.RGBELoader();

    loader.load(
      path,
      (texture) => {
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
          format: THREE.RGBAFormat,
          generateMipmaps: true,
          minFilter: THREE.LinearMipmapLinearFilter,
      });
        const cubeMap = cubeRenderTarget.fromEquirectangularTexture(renderer, texture).texture;
        resolve(cubeMap);
      },
      undefined,
      reject
    );
  });
}

// viewer.js

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.glb-viewer').forEach(container => {
    const id = container.dataset.id;
    const modelNames = JSON.parse(container.dataset.models || '[]');
    const materialNames = JSON.parse(container.dataset.materials || '[]');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.background = new THREE.Color('#c0c0c0');
    camera.position.z = 5;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    const gui = new dat.GUI(); // Initialize dat.GUI
    // Create a wrapper for GUI under the canvas
    const guiContainer = document.createElement('div');
    guiContainer.className = 'gui-container';
    container.appendChild(guiContainer);
    guiContainer.appendChild(gui.domElement);


    modelNames.forEach((modelName, index) => {
      const materialName = materialNames[index];
      const loader = new THREE.GLTFLoader();

      loader.load(
        `/assets/models/${modelName}.glb`,
        async (gltf) => {
          const object = gltf.scene;

          try {
            const [vertexShader, fragmentShader, uniformsJson] = await Promise.all([
              fetch(`/assets/models/materials/${materialName}/vertex.glsl`).then(r => r.text()),
              fetch(`/assets/models/materials/${materialName}/fragment.glsl`).then(r => r.text()),
              fetch(`/assets/models/materials/${materialName}/uniforms.json`).then(r => r.json())
            ]);

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

            // Add GUI controls for the material
            addMaterialGUI(gui, {name:materialName}, uniforms);
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

/**
 * Add GUI controls for a material's uniforms.
 */
function addMaterialGUI(gui, material, uniforms) {
  const folderName = `Material Properties (${material.name || 'Model ' + Math.random().toFixed(3)})`;
  const folder = gui.addFolder(folderName);
  console.log('Uniforms passed to GUI:', uniforms);
  
  for (const key in uniforms) {
    const uniform = uniforms[key];
    if (uniform.value instanceof THREE.Color) {
      // Add color picker for vec3 uniforms representing colors
      folder.addColor({ [key]: `#${uniform.value.getHexString()}` }, key)
        .onChange(value => uniform.value.set(value));
    } else if (Array.isArray(uniform.value)) {
      // Add sliders for vec3 or vec2 uniforms
      uniform.value.forEach((_, i) => {
        folder.add(uniform.value, i, 0, 1).name(`${key}[${i}]`);
      });
    } else if (typeof uniform.value === 'number') {
      // Add slider for float uniforms
      folder.add(uniform, 'value', 0, 1).name(key);
    }
  }

  folder.open();
}

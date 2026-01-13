# How to Add Your Custom 3D Model to the About Page

## Overview
The About page now displays a floating 3D object that responds to mouse movement. By default, it shows a rotating blue cube, but you can replace it with any custom `.glb` or `.gltf` model.

## Step 1: Prepare Your 3D Model

### Recommended Format: **glTF Binary (.glb)**

**Why .glb?**
- Smallest file size (binary format)
- Single file (no separate textures)
- Best supported by Three.js
- Web-optimized

### Export from Your 3D Software

**Blender:**
1. In Blender, prepare your model
2. `File` → `Export` → `glTF Binary (.glb)`
3. In export options:
   - ✓ Include Animations (if you have any)
   - ✓ Include All Bone Influences
   - Choose quality settings

**Other 3D Software:**
- **Maya**: Install glTF exporter plugin
- **3DS Max**: Use Babylon.js exporter
- **Cinema 4D**: Use Babylon.js exporter
- **ZBrush**: Export to OBJ, then convert to glTF

### Optimize Your Model
- Keep geometry under 100k triangles for best performance
- Bake lighting if possible (reduces file size)
- Use texture atlasing
- Target file size: < 5MB (ideally < 2MB)

## Step 2: Add Model to Your Project

1. **Place the file** in the assets folder:
   ```
   docs/.vitepress/images/models/your-model.glb
   ```

2. **Create the folder** if it doesn't exist:
   ```bash
   mkdir -p docs/.vitepress/images/models
   ```

## Step 3: Update AboutPage.vue

Edit the `setupScene` function in your AboutPage component:

```typescript
const setupScene = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) => {
  camera.position.z = 5;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Load your custom model
  const loader = new GLTFLoader();
  loader.load(
    "/.vitepress/images/models/your-model.glb", // Update path to your model
    (gltf) => {
      const model = gltf.scene;
      
      // Scale and position as needed
      model.scale.set(1, 1, 1); // Adjust scale
      model.position.set(0, 0, 0); // Adjust position
      
      scene.add(model);
      (window as any)._aboutPageMesh = model;
    },
    (progress) => {
      console.log(
        "Model loading:",
        (progress.loaded / progress.total) * 100 + "%"
      );
    },
    (error) => {
      console.error("Error loading model:", error);
      // Fallback to cube if model fails to load
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshPhongMaterial({ color: 0x0033ff });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      (window as any)._aboutPageMesh = cube;
    }
  );

  // Renderer setup
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  // Animation loop with mouse interactivity
  const animate = () => {
    requestAnimationFrame(animate);

    const mesh = (window as any)._aboutPageMesh;
    if (mesh) {
      // Smooth mouse-based rotation
      rotationX.value += (mouseY.value * 2 - rotationX.value) * 0.05;
      rotationY.value += (mouseX.value * 2 - rotationY.value) * 0.05;

      mesh.rotation.x = rotationX.value;
      mesh.rotation.y = rotationY.value;

      // Auto-rotate if no mouse movement
      if (Math.abs(mouseX.value) < 0.01 && Math.abs(mouseY.value) < 0.01) {
        mesh.rotation.x += 0.003;
        mesh.rotation.y += 0.005;
      }
    }

    renderer.render(scene, camera);
  };

  animate();
};
```

## Step 4: Adjust Model Properties

### Scale the Model
In the `loader.load()` callback:
```typescript
model.scale.set(2, 2, 2); // Make it 2x bigger (default is 1)
```

### Reposition the Model
```typescript
model.position.set(0, -0.5, 0); // Move down by 0.5 units
```

### Change Lighting for Better Effect
```typescript
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increase intensity
directionalLight.position.set(10, 10, 10); // Adjust angle
```

## Step 5: Adjust Container Position

If your model is too large or small in the viewport, edit the CSS in `AboutPage.vue`:

```css
.three-d-container {
  position: fixed;
  bottom: -200px;    /* Adjust vertical position */
  right: -150px;     /* Adjust horizontal position */
  width: 600px;      /* Change container size */
  height: 600px;
  z-index: 1;
}
```

## Troubleshooting

### Model doesn't appear
1. Check browser console for errors (F12)
2. Verify file path is correct
3. Check file size (shouldn't exceed 5MB)
4. Ensure model is in `.glb` or `.gltf` format

### Model is too small/large
- Use `model.scale.set(x, y, z)` to resize
- Adjust camera position with `camera.position.z`

### Model rotates too fast/slow
- Edit the rotation speed in the animation loop:
  ```typescript
  mesh.rotation.x += 0.01; // Increase/decrease this value
  mesh.rotation.y += 0.015;
  ```

### Model doesn't respond to mouse
- Ensure mouse listener is active
- Check that `mouseX.value` and `mouseY.value` are updating

## Tips

- **Animated models**: glTF supports animations; they'll play automatically
- **Multiple objects**: Load multiple models into the same scene
- **Performance**: Use Blender's "Simplify" modifier to reduce polygon count
- **Color scheme**: Add emissive materials to models that glow with your theme colors

---

For more info, see:
- [Three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [Blender glTF Export](https://docs.blender.org/manual/en/latest/addons/io_scene_gltf2/export.html)

<script setup lang="ts">
import NavBar from "./NavBar.vue";
import ThreeScene from "./ThreeScene.vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { onUnmounted } from "vue";

// Scene setup function - called by ThreeScene component
const setupScene = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) => {
  camera.position.set(0, 0, 3);
  camera.up.set(0, 0, 1); // rotate around Z axis
  camera.lookAt(0, 0, 0);

  // OrbitControls: free rotation + bounded zoom, no pan
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = true;
  controls.rotateSpeed = 0.5;
  // Lock polar angle to keep orbit constrained to Z axis (up is Z now)
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.screenSpacePanning = false;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 2; // prevent zooming inside the object
  controls.maxDistance = 4.5; // keep object at least ~70% viewport size
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-10, -10, -10);
  scene.add(directionalLight2);

  // Model
  const loader = new GLTFLoader();
  loader.load(
    "/.vitepress/images/models/stone-bark.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      // Center pivot so auto-rotation spins around the object's own center
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center); // shift so center is at origin
      controls.target.set(0, 0, 0); // rotate around origin
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;
      controls.update();

      scene.add(model);
      (window as any)._homePageMesh = model;
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      (window as any)._homePageMesh = sphere;
    },
  );

  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.domElement.style.pointerEvents = "auto";

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
  (window as any)._homePageControls = controls;
};

onUnmounted(() => {
  if ((window as any)._homePageControls) {
    (window as any)._homePageControls.dispose();
  }
});
</script>

<template>
  <NavBar />
  <div class="home-page-container">
    <!-- 3D Object Container (centered) -->
    <div class="three-d-container">
      <ThreeScene :setupScene="setupScene" height="100%" />
    </div>

    <!-- Text Overlay (optional) -->
    <div class="text-overlay">
      <h1 class="title">Drag; Scroll; Discover Projects;</h1>
    </div>
  </div>
</template>

<style scoped>
.home-page-container {
  background-color: var(--theme-bg, #1a1a1a);
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

/* Background gradient effect */
.home-page-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 50px rgba(191, 216, 125, 0.3);
  z-index: -1;
  filter: blur(60px);
}

html:not(.dark) .home-page-container::before {
  box-shadow: inset 0 0 100px 50px rgba(0, 51, 255, 0.2) !important;
}

/* 3D Object Container - centered */
.three-d-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: auto;
}

/* Text Overlay */
.text-overlay {
  position: relative;
  z-index: 2;
  text-align: center;
  pointer-events: none;
  bottom: 50px;
}

.title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
  margin: 0;
  font-family: "IBM Plex Sans", sans-serif;
}

html:not(.dark) .title {
  color: rgba(0, 0, 0, 0.5);
}

/* Dark mode adjustments */
:global(.dark) .home-page-container {
  background-color: #1a1a1a;
}
</style>

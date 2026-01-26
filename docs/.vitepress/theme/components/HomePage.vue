<script setup lang="ts">
import { useRoute } from "vitepress";
import { computed, ref, onMounted } from "vue";
import NavBar from "./NavBar.vue";
import ThreeScene from "./ThreeScene.vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const route = useRoute();
const mouseX = ref(0);
const mouseY = ref(0);
const rotationX = ref(0);
const rotationY = ref(0);

// Mouse tracking for interactivity
const handleMouseMove = (event: MouseEvent) => {
  mouseX.value = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY.value = -(event.clientY / window.innerHeight) * 2 + 1;
};

// Scene setup function - called by ThreeScene component
const setupScene = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) => {
  camera.position.z = 3;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  // Load the 3D model
  const loader = new GLTFLoader();
  loader.load(
    "/.vitepress/images/models/stone-bark.glb",
    (gltf) => {
      const model = gltf.scene;

      // Scale and position as needed
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      scene.add(model);
      (window as any)._homePageMesh = model;
    },
    (progress) => {
      console.log(
        "Model loading:",
        (progress.loaded / progress.total) * 100 + "%",
      );
    },
    (error) => {
      console.error("Error loading model:", error);
      // Fallback to sphere if model fails to load
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      (window as any)._homePageMesh = sphere;
    },
  );

  // Renderer setup
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  // Animation loop with mouse interactivity
  const animate = () => {
    requestAnimationFrame(animate);

    const mesh = (window as any)._homePageMesh;
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

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <NavBar />
  <div class="home-page-container" @mousemove="handleMouseMove">
    <!-- 3D Object Container (centered) -->
    <div class="three-d-container">
      <ThreeScene :setupScene="setupScene" height="100%" />
    </div>

    <!-- Text Overlay (optional) -->
    <div class="text-overlay">
      <h1 class="title">Move your mouse to explore</h1>
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

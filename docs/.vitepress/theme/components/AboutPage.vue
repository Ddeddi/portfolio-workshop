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
    "/.vitepress/images/models/rotating-stone.glb", // Update path to your model
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

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <NavBar />
  <div class="about-page-container" @mousemove="handleMouseMove">
    <!-- 3D Object Container (positioned right/bottom, partially out of frame) -->
    <div class="three-d-container">
      <ThreeScene :setupScene="setupScene" height="100%" />
    </div>

    <!-- Text Content (centered) -->
    <div class="content-wrapper">
      <div class="text-content">
        <h1 class="about-title">About Me</h1>

        <p class="about-intro">
          I'm a creative technologist exploring the intersections of digital
          design, interactive art, and immersive experiences.
        </p>

        <div class="about-sections">
          <section class="section">
            <h2>Philosophy</h2>
            <p>
              I believe in the power of technology to enhance human creativity
              and connection. My work focuses on creating experiences that are
              both visually stunning and emotionally resonant.
            </p>
          </section>

          <section class="section">
            <h2>Expertise</h2>
            <p>
              Specialized in web development, 3D graphics, interactive
              installations, and creative coding. I use tools like Three.js,
              VitePress, and custom web technologies to bring ideas to life.
            </p>
          </section>

          <section class="section">
            <h2>Vision</h2>
            <p>
              To create digital experiences that push boundaries and inspire
              audiences. Each project is an opportunity to explore new
              possibilities at the intersection of art and technology.
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-page-container {
  background-color: var(--theme-bg, #ffffff);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

/* Background frame effect (green/blue gradient) */
.about-page-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 50px rgba(191, 216, 125, 0.6);
  z-index: -1;
  filter: blur(40px);
}

html:not(.dark) .about-page-container::before {
  box-shadow: inset 0 0 100px 50px rgba(0, 51, 255, 0.6) !important;
}

/* 3D Object Container - positioned right/bottom, partially out of frame */
.three-d-container {
  position: fixed;
  bottom: -200px;
  right: -150px;
  width: 600px;
  height: 600px;
  z-index: 1;
  pointer-events: auto;
  opacity: 0.9;
}

@media (max-width: 1024px) {
  .three-d-container {
    width: 400px;
    height: 400px;
    bottom: -100px;
    right: -100px;
  }
}

@media (max-width: 640px) {
  .three-d-container {
    width: 300px;
    height: 300px;
    bottom: -50px;
    right: -50px;
  }
}

/* Text Content - centered */
.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  margin-left: 0;
}

.text-content {
  color: var(--theme-text, #1a1a1a);
  text-align: center;
}

.about-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--theme-text, #1a1a1a);
  letter-spacing: -0.02em;
}

.about-intro {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--theme-text-muted, #666666);
  margin-bottom: 2rem;
  font-weight: 400;
}

.about-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;
}

.section {
  margin-bottom: 1.5rem;
}

.section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text, #1a1a1a);
  margin-bottom: 0.75rem;
}

.section p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--theme-text-muted, #666666);
}

/* Dark mode adjustments */
:global(.dark) .about-page-container {
  background-color: #2f2e2e;
}

:global(.dark) .text-content {
  color: var(--theme-text, #e0e0e0);
}

:global(.dark) .about-title {
  color: var(--theme-text, #e0e0e0);
}

:global(.dark) .about-intro {
  color: var(--theme-text-muted, #999999);
}

:global(.dark) .section h2 {
  color: var(--theme-text, #e0e0e0);
}

:global(.dark) .section p {
  color: var(--theme-text-muted, #999999);
}
</style>

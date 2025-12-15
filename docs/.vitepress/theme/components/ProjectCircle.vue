<template>
  <div
    ref="containerRef"
    class="relative w-full h-[500px] md:h-[600px] lg:h-[650px] flex items-center justify-center select-none touch-none overflow-hidden"
    @wheel="handleWheel"
    @mousedown="handlePointerDown"
    @touchstart="handlePointerDown"
  >
    <!-- Main Circle Container -->
    <div
      class="relative w-full h-full flex items-center justify-center transition-transform"
      :style="{ 
        transform: `rotate(${currentRotation}deg)`,
        willChange: 'transform'
      }"
    >
      <!-- Center visual marker -->
      <div class="absolute w-3 h-3 rounded-full bg-stone-400/30 shadow-inner"></div>

      <!-- Project Names in Circle -->
      <div
        v-for="(project, index) in projects"
        :key="project.slug"
        class="absolute"
        :style="getProjectStyle(index)"
        @mouseenter="handleProjectHover(project, $event)"
        @mousemove="handleProjectHover(project, $event)"
        @mouseleave="handleProjectLeave"
      >
        <a
          :href="project.href"
          class="project-name block transition-all duration-300 font-medium"
          :class="{
            'text-stone-500 hover:text-stone-950': true,
            'project-hovered': hoveredProject === project.slug,
          }"
          :style="getTextStyle(index)"
        >
          {{ project.title }}
        </a>
      </div>
    </div>

    <!-- Cursor-Following Image Preview (Desktop Only) -->
    <div
      v-if="hoveredProject && !isMobile"
      ref="previewRef"
      class="fixed pointer-events-none z-50 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20"
      :style="{
        left: `${previewPosition.x}px`,
        top: `${previewPosition.y}px`,
        transform: `translate(-50%, -50%) scale(${previewOpacity})`,
        opacity: previewOpacity,
        width: '320px',
        height: '220px',
        transition: 'opacity 0.2s ease-out',
      }"
    >
      <img
        v-if="hoveredProjectData?.image"
        :src="hoveredProjectData.image"
        :alt="hoveredProjectData.title"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-stone-300 flex items-center justify-center text-stone-600"
      >
        No Preview
      </div>
    </div>

    <!-- Subtle hint animation overlay (only on mount) -->
    <div
      v-if="showHint"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <div class="text-stone-400 text-xs md:text-sm opacity-60 animate-pulse tracking-wide">
        Scroll or drag to explore
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

type Project = {
  slug: string;
  title: string;
  href: string;
  image: string | null;
};

const props = defineProps<{
  projects: Project[];
}>();

// State
const containerRef = ref<HTMLElement | null>(null);
const previewRef = ref<HTMLElement | null>(null);
const currentRotation = ref(0);
const targetRotation = ref(0);
const rotationVelocity = ref(0);
const isDragging = ref(false);
const lastPointerY = ref(0);
const hoveredProject = ref<string | null>(null);
const previewPosition = ref({ x: 0, y: 0 });
const targetPreviewPosition = ref({ x: 0, y: 0 });
const previewOpacity = ref(0);
const showHint = ref(true);
const isMobile = ref(false);

// Check for reduced motion preference
const prefersReducedMotion = ref(false);

// Computed
const hoveredProjectData = computed(() => {
  if (!hoveredProject.value) return null;
  return props.projects.find((p) => p.slug === hoveredProject.value);
});

// Circle layout calculations
const radius = computed(() => {
  if (typeof window === 'undefined') return 220;
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  // More responsive radius based on screen size
  if (window.innerWidth < 768) return minDimension * 0.32;
  return minDimension * 0.38;
});

function getProjectStyle(index: number) {
  const angle = (index / props.projects.length) * 2 * Math.PI - Math.PI / 2;
  const x = Math.cos(angle) * radius.value;
  const y = Math.sin(angle) * radius.value;

  // Add slight randomness to radius for uneven edge
  const titleLength = props.projects[index].title.length;
  const radiusOffset = Math.min(titleLength * 2, 40);

  return {
    left: '50%',
    top: '50%',
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + radiusOffset}px))`,
  };
}

function getTextStyle(index: number) {
  const angle = (index / props.projects.length) * 360;
  const baseRotation = -currentRotation.value;

  // Add slight text warping/deformation
  const warp = Math.sin(index * 0.5) * 3;

  // Responsive font sizing
  const baseFontSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 1.0 : 1.3;
  const fontSize = baseFontSize + Math.abs(Math.sin(index * 0.3)) * 0.5;

  return {
    transform: `rotate(${angle + baseRotation + warp}deg)`,
    fontSize: `${fontSize}rem`,
    fontWeight: 500 + Math.floor(Math.abs(Math.cos(index * 0.7)) * 200),
    letterSpacing: '0.02em',
  };
}

// Rotation handlers
function handleWheel(e: WheelEvent) {
  if (prefersReducedMotion.value) return;
  e.preventDefault();

  const delta = e.deltaY * 0.2;
  targetRotation.value += delta;
  rotationVelocity.value = delta * 0.5;
}

function handlePointerDown(e: MouseEvent | TouchEvent) {
  if (prefersReducedMotion.value) return;

  isDragging.value = true;
  showHint.value = false;

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  lastPointerY.value = clientY;

  document.addEventListener('mousemove', handlePointerMove);
  document.addEventListener('touchmove', handlePointerMove);
  document.addEventListener('mouseup', handlePointerUp);
  document.addEventListener('touchend', handlePointerUp);
}

function handlePointerMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const deltaY = clientY - lastPointerY.value;

  targetRotation.value += deltaY * 0.5;
  rotationVelocity.value = deltaY * 0.3;
  lastPointerY.value = clientY;
}

function handlePointerUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handlePointerMove);
  document.removeEventListener('touchmove', handlePointerMove);
  document.removeEventListener('mouseup', handlePointerUp);
  document.removeEventListener('touchend', handlePointerUp);
}

// Hover handlers
function handleProjectHover(project: Project, e: MouseEvent) {
  if (isMobile.value) return;

  hoveredProject.value = project.slug;
  targetPreviewPosition.value = { x: e.clientX, y: e.clientY };
  previewOpacity.value = 1;
}

function handleProjectLeave() {
  hoveredProject.value = null;
  previewOpacity.value = 0;
}

// Animation loop with smooth interpolation
let animationFrameId: number;

function animate() {
  // Smooth rotation with inertia
  const rotationDiff = targetRotation.value - currentRotation.value;
  currentRotation.value += rotationDiff * 0.08; // Easing factor

  // Apply velocity decay
  if (!isDragging.value && Math.abs(rotationVelocity.value) > 0.1) {
    targetRotation.value += rotationVelocity.value;
    rotationVelocity.value *= 0.92; // Friction
  } else if (!isDragging.value) {
    rotationVelocity.value = 0;
  }

  // Smooth preview position (magnetic follow)
  const previewDiffX = targetPreviewPosition.value.x - previewPosition.value.x;
  const previewDiffY = targetPreviewPosition.value.y - previewPosition.value.y;
  previewPosition.value.x += previewDiffX * 0.15; // Magnetic easing
  previewPosition.value.y += previewDiffY * 0.15;

  animationFrameId = requestAnimationFrame(animate);
}

// Initial nudge animation
function initialNudge() {
  if (prefersReducedMotion.value) return;

  // Gentle rotation hint
  targetRotation.value = 12;
  setTimeout(() => {
    targetRotation.value = -8;
  }, 600);
  
  setTimeout(() => {
    targetRotation.value = 0;
  }, 1200);

  setTimeout(() => {
    showHint.value = false;
  }, 3500);
}

// Lifecycle
onMounted(() => {
  // Check for reduced motion preference
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;

    // Check if mobile
    isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window;

    // Preload all images
    props.projects.forEach((project) => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });

    // Start animation loop
    animate();

    // Initial nudge
    if (!prefersReducedMotion.value) {
      setTimeout(initialNudge, 500);
    }
  }
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // Clean up event listeners
  document.removeEventListener('mousemove', handlePointerMove);
  document.removeEventListener('touchmove', handlePointerMove);
  document.removeEventListener('mouseup', handlePointerUp);
  document.removeEventListener('touchend', handlePointerUp);
});
</script>

<style scoped>
.project-name {
  cursor: pointer;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0);
  transition: text-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  filter: blur(0px);
}

.project-name:hover {
  transform: scale(1.05);
}

.project-hovered {
  color: #0c0a09 !important;
  text-shadow: 
    0 0 30px rgba(120, 113, 108, 0.5),
    0 0 60px rgba(168, 162, 158, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
  font-weight: 700 !important;
}

/* Prevent text selection during drag */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Smooth transitions */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Hide scrollbar for container */
div::-webkit-scrollbar {
  display: none;
}

div {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

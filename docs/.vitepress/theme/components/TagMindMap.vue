<template>
  <div class="mindmap-container">
    <div class="mindmap-header">
      <h2 class="mindmap-title">Explore by Tags</h2>
      <p class="mindmap-subtitle">Hover over tags to see related projects</p>
    </div>
    <div ref="canvasContainer" class="canvas-wrapper">
      <canvas ref="canvas"></canvas>
      <div
        v-for="node in nodes"
        :key="node.id"
        :class="[
          'node',
          node.type,
          { active: hoveredTag === node.id, hovered: node.id === hoveredNode },
        ]"
        :style="{
          left: node.x + 'px',
          top: node.y + 'px',
          transform: `translate(-50%, -50%) scale(${node.scale})`,
        }"
        @mouseenter="handleNodeHover(node)"
        @mouseleave="handleNodeLeave"
        @click="handleNodeClick(node)"
      >
        <div class="node-dot"></div>
        <div v-if="node.id === hoveredNode" class="node-tooltip">
          {{ node.label }}
          <span v-if="node.type === 'tag'" class="tooltip-count"
            >({{ node.projects?.length }})</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { withBase, useRouter } from "vitepress";
import gsap from "gsap";

type NodeType = "tag" | "project";

interface Node {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  projects?: string[]; // For tag nodes
  route?: string; // For project nodes
  tags?: string[]; // For project nodes
  connectedTo?: string[]; // IDs of connected nodes
}

interface Work {
  slug: string;
  title: string;
  tags: string[];
  route: string;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const nodes = ref<Node[]>([]);
const hoveredTag = ref<string | null>(null);
const hoveredNode = ref<string | null>(null);
const router = useRouter();

let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let width = 0;
let height = 0;

// Parse markdown files to extract works and tags
const markdownFiles = import.meta.glob("../../../works/**/index.md", {
  as: "raw",
  eager: true,
});

const works: Work[] = [];
const tagMap = new Map<string, string[]>(); // tag -> [project slugs]

for (const path in markdownFiles) {
  const raw = markdownFiles[path] as string;
  const match = path.match(/works\/([^/]+)\/index\.md$/);
  const slug = match?.[1] ?? "";

  // Extract frontmatter
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/title:\s*(.+)/);
    const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]+)\]/);

    const title = titleMatch?.[1] || "Untitled";
    const tags = tagsMatch ? tagsMatch[1].split(",").map((t) => t.trim()) : [];

    works.push({
      slug,
      title,
      tags,
      route: `/works/${slug}/`,
    });

    // Build tag map
    tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, []);
      }
      tagMap.get(tag)!.push(slug);
    });
  }
}

// Initialize nodes
function initializeNodes() {
  const newNodes: Node[] = [];
  const centerX = width / 2;
  const centerY = height / 2;

  // Create tag nodes (larger, central)
  const tagArray = Array.from(tagMap.entries());
  const tagRadius = Math.min(width, height) * 0.25;

  tagArray.forEach(([tag, projectSlugs], i) => {
    const angle = (i / tagArray.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * tagRadius;
    const y = centerY + Math.sin(angle) * tagRadius;

    newNodes.push({
      id: `tag-${tag}`,
      label: tag,
      type: "tag",
      x,
      y,
      vx: 0,
      vy: 0,
      scale: 1,
      projects: projectSlugs,
      connectedTo: projectSlugs.map((slug) => `project-${slug}`),
    });
  });

  // Create project nodes (smaller, orbiting tags)
  works.forEach((work) => {
    // Position near related tags
    const relatedTags = work.tags.map((t) => `tag-${t}`);
    const relatedNodes = newNodes.filter((n) => relatedTags.includes(n.id));

    let x = centerX;
    let y = centerY;

    if (relatedNodes.length > 0) {
      x =
        relatedNodes.reduce((sum, n) => sum + n.x, 0) / relatedNodes.length +
        (Math.random() - 0.5) * 100;
      y =
        relatedNodes.reduce((sum, n) => sum + n.y, 0) / relatedNodes.length +
        (Math.random() - 0.5) * 100;
    }

    newNodes.push({
      id: `project-${work.slug}`,
      label: work.title,
      type: "project",
      x,
      y,
      vx: 0,
      vy: 0,
      scale: 1,
      route: work.route,
      tags: work.tags,
      connectedTo: work.tags.map((t) => `tag-${t}`),
    });
  });

  nodes.value = newNodes;
}

// Physics simulation - subtle movement
function updatePhysics() {
  const damping = 0.92;

  nodes.value.forEach((node) => {
    // Apply velocity
    node.x += node.vx;
    node.y += node.vy;

    // Strong damping - movement dies out quickly
    node.vx *= damping;
    node.vy *= damping;

    // Stop very small movements
    if (Math.abs(node.vx) < 0.01) node.vx = 0;
    if (Math.abs(node.vy) < 0.01) node.vy = 0;
  });
}

// Draw connections
function drawConnections() {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  const activeConnections = new Set<string>();

  if (hoveredTag.value) {
    const hoveredNode = nodes.value.find((n) => n.id === hoveredTag.value);
    if (hoveredNode?.connectedTo) {
      hoveredNode.connectedTo.forEach((id) => {
        activeConnections.add(`${hoveredTag.value}-${id}`);
        activeConnections.add(`${id}-${hoveredTag.value}`);
      });
    }
  }

  nodes.value.forEach((node) => {
    if (!node.connectedTo) return;

    node.connectedTo.forEach((connectedId) => {
      const connected = nodes.value.find((n) => n.id === connectedId);
      if (!connected) return;

      const isActive =
        activeConnections.has(`${node.id}-${connectedId}`) ||
        activeConnections.has(`${connectedId}-${node.id}`);

      ctx!.beginPath();
      ctx!.moveTo(node.x, node.y);
      ctx!.lineTo(connected.x, connected.y);
      ctx!.strokeStyle = isActive
        ? "rgba(0, 51, 255, 0.6)"
        : "rgba(255, 255, 255, 0.1)";
      ctx!.lineWidth = isActive ? 2 : 1;
      ctx!.stroke();
    });
  });
}

// Animation loop
function animate() {
  updatePhysics();
  drawConnections();
  animationId = requestAnimationFrame(animate);
}

function handleNodeHover(node: Node) {
  hoveredNode.value = node.id;

  if (node.type === "tag") {
    hoveredTag.value = node.id;

    // Subtle highlight for connected projects
    nodes.value.forEach((n) => {
      if (node.connectedTo?.includes(n.id)) {
        gsap.to(n, { scale: 1.05, duration: 0.3 });
      } else if (n.type === "project") {
        gsap.to(n, { scale: 0.95, duration: 0.3 });
      }
    });

    gsap.to(node, { scale: 1.1, duration: 0.3 });
  } else {
    gsap.to(node, { scale: 1.05, duration: 0.3 });
  }
}

function handleNodeLeave() {
  hoveredTag.value = null;
  hoveredNode.value = null;

  nodes.value.forEach((n) => {
    gsap.to(n, { scale: 1, duration: 0.3 });
  });
}

function handleNodeClick(node: Node) {
  if (node.type === "project" && node.route) {
    router.go(withBase(node.route));
  }
}

function resizeCanvas() {
  if (!canvas.value || !canvasContainer.value) return;

  width = canvasContainer.value.clientWidth;
  height = canvasContainer.value.clientHeight;

  canvas.value.width = width;
  canvas.value.height = height;

  if (nodes.value.length === 0) {
    initializeNodes();
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d");
  }

  resizeCanvas();
  animate();

  window.addEventListener("resize", resizeCanvas);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  padding: 4rem 2rem;
  background: linear-gradient(
    135deg,
    rgba(0, 51, 255, 0.02) 0%,
    transparent 50%,
    rgba(191, 216, 125, 0.03) 100%
  );
  position: relative;
  overflow: hidden;
}

.mindmap-header {
  text-align: center;
  margin-bottom: 3rem;
}

.mindmap-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0033ff;
  margin: 0 0 0.5rem;
  font-family: "garamond-atf-text", serif;
  letter-spacing: -0.02em;
}

.mindmap-subtitle {
  color: var(--theme-text-muted, #888);
  font-size: 1rem;
  margin: 0;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.node {
  position: absolute;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.node.tag {
  z-index: 20;
}

.node.hovered {
  z-index: 30;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.node.tag .node-dot {
  background: #0033ff;
  width: 16px;
  height: 16px;
}

.node.project .node-dot {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(0, 51, 255, 0.3);
  cursor: pointer;
}

.node.project:hover .node-dot {
  background: rgba(0, 51, 255, 0.2);
  border-color: #0033ff;
  border-width: 3px;
}

.node:hover .node-dot {
  box-shadow: 0 4px 16px rgba(0, 51, 255, 0.5);
}

.node.tag:hover .node-dot {
  background: #3355ff;
}

.node.project.active .node-dot {
  background: rgba(0, 51, 255, 0.3);
  border-color: #0033ff;
  border-width: 3px;
}

.node-tooltip {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.2s ease;
}

.node-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .mindmap-container {
    padding: 2rem 1rem;
  }

  .canvas-wrapper {
    height: 500px;
  }

  .mindmap-title {
    font-size: 2rem;
  }

  .node-dot {
    width: 10px;
    height: 10px;
  }

  .node.tag .node-dot {
    width: 14px;
    height: 14px;
  }

  .node-tooltip {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>

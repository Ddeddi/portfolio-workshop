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
        :class="['node', node.type, { active: hoveredTag === node.id }]"
        :style="{
          left: node.x + 'px',
          top: node.y + 'px',
          transform: `translate(-50%, -50%) scale(${node.scale})`,
        }"
        @mouseenter="handleNodeHover(node)"
        @mouseleave="handleNodeLeave"
        @click="handleNodeClick(node)"
      >
        <div class="node-content">
          <span class="node-label">{{ node.label }}</span>
          <span v-if="node.type === 'tag'" class="node-count">{{
            node.projects?.length
          }}</span>
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
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
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
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      scale: 0.8,
      route: work.route,
      tags: work.tags,
      connectedTo: work.tags.map((t) => `tag-${t}`),
    });
  });

  nodes.value = newNodes;
}

// Physics simulation
function updatePhysics() {
  const damping = 0.95;
  const springStrength = 0.01;
  const repulsionStrength = 50000;
  const centerStrength = 0.001;

  nodes.value.forEach((node) => {
    // Apply velocity
    node.x += node.vx;
    node.y += node.vy;

    // Damping
    node.vx *= damping;
    node.vy *= damping;

    // Center attraction
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = centerX - node.x;
    const dy = centerY - node.y;
    node.vx += dx * centerStrength;
    node.vy += dy * centerStrength;

    // Boundary collision
    const margin = 50;
    if (node.x < margin) {
      node.x = margin;
      node.vx *= -0.5;
    }
    if (node.x > width - margin) {
      node.x = width - margin;
      node.vx *= -0.5;
    }
    if (node.y < margin) {
      node.y = margin;
      node.vy *= -0.5;
    }
    if (node.y > height - margin) {
      node.y = height - margin;
      node.vy *= -0.5;
    }

    // Repulsion from other nodes
    nodes.value.forEach((other) => {
      if (node.id === other.id) return;

      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 200) {
        const force = repulsionStrength / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }
    });

    // Spring attraction to connected nodes
    if (node.connectedTo) {
      node.connectedTo.forEach((connectedId) => {
        const connected = nodes.value.find((n) => n.id === connectedId);
        if (connected) {
          const dx = connected.x - node.x;
          const dy = connected.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const targetDist = node.type === "tag" ? 150 : 120;

          if (dist > 0) {
            const force = (dist - targetDist) * springStrength;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }
      });
    }
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
  if (node.type === "tag") {
    hoveredTag.value = node.id;

    // Highlight connected projects
    nodes.value.forEach((n) => {
      if (node.connectedTo?.includes(n.id)) {
        gsap.to(n, { scale: 1, duration: 0.3 });
      } else if (n.type === "project") {
        gsap.to(n, { scale: 0.6, duration: 0.3 });
      }
    });

    gsap.to(node, { scale: 1.2, duration: 0.3 });
  }
}

function handleNodeLeave() {
  hoveredTag.value = null;

  nodes.value.forEach((n) => {
    gsap.to(n, { scale: n.type === "tag" ? 1 : 0.8, duration: 0.3 });
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

.node-content {
  position: relative;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.node.tag .node-content {
  background: #0033ff;
  border: 2px solid #0033ff;
  padding: 1rem 1.5rem;
}

.node.project .node-content {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 51, 255, 0.2);
}

.node:hover .node-content {
  box-shadow: 0 6px 20px rgba(0, 51, 255, 0.3);
  transform: scale(1.05);
}

.node.tag:hover .node-content {
  background: #3355ff;
  border-color: #3355ff;
}

.node.project.active .node-content {
  background: rgba(0, 51, 255, 0.1);
  border-color: #0033ff;
  border-width: 2px;
}

.node-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.node.tag .node-label {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  text-transform: lowercase;
}

.node.project .node-label {
  color: #333;
  font-size: 0.85rem;
}

.node-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  min-width: 1.5rem;
  text-align: center;
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

  .node-content {
    padding: 0.6rem 1rem;
  }

  .node.tag .node-content {
    padding: 0.8rem 1.2rem;
  }

  .node-label {
    font-size: 0.8rem;
  }

  .node.tag .node-label {
    font-size: 0.9rem;
  }
}
</style>

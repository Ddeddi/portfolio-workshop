<script setup lang="ts">
import { withBase, useRoute } from "vitepress";
import { computed, ref } from "vue";
import NavBar from "./NavBar.vue";
import TagMindMap from "./TagMindMap.vue";

type Project = {
  slug: string;
  title: string;
  year: string;
  status: string;
  collaborators: string;
  tags: string[];
  description: string;
  route: string;
  coverImage?: string;
};

const route = useRoute();

const markdownFiles = import.meta.glob("../../../works/**/index.md", {
  as: "raw",
  eager: true,
});

const projects = ref<Project[]>([]);

function parseFrontmatter(raw: string) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const fmText = fmMatch[1];
  const data: Record<string, any> = {};

  fmText.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/['"]/g, ""));
    }

    data[key] = value;
  });

  return data;
}

for (const path in markdownFiles) {
  const raw = markdownFiles[path] as string;
  const frontmatter = parseFrontmatter(raw);
  const lines = raw.split("\n");

  const titleLine = lines.find((line) => line.startsWith("# "));
  const match = path.match(/works\/([^/]+)\/index\.md$/);
  const slug = match?.[1] ?? "";
  const routePath = `/works/${slug}/`;

  projects.value.push({
    slug,
    title: frontmatter.title || titleLine?.replace(/^# /, "") || "Untitled",
    year: frontmatter.year || "????",
    status: frontmatter.status || "archived",
    collaborators: frontmatter.collaborators || frontmatter.with || "",
    tags: Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : frontmatter.tags
        ? [frontmatter.tags]
        : [],
    description: frontmatter.description || "An experimental project.",
    route: routePath,
    coverImage: `/works/${slug}/cover.jpg`,
  });
}

projects.value.sort((a, b) => b.year.localeCompare(a.year));

const currentProjectSlug = computed(() => {
  const match = route.path.match(/\/works\/([^/]+)\/?$/);
  if (match?.[1]) return match[1];
  return projects.value[0]?.slug ?? null; // fallback to most recent
});

const currentProject = computed(() => {
  const slug = currentProjectSlug.value;
  if (!slug) return null;
  return (
    projects.value.find((p) => p.slug === slug) ?? projects.value[0] ?? null
  );
});

const isWorksIndexPage = computed(() => {
  const path = route.path.replace(/\/+$/, "");
  return path === "/works" || path.endsWith("/works");
});
</script>

<template>
  <NavBar />

  <div class="three-column-layout">
    <div class="column column-left">
      <div class="column-header">
        <h2 class="column-title">Projects</h2>
        <div class="divider"></div>
      </div>

      <div class="projects-grid">
        <div
          v-for="project in projects"
          :key="project.slug"
          class="project-thumbnail"
          :class="{ active: project.slug === currentProjectSlug }"
        >
          <a :href="withBase(project.route)" class="thumbnail-link">
            <div class="thumbnail-image-wrapper">
              <img
                :src="withBase(project.coverImage)"
                :alt="project.title"
                class="thumbnail-image"
              />
              <div class="thumbnail-overlay">
                <span class="thumbnail-link-text">View →</span>
              </div>
            </div>

            <div class="thumbnail-content">
              <h3 class="thumbnail-title">{{ project.title }}</h3>
              <p class="thumbnail-year">{{ project.year }}</p>
              <p class="thumbnail-description">{{ project.description }}</p>
            </div>
          </a>
        </div>
      </div>
    </div>

    <div class="column column-center">
      <!-- Tag Mind Map Section - Only on /works/ index -->
      <div v-if="isWorksIndexPage" class="mindmap-section">
        <TagMindMap />
      </div>

      <div v-if="currentProject" class="project-detail">
        <div class="detail-header">
          <h1 class="detail-title">
            {{ currentProject.title }}<span class="cursor-blink">_</span>
          </h1>
          <div class="divider"></div>
        </div>

        <div class="detail-metadata">
          <div class="metadata-row">
            <span class="metadata-label">Year:</span>
            <span class="metadata-value">{{ currentProject.year }}</span>
          </div>
          <div class="metadata-row">
            <span class="metadata-label">Status:</span>
            <span class="metadata-value metadata-status">{{
              currentProject.status
            }}</span>
          </div>
          <div v-if="currentProject.collaborators" class="metadata-row">
            <span class="metadata-label">With:</span>
            <span class="metadata-value">{{
              currentProject.collaborators
            }}</span>
          </div>
          <div v-if="currentProject.tags.length" class="metadata-row">
            <span class="metadata-label">Tags:</span>
            <div class="tags-list">
              <a
                v-for="tag in currentProject.tags"
                :key="tag"
                :href="withBase('/works/')"
                class="tag"
              >
                {{ tag }}
              </a>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="documentation-area">
          <Content class="project-markdown" />
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Select a project to view details</p>
      </div>
    </div>

    <div class="column column-right">
      <div class="info-panel">
        <div class="panel-section">
          <h3 class="panel-title">About This Project</h3>
          <div class="divider small"></div>
          <p v-if="currentProject" class="panel-text">
            {{ currentProject.description }}
          </p>
          <p v-else class="panel-text muted">
            Browse projects on the left to explore details.
          </p>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Navigation</h3>
          <div class="divider small"></div>
          <a href="/about/" class="nav-link">← Back to about</a>
          <a href="//" class="nav-link">← Back to home</a>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Project Index</h3>
          <div class="divider small"></div>
          <div class="quick-index">
            <a
              v-for="p in projects"
              :key="p.slug"
              :href="withBase(p.route)"
              class="index-item"
              :class="{ active: p.slug === currentProjectSlug }"
            >
              <span class="index-year">{{ p.year }}</span>
              <span class="index-title">{{ p.title }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.three-column-layout {
  display: grid;
  grid-template-columns: 0.5fr 2.5fr 0.5fr;
  gap: 2rem;
  min-height: 100vh;
  background-color: #2a2a2a;
  color: #d5d5d5;
  font-family: "garamond-atf-text", serif;
  padding: 3rem 2rem;
  position: relative;
}

.three-column-layout::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(80, 80, 80, 0.08) 0px,
      rgba(80, 80, 80, 0.08) 1px,
      transparent 1px,
      transparent 60px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(80, 80, 80, 0.08) 0px,
      rgba(80, 80, 80, 0.08) 1px,
      transparent 1px,
      transparent 60px
    );
  pointer-events: none;
  z-index: 0;
}

.column {
  position: relative;
  z-index: 1;
}

.column-left {
  overflow-y: auto;
  max-height: 100vh;
  padding-right: 1rem;
}

.column-center {
  border-left: 1px solid #444;
  border-right: 1px solid #444;
  padding: 0 2rem;
  max-height: 100vh;
  overflow-y: auto;
}

.mindmap-section {
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid #444;
}

.mindmap-section :deep(.mindmap-container) {
  padding: 2rem 0;
  background: transparent;
}

.mindmap-section :deep(.mindmap-title) {
  color: #e8e8e8;
  font-size: 1.8rem;
}

.mindmap-section :deep(.mindmap-subtitle) {
  color: #999;
}

.mindmap-section :deep(.canvas-wrapper) {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
}

.column-right {
  border-left: 1px solid #444;
  padding-left: 2rem;
  max-height: 100vh;
  overflow-y: auto;
}

.column-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #e8e8e8;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
}

.divider {
  height: 1px;
  background-color: #444;
  margin: 1rem 0;
}

.divider.small {
  margin: 0.75rem 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.project-thumbnail {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 2px;
}

.project-thumbnail:hover,
.project-thumbnail.active {
  border-color: #666;
  background-color: rgba(100, 100, 100, 0.1);
}

.project-thumbnail.active {
  border-color: #888;
  background-color: rgba(100, 100, 100, 0.15);
}

.thumbnail-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.thumbnail-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background-color: #1a1a1a;
  margin-bottom: 0.75rem;
  border: 1px solid #444;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-link-text {
  color: #e0e0e0;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.thumbnail-content {
  padding: 0.5rem;
}

.thumbnail-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e8e8e8;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.thumbnail-year {
  font-size: 0.8rem;
  color: #888;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.thumbnail-description {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-detail {
  padding: 1rem 0;
}

.detail-header {
  margin-bottom: 2rem;
}

.detail-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0033ff;
  margin: 0 0 1rem 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.cursor-blink {
  animation: blink 1.2s infinite;
  color: #0033ff;
}

@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

.detail-metadata {
  margin-bottom: 1.5rem;
}

.metadata-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.metadata-label {
  color: #888;
  font-weight: 500;
  min-width: 5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.metadata-value {
  color: #c5c5c5;
}

.metadata-status {
  padding: 0.25rem 0.5rem;
  background-color: rgba(100, 100, 100, 0.2);
  border: 1px solid #666;
  font-size: 0.8rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #1a1a1a;
  border: 1px solid #555;
  font-size: 0.8rem;
  color: #aaa;
  display: inline-block;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag:hover {
  background-color: #333;
  border-color: #777;
  color: #e0e0e0;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  font-style: italic;
}

.documentation-area {
  margin-top: 2rem;
}

.project-markdown {
  color: #c5c5c5;
  font-size: 0.95rem;
  line-height: 1.7;
}

.project-markdown :deep(h1),
.project-markdown :deep(h2),
.project-markdown :deep(h3),
.project-markdown :deep(h4) {
  color: #e8e8e8;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
}

.project-markdown :deep(h1) {
  font-size: 1.75rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.75rem;
}

.project-markdown :deep(h2) {
  font-size: 1.35rem;
}

.project-markdown :deep(h3) {
  font-size: 1.1rem;
}

.project-markdown :deep(h4) {
  font-size: 1rem;
}

.project-markdown :deep(p) {
  margin-bottom: 1rem;
}

.project-markdown :deep(a) {
  color: #0033ff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.project-markdown :deep(a:hover) {
  color: #3355ff;
  text-decoration: underline;
}

.project-markdown :deep(img) {
  width: 100%;
  height: auto;
  object-fit: contain;
  margin: 2rem 0;
  border: 1px solid #444;
  display: block;
}

.project-markdown :deep(code) {
  background-color: #1a1a1a;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-size: 0.9em;
  color: #aaa;
  font-family: "Courier New", monospace;
}

.project-markdown :deep(pre) {
  background-color: #1a1a1a;
  padding: 1rem;
  border: 1px solid #444;
  border-radius: 2px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.project-markdown :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #aaa;
}

.project-markdown :deep(ul),
.project-markdown :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.project-markdown :deep(li) {
  margin-bottom: 0.5rem;
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.panel-section {
  padding-bottom: 1rem;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #e8e8e8;
  margin: 0;
}

.panel-text {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
  margin: 1rem 0 0 0;
}

.panel-text.muted {
  color: #777;
  font-style: italic;
}

.nav-link {
  display: inline-block;
  color: #0033ff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.nav-link:hover {
  color: #0033ff;
  border-bottom-color: #0033ff;
}

.quick-index {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.index-item {
  display: flex;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
  margin-left: -0.75rem;
}

.index-item:hover {
  border-left-color: #0033ff;
  color: #0033ff;
  background-color: rgba(0, 51, 255, 0.08);
}

.index-item.active {
  border-left-color: #888;
  color: #e8e8e8;
  background-color: rgba(100, 100, 100, 0.1);
}

.index-year {
  color: #666;
  min-width: 2.5rem;
  font-weight: 500;
}

.index-title {
  color: inherit;
  flex: 1;
}

.column-left::-webkit-scrollbar,
.column-center::-webkit-scrollbar,
.column-right::-webkit-scrollbar {
  width: 6px;
}

.column-left::-webkit-scrollbar-track,
.column-center::-webkit-scrollbar-track,
.column-right::-webkit-scrollbar-track {
  background: transparent;
}

.column-left::-webkit-scrollbar-thumb,
.column-center::-webkit-scrollbar-thumb,
.column-right::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 3px;
}

.column-left::-webkit-scrollbar-thumb:hover,
.column-center::-webkit-scrollbar-thumb:hover,
.column-right::-webkit-scrollbar-thumb:hover {
  background: #666;
}

@media (max-width: 1200px) {
  .three-column-layout {
    grid-template-columns: 0.8fr 1.5fr 0.8fr;
    gap: 1.5rem;
    padding: 2rem 1.5rem;
  }

  .column-center {
    padding: 0 1.5rem;
  }

  .column-right {
    padding-left: 1.5rem;
  }
}

@media (max-width: 920px) {
  .three-column-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .column-left,
  .column-center,
  .column-right {
    max-height: none;
    overflow-y: visible;
    padding: 0;
    border: none;
  }

  .column-right {
    padding-left: 0;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .thumbnail-image-wrapper {
    aspect-ratio: auto;
    height: 200px;
  }

  .detail-title {
    font-size: 1.5rem;
  }

  .project-markdown :deep(h1) {
    font-size: 1.35rem;
  }

  .project-markdown :deep(h2) {
    font-size: 1.15rem;
  }
}

@media (max-width: 640px) {
  .three-column-layout {
    padding: 1.5rem 1rem;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .thumbnail-image-wrapper {
    height: 150px;
  }

  .thumbnail-title {
    font-size: 0.85rem;
  }

  .thumbnail-description {
    font-size: 0.7rem;
  }

  .detail-title {
    font-size: 1.25rem;
  }

  .metadata-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .project-markdown {
    font-size: 0.9rem;
  }
}
</style>

<script setup lang="ts">
import { withBase, useRoute } from "vitepress";
import { ref, computed } from "vue";
import NavBar from "./NavBar.vue";

const route = useRoute();

type Project = {
  slug: string;
  title: string;
  year: string;
  status: string;
  collaborators: string;
  tags: string[];
  description: string;
  route: string;
};

// Raw markdown text for parsing frontmatter and content
const markdownFiles = import.meta.glob("../../../works/**/index.md", {
  as: "raw",
  eager: true,
});

const projects = ref<Project[]>([]);

// Simple frontmatter parser
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

    // Handle arrays (tags)
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

  const route = `/works/?id=${slug}`;

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
    route,
  });
}

// Sort by year (most recent first)
projects.value.sort((a, b) => b.year.localeCompare(a.year));

// Check if viewing a specific project
const currentProjectId = computed(() => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
});

// Get current project data and markdown content
const currentProject = computed(() => {
  const id = currentProjectId.value;
  if (!id) return null;

  const project = projects.value.find((p) => p.slug === id);
  if (!project) return null;

  // Find the raw markdown content by matching the slug
  let raw: string | null = null;
  for (const path in markdownFiles) {
    if (path.includes(`works/${id}/index.md`)) {
      raw = markdownFiles[path as keyof typeof markdownFiles] as string;
      break;
    }
  }

  if (!raw) return null;

  // Remove frontmatter and extract content
  const content = raw.replace(/^---\n[\s\S]*?\n---\n/, "");

  return {
    ...project,
    content,
  };
});
</script>

<template>
  <NavBar />

  <!-- Individual Project View -->
  <div v-if="currentProject" class="archive-container">
    <div class="project-detail">
      <a :href="withBase('/works/')" class="back-link"> ← Back to projects </a>

      <header class="project-detail-header">
        <h1 class="project-detail-title">{{ currentProject.title }}</h1>
        <div class="project-detail-meta">
          <span class="project-year">{{ currentProject.year }}</span>
          <span class="project-separator">•</span>
          <span class="project-status">{{ currentProject.status }}</span>
          <span v-if="currentProject.collaborators" class="project-with">
            with {{ currentProject.collaborators }}
          </span>
        </div>
        <div class="project-detail-tags">
          <span
            v-for="tag in currentProject.tags"
            :key="tag"
            class="project-tag"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <div class="project-content" v-html="currentProject.content"></div>
    </div>
  </div>

  <!-- Project List View -->
  <div v-else class="archive-container">
    <!-- Header -->
    <header class="project-header">
      <h1 class="archive-title">
        /projects<span class="cursor-blink">_</span>
      </h1>
      <p class="archive-manifesto">
        A living archive of experiments, collaborations, and unfinished
        thoughts.
      </p>
    </header>

    <!-- Project List -->
    <div class="project-list">
      <div
        v-for="project in projects"
        :key="project.slug"
        class="project-entry"
      >
        <div class="project-line">
          <span class="project-year">{{ project.year }}</span>
          <span class="project-separator">→</span>
          <a :href="withBase(project.route)" class="project-title">
            {{ project.title }}
          </a>
          <span class="project-status">[{{ project.status }}]</span>
          <span v-if="project.collaborators" class="project-with">
            with: {{ project.collaborators }}
          </span>
        </div>

        <div class="project-meta">
          <span v-for="tag in project.tags" :key="tag" class="project-tag">
            {{ tag }}
          </span>
        </div>

        <div class="project-description">
          {{ project.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.archive-container {
  min-height: 100vh;
  color: #e0e0e0;
  padding: 3rem 2rem;
  font-family: "garamond-atf-text", serif;
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;
}

.archive-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 80px 50px rgba(0, 51, 255, 0.6);
  z-index: 0;
  filter: blur(40px);
}

/* Header */
.project-header {
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333;
}

.archive-title {
  font-size: 2rem;
  font-weight: 700;
  color: #bfd87d;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  font-family: "garamond-atf-text", serif;
}

.cursor-blink {
  animation: blink 1.2s infinite;
  color: #bfd87d;
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

.archive-manifesto {
  font-size: 0.95rem;
  color: #888;
  margin: 0;
  font-style: italic;
}

/* Project List */
.project-list {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-entry {
  padding: 0.75rem 1rem;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.project-entry:hover {
  background-color: rgba(191, 216, 125, 0.05);
  border-left-color: #bfd87d;
  padding-left: 1.5rem;
}

.project-line {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.project-year {
  color: #666;
  font-weight: 500;
  min-width: 3rem;
}

.project-separator {
  color: #333;
}

.project-title {
  color: #bfd87d;
  font-family: "garamond-atf-text", serif;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.project-title:hover {
  color: #d0e89e;
  text-decoration: underline;
}

.project-status {
  color: #888;
  font-size: 0.85rem;
}

.project-with {
  color: #999;
  font-size: 0.9rem;
  font-style: italic;
}

/* Meta & Tags */
.project-meta {
  display: flex;
  gap: 0.5rem;
  margin: 0.25rem 0 0.25rem 4.5rem;
  flex-wrap: wrap;
}

.project-tag {
  color: #666;
  font-size: 0.8rem;
  padding: 0.1rem 0.5rem;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.project-entry:hover .project-tag {
  border-color: #bfd87d;
  color: #bfd87d;
}

/* Description (hidden by default) */
.project-description {
  margin: 0.5rem 0 0 4.5rem;
  color: #aaa;
  font-size: 0.9rem;
  font-style: italic;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
}

.project-entry:hover .project-description {
  max-height: 100px;
  opacity: 1;
  margin-top: 0.75rem;
}

/* Individual Project View */
.project-detail {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #bfd87d;
}

.project-detail-header {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333;
}

.project-detail-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #bfd87d;
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  font-family: "garamond-atf-text", serif;
  line-height: 1.2;
}

.project-detail-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  color: #888;
}

.project-detail-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.project-content {
  color: #ccc;
  line-height: 1.8;
  font-size: 1rem;
}

.project-content :deep(h1),
.project-content :deep(h2),
.project-content :deep(h3),
.project-content :deep(h4) {
  color: #ddd;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.project-content :deep(h1) {
  font-size: 2rem;
}

.project-content :deep(h2) {
  font-size: 1.5rem;
}

.project-content :deep(h3) {
  font-size: 1.25rem;
}

.project-content :deep(p) {
  margin-bottom: 1rem;
}

.project-content :deep(a) {
  color: #bfd87d;
  text-decoration: none;
}

.project-content :deep(a:hover) {
  text-decoration: underline;
}

.project-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 2rem 0;
  border-radius: 4px;
}

.project-content :deep(code) {
  background: #1a1a1a;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
  color: #aaa;
}

.project-content :deep(pre) {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.project-content :deep(pre code) {
  background: none;
  padding: 0;
}

.project-content :deep(ul),
.project-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.project-content :deep(li) {
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .archive-container {
    padding: 2rem 1rem;
  }

  .archive-title {
    font-size: 1.5rem;
  }

  .project-line {
    flex-direction: column;
    gap: 0.25rem;
  }

  .project-meta,
  .project-description {
    margin-left: 0;
  }

  .project-entry:hover {
    padding-left: 1rem;
  }

  .project-detail-title {
    font-size: 1.75rem;
  }

  .project-detail-meta {
    font-size: 0.85rem;
  }
}
</style>

<script setup lang="ts">
import { withBase } from "vitepress";
import { ref } from "vue";
import NavBar from "./NavBar.vue";

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
</script>

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
  box-shadow: inset 0 0 100px 50px rgba(191, 216, 125, 0.6);
  z-index: 0;
  filter: blur(40px);
}

/* Header */
.archive-header {
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #333;
}

.archive-title {
  font-size: 2rem;
  font-weight: 700;
  color: #0033ff;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  font-family: "garamond-atf-text", serif;
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
  background-color: rgba(0, 51, 255, 0.05);
  border-left-color: #0033ff;
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
  color: #0033ff;
  font-family: "garamond-atf-text", serif;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.project-title:hover {
  color: #3355ff;
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
  border-color: #0033ff;
  color: #0033ff;
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
}
</style>

<template>
  <NavBar />
  <div class="archive-container">
    <!-- Header -->
    <header class="archive-header">
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

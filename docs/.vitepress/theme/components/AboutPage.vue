<script setup lang="ts">
import { useRoute } from "vitepress";
import { computed } from "vue";
import NavBar from "./NavBar.vue";

const route = useRoute();
const currentPath = computed(() => route.path.replace(/\/$/, ""));

// Sidebar custom navigation links
const links = [
  { title: "Vitepress", path: "https://vitepress.dev/guide/what-is-vitepress" },
  { title: "Tailwind CSS", path: "https://tailwindcss.com/" },
];
</script>

<template>
  <NavBar />
  <div class="about-page-container">
    <div
      class="flex flex-col lg:flex-row min-h-[80vh] border border-stone-800 rounded overflow-hidden"
    >
      <!-- Sidebar -->
      <aside class="about-sidebar">
        <h2 class="sidebar-title">References</h2>
        <ul class="sidebar-links">
          <li v-for="link in links" :key="link.path">
            <a
              :href="link.path"
              class="sidebar-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="link-arrow">→</span> {{ link.title }}
            </a>
          </li>
        </ul>
      </aside>

      <!-- Markdown Content -->
      <section class="about-content">
        <Content class="prose prose-base md:prose-lg max-w-none break-words" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-page-container {
  background-color: var(--theme-bg, #2f2e2e);
  min-height: 100vh;
  padding: 2rem;
  font-family: "garamond-atf-text", serif;
  position: relative;
  transition: background-color 0.3s ease;
}

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

:global(html:not(.dark)) .about-page-container::before {
  box-shadow: inset 0 0 100px 50px rgba(0, 51, 255, 0.6);
}

.about-sidebar {
  width: 100%;
  background: var(--theme-bg, #2f2e2e);
  filter: brightness(0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

@media (min-width: 1024px) {
  .about-sidebar {
    width: 25%;
  }
}

.sidebar-title {
  font-size: 0.85rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sidebar-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: #888;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.sidebar-link:hover {
  color: #0033ff;
  background: rgba(0, 51, 255, 0.05);
}

.link-arrow {
  color: #333;
  transition: color 0.2s ease;
  font-size: 0.85rem;
}

.sidebar-link:hover .link-arrow {
  color: #0033ff;
  transform: translateX(2px);
}

.about-content {
  background: var(--theme-bg, #2f2e2e);
  filter: brightness(0.95);
  width: 100%;
  padding: 2rem;
  overflow: auto;
  color: var(--theme-text, #ffffff);
  transition: all 0.3s ease;
}

@media (min-width: 1024px) {
  .about-content {
    width: 75%;
  }
}

.about-content :deep(.prose) {
  color: var(--theme-text-muted, #ccc);
}

.about-content :deep(.prose h1),
.about-content :deep(.prose h2),
.about-content :deep(.prose h3) {
  color: var(--theme-text, #ddd);
  font-family: "petala-pro", sans-serif;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.about-content :deep(.prose a) {
  color: #0033ff;
  text-decoration: none;
}

.about-content :deep(.prose a:hover) {
  text-decoration: underline;
}

.about-content :deep(.prose code) {
  color: #aaa;
  background: var(--theme-bg, #2f2e2e);
  filter: brightness(0.85);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}
</style>

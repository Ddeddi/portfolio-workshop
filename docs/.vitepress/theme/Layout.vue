<script setup lang="ts">
import { useData, useRoute } from "vitepress";
import NavBar from "./components/NavBar.vue";
import WorkPage from "./components/WorkPage.vue";
import WorkStack from "./components/WorkStack.vue";
import AboutPage from "./components/AboutPage.vue";
import HeroSection from "./home-page-components/hero-section/HeroSection.vue";
import { computed, onMounted } from "vue";

const { frontmatter, site } = useData();
const route = useRoute();

// Initialize dark mode early
onMounted(() => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }
});

// Remove base from the path so matching works in dev & GitHub Pages
const normalizedPath = computed(() => {
  const base = site.value.base || "/";
  // ensure leading slash and strip any base prefix
  return route.path.replace(base, "/") || "/";
});

const currentPageComponent = computed(() => {
  if (frontmatter.value.layout === "home") return WorkStack;

  // Only use WorkPage for the works root list; let markdown render for /works/{slug}/
  const path = normalizedPath.value.replace(/\/+$/, "/");
  if (path === "/works/") return WorkPage;

  if (normalizedPath.value.startsWith("/about")) return AboutPage;
  return null;
});
</script>

<template>
  <!-- <HeroSection/> -->
  <div class="layout-wrapper">
    <!-- Only show NavBar for default content pages, components handle their own -->
    <NavBar v-if="!currentPageComponent" />

    <main v-if="!currentPageComponent" class="default-content">
      <Content class="prose prose-base md:prose-lg max-w-none" />
    </main>

    <component v-else :is="currentPageComponent" :key="route.path" />
  </div>
</template>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  background-color: var(--theme-bg, #2f2e2e);
  color: var(--theme-text, #ffffff);
  font-family: "garamond-atf-text", serif;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative;
}

.layout-wrapper::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 50px rgba(191, 216, 125, 0.77);
  z-index: 0;
  filter: blur(40px);
}

.default-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  position: relative;
  z-index: 1;
}

.default-content :deep(.prose) {
  color: #aaa;
  background: var(--theme-bg, #2f2e2e);
  filter: brightness(0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 2rem;
  line-height: 1.6;
}

.default-content :deep(.prose h1) {
  font-size: 1.5rem;
  font-weight: 900;
  color: #0033ff;
  margin: 0 0 0.5rem;
  font-family: "garamond-atf-text", serif;
  letter-spacing: -0.02em;
}

.default-content :deep(.prose h2) {
  font-size: 1rem;
  color: var(--theme-text-muted, #888);
  margin: 0 0 1.25rem;
  font-weight: 400;
}

.default-content :deep(.prose h3),
.default-content :deep(.prose h4),
.default-content :deep(.prose h5),
.default-content :deep(.prose h6) {
  color: #0033ff;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.default-content :deep(.prose p) {
  color: var(--theme-text-muted, #aaa);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.default-content :deep(.prose a) {
  color: #0033ff;
  text-decoration: none;
  transition: all 0.2s ease;
}

.default-content :deep(.prose a:hover) {
  color: #3355ff;
  text-decoration: underline;
}

.default-content :deep(.prose code) {
  color: #aaa;
  background: #1a1a1a;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}

.default-content :deep(.prose img) {
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.default-content :deep(.prose ul),
.default-content :deep(.prose ol) {
  color: var(--theme-text-muted, #aaa);
}

.default-content :deep(.prose strong) {
  color: #ddd;
}

.default-content :deep(.prose blockquote) {
  border-left-color: #0033ff;
  color: var(--theme-text-muted, #888);
}

@media (max-width: 768px) {
  .default-content {
    padding: 2rem 1rem;
  }

  .default-content :deep(.prose) {
    padding: 1.5rem;
  }
}
</style>

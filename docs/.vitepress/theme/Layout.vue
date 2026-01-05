<script setup lang="ts">
import { useData, useRoute } from "vitepress";
import NavBar from "./components/NavBar.vue";
import WorkPage from "./components/WorkPage.vue";
import WorkStack from "./components/WorkStack.vue";
import AboutPage from "./components/AboutPage.vue";
import HeroSection from "./home-page-components/hero-section/HeroSection.vue";
import { computed } from "vue";

const { frontmatter, site } = useData();
const route = useRoute();

// Remove base from the path so matching works in dev & GitHub Pages
const normalizedPath = computed(() => {
  const base = site.value.base || "/";
  // ensure leading slash and strip any base prefix
  return route.path.replace(base, "/") || "/";
});

const currentPageComponent = computed(() => {
  if (frontmatter.value.layout === "home") return WorkStack;
  if (normalizedPath.value.startsWith("/works/")) return WorkPage;
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
}

.default-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.default-content :deep(.prose) {
  color: #ccc;
}

.default-content :deep(.prose h1),
.default-content :deep(.prose h2),
.default-content :deep(.prose h3) {
  color: #ddd;
}

.default-content :deep(.prose a) {
  color: #0033ff;
  text-decoration: none;
}

.default-content :deep(.prose a:hover) {
  text-decoration: underline;
}

.default-content :deep(.prose code) {
  color: #aaa;
  background: #1a1a1a;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
}
</style>

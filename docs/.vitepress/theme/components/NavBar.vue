<script setup lang="ts">
import { useData, withBase, useRoute } from "vitepress";
import { computed, ref, onMounted } from "vue";

const { theme } = useData();
const route = useRoute();
const nav = theme.value.nav || [];

const isActive = (link: string) => {
  const currentPath = route.path.replace(/\/$/, "");
  const navPath = link.replace(/\/$/, "");
  return (
    currentPath === navPath ||
    (navPath !== "" && currentPath.startsWith(navPath))
  );
};

// Theme toggle
const isDark = ref(true);

const setTheme = (dark: boolean) => {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    setTheme(false);
  } else {
    setTheme(true);
  }
});
</script>

<template>
  <header class="archive-header">
    <nav class="archive-nav">
      <!-- Repository-style breadcrumb -->
      <div class="archive-breadcrumb">
        <span class="archive-repo-name">~/archive</span>
        <span class="archive-separator">/</span>
        <span class="archive-ref">main</span>

        <!-- Theme toggle -->
        <div class="theme-toggle">
          <button
            @click="setTheme(false)"
            class="theme-square theme-square-light"
            :class="{ 'theme-square-active': !isDark }"
            aria-label="Light mode"
            title="Light mode"
          ></button>
          <button
            @click="setTheme(true)"
            class="theme-square theme-square-dark"
            :class="{ 'theme-square-active': isDark }"
            aria-label="Dark mode"
            title="Dark mode"
          ></button>
        </div>
      </div>

      <!-- Navigation links -->
      <ul class="archive-nav-links">
        <li v-for="item in nav" :key="item.link">
          <a
            :href="withBase(item.link)"
            class="archive-link"
            :class="{ 'archive-link-active': isActive(item.link) }"
          >
            <span class="link-bracket">[</span>{{ item.text
            }}<span class="link-bracket">]</span>
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.archive-header {
  background-color: var(--theme-bg, #2f2e2e);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: "garamond-atf-text", serif;
  font-weight: 400;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  transition: background-color 0.3s ease;
}

.archive-nav {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.archive-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.archive-repo-name {
  color: #666;
  font-family: monospace;
  font-size: 0.85rem;
}

.archive-separator {
  color: #454444ff;
}

.archive-ref {
  color: #555;
  font-family: monospace;
  font-size: 0.85rem;
  padding: 0.1rem 0.4rem;
  background: #1a1a1a;
  border-radius: 3px;
}

.archive-nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.archive-link {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  color: #888;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  transition: all 0.2s ease;
  border-radius: 2px;
  position: relative;
}

.archive-link:hover {
  color: #0033ff;
  background: rgba(0, 51, 255, 0.05);
}

.archive-link-active {
  color: #0033ff;
}

.archive-link-active .link-bracket {
  color: #0033ff;
}

.link-bracket {
  color: #333;
  transition: color 0.2s ease;
  font-weight: 300;
}

.archive-link:hover .link-bracket {
  color: #0033ff;
}

@media (max-width: 768px) {
  .archive-nav {
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .archive-breadcrumb {
    font-size: 0.8rem;
  }

  .archive-nav-links {
    gap: 0.5rem;
  }

  .archive-link {
    font-size: 0.9rem;
    padding: 0.3rem 0.7rem;
  }
}

/* Theme toggle */
.theme-toggle {
  display: flex;
  gap: 0.35rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid #333;
}

.theme-square {
  width: 18px;
  height: 18px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 2px;
}

.theme-square-light {
  background-color: #ffffffff;
}

.theme-square-dark {
  background-color: #2f2e2e;
}

.theme-square:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.theme-square-active {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.theme-square-active:hover {
  transform: scale(1.15);
}
</style>

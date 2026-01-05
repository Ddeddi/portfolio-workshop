<template>
  <NavBar />
  <div class="workstack-container">
    <Carousel :slides="slides" autoplay :interval="5000" loop />

    <div class="workstack-grid">
      <div v-for="card in cards" :key="card.slug" class="work-card">
        <h2 class="work-title">
          {{ card.title }}
        </h2>
        <h3 class="work-author">{{ card.name }}</h3>

        <p class="work-excerpt">{{ card.excerpt }}</p>

        <a :href="withBase(card.route)" class="work-link"
          >View more <span class="arrow">→</span></a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { withBase } from "vitepress";
import Carousel from "./Carousel.vue";
import NavBar from "./NavBar.vue";

type Card = {
  slug: string;
  title: string;
  name: string;
  excerpt: string;
  route: string;
  image: string | null;
};

const markdownFiles = import.meta.glob("../../../works/**/index.md", {
  as: "raw",
  eager: true,
});
const imageFiles = import.meta.glob(
  "../../../works/**/cover.{jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  }
);

const cards = ref<Card[]>([]);

for (const path in markdownFiles) {
  const raw = markdownFiles[path] as string;
  const lines = raw.split("\n");

  const titleLine = lines.find((line) => line.startsWith("# "));
  const nameLine = lines.find((line) => line.startsWith("## "));
  const excerptLine = lines.find(
    (line) => line.trim() && !line.startsWith("#")
  );

  const match = path.match(/works\/([^/]+)\/index\.md$/);
  const slug = match?.[1] ?? "";

  const route = `/works/?id=${slug}`;

  const folder = path.replace(/\/index\.md$/, "/");
  const imageKey = Object.keys(imageFiles).find((k) => k.startsWith(folder));

  cards.value.push({
    slug,
    title: titleLine?.replace(/^# /, "") || "Untitled",
    name: nameLine?.replace(/^## /, "") || "Anonymous",
    excerpt: excerptLine || "",
    route,
    image: imageKey ? (imageFiles[imageKey] as string) : null,
  });
}

// Create slides for Carousel
const slides = cards.value.map((card) => ({
  image: card.image,
  title: card.title,
  href: withBase(card.route),
}));
</script>

<style scoped>
.workstack-container {
  background-color: var(--theme-bg, #2f2e2e);
  min-height: 100vh;
  padding: 3rem 2rem;
  font-family: "garamond-atf-text", serif;
  position: relative;
  transition: background-color 0.3s ease;
}

.workstack-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 50px rgba(188, 235, 60, 0.77);
  z-index: 0;
  filter: blur(40px);
}

.workstack-grid {
  max-width: 1200px;
  margin: 3rem auto 0;
  display: grid;
  gap: 1.5rem;
}

.work-card {
  background: var(--theme-bg, #2f2e2e);
  filter: brightness(0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 2rem;
  transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.work-card:hover {
  background: rgba(0, 51, 255, 0.03);
  border-color: #0033ff;
  transform: translateY(-2px);
}

.work-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--theme-text, #e0e0e0);
  margin: 0 0 0.5rem;
  font-family: "petala-pro", sans-serif;
  letter-spacing: -0.02em;
}

.work-author {
  font-size: 1rem;
  color: var(--theme-text-muted, #888);
  margin: 0 0 1.25rem;
  font-weight: 400;
}

.work-excerpt {
  color: var(--theme-text-muted, #aaa);
  margin: 0 0 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.work-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0033ff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.work-link:hover {
  color: #3355ff;
}

.work-link .arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.work-link:hover .arrow {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .workstack-container {
    padding: 2rem 1rem;
  }

  .work-card {
    padding: 1.5rem;
  }
}
</style>

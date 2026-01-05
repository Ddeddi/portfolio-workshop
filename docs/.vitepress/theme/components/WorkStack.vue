<template>
  <div class="w-full max-w-6xl mx-auto p-6">
    <ProjectCircle :projects="circleProjects" />

    <div class="mt-10 space-y-8">
      <div
        v-for="card in cards"
        :key="card.slug"
        class="w-full rounded-xl border border-gray-300 bg-white shadow-sm p-6"
      >
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">
          {{ card.title }}
        </h2>
        <h3 class="text-md font-medium text-gray-600 mb-4">{{ card.name }}</h3>

        <p class="text-gray-700 mb-4">{{ card.excerpt }}</p>

        <a
          :href="withBase(card.route)"
          class="text-blue-600 hover:underline text-sm font-medium"
          >View more →</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { withBase } from "vitepress";
import ProjectCircle from "./ProjectCircle.vue";

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

// Create projects for ProjectCircle
const circleProjects = cards.value.map((card) => ({
  slug: card.slug,
  title: card.title,
  href: withBase(card.route),
  image: card.image,
}));
</script>

<style scoped></style>


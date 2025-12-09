// WorkStack.vue
<template>
  <div class="w-full max-w-6xl mx-auto p-6">
    <Carousel :slides="slides" autoplay :interval="5000" loop />

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
import Carousel from "./Carousel.vue";

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

<style scoped></style>

// Carousel.vue
<template>
  <div
    class="relative w-full overflow-hidden rounded-2xl select-none"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <!-- Slides Wrapper -->
    <div
      class="flex transition-transform duration-700 ease-out"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="w-full flex-shrink-0 relative cursor-pointer"
        @click="slide.href && (window.location.href = slide.href)"
      >
        <img
          v-if="slide.image"
          :src="slide.image"
          :alt="slide.title"
          class="w-full h-64 sm:h-96 object-cover"
        />
        <div
          v-else
          class="w-full h-64 sm:h-96 bg-gray-300 flex items-center justify-center text-gray-700"
        >
          No Image
        </div>

        <div
          class="absolute bottom-0 left-0 w-full bg-black/30 text-white p-4 text-lg font-semibold"
        >
          {{ slide.title }}
        </div>
      </div>
    </div>

    <!-- Prev Button -->
    <button
      class="absolute top-1/2 -translate-y-1/2 left-3 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      @click.stop="prev"
    >
      ‹
    </button>

    <!-- Next Button -->
    <button
      class="absolute top-1/2 -translate-y-1/2 right-3 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
      @click.stop="next"
    >
      ›
    </button>

    <!-- Dots -->
    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        @click="goTo(i)"
        class="w-3 h-3 rounded-full"
        :class="i === currentIndex ? 'bg-white' : 'bg-white/50'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

type Slide = {
  image: string | null;
  title: string;
  href?: string;
};

const props = withDefaults(
  defineProps<{
    slides: Slide[];
    autoplay?: boolean;
    interval?: number;
    loop?: boolean;
  }>(),
  {
    autoplay: false,
    interval: 4000,
    loop: true,
  }
);

const currentIndex = ref(0);
let timer: number | null = null;

function next() {
  if (currentIndex.value < props.slides.length - 1) currentIndex.value++;
  else if (props.loop) currentIndex.value = 0;
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--;
  else if (props.loop) currentIndex.value = props.slides.length - 1;
}

function goTo(i: number) {
  currentIndex.value = i;
}

function startAuto() {
  if (!props.autoplay) return;
  if (timer) return;
  timer = window.setInterval(() => next(), props.interval);
}

function pause() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resume() {
  startAuto();
}

onMounted(startAuto);
onBeforeUnmount(pause);

watch(
  () => props.autoplay,
  (val) => {
    if (val) startAuto();
    else pause();
  }
);
</script>

<style scoped></style>

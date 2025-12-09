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
        class="w-full flex-shrink-0 relative"
        :class="{ 'cursor-pointer': slide.href }"
        @click="handleSlideClick(slide)"
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

function handleSlideClick(slide: Slide) {
  if (slide.href) {
    window.location.href = slide.href;
  }
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

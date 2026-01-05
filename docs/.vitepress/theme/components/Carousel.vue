<template>
  <div class="carousel-wrapper" @mouseenter="pause" @mouseleave="resume">
    <!-- Slides Wrapper -->
    <div
      class="carousel-slides"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="carousel-slide"
        :class="{ 'cursor-pointer': slide.href }"
        @click="handleSlideClick(slide)"
      >
        <img
          v-if="slide.image"
          :src="slide.image"
          :alt="slide.title"
          class="slide-image"
        />
        <div v-else class="slide-placeholder">No Image Available</div>

        <div class="slide-caption">
          {{ slide.title }}
        </div>
      </div>
    </div>

    <!-- Prev Button -->
    <button class="carousel-btn carousel-btn-prev" @click.stop="prev">‹</button>

    <!-- Next Button -->
    <button class="carousel-btn carousel-btn-next" @click.stop="next">›</button>

    <!-- Dots -->
    <div class="carousel-dots">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        @click="goTo(i)"
        class="carousel-dot"
        :class="i === currentIndex ? 'carousel-dot-active' : ''"
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

<style scoped>
.carousel-wrapper {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 4px;
  user-select: none;
  border: 1px solid #222;
  background: #111;
}

.carousel-slides {
  display: flex;
  transition: transform 0.7s ease-out;
}

.carousel-slide {
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

.slide-image {
  width: 100%;
  height: 24rem;
  object-fit: cover;
  display: block;
}

@media (min-width: 640px) {
  .slide-image {
    height: 32rem;
  }
}

.slide-placeholder {
  width: 100%;
  height: 24rem;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-family: "garamond-atf-text", serif;
  font-size: 0.95rem;
}

@media (min-width: 640px) {
  .slide-placeholder {
    height: 32rem;
  }
}

.slide-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: #ddd;
  padding: 2rem 1.5rem 1rem;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: "garamond-atf-text", serif;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #ddd;
  padding: 0.75rem 1rem;
  border: 1px solid #333;
  border-radius: 3px;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "garamond-atf-text", serif;
}

.carousel-btn:hover {
  background: #0033ff;
  border-color: #0033ff;
  color: #fff;
}

.carousel-btn-prev {
  left: 1rem;
}

.carousel-btn-next {
  right: 1rem;
}

.carousel-dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.carousel-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-dot:hover {
  background: rgba(0, 51, 255, 0.6);
  border-color: #0033ff;
}

.carousel-dot-active {
  background: #0033ff;
  border-color: #0033ff;
}
</style>

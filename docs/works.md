
<script setup>
import { useData } from 'vitepress'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import Hero from './.vitepress/theme/1. hero-section/HeroSection.vue'

import FrameworksSection from './.vitepress/theme/3. frameworks-section/FrameworksSection.vue'

import ProposalStack from './.vitepress/theme/components/ProposalStack.vue'

const { isDark } = useData()

onMounted(() => {
  document.documentElement.classList.add('dark')
})

onBeforeUnmount(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>
<div class="VPHome">


  <ProposalStack/>


</div>

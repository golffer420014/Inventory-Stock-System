<script setup lang="ts">
// #import
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

// #store
const themeStore = useThemeStore()

// #onMounted
onMounted(() => {
  themeStore.init()
})
</script>

<template>
  <RouterView />
</template>

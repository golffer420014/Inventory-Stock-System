<script setup lang="ts">
// #import
import { LoaderCircle } from '@lucide/vue'

// #props
withDefaults(defineProps<{ size?: number }>(), {
  size: 16,
})
</script>

<template>
  <LoaderCircle class="spinner" :size="size" :stroke-width="2.5" aria-hidden="true" />
</template>

<style scoped>
.spinner {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<script setup lang="ts">
// #props
withDefaults(defineProps<{ title?: string }>(), {
  title: '',
})
</script>

<template>
  <div class="card">
    <h2 v-if="title" class="card__title">{{ title }}</h2>
    <slot />
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--paper-border);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  box-shadow:
    inset 0 1px 0 var(--edge-highlight),
    0 10px 20px -12px var(--shadow-color),
    0 2px 4px rgba(43, 29, 14, 0.08);
  padding: 22px;
}

.card__title {
  margin: 0 0 14px;
  color: var(--ink);
  font-size: 1rem;
  font-weight: 800;
}
</style>

<script setup lang="ts">
// #props
withDefaults(defineProps<{ title?: string; interactive?: boolean }>(), {
  title: '',
  interactive: false,
})
</script>

<template>
  <div class="card" :class="{ 'card--interactive': interactive }">
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
  opacity: 0;
  animation: fade-in-up 360ms var(--ease-out) forwards;
  animation-delay: var(--card-delay, 0ms);
  transition: transform 180ms var(--ease-out), box-shadow 180ms var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    animation-duration: 1ms;
  }
}

.card--interactive {
  cursor: pointer;
}

@media (hover: hover) and (pointer: fine) {
  .card--interactive:hover {
    transform: translateY(-3px);
    box-shadow:
      inset 0 1px 0 var(--edge-highlight),
      0 16px 28px -12px var(--shadow-color),
      0 2px 4px rgba(43, 29, 14, 0.1);
  }
}

.card--interactive:active {
  transform: translateY(-1px) scale(0.99);
}

.card__title {
  margin: 0 0 14px;
  color: var(--ink);
  font-size: 1rem;
  font-weight: 800;
}
</style>

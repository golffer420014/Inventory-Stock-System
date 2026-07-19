<script setup lang="ts">
// #import
import { computed } from 'vue'

// #props
const props = withDefaults(
  defineProps<{
    variant?: 'neutral' | 'success' | 'warning' | 'danger'
  }>(),
  {
    variant: 'neutral',
  }
)

// #computed
const badgeClass = computed(() => `badge badge--${props.variant}`)
</script>

<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>

<style scoped>
@reference "tailwindcss";

.badge {
  @apply inline-flex items-center gap-1.5 rounded-full border border-transparent text-xs font-extrabold tracking-wide uppercase;
  padding: 4px 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 1px 2px rgba(43, 29, 14, 0.15);
}

.badge--neutral {
  border-color: var(--brass-dark);
  background: linear-gradient(180deg, #f6efe0, #e9dcc0);
  color: var(--leather-dark);
}

.badge--success {
  border-color: #8faa5c;
  background: linear-gradient(180deg, #dcecb8, #b6cf7e);
  color: #3c4e1f;
}

.badge--warning {
  border-color: var(--brass-dark);
  background: linear-gradient(180deg, var(--brass-light), var(--brass));
  color: var(--leather-dark);
}

.badge--danger {
  border-color: #a5473b;
  background: linear-gradient(180deg, #e9a99a, #cf7a68);
  color: #4a1c14;
}
</style>

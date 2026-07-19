<script setup lang="ts">
// #import
import { computed } from 'vue'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from '@lucide/vue'

// #props
const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'destructive'
  }>(),
  {
    variant: 'info',
  }
)

// #computed
const alertClass = computed(() => `alert alert--${props.variant}`)

const icon = computed(() => {
  const iconMap = {
    info: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    destructive: CircleAlert,
  }

  return iconMap[props.variant]
})
</script>

<template>
  <div :class="alertClass" role="alert">
    <component :is="icon" class="alert__icon" :size="16" :stroke-width="2.25" aria-hidden="true" />
    <div class="alert__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.875rem;
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  box-shadow:
    inset 0 1px 0 var(--edge-highlight),
    0 2px 4px rgba(43, 29, 14, 0.08);
}

.alert__icon {
  flex: none;
  margin-top: 2px;
}

.alert--info {
  border-color: var(--paper-border);
  color: var(--ink);
}

.alert--success {
  border-color: color-mix(in srgb, var(--success) 45%, transparent);
  color: var(--success);
}

.alert--warning {
  border-color: var(--brass-dark);
  color: var(--brass-dark);
}

.alert--destructive {
  border-color: color-mix(in srgb, var(--destructive) 45%, transparent);
  color: var(--destructive);
}
</style>

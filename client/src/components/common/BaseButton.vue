<script setup lang="ts">
// #import
import { computed } from 'vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// #props
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
  }
)

// #computed
const buttonClass = computed(() => `btn btn--${props.variant}`)
const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button :class="buttonClass" :type="props.type" :disabled="isDisabled" :aria-busy="props.loading">
    <BaseSpinner v-if="props.loading" :size="14" />
    <slot />
  </button>
</template>

<style scoped>
@reference "tailwindcss";

.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent text-sm font-bold select-none;
  padding: 10px 18px;
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease, background 160ms ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  @apply cursor-not-allowed opacity-55;
  transform: none;
}

.btn--primary {
  border-color: rgba(0, 0, 0, 0.35);
  background: linear-gradient(180deg, var(--brass-light), var(--brass) 60%, var(--brass-dark));
  color: var(--leather-dark);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -3px 4px rgba(0, 0, 0, 0.25);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.06);
}

.btn--primary:active:not(:disabled) {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.4);
}

.btn--secondary {
  border-color: var(--paper-border);
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  color: var(--ink);
  box-shadow:
    0 1px 2px rgba(43, 29, 14, 0.12),
    inset 0 1px 0 var(--edge-highlight);
}

.btn--secondary:active:not(:disabled) {
  box-shadow: inset 0 2px 4px rgba(43, 29, 14, 0.18);
}

.btn--ghost {
  border-color: transparent;
  background: transparent;
  color: var(--ink-soft);
}

.btn--ghost:hover:not(:disabled) {
  background: rgba(43, 29, 14, 0.06);
  color: var(--ink);
}

.btn--danger {
  border-color: rgba(0, 0, 0, 0.25);
  background: linear-gradient(180deg, color-mix(in srgb, var(--destructive) 82%, white), var(--destructive));
  color: white;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -3px 4px rgba(0, 0, 0, 0.18);
}

.btn--danger:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn--danger:active:not(:disabled) {
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3);
}
</style>

<script setup lang="ts">
// #import
import { computed } from 'vue'
import { Moon, Sun } from '@lucide/vue'

// #props
const dark = defineModel<boolean>({ default: false })

// #computed
const ariaLabel = computed(() => (dark.value ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'))

// #event
const event = () => {
  const ev = {
    onToggle: () => {
      dark.value = !dark.value
    },
  }

  return ev
}

const ev = event()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="ariaLabel"
    :aria-pressed="dark"
    :title="ariaLabel"
    @click="ev.onToggle"
  >
    <Sun v-if="dark" :size="16" :stroke-width="2.3" />
    <Moon v-else :size="16" :stroke-width="2.3" />
  </button>
</template>

<style scoped>
.theme-toggle {
  @apply flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full border;
  border-color: rgba(0, 0, 0, 0.4);
  background: radial-gradient(circle at 35% 30%, var(--brass-light), var(--brass) 55%, var(--brass-dark) 100%);
  color: var(--leather-dark);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    inset 0 -2px 3px rgba(0, 0, 0, 0.35);
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
}

.theme-toggle:hover {
  filter: brightness(1.08);
}

.theme-toggle:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
}
</style>

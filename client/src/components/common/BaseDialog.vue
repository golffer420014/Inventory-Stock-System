<script setup lang="ts">
// #import
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from '@lucide/vue'

// #props
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    maxWidth?: string
  }>(),
  {
    title: '',
    maxWidth: '480px',
  }
)

// #ref / #reactive
const dialogBoxRef = ref<HTMLElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// #action
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const action = () => {
  const ac = {
    /**
     * หา element ที่ focus ได้ทั้งหมดใน dialog ปัจจุบัน ใช้ทั้งตอน focus ครั้งแรกและตอน trap tab
     */
    getFocusableElements: (): HTMLElement[] => {
      if (!dialogBoxRef.value) return []
      return Array.from(dialogBoxRef.value.querySelectorAll<HTMLElement>(focusableSelector))
    },

    /**
     * กัน Tab/Shift+Tab หลุดออกไปนอก dialog ระหว่างเปิดอยู่ (focus trap) เพื่อให้ผู้ใช้ keyboard ไม่หลุดไปกดอะไรที่อยู่ข้างหลัง dialog โดยไม่ตั้งใจ
     */
    trapFocus: (e: KeyboardEvent) => {
      const focusables = ac.getFocusableElements()
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !dialogBoxRef.value?.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialogBoxRef.value?.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onClose: () => {
      emit('update:modelValue', false)
    },

    onKeydown: (e: KeyboardEvent) => {
      if (!props.modelValue) return
      if (e.key === 'Escape') {
        ev.onClose()
        return
      }
      if (e.key === 'Tab') ac.trapFocus(e)
    },
  }

  return ev
}

const ev = event()

// #watch
watch(
  () => props.modelValue,
  async (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''

    if (isOpen) {
      previouslyFocusedElement = document.activeElement as HTMLElement | null
      await nextTick()
      const [firstFocusable] = ac.getFocusableElements()
      ;(firstFocusable ?? dialogBoxRef.value)?.focus()
    } else {
      previouslyFocusedElement?.focus()
      previouslyFocusedElement = null
    }
  }
)

// #onMounted
onMounted(() => {
  document.addEventListener('keydown', ev.onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', ev.onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog-overlay" @mousedown.self="ev.onClose">
        <div ref="dialogBoxRef" class="dialog-box" role="dialog" aria-modal="true" tabindex="-1" :style="{ maxWidth }">
          <div v-if="title || $slots.header" class="dialog-header">
            <slot name="header">
              <h2 class="dialog-title">{{ title }}</h2>
            </slot>
            <button class="dialog-close" type="button" aria-label="ปิด" @click="ev.onClose">
              <X :size="16" :stroke-width="2.4" />
            </button>
          </div>

          <div class="dialog-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@reference "tailwindcss";

.dialog-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  padding: 20px;
  background: rgba(20, 13, 6, 0.55);
  backdrop-filter: blur(2px);
}

.dialog-box {
  @apply flex w-full flex-col overflow-y-auto rounded-2xl border;
  max-height: 90vh;
  border-color: var(--paper-border);
  background: var(--paper);
  box-shadow:
    0 18px 40px rgba(20, 13, 6, 0.4),
    inset 0 1px 0 var(--edge-highlight-soft);
}

.dialog-box:focus {
  outline: none;
}

.dialog-header {
  @apply sticky top-0 z-10 flex items-center justify-between gap-3;
  padding: 16px 20px;
  border-bottom: 1px dashed var(--paper-border);
  background: var(--paper);
}

.dialog-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--ink);
}

.dialog-close {
  @apply inline-flex flex-none items-center justify-center rounded-full;
  width: 30px;
  height: 30px;
  color: var(--ink-soft);
  transition: background 120ms ease, color 120ms ease;
}

.dialog-close:hover {
  background: rgba(43, 29, 14, 0.08);
  color: var(--ink);
}

.dialog-body {
  padding: 20px;
}

.dialog-fade-enter-active .dialog-box,
.dialog-fade-leave-active .dialog-box {
  transition: transform 160ms ease, opacity 160ms ease;
}

.dialog-fade-enter-active {
  transition: opacity 160ms ease;
}

.dialog-fade-leave-active {
  transition: opacity 140ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-box,
.dialog-fade-leave-to .dialog-box {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}
</style>

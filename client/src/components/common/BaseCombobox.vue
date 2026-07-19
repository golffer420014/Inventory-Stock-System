<script setup lang="ts" generic="T extends number | string">
// #import
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronDown, Search, X } from '@lucide/vue'

interface iComboboxOption<T> {
  label: string
  value: T
}

// #props
const props = withDefaults(
  defineProps<{
    modelValue: T | null
    options: iComboboxOption<T>[]
    label?: string
    placeholder?: string
    disabled?: boolean
    emptyText?: string
    error?: string
  }>(),
  {
    label: '',
    placeholder: '',
    disabled: false,
    emptyText: 'ไม่พบข้อมูล',
    error: '',
  }
)

// #action
const emit = defineEmits<{
  'update:modelValue': [value: T | null]
}>()

// #ref / #reactive
const isOpen = ref(false)
const query = ref('')
const highlightedIndex = ref(0)
const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0, width: 0 })

// #computed
const selectedOption = computed(() => props.options.find((o) => o.value === props.modelValue) ?? null)

const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(keyword))
})

const hasValue = computed(() => query.value !== '' || props.modelValue !== null)

// #action
const action = () => {
  const ac = {
    /**
     * ซิงค์ข้อความในช่อง input ให้ตรงกับ option ที่เลือกอยู่ ใช้ตอนปิด dropdown หรือ modelValue เปลี่ยนจากภายนอก
     */
    syncQueryToSelected: () => {
      query.value = selectedOption.value?.label ?? ''
    },

    /**
     * คำนวณตำแหน่ง dropdown list จาก bounding rect ของ input แล้วเก็บไว้ใช้ตอน render ผ่าน Teleport ไปที่ body
     * ป้องกันปัญหา dropdown โดน overflow ของ modal/parent element บังหรือตัดขอบ
     */
    updateMenuPosition: () => {
      const rect = rootRef.value?.getBoundingClientRect()
      if (!rect) return
      menuPosition.value = { top: rect.bottom + 6, left: rect.left, width: rect.width }
    },

    openDropdown: () => {
      if (props.disabled) return
      isOpen.value = true
      ac.updateMenuPosition()
      const activeIndex = filteredOptions.value.findIndex((o) => o.value === props.modelValue)
      highlightedIndex.value = activeIndex === -1 ? 0 : activeIndex
    },

    closeDropdown: () => {
      isOpen.value = false
      ac.syncQueryToSelected()
    },

    selectOption: (option: iComboboxOption<T>) => {
      emit('update:modelValue', option.value)
      query.value = option.label
      isOpen.value = false
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    onFocus: () => {
      ac.openDropdown()
    },

    onInput: () => {
      isOpen.value = true
      highlightedIndex.value = 0
    },

    onClear: () => {
      emit('update:modelValue', null)
      query.value = ''
      isOpen.value = false
      inputRef.value?.focus()
    },

    onSelectOption: (option: iComboboxOption<T>) => {
      ac.selectOption(option)
    },

    onKeydown: (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen.value) {
          ac.openDropdown()
          return
        }
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const option = filteredOptions.value[highlightedIndex.value]
        if (option) ac.selectOption(option)
      } else if (e.key === 'Escape') {
        ac.closeDropdown()
        inputRef.value?.blur()
      }
    },

    onClickOutside: (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideRoot = rootRef.value?.contains(target) ?? false
      const isInsideMenu = menuRef.value?.contains(target) ?? false
      if (isOpen.value && !isInsideRoot && !isInsideMenu) {
        ac.closeDropdown()
      }
    },

    onScrollOrResize: () => {
      if (isOpen.value) ac.updateMenuPosition()
    },
  }

  return ev
}

const ev = event()

// #watch
watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) ac.syncQueryToSelected()
  },
  { immediate: true }
)

// #onMounted
onMounted(() => {
  document.addEventListener('mousedown', ev.onClickOutside)
  window.addEventListener('scroll', ev.onScrollOrResize, true)
  window.addEventListener('resize', ev.onScrollOrResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', ev.onClickOutside)
  window.removeEventListener('scroll', ev.onScrollOrResize, true)
  window.removeEventListener('resize', ev.onScrollOrResize)
})
</script>

<template>
  <div ref="rootRef" class="combobox">
    <span v-if="label" class="field-label">{{ label }}</span>

    <div class="combobox-input-wrap" :class="{ 'combobox-input-wrap--error': error }">
      <Search :size="14" class="combobox-icon combobox-icon--search" :stroke-width="2.2" />

      <input
        ref="inputRef"
        v-model="query"
        class="combobox-input"
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-invalid="!!error"
        :placeholder="placeholder"
        :disabled="disabled"
        @focus="ev.onFocus"
        @input="ev.onInput"
        @keydown="ev.onKeydown"
      />

      <button
        v-if="hasValue && !disabled"
        type="button"
        class="combobox-clear"
        aria-label="ล้างค่า"
        tabindex="-1"
        @mousedown.prevent="ev.onClear"
      >
        <X :size="14" :stroke-width="2.4" />
      </button>
      <ChevronDown v-else :size="14" class="combobox-icon combobox-icon--chevron" :stroke-width="2.2" />
    </div>

    <Teleport to="body">
      <ul
        v-if="isOpen"
        ref="menuRef"
        class="combobox-listbox"
        role="listbox"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, width: `${menuPosition.width}px` }"
      >
        <li v-if="filteredOptions.length === 0" class="combobox-empty">{{ emptyText }}</li>
        <li
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          class="combobox-option"
          :class="{
            'combobox-option--active': index === highlightedIndex,
            'combobox-option--selected': option.value === modelValue,
          }"
          role="option"
          :aria-selected="option.value === modelValue"
          @mousedown.prevent="ev.onSelectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option.label }}
        </li>
      </ul>
    </Teleport>

    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.combobox {
  @apply relative flex flex-col gap-1.5;
}

.field-label {
  color: var(--ink-soft);
  font-size: 0.8rem;
  font-weight: 700;
}

.combobox-input-wrap {
  @apply relative flex items-center;
}

.combobox-icon {
  @apply pointer-events-none absolute;
  color: var(--ink-soft);
}

.combobox-icon--search {
  left: 12px;
}

.combobox-icon--chevron {
  right: 12px;
}

.combobox-input {
  @apply w-full rounded-lg border;
  padding: 10px 36px;
  border-color: var(--paper-border);
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.12),
    inset 0 -1px 0 var(--edge-highlight-soft);
  transition: box-shadow 140ms ease, border-color 140ms ease;
}

.combobox-input::placeholder {
  color: var(--ink-soft);
}

.combobox-input:focus {
  border-color: var(--brass);
  outline: none;
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.15),
    0 0 0 3px rgba(216, 163, 77, 0.25);
}

.combobox-input:disabled {
  @apply cursor-not-allowed opacity-60;
}

.combobox-input-wrap--error .combobox-input {
  border-color: var(--destructive);
}

.combobox-input-wrap--error .combobox-input:focus {
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.15),
    0 0 0 3px color-mix(in srgb, var(--destructive) 25%, transparent);
}

.field-error {
  color: var(--destructive);
  font-size: 0.75rem;
  font-weight: 600;
}

.combobox-clear {
  @apply absolute inline-flex items-center justify-center rounded-full;
  right: 8px;
  width: 20px;
  height: 20px;
  color: var(--ink-soft);
  transition: background 120ms ease, color 120ms ease;
}

.combobox-clear:hover {
  background: rgba(43, 29, 14, 0.08);
  color: var(--ink);
}

.combobox-listbox {
  @apply fixed flex flex-col overflow-y-auto rounded-lg border;
  z-index: 60;
  max-height: 220px;
  margin: 0;
  padding: 4px;
  list-style: none;
  border-color: var(--paper-border);
  background: var(--paper);
  box-shadow: 0 8px 18px rgba(43, 29, 14, 0.18);
}

.combobox-empty {
  padding: 8px 10px;
  color: var(--ink-soft);
  font-size: 0.8125rem;
}

.combobox-option {
  @apply cursor-pointer rounded-md;
  padding: 8px 10px;
  color: var(--ink);
  font-size: 0.875rem;
}

.combobox-option--active {
  background: rgba(216, 163, 77, 0.18);
}

.combobox-option--selected {
  font-weight: 700;
}
</style>

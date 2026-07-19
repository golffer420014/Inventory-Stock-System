<script setup lang="ts">
// #import
import { computed } from 'vue'
import { formatNumber } from '@/directives/numberFormat'

// #props
const props = withDefaults(
  defineProps<{
    modelValue: number | null
    label?: string
    placeholder?: string
    disabled?: boolean
    error?: string
  }>(),
  {
    label: '',
    placeholder: '',
    disabled: false,
    error: '',
  }
)

// #action
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

/**
 * แปลง input ที่พิมพ์ (มี comma) ให้เป็นตัวเลขล้วนก่อน emit กลับไปยัง parent
 * เพื่อให้ modelValue ของ component นี้เป็น number ที่ใช้งานต่อได้ทันที
 */
const emitParsedValue = (raw: string) => {
  const cleaned = raw.replace(/,/g, '')

  if (cleaned === '' || cleaned === '-') {
    emit('update:modelValue', null)
    return
  }

  const parsed = Number(cleaned)
  emit('update:modelValue', Number.isNaN(parsed) ? null : parsed)
}

// #computed
const displayValue = computed<string>({
  get: () => (props.modelValue === null || props.modelValue === undefined ? '' : formatNumber(String(props.modelValue))),
  set: (raw: string) => emitParsedValue(raw),
})
</script>

<template>
  <label class="field">
    <span v-if="label" class="field-label">{{ label }}</span>
    <input
      v-model="displayValue"
      v-number-format
      class="field-input-number"
      :class="{ 'field-input-number--error': error }"
      type="text"
      inputmode="decimal"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="!!error"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
  </label>
</template>

<style scoped>
@reference "tailwindcss";

.field {
  @apply flex flex-col gap-1.5;
}

.field-label {
  color: var(--ink-soft);
  font-size: 0.8rem;
  font-weight: 700;
}

.field-input-number {
  @apply w-full rounded-lg border;
  padding: 10px 12px;
  border-color: var(--paper-border);
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.12),
    inset 0 -1px 0 var(--edge-highlight-soft);
  transition: box-shadow 140ms ease, border-color 140ms ease;
}

.field-input-number::placeholder {
  color: var(--ink-soft);
}

.field-input-number:focus {
  border-color: var(--brass);
  outline: none;
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.15),
    0 0 0 3px rgba(216, 163, 77, 0.25);
}

.field-input-number:disabled {
  @apply cursor-not-allowed opacity-60;
}

.field-input-number--error {
  border-color: var(--destructive);
}

.field-input-number--error:focus {
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.15),
    0 0 0 3px color-mix(in srgb, var(--destructive) 25%, transparent);
}

.field-error {
  color: var(--destructive);
  font-size: 0.75rem;
  font-weight: 600;
}
</style>

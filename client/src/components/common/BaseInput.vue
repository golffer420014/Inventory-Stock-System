<script setup lang="ts">
// #props
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    disabled?: boolean
    type?: 'text' | 'email' | 'password' | 'search' | 'date'
    error?: string
  }>(),
  {
    label: '',
    placeholder: '',
    disabled: false,
    type: 'text',
    error: '',
  }
)

// #action
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="field">
    <span v-if="label" class="field-label">{{ label }}</span>
    <input
      class="field-input"
      :class="{ 'field-input--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
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

.field-input {
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

.field-input::placeholder {
  color: var(--ink-soft);
}

.field-input:focus {
  border-color: var(--brass);
  outline: none;
  box-shadow:
    inset 0 2px 4px rgba(43, 29, 14, 0.15),
    0 0 0 3px rgba(216, 163, 77, 0.25);
}

.field-input:disabled {
  @apply cursor-not-allowed opacity-60;
}

.field-input--error {
  border-color: var(--destructive);
}

.field-input--error:focus {
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

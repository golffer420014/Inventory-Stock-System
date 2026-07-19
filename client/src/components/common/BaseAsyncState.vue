<script setup lang="ts">
// #import
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

// #props
withDefaults(
  defineProps<{
    isLoading: boolean
    error?: string | null
    isEmpty?: boolean
    emptyText?: string
  }>(),
  {
    error: null,
    isEmpty: false,
    emptyText: 'ไม่มีข้อมูล',
  }
)

// #action
defineEmits<{
  retry: []
}>()
</script>

<template>
  <div v-if="isLoading" class="async-state" aria-live="polite">
    <BaseSpinner :size="20" />
    <p>กำลังโหลดข้อมูล...</p>
  </div>

  <div v-else-if="error" class="async-state" aria-live="assertive">
    <BaseAlert variant="destructive">{{ error }}</BaseAlert>
    <BaseButton variant="secondary" @click="$emit('retry')">ลองใหม่อีกครั้ง</BaseButton>
  </div>

  <div v-else-if="isEmpty" class="async-state">
    <slot name="empty">
      <p class="async-state__empty">{{ emptyText }}</p>
    </slot>
  </div>

  <slot v-else />
</template>

<style scoped>
.async-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  color: var(--ink-soft);
  font-size: 0.875rem;
  text-align: center;
}

.async-state__empty {
  margin: 0;
}
</style>

<script setup lang="ts">
// #import
import { computed } from 'vue'
import { useConfirmStore } from '@/stores/confirm'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'

// #store
const confirmStore = useConfirmStore()

// #computed
const isOpen = computed({
  get: () => confirmStore.request !== null,
  set: (value: boolean) => {
    if (!value) confirmStore.resolve(false)
  },
})

// #event
const event = () => {
  const ev = {
    onConfirm: () => {
      confirmStore.resolve(true)
    },

    onCancel: () => {
      confirmStore.resolve(false)
    },
  }

  return ev
}

const ev = event()
</script>

<template>
  <BaseDialog v-model="isOpen" :title="confirmStore.request?.title ?? ''" max-width="420px">
    <div class="confirm-dialog">
      <p class="confirm-dialog__message">{{ confirmStore.request?.message }}</p>

      <div class="confirm-dialog__actions">
        <BaseButton :variant="confirmStore.request?.danger ? 'danger' : 'primary'" @click="ev.onConfirm">
          {{ confirmStore.request?.confirmText }}
        </BaseButton>
        <BaseButton variant="secondary" @click="ev.onCancel">{{ confirmStore.request?.cancelText }}</BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.confirm-dialog {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.confirm-dialog__message {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.confirm-dialog__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

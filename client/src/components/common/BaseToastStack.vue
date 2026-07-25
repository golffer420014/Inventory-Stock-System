<script setup lang="ts">
// #import
import { computed } from 'vue'
import { CircleAlert, CircleCheck, TriangleAlert, X } from '@lucide/vue'
import { useNotificationStore } from '@/stores/notification'
import { useToastStore } from '@/stores/toast'

type tToastKind = 'lowStock' | 'success' | 'destructive'

interface iRenderToast {
  key: string
  kind: tToastKind
  title: string
  detail: string
  onClose: () => void
}

// #store
const notificationStore = useNotificationStore()
const toastStore = useToastStore()

// #computed
/**
 * รวม toast แจ้งเตือนสินค้าใกล้หมด (จาก SSE) กับ toast แจ้งผลลัพธ์ action ทั่วไป ให้แสดงในสแตกเดียวกัน
 */
const items = computed<iRenderToast[]>(() => [
  ...notificationStore.toasts.map(
    (toast): iRenderToast => ({
      key: `low-stock-${toast.id}`,
      kind: 'lowStock',
      title: 'สินค้าใกล้หมด',
      detail: `[${toast.sku}] ${toast.name} - เหลือ ${toast.stockQuantity} หน่วย`,
      onClose: () => notificationStore.dismiss(toast.id),
    })
  ),
  ...toastStore.toasts.map(
    (toast): iRenderToast => ({
      key: `action-${toast.id}`,
      kind: toast.variant,
      title: toast.variant === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด',
      detail: toast.message,
      onClose: () => toastStore.dismiss(toast.id),
    })
  ),
])

const iconByKind = {
  lowStock: TriangleAlert,
  success: CircleCheck,
  destructive: CircleAlert,
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup tag="div" name="toast" class="toast-stack">
      <div v-for="item in items" :key="item.key" class="toast" :class="`toast--${item.kind}`">
        <component :is="iconByKind[item.kind]" :size="18" class="toast__icon" :stroke-width="2.2" />

        <div class="toast__body">
          <span class="toast__title">{{ item.title }}</span>
          <span class="toast__detail">{{ item.detail }}</span>
        </div>

        <button class="toast__close" type="button" aria-label="ปิด" @click="item.onClose">
          <X :size="14" :stroke-width="2.4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
@reference "tailwindcss";

.toast-stack {
  @apply fixed z-60 flex flex-col gap-2;
  top: 20px;
  right: 20px;
  width: min(360px, calc(100vw - 40px));
}

.toast {
  @apply flex items-start gap-3 rounded-xl border;
  padding: 14px;
  border-color: var(--paper-border);
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  box-shadow:
    0 10px 24px rgba(43, 29, 14, 0.28),
    inset 0 1px 0 var(--edge-highlight);
}

.toast__icon {
  @apply flex-none;
  margin-top: 1px;
  color: var(--destructive);
}

.toast--success .toast__icon {
  color: var(--success);
}

.toast__body {
  @apply flex min-w-0 flex-1 flex-col gap-0.5;
}

.toast__title {
  font-size: 0.8125rem;
  font-weight: 800;
  color: var(--ink);
}

.toast__detail {
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.toast__close {
  @apply inline-flex flex-none items-center justify-center rounded-full;
  width: 22px;
  height: 22px;
  color: var(--ink-soft);
  transition: background 120ms ease, color 120ms ease;
}

.toast__close:hover {
  background: rgba(43, 29, 14, 0.08);
  color: var(--ink);
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: transform 180ms ease, opacity 180ms ease;
}

.toast-enter-from {
  transform: translateX(24px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(24px);
  opacity: 0;
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}
</style>

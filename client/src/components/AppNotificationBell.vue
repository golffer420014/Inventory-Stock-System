<script setup lang="ts">
// #import
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, TriangleAlert } from '@lucide/vue'
import { useNotificationStore } from '@/stores/notification'

const POLL_INTERVAL_MS = 15_000

// #store
const notificationStore = useNotificationStore()

// #ref / #reactive
const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

// #computed
const hasUnread = computed(() => notificationStore.unreadCount > 0)
const badgeText = computed(() => (notificationStore.unreadCount > 9 ? '9+' : String(notificationStore.unreadCount)))

// #action
const action = () => {
  const ac = {
    init: async () => {
      await notificationStore.fetchHistory()
    },

    formatTime: (isoDate: string): string => {
      return new Date(isoDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
    },
  }

  return ac
}

const ac = action()

// #event
const event = () => {
  const ev = {
    /**
     * เปิด/ปิด dropdown ประวัติการแจ้งเตือน ตอนเปิดให้โหลดข้อมูลล่าสุดแล้ว mark ว่าอ่านแล้วทั้งหมด
     */
    onToggle: async () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        await notificationStore.fetchHistory()
        await notificationStore.markAllRead()
      }
    },

    onClickOutside: (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideRoot = rootRef.value?.contains(target) ?? false
      if (isOpen.value && !isInsideRoot) {
        isOpen.value = false
      }
    },
  }

  return ev
}

const ev = event()

// #onMounted
onMounted(() => {
  ac.init()
  intervalId = setInterval(() => notificationStore.fetchHistory(), POLL_INTERVAL_MS)
  document.addEventListener('mousedown', ev.onClickOutside)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  document.removeEventListener('mousedown', ev.onClickOutside)
})
</script>

<template>
  <div ref="rootRef" class="notif-bell">
    <button type="button" class="notif-bell__trigger" aria-label="การแจ้งเตือนสินค้าใกล้หมด" @click="ev.onToggle">
      <Bell :size="16" :stroke-width="2.2" />
      <span v-if="hasUnread" class="notif-bell__badge">{{ badgeText }}</span>
    </button>

    <Transition name="notif-panel">
      <div v-if="isOpen" class="notif-panel">
        <div class="notif-panel__header">สินค้าใกล้หมด</div>

        <p v-if="notificationStore.isHistoryLoading && notificationStore.history.length === 0" class="notif-panel__state">
          กำลังโหลด...
        </p>
        <p v-else-if="notificationStore.history.length === 0" class="notif-panel__state">ไม่มีการแจ้งเตือน</p>

        <ul v-else class="notif-panel__list">
          <li v-for="item in notificationStore.history" :key="item.id" class="notif-item">
            <TriangleAlert :size="15" class="notif-item__icon" :stroke-width="2.2" />
            <div class="notif-item__body">
              <span class="notif-item__title">[{{ item.sku }}] {{ item.name }}</span>
              <span class="notif-item__detail">เหลือ {{ item.stockQuantity }} หน่วย · {{ ac.formatTime(item.createdAt) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.notif-bell {
  @apply relative inline-flex;
}

.notif-bell__trigger {
  @apply relative inline-flex items-center justify-center rounded-full;
  width: 34px;
  height: 34px;
  color: var(--ink-soft);
  border: 1px solid var(--paper-border);
  background: linear-gradient(180deg, var(--paper-highlight), var(--paper-card));
  transition: border-color 140ms ease, color 140ms ease;
}

.notif-bell__trigger:hover {
  color: var(--brass-dark);
  border-color: var(--brass-dark);
}

.notif-bell__badge {
  @apply absolute inline-flex items-center justify-center rounded-full;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  background: var(--destructive);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 0 0 2px var(--paper);
}

.notif-panel {
  @apply absolute flex flex-col overflow-hidden rounded-xl border;
  top: calc(100% + 8px);
  right: 0;
  z-index: 60;
  width: min(320px, 80vw);
  max-height: 360px;
  border-color: var(--paper-border);
  background: var(--paper-card);
  box-shadow: 0 12px 28px rgba(43, 29, 14, 0.24);
}

.notif-panel__header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--paper-border);
  color: var(--ink);
  font-size: 0.8125rem;
  font-weight: 800;
}

.notif-panel__state {
  padding: 20px 14px;
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.8125rem;
  text-align: center;
}

.notif-panel__list {
  @apply flex flex-col overflow-y-auto;
  margin: 0;
  padding: 6px;
  list-style: none;
}

.notif-item {
  @apply flex items-start gap-2.5 rounded-lg;
  padding: 8px;
}

.notif-item + .notif-item {
  border-top: 1px dashed var(--paper-border);
}

.notif-item__icon {
  @apply flex-none;
  margin-top: 1px;
  color: var(--destructive);
}

.notif-item__body {
  @apply flex min-w-0 flex-1 flex-col gap-0.5;
}

.notif-item__title {
  color: var(--ink);
  font-size: 0.8125rem;
  font-weight: 700;
}

.notif-item__detail {
  color: var(--ink-soft);
  font-size: 0.75rem;
}

.notif-panel-enter-active,
.notif-panel-leave-active {
  transition: transform 160ms var(--ease-out), opacity 160ms var(--ease-out);
}

.notif-panel-enter-from,
.notif-panel-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
</style>

import { onBeforeUnmount, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import type { iLowStockEvent } from '@/types/notification.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * เปิด connection แบบ Server-Sent Events ค้างไว้ตลอดอายุของ component ที่เรียกใช้ (เรียกครั้งเดียวใน DefaultLayout)
 * รับ event 'low-stock' แบบ real-time จาก server แล้วส่งต่อเข้า notification store เป็น toast
 */
export const useNotificationStream = () => {
  const notificationStore = useNotificationStore()
  let source: EventSource | null = null

  onMounted(() => {
    source = new EventSource(`${API_BASE_URL}/notifications/stream`)

    source.addEventListener('low-stock', (e: MessageEvent<string>) => {
      const event = JSON.parse(e.data) as iLowStockEvent
      notificationStore.pushLowStockAlert(event)
    })
  })

  onBeforeUnmount(() => {
    source?.close()
  })
}

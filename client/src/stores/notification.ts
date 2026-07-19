import { acceptHMRUpdate, defineStore } from 'pinia'
import type { iLowStockEvent, iLowStockToast } from '@/types/notification.types'

const TOAST_DURATION_MS = 6000

interface iNotificationStore {
  toasts: iLowStockToast[]
  nextToastId: number
}

export const useNotificationStore = defineStore('notification', {
  state: (): iNotificationStore => ({
    toasts: [],
    nextToastId: 1,
  }),

  actions: {
    /**
     * เพิ่ม toast แจ้งเตือนสินค้าใกล้หมดที่ได้รับจาก real-time stream แล้วลบตัวเองออกอัตโนมัติหลังครบเวลา
     */
    pushLowStockAlert(event: iLowStockEvent) {
      const id = this.nextToastId++
      this.toasts.push({ id, ...event })

      setTimeout(() => this.dismiss(id), TOAST_DURATION_MS)
    },

    dismiss(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationStore, import.meta.hot))
}

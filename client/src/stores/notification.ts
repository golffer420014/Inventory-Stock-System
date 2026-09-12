import { acceptHMRUpdate, defineStore } from 'pinia'
import { notificationService } from '@/services/notification.service'
import type { iLowStockEvent, iLowStockNotification, iLowStockToast } from '@/types/notification.types'

const TOAST_DURATION_MS = 6000

interface iNotificationStore {
  toasts: iLowStockToast[]
  nextToastId: number
  history: iLowStockNotification[]
  unreadCount: number
  isHistoryLoading: boolean
}

export const useNotificationStore = defineStore('notification', {
  state: (): iNotificationStore => ({
    toasts: [],
    nextToastId: 1,
    history: [],
    unreadCount: 0,
    isHistoryLoading: false,
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

    /**
     * โหลดประวัติการแจ้งเตือนสินค้าใกล้หมดล่าสุด พร้อมจำนวนที่ยังไม่ได้อ่าน ให้ bell icon แสดง
     */
    async fetchHistory() {
      this.isHistoryLoading = true

      try {
        const { items, unreadCount } = await notificationService.getHistory()
        this.history = items
        this.unreadCount = unreadCount
      } finally {
        this.isHistoryLoading = false
      }
    },

    /**
     * ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว เรียกตอนผู้ใช้เปิด dropdown กระดิ่ง
     */
    async markAllRead() {
      if (this.unreadCount === 0) return

      await notificationService.markAllRead()
      this.unreadCount = 0
      this.history = this.history.map((item) => ({ ...item, isRead: true }))
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotificationStore, import.meta.hot))
}

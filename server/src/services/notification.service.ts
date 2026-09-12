import { notificationRepository } from '@/repositories/notification.repository.js'
import type { iLowStockEvent, iLowStockHistory } from '@/types/notification.types.js'

export const notificationService = {
  getLowStockProducts: async (): Promise<iLowStockEvent[]> => {
    return notificationRepository.findLowStockProducts()
  },

  /** ประวัติการแจ้งเตือนสินค้าใกล้หมด พร้อมจำนวนที่ยังไม่ได้อ่าน ให้ bell icon แสดง */
  getHistory: async (limit: number): Promise<iLowStockHistory> => {
    const [items, unreadCount] = await Promise.all([
      notificationRepository.findHistory(limit),
      notificationRepository.countUnread(),
    ])

    return { items, unreadCount }
  },

  markAllRead: async (): Promise<void> => {
    return notificationRepository.markAllRead()
  },
}

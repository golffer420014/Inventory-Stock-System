import { http } from '@/services/http'
import type { iLowStockEvent, iLowStockHistory } from '@/types/notification.types'

export const notificationService = {
  getLowStock: () => http.get<iLowStockEvent[]>('/notifications/low-stock'),
  getHistory: () => http.get<iLowStockHistory>('/notifications/history'),
  markAllRead: () => http.post<void>('/notifications/history/read', {}),
}

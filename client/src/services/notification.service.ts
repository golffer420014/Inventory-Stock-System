import { http } from '@/services/http'
import type { iLowStockEvent } from '@/types/notification.types'

export const notificationService = {
  getLowStock: () => http.get<iLowStockEvent[]>('/notifications/low-stock'),
}

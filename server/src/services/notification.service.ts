import { notificationRepository } from '@/repositories/notification.repository.js'
import type { iLowStockEvent } from '@/types/notification.types.js'

export const notificationService = {
  getLowStockProducts: async (): Promise<iLowStockEvent[]> => {
    return notificationRepository.findLowStockProducts()
  },
}

import { salesOrderRepository } from '@/repositories/salesOrder.repository.js'
import type { iSalesOrder } from '@/types/salesOrder.types.js'

export const salesOrderService = {
  getAllSalesOrders: async (): Promise<iSalesOrder[]> => {
    return salesOrderRepository.findAll()
  },
}

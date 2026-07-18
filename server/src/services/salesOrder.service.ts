import { salesOrderRepository } from '@/repositories/salesOrder.repository.js'
import type { iSalesOrder, iSalesOrderItemInput } from '@/types/salesOrder.types.js'

export const salesOrderService = {
  getAllSalesOrders: async (): Promise<iSalesOrder[]> => {
    return salesOrderRepository.findAll()
  },

  createSalesOrder: async (items: iSalesOrderItemInput[]): Promise<iSalesOrder> => {
    return salesOrderRepository.create(items)
  },

  addPayment: async (id: number, fileUrl: string, fileName: string): Promise<iSalesOrder> => {
    return salesOrderRepository.addPayment(id, fileUrl, fileName)
  },

  confirmSalesOrder: async (id: number): Promise<iSalesOrder> => {
    return salesOrderRepository.confirm(id)
  },

  fulfillSalesOrder: async (id: number): Promise<iSalesOrder> => {
    return salesOrderRepository.fulfill(id)
  },

  cancelSalesOrder: async (id: number): Promise<iSalesOrder> => {
    return salesOrderRepository.cancel(id)
  },
}

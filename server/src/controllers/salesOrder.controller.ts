import type { Request, Response } from 'express'
import { salesOrderService } from '@/services/salesOrder.service.js'

export const salesOrderController = {
  list: async (_req: Request, res: Response) => {
    const salesOrders = await salesOrderService.getAllSalesOrders()
    res.json(salesOrders)
  },
}

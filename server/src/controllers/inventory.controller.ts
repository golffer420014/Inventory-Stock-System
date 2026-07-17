import type { Request, Response } from 'express'
import { inventoryService } from '@/services/inventory.service.js'

export const inventoryController = {
  listMovements: async (_req: Request, res: Response) => {
    const movements = await inventoryService.getAllMovements()
    res.json(movements)
  },
}

import { Router } from 'express'
import { inventoryController } from '@/controllers/inventory.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const inventoryRoutes = Router()

// Inventory Movement: Admin, Sales(view), Warehouse, Viewer(view)
inventoryRoutes.get(
  '/movements',
  requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'),
  inventoryController.listMovements
)

// Stock In / Stock Out / Stock Adjustment: Admin, Warehouse เท่านั้น (README ข้อ 5)
inventoryRoutes.post('/stock-in', requireRole('Admin', 'Warehouse'), inventoryController.stockIn)
inventoryRoutes.post('/stock-out', requireRole('Admin', 'Warehouse'), inventoryController.stockOut)
inventoryRoutes.post('/adjustment', requireRole('Admin', 'Warehouse'), inventoryController.adjustment)

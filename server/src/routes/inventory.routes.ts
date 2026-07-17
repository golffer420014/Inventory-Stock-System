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

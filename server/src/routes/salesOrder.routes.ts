import { Router } from 'express'
import { salesOrderController } from '@/controllers/salesOrder.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const salesOrderRoutes = Router()

// สร้าง Sales Order: Admin, Sales เท่านั้น
salesOrderRoutes.get('/', requireRole('Admin', 'Sales'), salesOrderController.list)

import { Router } from 'express'
import { categoryController } from '@/controllers/category.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const categoryRoutes = Router()

// ดูหมวดหมู่: Admin, Sales, Warehouse, Viewer
categoryRoutes.get('/', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), categoryController.list)

// จัดการหมวดหมู่: Admin เท่านั้น (README ข้อ 5 - จัดการสินค้า)
categoryRoutes.post('/', requireRole('Admin'), categoryController.create)
categoryRoutes.put('/:id', requireRole('Admin'), categoryController.update)
categoryRoutes.delete('/:id', requireRole('Admin'), categoryController.remove)

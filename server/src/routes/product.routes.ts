import { Router } from 'express'
import { productController } from '@/controllers/product.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const productRoutes = Router()

// ดูสินค้า: Admin, Sales, Warehouse, Viewer
productRoutes.get('/', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), productController.list)

// จัดการสินค้า: Admin เท่านั้น (README ข้อ 5)
productRoutes.post('/', requireRole('Admin'), productController.create)
productRoutes.put('/:id', requireRole('Admin'), productController.update)
productRoutes.delete('/:id', requireRole('Admin'), productController.remove)

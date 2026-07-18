import { Router } from 'express'
import { salesOrderController } from '@/controllers/salesOrder.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const salesOrderRoutes = Router()

// ดู Sales Order: Admin, Sales, Warehouse(view เพื่อดำเนินการ fulfill), Viewer(view)
salesOrderRoutes.get('/', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), salesOrderController.list)

// สร้าง/ยืนยัน/ยกเลิก Sales Order: Admin, Sales เท่านั้น (README ข้อ 5)
salesOrderRoutes.post('/', requireRole('Admin', 'Sales'), salesOrderController.create)
salesOrderRoutes.post('/:id/payments', requireRole('Admin', 'Sales'), salesOrderController.addPayment)
salesOrderRoutes.post('/:id/confirm', requireRole('Admin', 'Sales'), salesOrderController.confirm)
salesOrderRoutes.post('/:id/cancel', requireRole('Admin', 'Sales'), salesOrderController.cancel)

// ดำเนินการคลัง (ตัดสต๊อกตาม Sales Order): Admin, Warehouse เท่านั้น เหมือนสิทธิ์ Stock Out
salesOrderRoutes.post('/:id/fulfill', requireRole('Admin', 'Warehouse'), salesOrderController.fulfill)

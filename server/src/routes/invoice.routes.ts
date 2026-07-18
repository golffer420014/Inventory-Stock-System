import { Router } from 'express'
import { invoiceController } from '@/controllers/invoice.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const invoiceRoutes = Router()

// ดู Invoice: Admin, Sales, Warehouse(view), Viewer(view)
invoiceRoutes.get('/', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), invoiceController.list)

// พิมพ์ Invoice เป็น PDF: สิทธิ์เดียวกับการดู Invoice
invoiceRoutes.get('/:id/pdf', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), invoiceController.pdf)

import { Router } from 'express'
import { reportController } from '@/controllers/report.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const reportRoutes = Router()

// Report: Admin, Sales, Warehouse, Viewer ดูได้ทุก role (README ข้อ 5)
reportRoutes.get('/sales', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), reportController.sales)
reportRoutes.get('/inventory', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), reportController.inventory)

// Export Data (CSV)
reportRoutes.get('/sales/csv', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), reportController.salesCsv)
reportRoutes.get(
  '/inventory/csv',
  requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'),
  reportController.inventoryCsv
)

// Generate PDF
reportRoutes.get('/sales/pdf', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), reportController.salesPdf)
reportRoutes.get(
  '/inventory/pdf',
  requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'),
  reportController.inventoryPdf
)

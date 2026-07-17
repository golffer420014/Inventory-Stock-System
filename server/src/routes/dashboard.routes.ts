import { Router } from 'express'
import { dashboardController } from '@/controllers/dashboard.controller.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const dashboardRoutes = Router()

// Dashboard: Admin, Sales, Warehouse, Viewer
dashboardRoutes.get('/summary', requireRole('Admin', 'Sales', 'Warehouse', 'Viewer'), dashboardController.summary)

import { Router } from 'express'
import { categoryRoutes } from '@/routes/category.routes.js'
import { dashboardRoutes } from '@/routes/dashboard.routes.js'
import { inventoryRoutes } from '@/routes/inventory.routes.js'
import { invoiceRoutes } from '@/routes/invoice.routes.js'
import { notificationRoutes } from '@/routes/notification.routes.js'
import { productRoutes } from '@/routes/product.routes.js'
import { reportRoutes } from '@/routes/report.routes.js'
import { salesOrderRoutes } from '@/routes/salesOrder.routes.js'
import { uploadRoutes } from '@/routes/upload.routes.js'

export const apiRouter = Router()

apiRouter.use('/products', productRoutes)
apiRouter.use('/categories', categoryRoutes)
apiRouter.use('/uploads', uploadRoutes)
apiRouter.use('/inventory', inventoryRoutes)
apiRouter.use('/sales-orders', salesOrderRoutes)
apiRouter.use('/invoices', invoiceRoutes)
apiRouter.use('/dashboard', dashboardRoutes)
apiRouter.use('/reports', reportRoutes)
apiRouter.use('/notifications', notificationRoutes)

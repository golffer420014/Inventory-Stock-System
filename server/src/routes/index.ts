import { Router } from 'express'
import { dashboardRoutes } from '@/routes/dashboard.routes.js'
import { inventoryRoutes } from '@/routes/inventory.routes.js'
import { invoiceRoutes } from '@/routes/invoice.routes.js'
import { productRoutes } from '@/routes/product.routes.js'
import { salesOrderRoutes } from '@/routes/salesOrder.routes.js'

export const apiRouter = Router()

apiRouter.use('/products', productRoutes)
apiRouter.use('/inventory', inventoryRoutes)
apiRouter.use('/sales-orders', salesOrderRoutes)
apiRouter.use('/invoices', invoiceRoutes)
apiRouter.use('/dashboard', dashboardRoutes)

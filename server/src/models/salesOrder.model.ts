import { Model } from '@/models/base.model.js'
import type { tSalesOrderStatus } from '@/types/salesOrder.types.js'

export class SalesOrder extends Model {
  static override table = 'sales_orders'
  static override numericFields = ['totalAmount']

  orderNumber!: string
  status!: tSalesOrderStatus
  totalAmount!: number
  createdAt!: string
  updatedAt!: string
}

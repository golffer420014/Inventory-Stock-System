import { Model } from '@/models/base.model.js'

export class SalesOrderItem extends Model {
  static override table = 'sales_order_items'
  static override numericFields = ['unitPrice']

  salesOrderId!: number
  productId!: number
  quantity!: number
  unitPrice!: number
}

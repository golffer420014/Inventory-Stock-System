import { Model } from '@/models/base.model.js'

export class LowStockNotification extends Model {
  static override table = 'low_stock_notifications'
  static override readonlyFields = ['id', 'createdAt']

  productId!: number
  sku!: string
  name!: string
  stockQuantity!: number
  isRead!: boolean
  createdAt!: string
}

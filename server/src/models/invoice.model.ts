import { Model } from '@/models/base.model.js'

export class Invoice extends Model {
  static override table = 'invoices'
  static override numericFields = ['totalAmount']
  static override readonlyFields = ['id', 'createdAt']

  invoiceNumber!: string
  salesOrderId!: number
  totalAmount!: number
  createdAt!: string
}

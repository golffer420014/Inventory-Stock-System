export type tSalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'

export interface iSalesOrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
}

export interface iSalesOrder {
  id: number
  orderNumber: string
  status: tSalesOrderStatus
  items: iSalesOrderItem[]
  totalAmount: number
  createdAt: string
}

export interface iInvoiceItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
}

export interface iInvoice {
  id: number
  invoiceNumber: string
  salesOrderId: number
  items: iInvoiceItem[]
  totalAmount: number
  createdAt: string
}

export type tSalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'

export interface iSalesOrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
}

export interface iSalesOrderPayment {
  id: number
  fileUrl: string
  fileName: string
  uploadedAt: string
}

export interface iSalesOrder {
  id: number
  orderNumber: string
  status: tSalesOrderStatus
  items: iSalesOrderItem[]
  payments: iSalesOrderPayment[]
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

export interface iInvoiceDetailItem {
  id: number
  productId: number
  sku: string
  name: string
  quantity: number
  unitPrice: number
}

export interface iInvoiceDetail {
  id: number
  invoiceNumber: string
  orderNumber: string
  salesOrderId: number
  items: iInvoiceDetailItem[]
  totalAmount: number
  createdAt: string
}

export interface iSalesOrderItemInput {
  productId: number
  quantity: number
}

export interface iSalesOrderInput {
  items: iSalesOrderItemInput[]
}

export interface iSalesOrderPaymentInput {
  fileUrl: string
  fileName: string
}

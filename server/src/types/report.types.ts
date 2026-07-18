export interface iReportDateRange {
  startDate?: string
  endDate?: string
}

export interface iSalesReportRow {
  invoiceId: number
  invoiceNumber: string
  orderId: number
  orderNumber: string
  orderStatus: string
  totalAmount: number
  createdAt: string
}

export interface iSalesReport {
  rows: iSalesReportRow[]
  totalAmount: number
  invoiceCount: number
}

export interface iInventoryReportProductRow {
  productId: number
  sku: string
  name: string
  stockQuantity: number
  isLowStock: boolean
}

export interface iInventoryReport {
  products: iInventoryReportProductRow[]
  totalStockQuantity: number
  lowStockProductCount: number
  totalIn: number
  totalOut: number
  totalAdjustment: number
}

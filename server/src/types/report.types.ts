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
  /** ยอดขายสุทธิ ไม่รวม invoice ของ order ที่ถูกยกเลิก */
  totalAmount: number
  /** จำนวน invoice ทั้งหมดในช่วงวันที่ รวมที่ถูกยกเลิกด้วย (ตรงกับจำนวนแถวใน rows) */
  invoiceCount: number
  cancelledAmount: number
  cancelledCount: number
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

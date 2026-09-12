export interface iLowStockEvent {
  productId: number
  sku: string
  name: string
  stockQuantity: number
}

export interface iLowStockNotification extends iLowStockEvent {
  id: number
  isRead: boolean
  createdAt: string
}

export interface iLowStockHistory {
  items: iLowStockNotification[]
  unreadCount: number
}

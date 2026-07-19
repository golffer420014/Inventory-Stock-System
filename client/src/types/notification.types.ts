export interface iLowStockEvent {
  productId: number
  sku: string
  name: string
  stockQuantity: number
}

export interface iLowStockToast extends iLowStockEvent {
  id: number
}

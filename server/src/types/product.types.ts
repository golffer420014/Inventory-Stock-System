export interface iProduct {
  id: number
  sku: string
  name: string
  brand: string
  categoryId: number
  unit: string
  price: number
  stockQuantity: number
}

export interface iCategory {
  id: number
  name: string
}

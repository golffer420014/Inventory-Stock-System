export interface iProduct {
  id: number
  sku: string
  name: string
  brand: string
  categoryId: number
  unit: string
  price: number
  stockQuantity: number
  imageUrl?: string
}

export interface iProductInput {
  name: string
  brand: string
  categoryId: number
  unit: string
  price: number
  stockQuantity: number
  imageUrl?: string
}

export interface iCategory {
  id: number
  name: string
  code: string
}

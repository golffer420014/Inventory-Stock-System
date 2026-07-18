import { Model } from '@/models/base.model.js'

export class Product extends Model {
  static override table = 'products'
  static override numericFields = ['price']

  sku!: string
  name!: string
  brand!: string
  categoryId!: number
  unit!: string
  price!: number
  stockQuantity!: number
  imageUrl?: string | null
  createdAt!: string
  updatedAt!: string
}

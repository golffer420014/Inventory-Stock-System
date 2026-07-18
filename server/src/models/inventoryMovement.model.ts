import { Model } from '@/models/base.model.js'
import type { tInventoryMovementType } from '@/types/inventory.types.js'

export class InventoryMovement extends Model {
  static override table = 'inventory_movements'
  static override readonlyFields = ['id', 'createdAt']

  productId!: number
  type!: tInventoryMovementType
  quantity!: number
  note?: string | null
  createdAt!: string
}

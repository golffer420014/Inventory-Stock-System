export type tInventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface iInventoryMovement {
  id: number
  productId: number
  type: tInventoryMovementType
  quantity: number
  note?: string
  createdAt: string
}

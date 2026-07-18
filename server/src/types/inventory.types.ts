export type tInventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface iInventoryMovement {
  id: number
  productId: number
  type: tInventoryMovementType
  quantity: number
  note?: string
  createdAt: string
}

export interface iStockMovementInput {
  productId: number
  quantity: number
  note?: string
}

export interface iStockAdjustmentInput {
  productId: number
  /** ส่วนต่างที่จะปรับ เป็นค่าบวก (เพิ่ม) หรือค่าลบ (ลด) ก็ได้ */
  quantity: number
  note?: string
}

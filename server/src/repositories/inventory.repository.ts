import { pool } from '@/config/database.js'
import { LOW_STOCK_THRESHOLD } from '@/repositories/dashboard.repository.js'
import { InventoryMovement } from '@/models/inventoryMovement.model.js'
import type { iInventoryMovement, tInventoryMovementType } from '@/types/inventory.types.js'
import { emitLowStock } from '@/utils/notificationBus.js'

const toApiMovement = (movement: InventoryMovement): iInventoryMovement => ({
  id: movement.id,
  productId: movement.productId,
  type: movement.type,
  quantity: movement.quantity,
  note: movement.note ?? undefined,
  createdAt: movement.createdAt,
})

/**
 * บันทึกรายการเคลื่อนไหวสต๊อก แล้วปรับ stock_quantity ของสินค้าในธุรกรรมเดียวกัน
 * lock แถวสินค้า (FOR UPDATE) กันสองรายการชิงปรับสต๊อกพร้อมกันแล้วยอดเพี้ยน
 * quantity ที่ส่งเข้ามาคือ "ส่วนต่าง" ที่จะบวกเข้ากับสต๊อกปัจจุบันเสมอ (OUT ให้ส่งเป็นค่าลบมาก่อนแล้ว)
 */
const applyMovement = async (
  type: tInventoryMovementType,
  productId: number,
  delta: number,
  quantity: number,
  note?: string
): Promise<iInventoryMovement> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const productResult = await client.query<{ stock_quantity: number; sku: string; name: string }>(
      'SELECT stock_quantity, sku, name FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    )
    const product = productResult.rows[0]
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND')
    }

    const newQuantity = product.stock_quantity + delta
    if (newQuantity < 0) {
      throw new Error('INSUFFICIENT_STOCK')
    }

    await client.query('UPDATE products SET stock_quantity = $1, updated_at = now() WHERE id = $2', [
      newQuantity,
      productId,
    ])

    const movement = await InventoryMovement.create({ productId, type, quantity, note: note ?? null }, client)

    await client.query('COMMIT')

    // แจ้งเตือนแบบ real-time เฉพาะตอน "ตัดข้าม" เกณฑ์สต๊อกต่ำ (ก่อนหน้ายังไม่ต่ำ แต่ตอนนี้ต่ำแล้ว) กันสแปมแจ้งซ้ำ
    if (product.stock_quantity > LOW_STOCK_THRESHOLD && newQuantity <= LOW_STOCK_THRESHOLD) {
      emitLowStock({ productId, sku: product.sku, name: product.name, stockQuantity: newQuantity })
    }

    return toApiMovement(movement)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export const inventoryRepository = {
  findAllMovements: async (): Promise<iInventoryMovement[]> => {
    const movements = await InventoryMovement.findAll({ orderBy: 'created_at DESC, id DESC' })
    return movements.map(toApiMovement)
  },

  createStockIn: async (productId: number, quantity: number, note?: string): Promise<iInventoryMovement> => {
    return applyMovement('IN', productId, quantity, quantity, note)
  },

  createStockOut: async (productId: number, quantity: number, note?: string): Promise<iInventoryMovement> => {
    return applyMovement('OUT', productId, -quantity, quantity, note)
  },

  createAdjustment: async (productId: number, quantity: number, note?: string): Promise<iInventoryMovement> => {
    return applyMovement('ADJUSTMENT', productId, quantity, quantity, note)
  },
}

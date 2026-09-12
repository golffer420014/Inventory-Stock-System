import { pool } from '@/config/database.js'
import type { tExecutor } from '@/models/base.model.js'
import { LowStockNotification } from '@/models/lowStockNotification.model.js'
import { LOW_STOCK_THRESHOLD } from '@/repositories/dashboard.repository.js'
import type { iLowStockEvent, iLowStockNotification } from '@/types/notification.types.js'

interface iLowStockNotificationRow {
  id: number
  product_id: number
  sku: string
  name: string
  stock_quantity: number
  is_read: boolean
  created_at: string
}

const toApiNotification = (row: iLowStockNotificationRow): iLowStockNotification => ({
  id: row.id,
  productId: row.product_id,
  sku: row.sku,
  name: row.name,
  stockQuantity: row.stock_quantity,
  isRead: row.is_read,
  createdAt: row.created_at,
})

export const notificationRepository = {
  /** สินค้าที่สต๊อกต่ำกว่าเกณฑ์ ณ ปัจจุบัน ให้ client poll เป็นระยะแทน SSE */
  findLowStockProducts: async (): Promise<iLowStockEvent[]> => {
    const result = await pool.query<{ id: number; sku: string; name: string; stock_quantity: number }>(
      'SELECT id, sku, name, stock_quantity FROM products WHERE stock_quantity <= $1 ORDER BY stock_quantity ASC',
      [LOW_STOCK_THRESHOLD]
    )

    return result.rows.map((row) => ({
      productId: row.id,
      sku: row.sku,
      name: row.name,
      stockQuantity: row.stock_quantity,
    }))
  },

  /**
   * บันทึกประวัติการแจ้งเตือนสินค้าใกล้หมด 1 รายการ
   * เรียกจาก transaction เดียวกับตอนตัดสต๊อกจริง (inventory.repository.ts applyMovement / salesOrder.repository.ts fulfill)
   * ผ่าน executor ที่เป็น client ของ transaction นั้น กันประวัติไม่ตรงกับสต๊อกที่ถูกตัดจริง ถ้า transaction rollback ประวัติก็ต้อง rollback ไปด้วย
   */
  recordLowStockEvent: async (event: iLowStockEvent, executor: tExecutor = pool): Promise<void> => {
    await LowStockNotification.create(
      {
        productId: event.productId,
        sku: event.sku,
        name: event.name,
        stockQuantity: event.stockQuantity,
        isRead: false,
      },
      executor
    )
  },

  /** ประวัติการแจ้งเตือนล่าสุด (ใหม่สุดก่อน) ให้ bell icon แสดงย้อนหลัง */
  findHistory: async (limit: number): Promise<iLowStockNotification[]> => {
    const result = await pool.query<iLowStockNotificationRow>(
      `SELECT * FROM low_stock_notifications ORDER BY created_at DESC, id DESC LIMIT $1`,
      [limit]
    )
    return result.rows.map(toApiNotification)
  },

  /** จำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน ให้ badge บน bell icon */
  countUnread: async (): Promise<number> => {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM low_stock_notifications WHERE is_read = false'
    )
    return Number(result.rows[0].count)
  },

  /** ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว เรียกตอนผู้ใช้เปิด dropdown กระดิ่ง */
  markAllRead: async (): Promise<void> => {
    await pool.query('UPDATE low_stock_notifications SET is_read = true WHERE is_read = false')
  },
}

import { pool } from '@/config/database.js'
import { LOW_STOCK_THRESHOLD } from '@/repositories/dashboard.repository.js'
import type { iLowStockEvent } from '@/types/notification.types.js'

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
}

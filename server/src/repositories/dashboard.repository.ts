import { pool } from '@/config/database.js'
import type { iDashboardSummary } from '@/types/dashboard.types.js'

/** ยังไม่มีคอลัมน์ reorder level ต่อสินค้า ใช้เกณฑ์คงที่นี้ร่วมกันทั้ง Dashboard และ Inventory Report ไปก่อน */
export const LOW_STOCK_THRESHOLD = 10

export const dashboardRepository = {
  /**
   * สรุปภาพรวมของระบบสำหรับหน้า Dashboard
   * ยอดขายรวมนับจาก Invoice ทั้งหมด (Invoice เกิดตอนยืนยันคำสั่งขาย ถือเป็นยอดขายที่บันทึกแล้ว)
   */
  getSummary: async (): Promise<iDashboardSummary> => {
    const [salesResult, productResult] = await Promise.all([
      pool.query<{ total: string | null }>('SELECT SUM(total_amount) AS total FROM invoices'),
      pool.query<{ total_products: string; total_stock: string | null; low_stock: string }>(
        `SELECT COUNT(*) AS total_products,
                COALESCE(SUM(stock_quantity), 0) AS total_stock,
                COUNT(*) FILTER (WHERE stock_quantity <= $1) AS low_stock
         FROM products`,
        [LOW_STOCK_THRESHOLD]
      ),
    ])

    const productRow = productResult.rows[0]

    return {
      totalSalesAmount: Number(salesResult.rows[0]?.total ?? 0),
      totalProducts: Number(productRow.total_products),
      totalStockQuantity: Number(productRow.total_stock ?? 0),
      lowStockProductCount: Number(productRow.low_stock),
    }
  },
}

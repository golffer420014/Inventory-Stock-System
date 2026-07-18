import { pool } from '@/config/database.js'
import { LOW_STOCK_THRESHOLD } from '@/repositories/dashboard.repository.js'
import type { iInventoryReport, iReportDateRange, iSalesReport } from '@/types/report.types.js'

export const reportRepository = {
  /**
   * รายงานยอดขายจาก Invoice ทั้งหมดในช่วงวันที่ที่กำหนด (ไม่ระบุ = ทั้งหมด)
   * endDate เป็นแบบรวมวันนั้นด้วย (inclusive) จึงเทียบกับวันถัดไปแทนการใช้ <=
   */
  getSalesReport: async ({ startDate, endDate }: iReportDateRange): Promise<iSalesReport> => {
    const result = await pool.query<{
      invoice_id: number
      invoice_number: string
      order_id: number
      order_number: string
      order_status: string
      total_amount: string
      created_at: string
    }>(
      `SELECT i.id AS invoice_id, i.invoice_number, so.id AS order_id, so.order_number,
              so.status AS order_status, i.total_amount, i.created_at
       FROM invoices i
       JOIN sales_orders so ON so.id = i.sales_order_id
       WHERE ($1::date IS NULL OR i.created_at >= $1::date)
         AND ($2::date IS NULL OR i.created_at < ($2::date + INTERVAL '1 day'))
       ORDER BY i.created_at DESC`,
      [startDate ?? null, endDate ?? null]
    )

    const rows = result.rows.map((row) => ({
      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,
      orderId: row.order_id,
      orderNumber: row.order_number,
      orderStatus: row.order_status,
      totalAmount: Number(row.total_amount),
      createdAt: row.created_at,
    }))

    return {
      rows,
      totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
      invoiceCount: rows.length,
    }
  },

  /**
   * รายงานคลังสินค้า: สต๊อกคงเหลือปัจจุบันของทุกสินค้า (ไม่ผูกกับช่วงวันที่)
   * รวมกับยอดเคลื่อนไหวสต๊อกแยกตามประเภท (IN/OUT/ADJUSTMENT) เฉพาะในช่วงวันที่ที่กำหนด
   */
  getInventoryReport: async ({ startDate, endDate }: iReportDateRange): Promise<iInventoryReport> => {
    const [productsResult, movementsResult] = await Promise.all([
      pool.query<{ id: number; sku: string; name: string; stock_quantity: number }>(
        'SELECT id, sku, name, stock_quantity FROM products ORDER BY name'
      ),
      pool.query<{ type: string; total: string }>(
        `SELECT type, COALESCE(SUM(quantity), 0) AS total
         FROM inventory_movements
         WHERE ($1::date IS NULL OR created_at >= $1::date)
           AND ($2::date IS NULL OR created_at < ($2::date + INTERVAL '1 day'))
         GROUP BY type`,
        [startDate ?? null, endDate ?? null]
      ),
    ])

    const products = productsResult.rows.map((row) => ({
      productId: row.id,
      sku: row.sku,
      name: row.name,
      stockQuantity: row.stock_quantity,
      isLowStock: row.stock_quantity <= LOW_STOCK_THRESHOLD,
    }))

    const totalsByType = Object.fromEntries(movementsResult.rows.map((row) => [row.type, Number(row.total)]))

    return {
      products,
      totalStockQuantity: products.reduce((sum, product) => sum + product.stockQuantity, 0),
      lowStockProductCount: products.filter((product) => product.isLowStock).length,
      totalIn: totalsByType.IN ?? 0,
      totalOut: totalsByType.OUT ?? 0,
      totalAdjustment: totalsByType.ADJUSTMENT ?? 0,
    }
  },
}

import { pool } from '@/config/database.js'
import type { iInvoice, iInvoiceDetail } from '@/types/salesOrder.types.js'

interface InvoiceRow {
  id: number
  invoice_number: string
  sales_order_id: number
  total_amount: string
  created_at: string
  items: { id: number; productId: number; quantity: number; unitPrice: number }[]
}

interface InvoiceDetailRow {
  id: number
  invoice_number: string
  order_number: string
  sales_order_id: number
  total_amount: string
  created_at: string
  items: { id: number; productId: number; sku: string; name: string; quantity: number; unitPrice: number }[]
}

const mapRow = (row: InvoiceRow): iInvoice => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  salesOrderId: row.sales_order_id,
  items: row.items,
  totalAmount: Number(row.total_amount),
  createdAt: row.created_at,
})

const mapDetailRow = (row: InvoiceDetailRow): iInvoiceDetail => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  orderNumber: row.order_number,
  salesOrderId: row.sales_order_id,
  items: row.items,
  totalAmount: Number(row.total_amount),
  createdAt: row.created_at,
})

export const invoiceRepository = {
  /**
   * รายการ Invoice ทั้งหมด พร้อมรายการสินค้า — items ดึงจาก sales_order_items ของ sales order ที่ผูกกัน
   * (ไม่มี invoice_items แยก เพราะรายการสินค้าคงที่ตั้งแต่ตอนยืนยันคำสั่งขายแล้ว)
   */
  findAll: async (): Promise<iInvoice[]> => {
    const result = await pool.query<InvoiceRow>(`
      SELECT i.id, i.invoice_number, i.sales_order_id, i.total_amount, i.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', soi.id, 'productId', soi.product_id, 'quantity', soi.quantity, 'unitPrice', soi.unit_price)
            ORDER BY soi.id
          ) FILTER (WHERE soi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM invoices i
      LEFT JOIN sales_order_items soi ON soi.sales_order_id = i.sales_order_id
      GROUP BY i.id
      ORDER BY i.id DESC
    `)
    return result.rows.map(mapRow)
  },

  /**
   * Invoice เดียวแบบละเอียด พร้อม SKU/ชื่อสินค้า และเลขที่ Sales Order — ใช้สำหรับพิมพ์เป็นเอกสาร PDF
   */
  findById: async (id: number): Promise<iInvoiceDetail | null> => {
    const result = await pool.query<InvoiceDetailRow>(
      `
      SELECT i.id, i.invoice_number, so.order_number, i.sales_order_id, i.total_amount, i.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', soi.id, 'productId', soi.product_id, 'sku', p.sku, 'name', p.name,
              'quantity', soi.quantity, 'unitPrice', soi.unit_price
            )
            ORDER BY soi.id
          ) FILTER (WHERE soi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM invoices i
      JOIN sales_orders so ON so.id = i.sales_order_id
      LEFT JOIN sales_order_items soi ON soi.sales_order_id = i.sales_order_id
      LEFT JOIN products p ON p.id = soi.product_id
      WHERE i.id = $1
      GROUP BY i.id, so.order_number
      `,
      [id]
    )
    const row = result.rows[0]
    return row ? mapDetailRow(row) : null
  },
}

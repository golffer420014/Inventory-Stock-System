import type { PoolClient } from 'pg'
import { pool } from '@/config/database.js'
import type { iSalesOrder, iSalesOrderItemInput, tSalesOrderStatus } from '@/types/salesOrder.types.js'

interface SalesOrderRow {
  id: number
  order_number: string
  status: tSalesOrderStatus
  total_amount: string
  created_at: string
  items: { id: number; productId: number; quantity: number; unitPrice: number }[]
  payments: { id: number; fileUrl: string; fileName: string; uploadedAt: string }[]
}

/**
 * ใช้ LEFT JOIN LATERAL แยก aggregate ของ items กับ payments คนละ subquery
 * เพราะทั้งคู่เป็น one-to-many กับ sales_orders — ถ้า LEFT JOIN ตรง ๆ พร้อมกันสองตาราง
 * จะเกิด cartesian product (เช่น 2 items x 3 payments = 6 แถว) ทำให้ json_agg นับซ้ำผิด
 */
const ORDER_WITH_ITEMS_QUERY = `
  SELECT so.id, so.order_number, so.status, so.total_amount, so.created_at,
    COALESCE(items_agg.items, '[]') AS items,
    COALESCE(payments_agg.payments, '[]') AS payments
  FROM sales_orders so
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object('id', soi.id, 'productId', soi.product_id, 'quantity', soi.quantity, 'unitPrice', soi.unit_price)
      ORDER BY soi.id
    ) AS items
    FROM sales_order_items soi
    WHERE soi.sales_order_id = so.id
  ) items_agg ON true
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object('id', sop.id, 'fileUrl', sop.file_url, 'fileName', sop.file_name, 'uploadedAt', sop.uploaded_at)
      ORDER BY sop.id
    ) AS payments
    FROM sales_order_payments sop
    WHERE sop.sales_order_id = so.id
  ) payments_agg ON true
`

const mapRow = (row: SalesOrderRow): iSalesOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status,
  items: row.items,
  payments: row.payments,
  totalAmount: Number(row.total_amount),
  createdAt: row.created_at,
})

const findByIdWithClient = async (client: PoolClient, id: number): Promise<iSalesOrder | null> => {
  const result = await client.query<SalesOrderRow>(`${ORDER_WITH_ITEMS_QUERY} WHERE so.id = $1`, [id])
  return result.rows[0] ? mapRow(result.rows[0]) : null
}

/**
 * lock แถว sales_order แล้วตรวจสอบว่าสถานะปัจจุบันอยู่ใน allowedStatuses ที่จะเปลี่ยนสถานะได้
 * ใช้ร่วมกันในทุก workflow transition (confirm/fulfill/cancel) กันแก้ไขซ้ำหรือข้ามขั้นตอน
 */
const lockOrderForTransition = async (
  client: PoolClient,
  id: number,
  allowedStatuses: tSalesOrderStatus[]
): Promise<void> => {
  const result = await client.query<{ status: tSalesOrderStatus }>(
    'SELECT status FROM sales_orders WHERE id = $1 FOR UPDATE',
    [id]
  )
  const order = result.rows[0]
  if (!order) {
    throw new Error('SALES_ORDER_NOT_FOUND')
  }
  if (!allowedStatuses.includes(order.status)) {
    throw new Error('INVALID_STATUS')
  }
}

export const salesOrderRepository = {
  findAll: async (): Promise<iSalesOrder[]> => {
    const result = await pool.query<SalesOrderRow>(`${ORDER_WITH_ITEMS_QUERY} ORDER BY so.id DESC`)
    return result.rows.map(mapRow)
  },

  /**
   * สร้าง Sales Order สถานะ DRAFT พร้อมรายการสินค้า
   * ราคาต่อหน่วยเป็น snapshot จาก products.price ณ ตอนสร้าง ไม่รับราคาจาก client เพื่อกันการปลอมราคา
   */
  create: async (items: iSalesOrderItemInput[]): Promise<iSalesOrder> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const orderResult = await client.query<{ id: number }>(
        `INSERT INTO sales_orders DEFAULT VALUES RETURNING id`
      )
      const orderId = orderResult.rows[0].id

      let totalAmount = 0
      for (const item of items) {
        const productResult = await client.query<{ price: string }>('SELECT price FROM products WHERE id = $1', [
          item.productId,
        ])
        const product = productResult.rows[0]
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND')
        }

        const unitPrice = Number(product.price)
        totalAmount += unitPrice * item.quantity

        await client.query(
          `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, unitPrice]
        )
      }

      await client.query(
        `UPDATE sales_orders SET order_number = 'SO-' || LPAD(id::text, 6, '0'), total_amount = $1 WHERE id = $2`,
        [totalAmount, orderId]
      )

      const order = await findByIdWithClient(client, orderId)
      await client.query('COMMIT')
      return order as iSalesOrder
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /**
   * แนบไฟล์หลักฐานการชำระเงินให้ Sales Order (ทำได้เฉพาะสถานะ DRAFT — ต้องแนบก่อนยืนยันคำสั่งขาย)
   */
  addPayment: async (id: number, fileUrl: string, fileName: string): Promise<iSalesOrder> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      await lockOrderForTransition(client, id, ['DRAFT'])

      await client.query(
        `INSERT INTO sales_order_payments (sales_order_id, file_url, file_name) VALUES ($1, $2, $3)`,
        [id, fileUrl, fileName]
      )

      const order = await findByIdWithClient(client, id)
      await client.query('COMMIT')
      return order as iSalesOrder
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /**
   * ยืนยันคำสั่งขาย (DRAFT -> CONFIRMED) แล้วสร้าง Invoice จากยอดรวมของคำสั่งขายนี้อัตโนมัติ
   * ต้องมีไฟล์หลักฐานการชำระเงินแนบไว้อย่างน้อย 1 ไฟล์ก่อน ถึงจะยืนยันได้ (จำลองขั้นตอนตรวจสอบการชำระเงินจริง)
   */
  confirm: async (id: number): Promise<iSalesOrder> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      await lockOrderForTransition(client, id, ['DRAFT'])

      const paymentCountResult = await client.query<{ count: string }>(
        'SELECT COUNT(*) FROM sales_order_payments WHERE sales_order_id = $1',
        [id]
      )
      if (Number(paymentCountResult.rows[0].count) === 0) {
        throw new Error('PAYMENT_REQUIRED')
      }

      await client.query(`UPDATE sales_orders SET status = 'CONFIRMED', updated_at = now() WHERE id = $1`, [id])

      const invoiceResult = await client.query<{ id: number }>(
        `INSERT INTO invoices (sales_order_id, total_amount)
         SELECT id, total_amount FROM sales_orders WHERE id = $1
         RETURNING id`,
        [id]
      )
      const invoiceId = invoiceResult.rows[0].id
      await client.query(`UPDATE invoices SET invoice_number = 'INV-' || LPAD(id::text, 6, '0') WHERE id = $1`, [
        invoiceId,
      ])

      const order = await findByIdWithClient(client, id)
      await client.query('COMMIT')
      return order as iSalesOrder
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /**
   * ให้คลังดำเนินการ (CONFIRMED -> FULFILLED) ตัดสต๊อกสินค้าทุกรายการในคำสั่งขาย
   * และบันทึกเป็นรายการเคลื่อนไหวสต๊อกประเภท OUT ในธุรกรรมเดียวกัน ถ้าสต๊อกสินค้าใดไม่พอจะ rollback ทั้งหมด
   */
  fulfill: async (id: number): Promise<iSalesOrder> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      await lockOrderForTransition(client, id, ['CONFIRMED'])

      const orderNumberResult = await client.query<{ order_number: string }>(
        'SELECT order_number FROM sales_orders WHERE id = $1',
        [id]
      )
      const orderNumber = orderNumberResult.rows[0].order_number

      const itemsResult = await client.query<{ product_id: number; quantity: number }>(
        'SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = $1',
        [id]
      )

      for (const item of itemsResult.rows) {
        const productResult = await client.query<{ stock_quantity: number }>(
          'SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        )
        const product = productResult.rows[0]
        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND')
        }

        const newQuantity = product.stock_quantity - item.quantity
        if (newQuantity < 0) {
          throw new Error('INSUFFICIENT_STOCK')
        }

        await client.query('UPDATE products SET stock_quantity = $1, updated_at = now() WHERE id = $2', [
          newQuantity,
          item.product_id,
        ])

        await client.query(
          `INSERT INTO inventory_movements (product_id, type, quantity, note)
           VALUES ($1, 'OUT', $2, $3)`,
          [item.product_id, item.quantity, `Sales Order ${orderNumber}`]
        )
      }

      await client.query(`UPDATE sales_orders SET status = 'FULFILLED', updated_at = now() WHERE id = $1`, [id])

      const order = await findByIdWithClient(client, id)
      await client.query('COMMIT')
      return order as iSalesOrder
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /**
   * ยกเลิกคำสั่งขาย ทำได้เฉพาะสถานะ DRAFT หรือ CONFIRMED เท่านั้น (ยังไม่ตัดสต๊อก)
   */
  cancel: async (id: number): Promise<iSalesOrder> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      await lockOrderForTransition(client, id, ['DRAFT', 'CONFIRMED'])

      await client.query(`UPDATE sales_orders SET status = 'CANCELLED', updated_at = now() WHERE id = $1`, [id])

      const order = await findByIdWithClient(client, id)
      await client.query('COMMIT')
      return order as iSalesOrder
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
}

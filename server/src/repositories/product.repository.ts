import type { PoolClient } from 'pg'
import { pool } from '@/config/database.js'
import type { iProduct, iProductInput } from '@/types/product.types.js'

interface ProductRow {
  id: number
  sku: string
  name: string
  brand: string
  category_id: number
  unit: string
  price: string
  stock_quantity: number
  image_url: string | null
}

const mapRow = (row: ProductRow): iProduct => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  brand: row.brand,
  categoryId: row.category_id,
  unit: row.unit,
  price: Number(row.price),
  stockQuantity: row.stock_quantity,
  imageUrl: row.image_url ?? undefined,
})

/**
 * สร้าง SKU ถัดไปของหมวดหมู่ = code ของหมวดหมู่ + running number (นับต่อจากตัวที่มากสุดที่มีอยู่)
 * ต้องเรียกหลังจาก lock แถวหมวดหมู่ (FOR UPDATE) แล้วเท่านั้น กันสินค้าสองรายการชิง running number เดียวกัน
 */
const nextSku = async (client: PoolClient, categoryId: number, categoryCode: string): Promise<string> => {
  const result = await client.query<{ sku: string }>('SELECT sku FROM products WHERE category_id = $1', [
    categoryId,
  ])

  const prefix = `${categoryCode}-`
  const maxNumber = result.rows.reduce((max, row) => {
    if (!row.sku.startsWith(prefix)) return max
    const num = Number(row.sku.slice(prefix.length))
    return Number.isFinite(num) && num > max ? num : max
  }, 0)

  return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`
}

export const productRepository = {
  findAll: async (): Promise<iProduct[]> => {
    const result = await pool.query<ProductRow>('SELECT * FROM products ORDER BY id')
    return result.rows.map(mapRow)
  },

  create: async (input: iProductInput): Promise<iProduct> => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const categoryResult = await client.query<{ code: string }>(
        'SELECT code FROM categories WHERE id = $1 FOR UPDATE',
        [input.categoryId]
      )
      const category = categoryResult.rows[0]
      if (!category) {
        throw new Error('CATEGORY_NOT_FOUND')
      }

      const sku = await nextSku(client, input.categoryId, category.code)

      const result = await client.query<ProductRow>(
        `INSERT INTO products (sku, name, brand, category_id, unit, price, stock_quantity, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          sku,
          input.name,
          input.brand,
          input.categoryId,
          input.unit,
          input.price,
          input.stockQuantity,
          input.imageUrl ?? null,
        ]
      )

      await client.query('COMMIT')
      return mapRow(result.rows[0])
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  update: async (id: number, input: iProductInput): Promise<iProduct | null> => {
    const result = await pool.query<ProductRow>(
      `UPDATE products
       SET name = $1, brand = $2, category_id = $3, unit = $4,
           price = $5, stock_quantity = $6, image_url = $7, updated_at = now()
       WHERE id = $8
       RETURNING *`,
      [
        input.name,
        input.brand,
        input.categoryId,
        input.unit,
        input.price,
        input.stockQuantity,
        input.imageUrl ?? null,
        id,
      ]
    )
    return result.rows[0] ? mapRow(result.rows[0]) : null
  },

  remove: async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

import type { PoolClient } from 'pg'
import { pool } from '@/config/database.js'
import { Product } from '@/models/product.model.js'
import type { iProduct, iProductInput } from '@/types/product.types.js'

const toApiProduct = (product: Product): iProduct => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  brand: product.brand,
  categoryId: product.categoryId,
  unit: product.unit,
  price: product.price,
  stockQuantity: product.stockQuantity,
  imageUrl: product.imageUrl ?? undefined,
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
    const products = await Product.findAll({ orderBy: 'id' })
    return products.map(toApiProduct)
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

      const product = await Product.create(
        {
          sku,
          name: input.name,
          brand: input.brand,
          categoryId: input.categoryId,
          unit: input.unit,
          price: input.price,
          stockQuantity: input.stockQuantity,
          imageUrl: input.imageUrl ?? null,
        },
        client
      )

      await client.query('COMMIT')
      return toApiProduct(product)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  update: async (id: number, input: iProductInput): Promise<iProduct | null> => {
    const product = await Product.updateById(id, {
      name: input.name,
      brand: input.brand,
      categoryId: input.categoryId,
      unit: input.unit,
      price: input.price,
      stockQuantity: input.stockQuantity,
      imageUrl: input.imageUrl ?? null,
    })
    return product ? toApiProduct(product) : null
  },

  remove: async (id: number): Promise<boolean> => {
    return Product.deleteById(id)
  },
}

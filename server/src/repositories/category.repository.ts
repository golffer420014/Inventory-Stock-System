import { pool } from '@/config/database.js'
import type { iCategory } from '@/types/product.types.js'

interface CategoryRow {
  id: number
  name: string
  code: string
}

const mapRow = (row: CategoryRow): iCategory => ({
  id: row.id,
  name: row.name,
  code: row.code,
})

export const categoryRepository = {
  findAll: async (): Promise<iCategory[]> => {
    const result = await pool.query<CategoryRow>('SELECT * FROM categories ORDER BY id')
    return result.rows.map(mapRow)
  },

  create: async (name: string, code: string): Promise<iCategory> => {
    const result = await pool.query<CategoryRow>(
      'INSERT INTO categories (name, code) VALUES ($1, $2) RETURNING *',
      [name, code]
    )
    return mapRow(result.rows[0])
  },

  update: async (id: number, name: string, code: string): Promise<iCategory | null> => {
    const result = await pool.query<CategoryRow>(
      'UPDATE categories SET name = $1, code = $2 WHERE id = $3 RETURNING *',
      [name, code, id]
    )
    return result.rows[0] ? mapRow(result.rows[0]) : null
  },

  remove: async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

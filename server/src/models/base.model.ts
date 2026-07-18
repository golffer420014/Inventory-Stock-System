import type { PoolClient } from 'pg'
import { pool } from '@/config/database.js'

/** query ได้ทั้งจาก pool ตรง ๆ หรือจาก client ที่อยู่กลาง transaction (BEGIN/COMMIT) เดิมของ repository */
export type tExecutor = Pick<PoolClient, 'query'>

export interface iFindAllOptions {
  /** ระบุได้เฉพาะ column/ทิศทางที่ฝั่ง repository กำหนดเอง ห้ามส่งค่าจาก user input ตรง ๆ (ไม่ผ่าน parameterized query) */
  orderBy?: string
  executor?: tExecutor
}

const camelToSnake = (key: string): string => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
const snakeToCamel = (key: string): string => key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())

/**
 * Active Record base ของทุก table ในระบบ ให้ Model ลูก extend แล้วประกาศ field ตาม column ของ table (camelCase)
 * ชื่อ field <-> ชื่อ column แปลงให้อัตโนมัติตาม naming convention (camelCase <-> snake_case) ไม่ต้องเขียน mapRow เอง
 *
 * ทุก method รับ `executor` (PoolClient) แทน pool ได้เสมอ เพื่อให้ใช้งานร่วมกับ transaction (BEGIN/COMMIT/FOR UPDATE)
 * ของ repository เดิมได้ — Model ไม่ผูกกับ pool ตรง ๆ
 */
export abstract class Model {
  /** ยังไม่ผ่าน hydrate/save = undefined เสมอ ถึงจะประกาศเป็น number (ใช้เช็คว่าเป็นแถวใหม่ใน save()) */
  id!: number

  static table: string

  /** field ที่ห้ามส่งเข้า INSERT/UPDATE เอง เพราะ DB จัดการให้ (serial id, timestamp default) */
  static readonlyFields: string[] = ['id', 'createdAt', 'updatedAt']

  /** column ที่เป็น NUMERIC/DECIMAL ใน DB — pg driver คืนค่าเป็น string เสมอ (กัน precision หาย) ต้องแปลงเป็น number เอง */
  static numericFields: string[] = []

  private static hydrate<T extends typeof Model>(this: T, row: Record<string, unknown>): InstanceType<T> {
    const instance = new (this as unknown as new () => InstanceType<T>)()

    for (const [column, value] of Object.entries(row)) {
      const field = snakeToCamel(column)
      const shouldCoerceNumber = this.numericFields.includes(field) && value !== null
      ;(instance as unknown as Record<string, unknown>)[field] = shouldCoerceNumber ? Number(value) : value
    }

    return instance
  }

  private static toColumns(data: Record<string, unknown>): { columns: string[]; values: unknown[] } {
    const keys = Object.keys(data).filter((key) => !this.readonlyFields.includes(key) && data[key] !== undefined)

    return {
      columns: keys.map((key) => camelToSnake(key)),
      values: keys.map((key) => data[key]),
    }
  }

  static async findAll<T extends typeof Model>(this: T, options: iFindAllOptions = {}): Promise<InstanceType<T>[]> {
    const executor = options.executor ?? pool
    const orderClause = options.orderBy ? ` ORDER BY ${options.orderBy}` : ''

    const result = await executor.query(`SELECT * FROM ${this.table}${orderClause}`)
    return result.rows.map((row) => this.hydrate(row))
  }

  static async findById<T extends typeof Model>(
    this: T,
    id: number,
    executor: tExecutor = pool
  ): Promise<InstanceType<T> | null> {
    const result = await executor.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id])
    return result.rows[0] ? this.hydrate(result.rows[0]) : null
  }

  /** หาแถวแรกที่ตรงกับเงื่อนไข เช่น Product.findOneBy({ sku: 'LAP-001' }) */
  static async findOneBy<T extends typeof Model>(
    this: T,
    conditions: Record<string, unknown>,
    executor: tExecutor = pool
  ): Promise<InstanceType<T> | null> {
    const keys = Object.keys(conditions)
    const where = keys.map((key, index) => `${camelToSnake(key)} = $${index + 1}`).join(' AND ')
    const values = keys.map((key) => conditions[key])

    const result = await executor.query(`SELECT * FROM ${this.table} WHERE ${where} LIMIT 1`, values)
    return result.rows[0] ? this.hydrate(result.rows[0]) : null
  }

  /** หาทุกแถวที่ตรงกับเงื่อนไข เช่น InventoryMovement.findManyBy({ productId: 1 }) */
  static async findManyBy<T extends typeof Model>(
    this: T,
    conditions: Record<string, unknown>,
    options: iFindAllOptions = {}
  ): Promise<InstanceType<T>[]> {
    const executor = options.executor ?? pool
    const keys = Object.keys(conditions)
    const where = keys.map((key, index) => `${camelToSnake(key)} = $${index + 1}`).join(' AND ')
    const values = keys.map((key) => conditions[key])
    const orderClause = options.orderBy ? ` ORDER BY ${options.orderBy}` : ''

    const result = await executor.query(`SELECT * FROM ${this.table} WHERE ${where}${orderClause}`, values)
    return result.rows.map((row) => this.hydrate(row))
  }

  static async create<T extends typeof Model>(
    this: T,
    data: Partial<InstanceType<T>>,
    executor: tExecutor = pool
  ): Promise<InstanceType<T>> {
    const { columns, values } = this.toColumns(data as Record<string, unknown>)
    const placeholders = values.map((_, index) => `$${index + 1}`)

    const result = await executor.query(
      `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    )
    return this.hydrate(result.rows[0])
  }

  static async updateById<T extends typeof Model>(
    this: T,
    id: number,
    data: Partial<InstanceType<T>>,
    executor: tExecutor = pool
  ): Promise<InstanceType<T> | null> {
    const { columns, values } = this.toColumns(data as Record<string, unknown>)
    const assignments = columns.map((column, index) => `${column} = $${index + 2}`)

    // table ที่มีคอลัมน์ updated_at (อยู่ใน readonlyFields) ให้ touch เวลาปัจจุบันอัตโนมัติทุกครั้งที่ update
    if (this.readonlyFields.includes('updatedAt')) {
      assignments.push('updated_at = now()')
    }

    const result = await executor.query(
      `UPDATE ${this.table} SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values]
    )
    return result.rows[0] ? this.hydrate(result.rows[0]) : null
  }

  static async deleteById(this: typeof Model, id: number, executor: tExecutor = pool): Promise<boolean> {
    const result = await executor.query(`DELETE FROM ${this.table} WHERE id = $1`, [id])
    return (result.rowCount ?? 0) > 0
  }

  /**
   * บันทึก instance ปัจจุบัน: ยังไม่มี id = insert แถวใหม่, มี id แล้ว = update แถวเดิม
   * แล้ว sync ค่าฟิลด์ทั้งหมดของ instance ให้ตรงกับแถวจริงใน DB หลังบันทึก (เช่น default ที่ DB generate ให้)
   */
  async save(executor: tExecutor = pool): Promise<this> {
    const ctor = this.constructor as typeof Model
    const data = { ...this } as Record<string, unknown>

    const saved =
      this.id === undefined ? await ctor.create(data, executor) : await ctor.updateById(this.id, data, executor)

    if (saved) Object.assign(this, saved)
    return this
  }

  /** ลบแถวของ instance นี้ออกจาก DB ตาม id */
  async remove(executor: tExecutor = pool): Promise<boolean> {
    if (this.id === undefined) return false
    const ctor = this.constructor as typeof Model
    return ctor.deleteById(this.id, executor)
  }
}

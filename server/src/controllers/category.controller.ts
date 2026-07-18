import type { NextFunction, Request, Response } from 'express'
import { categoryService } from '@/services/category.service.js'

interface PgError {
  code: string
}

const isPgError = (err: unknown): err is PgError =>
  typeof err === 'object' && err !== null && 'code' in err

/**
 * แปลง code ที่รับมาให้เป็นตัวพิมพ์ใหญ่ ตัดช่องว่าง ใช้เป็น prefix สร้าง SKU สินค้าในหมวดหมู่นี้
 */
const parseCategoryCode = (body: Record<string, unknown>): string => {
  const raw = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
  return raw
}

export const categoryController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.getAllCategories()
      res.json(categories)
    } catch (err) {
      next(err)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const code = parseCategoryCode(req.body)
    if (!name || !code) {
      res.status(400).json({ message: 'กรุณากรอกชื่อและ prefix ของหมวดหมู่' })
      return
    }

    try {
      const category = await categoryService.createCategory(name, code)
      res.status(201).json(category)
    } catch (err) {
      if (isPgError(err) && err.code === '23505') {
        res.status(409).json({ message: 'มีหมวดหมู่หรือ prefix นี้อยู่แล้ว' })
        return
      }
      next(err)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const code = parseCategoryCode(req.body)
    if (!name || !code) {
      res.status(400).json({ message: 'กรุณากรอกชื่อและ prefix ของหมวดหมู่' })
      return
    }

    try {
      const category = await categoryService.updateCategory(id, name, code)
      if (!category) {
        res.status(404).json({ message: 'ไม่พบหมวดหมู่นี้' })
        return
      }
      res.json(category)
    } catch (err) {
      if (isPgError(err) && err.code === '23505') {
        res.status(409).json({ message: 'มีหมวดหมู่หรือ prefix นี้อยู่แล้ว' })
        return
      }
      next(err)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)

    try {
      const deleted = await categoryService.deleteCategory(id)
      if (!deleted) {
        res.status(404).json({ message: 'ไม่พบหมวดหมู่นี้' })
        return
      }
      res.status(204).send()
    } catch (err) {
      if (isPgError(err) && err.code === '23503') {
        res.status(409).json({ message: 'ลบไม่ได้ เพราะมีสินค้าใช้หมวดหมู่นี้อยู่' })
        return
      }
      next(err)
    }
  },
}

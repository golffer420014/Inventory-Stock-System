import type { NextFunction, Request, Response } from 'express'
import { productService } from '@/services/product.service.js'
import type { iProductInput } from '@/types/product.types.js'

interface PgError {
  code: string
}

const isPgError = (err: unknown): err is PgError =>
  typeof err === 'object' && err !== null && 'code' in err

const parseProductInput = (body: Record<string, unknown>): iProductInput | null => {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const brand = typeof body.brand === 'string' ? body.brand.trim() : ''
  const unit = typeof body.unit === 'string' ? body.unit.trim() : ''
  const categoryId = Number(body.categoryId)
  const price = Number(body.price)
  const stockQuantity = Number(body.stockQuantity)
  const imageUrl = typeof body.imageUrl === 'string' && body.imageUrl.trim() ? body.imageUrl.trim() : undefined

  if (!name || !brand || !unit) return null
  if (!Number.isFinite(categoryId) || !Number.isFinite(price) || !Number.isFinite(stockQuantity)) return null

  return { name, brand, categoryId, unit, price, stockQuantity, imageUrl }
}

const isCategoryNotFoundError = (err: unknown): boolean => err instanceof Error && err.message === 'CATEGORY_NOT_FOUND'

export const productController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await productService.getAllProducts()
      res.json(products)
    } catch (err) {
      next(err)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    const input = parseProductInput(req.body)
    if (!input) {
      res.status(400).json({ message: 'ข้อมูลสินค้าไม่ครบหรือไม่ถูกต้อง' })
      return
    }

    try {
      const product = await productService.createProduct(input)
      res.status(201).json(product)
    } catch (err) {
      if (isCategoryNotFoundError(err)) {
        res.status(400).json({ message: 'ไม่พบหมวดหมู่สินค้านี้' })
        return
      }
      if (isPgError(err) && err.code === '23505') {
        res.status(409).json({ message: 'มี SKU นี้อยู่แล้ว กรุณาลองใหม่อีกครั้ง' })
        return
      }
      next(err)
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const input = parseProductInput(req.body)
    if (!input) {
      res.status(400).json({ message: 'ข้อมูลสินค้าไม่ครบหรือไม่ถูกต้อง' })
      return
    }

    try {
      const product = await productService.updateProduct(id, input)
      if (!product) {
        res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        return
      }
      res.json(product)
    } catch (err) {
      if (isPgError(err) && err.code === '23503') {
        res.status(400).json({ message: 'ไม่พบหมวดหมู่สินค้านี้' })
        return
      }
      next(err)
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)

    try {
      const deleted = await productService.deleteProduct(id)
      if (!deleted) {
        res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        return
      }
      res.status(204).send()
    } catch (err) {
      if (isPgError(err) && err.code === '23503') {
        res.status(409).json({ message: 'ลบไม่ได้ เพราะสินค้านี้มีประวัติการเคลื่อนไหวสต๊อกอยู่' })
        return
      }
      next(err)
    }
  },
}

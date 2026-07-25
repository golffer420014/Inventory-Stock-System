import type { NextFunction, Request, Response } from 'express'
import { inventoryService } from '@/services/inventory.service.js'
import type { iStockAdjustmentInput, iStockMovementInput } from '@/types/inventory.types.js'

const isProductNotFoundError = (err: unknown): boolean => err instanceof Error && err.message === 'PRODUCT_NOT_FOUND'
const isInsufficientStockError = (err: unknown): boolean => err instanceof Error && err.message === 'INSUFFICIENT_STOCK'

const parseNote = (body: Record<string, unknown>): string | undefined =>
  typeof body.note === 'string' && body.note.trim() ? body.note.trim() : undefined

/**
 * ใช้กับ Stock In / Stock Out - quantity ต้องเป็นจำนวนบวกเท่านั้น (ทิศทางกำหนดโดย type ของ movement)
 */
const parseMovementInput = (body: Record<string, unknown>): iStockMovementInput | null => {
  const productId = Number(body.productId)
  const quantity = Number(body.quantity)

  if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) return null

  return { productId, quantity, note: parseNote(body) }
}

/**
 * ใช้กับ Stock Adjustment - quantity เป็นส่วนต่างที่จะปรับ เป็นบวก (เพิ่ม) หรือลบ (ลด) ก็ได้ แต่ต้องไม่เท่ากับ 0
 */
const parseAdjustmentInput = (body: Record<string, unknown>): iStockAdjustmentInput | null => {
  const productId = Number(body.productId)
  const quantity = Number(body.quantity)

  if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity === 0) return null

  return { productId, quantity, note: parseNote(body) }
}

export const inventoryController = {
  listMovements: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const movements = await inventoryService.getAllMovements()
      res.json(movements)
    } catch (err) {
      next(err)
    }
  },

  stockIn: async (req: Request, res: Response, next: NextFunction) => {
    const input = parseMovementInput(req.body)
    if (!input) {
      res.status(400).json({ message: 'กรุณาเลือกสินค้าและระบุจำนวนที่รับเข้าให้ถูกต้อง' })
      return
    }

    try {
      const movement = await inventoryService.createStockIn(input)
      res.status(201).json(movement)
    } catch (err) {
      if (isProductNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        return
      }
      next(err)
    }
  },

  stockOut: async (req: Request, res: Response, next: NextFunction) => {
    const input = parseMovementInput(req.body)
    if (!input) {
      res.status(400).json({ message: 'กรุณาเลือกสินค้าและระบุจำนวนที่เบิกออกให้ถูกต้อง' })
      return
    }

    try {
      const movement = await inventoryService.createStockOut(input)
      res.status(201).json(movement)
    } catch (err) {
      if (isProductNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        return
      }
      if (isInsufficientStockError(err)) {
        res.status(409).json({ message: 'สต๊อกคงเหลือไม่พอสำหรับเบิกออกจำนวนนี้' })
        return
      }
      next(err)
    }
  },

  adjustment: async (req: Request, res: Response, next: NextFunction) => {
    const input = parseAdjustmentInput(req.body)
    if (!input) {
      res.status(400).json({ message: 'กรุณาเลือกสินค้าและระบุจำนวนที่ปรับให้ถูกต้อง' })
      return
    }

    try {
      const movement = await inventoryService.createAdjustment(input)
      res.status(201).json(movement)
    } catch (err) {
      if (isProductNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบสินค้านี้' })
        return
      }
      if (isInsufficientStockError(err)) {
        res.status(409).json({ message: 'ปรับสต๊อกไม่ได้ เพราะจะทำให้จำนวนติดลบ' })
        return
      }
      next(err)
    }
  },
}

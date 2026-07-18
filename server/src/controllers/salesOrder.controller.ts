import type { NextFunction, Request, Response } from 'express'
import { salesOrderService } from '@/services/salesOrder.service.js'
import type { iSalesOrderItemInput } from '@/types/salesOrder.types.js'

const isNotFoundError = (err: unknown): boolean =>
  err instanceof Error && (err.message === 'SALES_ORDER_NOT_FOUND' || err.message === 'PRODUCT_NOT_FOUND')
const isInvalidStatusError = (err: unknown): boolean => err instanceof Error && err.message === 'INVALID_STATUS'
const isInsufficientStockError = (err: unknown): boolean => err instanceof Error && err.message === 'INSUFFICIENT_STOCK'

/**
 * แปลง body.items ให้เป็นรายการสินค้าที่ถูกต้อง ต้องมีอย่างน้อย 1 รายการ productId/quantity เป็นตัวเลขและ quantity > 0
 */
const parseItemsInput = (body: Record<string, unknown>): iSalesOrderItemInput[] | null => {
  if (!Array.isArray(body.items) || body.items.length === 0) return null

  const items: iSalesOrderItemInput[] = []
  for (const raw of body.items as unknown[]) {
    if (typeof raw !== 'object' || raw === null) return null
    const item = raw as Record<string, unknown>
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)
    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) return null
    items.push({ productId, quantity })
  }

  return items
}

const parseOrderId = (req: Request): number => Number(req.params.id)

export const salesOrderController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const salesOrders = await salesOrderService.getAllSalesOrders()
      res.json(salesOrders)
    } catch (err) {
      next(err)
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    const items = parseItemsInput(req.body)
    if (!items) {
      res.status(400).json({ message: 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ พร้อมจำนวนที่ถูกต้อง' })
      return
    }

    try {
      const order = await salesOrderService.createSalesOrder(items)
      res.status(201).json(order)
    } catch (err) {
      if (isNotFoundError(err)) {
        res.status(400).json({ message: 'ไม่พบสินค้าบางรายการในคำสั่งขาย' })
        return
      }
      next(err)
    }
  },

  confirm: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await salesOrderService.confirmSalesOrder(parseOrderId(req))
      res.json(order)
    } catch (err) {
      if (isNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบคำสั่งขายนี้' })
        return
      }
      if (isInvalidStatusError(err)) {
        res.status(409).json({ message: 'ยืนยันได้เฉพาะคำสั่งขายที่ยังเป็นสถานะร่างเท่านั้น' })
        return
      }
      next(err)
    }
  },

  fulfill: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await salesOrderService.fulfillSalesOrder(parseOrderId(req))
      res.json(order)
    } catch (err) {
      if (isNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบคำสั่งขายนี้' })
        return
      }
      if (isInvalidStatusError(err)) {
        res.status(409).json({ message: 'ดำเนินการได้เฉพาะคำสั่งขายที่ยืนยันแล้วเท่านั้น' })
        return
      }
      if (isInsufficientStockError(err)) {
        res.status(409).json({ message: 'สต๊อกสินค้าบางรายการไม่พอสำหรับตัดสต๊อกคำสั่งขายนี้' })
        return
      }
      next(err)
    }
  },

  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await salesOrderService.cancelSalesOrder(parseOrderId(req))
      res.json(order)
    } catch (err) {
      if (isNotFoundError(err)) {
        res.status(404).json({ message: 'ไม่พบคำสั่งขายนี้' })
        return
      }
      if (isInvalidStatusError(err)) {
        res.status(409).json({ message: 'ยกเลิกไม่ได้ เพราะคำสั่งขายนี้ดำเนินการหรือยกเลิกไปแล้ว' })
        return
      }
      next(err)
    }
  },
}

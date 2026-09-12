import type { Request, Response } from 'express'
import { notificationService } from '@/services/notification.service.js'

const DEFAULT_HISTORY_LIMIT = 20

export const notificationController = {
  /**
   * คืนรายการสินค้าที่สต๊อกต่ำกว่าเกณฑ์ ณ ปัจจุบัน ให้ client poll เป็นระยะแทน SSE
   * (เดิมใช้ SSE ผ่าน EventEmitter ในหน่วยความจำ ใช้ไม่ได้บน serverless เพราะแต่ละ request อาจไปคนละ instance กัน)
   */
  getLowStock: async (_req: Request, res: Response) => {
    const products = await notificationService.getLowStockProducts()
    res.json(products)
  },

  /** ประวัติการแจ้งเตือนสินค้าใกล้หมดล่าสุด พร้อมจำนวนที่ยังไม่ได้อ่าน ให้ bell icon ดูย้อนหลัง */
  getHistory: async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || DEFAULT_HISTORY_LIMIT
    const history = await notificationService.getHistory(limit)
    res.json(history)
  },

  /** ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว เรียกตอนผู้ใช้เปิด dropdown กระดิ่ง */
  markAllRead: async (_req: Request, res: Response) => {
    await notificationService.markAllRead()
    res.status(204).send()
  },
}

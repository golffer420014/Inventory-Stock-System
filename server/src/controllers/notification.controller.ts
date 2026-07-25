import type { Request, Response } from 'express'
import { notificationService } from '@/services/notification.service.js'

export const notificationController = {
  /**
   * คืนรายการสินค้าที่สต๊อกต่ำกว่าเกณฑ์ ณ ปัจจุบัน ให้ client poll เป็นระยะแทน SSE
   * (เดิมใช้ SSE ผ่าน EventEmitter ในหน่วยความจำ ใช้ไม่ได้บน serverless เพราะแต่ละ request อาจไปคนละ instance กัน)
   */
  getLowStock: async (_req: Request, res: Response) => {
    const products = await notificationService.getLowStockProducts()
    res.json(products)
  },
}

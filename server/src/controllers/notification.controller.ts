import type { Request, Response } from 'express'
import { notificationBus } from '@/utils/notificationBus.js'
import type { iLowStockEvent } from '@/utils/notificationBus.js'

const HEARTBEAT_INTERVAL_MS = 25_000

export const notificationController = {
  /**
   * เปิด connection แบบ Server-Sent Events ค้างไว้ ส่ง event 'low-stock' แบบ real-time ทันทีที่มีสินค้าตัดข้ามเกณฑ์สต๊อกต่ำ
   * ไม่ผูกกับ role เพราะ Dashboard (ที่มาของแจ้งเตือนนี้) ทุก role ดูได้อยู่แล้ว และ EventSource ของ browser ส่ง custom header ไม่ได้
   */
  stream: (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const onLowStock = (event: iLowStockEvent) => {
      res.write(`event: low-stock\ndata: ${JSON.stringify(event)}\n\n`)
    }

    notificationBus.on('low-stock', onLowStock)

    // ping กัน proxy/browser ตัด connection ที่ idle นานเกินไป
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_INTERVAL_MS)

    req.on('close', () => {
      clearInterval(heartbeat)
      notificationBus.off('low-stock', onLowStock)
    })
  },
}

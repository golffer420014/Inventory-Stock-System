import { Router } from 'express'
import { notificationController } from '@/controllers/notification.controller.js'

export const notificationRoutes = Router()

// สินค้าที่สต๊อกต่ำกว่าเกณฑ์ ณ ปัจจุบัน — ทุก role ดูได้เหมือนสิทธิ์ Dashboard (README ข้อ 5), client poll เป็นระยะ
notificationRoutes.get('/low-stock', notificationController.getLowStock)

// ประวัติการแจ้งเตือนสินค้าใกล้หมด (bell icon) — ทุก role ดูได้เหมือนสิทธิ์ Dashboard เช่นกัน
notificationRoutes.get('/history', notificationController.getHistory)
notificationRoutes.post('/history/read', notificationController.markAllRead)

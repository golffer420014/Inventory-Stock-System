import { Router } from 'express'
import { notificationController } from '@/controllers/notification.controller.js'

export const notificationRoutes = Router()

// แจ้งเตือนสินค้าใกล้หมดแบบ real-time (SSE) — ทุก role ดูได้เหมือนสิทธิ์ Dashboard (README ข้อ 5)
notificationRoutes.get('/stream', notificationController.stream)

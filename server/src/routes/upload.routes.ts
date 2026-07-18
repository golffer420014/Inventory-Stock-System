import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { uploadController } from '@/controllers/upload.controller.js'
import { uploadImage } from '@/middlewares/upload.middleware.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const uploadRoutes = Router()

// อัปโหลดรูปสินค้า: Admin เท่านั้น (README ข้อ 5 — จัดการสินค้า)
uploadRoutes.post(
  '/',
  requireRole('Admin'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadImage(req, res, (err: unknown) => {
      if (err) {
        res.status(400).json({ message: err instanceof Error ? err.message : 'อัปโหลดไฟล์ไม่สำเร็จ' })
        return
      }
      next()
    })
  },
  uploadController.uploadImage
)

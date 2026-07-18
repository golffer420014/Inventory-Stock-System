import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { uploadController } from '@/controllers/upload.controller.js'
import { uploadImage } from '@/middlewares/upload.middleware.js'
import { requireRole } from '@/middlewares/role.middleware.js'

export const uploadRoutes = Router()

// อัปโหลดไฟล์ทั่วไป: Admin (รูปสินค้า), Sales (ไฟล์หลักฐานการชำระเงินของ Sales Order)
uploadRoutes.post(
  '/',
  requireRole('Admin', 'Sales'),
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

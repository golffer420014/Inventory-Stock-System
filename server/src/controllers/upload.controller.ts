import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { Request, Response } from 'express'
import { supabase, UPLOADS_BUCKET } from '@/config/supabase.js'

export const uploadController = {
  uploadImage: async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'ไม่พบไฟล์รูปภาพ' })
      return
    }

    const filename = `${randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`

    const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
    })

    if (error) {
      res.status(500).json({ message: 'อัปโหลดไฟล์ไม่สำเร็จ' })
      return
    }

    const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filename)
    res.status(201).json({ url: data.publicUrl })
  },
}

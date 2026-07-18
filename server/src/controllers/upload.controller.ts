import type { Request, Response } from 'express'

export const uploadController = {
  uploadImage: (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ message: 'ไม่พบไฟล์รูปภาพ' })
      return
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    res.status(201).json({ url })
  },
}

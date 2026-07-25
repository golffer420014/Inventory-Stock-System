import multer from 'multer'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (png, jpeg, webp, gif)'))
      return
    }
    cb(null, true)
  },
}).single('image')

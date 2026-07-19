import { http } from '@/services/http'

interface iUploadResult {
  url: string
}

export const uploadService = {
  uploadImage: (file: File) => http.upload<iUploadResult>('/uploads', 'image', file),
}

import axios from 'axios'
import { useRoleStore } from '@/stores/role'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

const client = axios.create({ baseURL: API_BASE_URL })

client.interceptors.request.use((config) => {
  const roleStore = useRoleStore()
  config.headers['x-demo-role'] = roleStore.currentRole
  return config
})

const parseErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data
    if (body && typeof body.message === 'string') return body.message
  }
  return fallback
}

export interface iDownloadResult {
  blob: Blob
  filename: string
}

/** ดึงชื่อไฟล์จาก Content-Disposition header เช่น 'attachment; filename="sales-report.csv"' */
const parseFilename = (contentDisposition: string | undefined, fallback: string): string => {
  const match = contentDisposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? fallback
}

export const http = {
  get: async <T>(path: string): Promise<T> => {
    try {
      const res = await client.get<T>(path)

      // หน่วงให้เห็น loading skeleton ชัดเจนขึ้น (dev/demo เท่านั้น ข้อมูลจริงมาเร็วเกินจะเห็น)
      await new Promise((resolve) => setTimeout(resolve, 500))

      return res.data
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `GET ${path} failed: ${status}`))
    }
  },

  post: async <T>(path: string, body: unknown): Promise<T> => {
    try {
      const res = await client.post<T>(path, body)
      return res.data
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `POST ${path} failed: ${status}`))
    }
  },

  put: async <T>(path: string, body: unknown): Promise<T> => {
    try {
      const res = await client.put<T>(path, body)
      return res.data
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `PUT ${path} failed: ${status}`))
    }
  },

  delete: async (path: string): Promise<void> => {
    try {
      await client.delete(path)
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `DELETE ${path} failed: ${status}`))
    }
  },

  /** ดาวน์โหลดไฟล์ (CSV/PDF) จาก endpoint ที่ตอบกลับเป็นไฟล์แทน JSON เช่น Export Report */
  download: async (path: string): Promise<iDownloadResult> => {
    try {
      const res = await client.get(path, { responseType: 'blob' })
      const filename = parseFilename(res.headers['content-disposition'], 'download')
      return { blob: res.data as Blob, filename }
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `GET ${path} failed: ${status}`))
    }
  },

  upload: async <T>(path: string, field: string, file: File): Promise<T> => {
    const formData = new FormData()
    formData.append(field, file)

    try {
      // ไม่ต้องตั้ง Content-Type เอง axios จะใส่ multipart boundary ให้อัตโนมัติเมื่อ body เป็น FormData
      const res = await client.post<T>(path, formData)
      return res.data
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      throw new Error(parseErrorMessage(error, `UPLOAD ${path} failed: ${status}`))
    }
  },
}

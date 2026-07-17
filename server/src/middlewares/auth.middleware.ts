import type { NextFunction, Request, Response } from 'express'
import type { tRole } from '@/types/role.types.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      role?: tRole
    }
  }
}

// Demo auth: อ่าน role จาก header เพื่อจำลองการเปลี่ยน role ของผู้ใช้งาน (ยังไม่มีระบบ login จริง)
export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const role = req.header('x-demo-role') as tRole | undefined
  req.role = role
  next()
}

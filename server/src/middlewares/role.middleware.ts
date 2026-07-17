import type { NextFunction, Request, Response } from 'express'
import type { tRole } from '@/types/role.types.js'

// ตรวจสอบสิทธิ์ตาม Permission Matrix (README ข้อ 5) ก่อนเข้าถึง route
export const requireRole = (...allowedRoles: tRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    next()
  }
}

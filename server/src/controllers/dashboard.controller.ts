import type { NextFunction, Request, Response } from 'express'
import { dashboardService } from '@/services/dashboard.service.js'

export const dashboardController = {
  summary: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await dashboardService.getSummary()
      res.json(summary)
    } catch (err) {
      next(err)
    }
  },
}

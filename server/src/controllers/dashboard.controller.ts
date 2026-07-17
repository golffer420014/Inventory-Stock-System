import type { Request, Response } from 'express'
import { dashboardService } from '@/services/dashboard.service.js'

export const dashboardController = {
  summary: async (_req: Request, res: Response) => {
    const summary = await dashboardService.getSummary()
    res.json(summary)
  },
}

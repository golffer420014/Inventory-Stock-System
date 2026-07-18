import { dashboardRepository } from '@/repositories/dashboard.repository.js'
import type { iDashboardSummary } from '@/types/dashboard.types.js'

export const dashboardService = {
  getSummary: async (): Promise<iDashboardSummary> => {
    return dashboardRepository.getSummary()
  },
}

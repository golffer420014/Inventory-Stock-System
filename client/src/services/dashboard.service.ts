import { http } from '@/services/http'
import type { iDashboardSummary } from '@/types/dashboard.types'

export const dashboardService = {
  getSummary: () => http.get<iDashboardSummary>('/dashboard/summary'),
}

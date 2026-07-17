import type { iDashboardSummary } from '@/types/dashboard.types.js'

export const dashboardService = {
  getSummary: async (): Promise<iDashboardSummary> => {
    return {
      totalSalesAmount: 0,
      totalProducts: 0,
      totalStockQuantity: 0,
      lowStockProductCount: 0,
    }
  },
}

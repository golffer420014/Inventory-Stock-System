import { reportRepository } from '@/repositories/report.repository.js'
import type { iInventoryReport, iReportDateRange, iSalesReport } from '@/types/report.types.js'

export const reportService = {
  getSalesReport: async (range: iReportDateRange): Promise<iSalesReport> => {
    return reportRepository.getSalesReport(range)
  },

  getInventoryReport: async (range: iReportDateRange): Promise<iInventoryReport> => {
    return reportRepository.getInventoryReport(range)
  },
}

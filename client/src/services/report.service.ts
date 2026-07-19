import { http } from '@/services/http'
import type { iInventoryReport, iReportDateRange, iSalesReport } from '@/types/report.types'

const toQueryString = (range: iReportDateRange): string => {
  const params = new URLSearchParams()
  if (range.startDate) params.set('startDate', range.startDate)
  if (range.endDate) params.set('endDate', range.endDate)

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const reportService = {
  getSalesReport: (range: iReportDateRange = {}) => http.get<iSalesReport>(`/reports/sales${toQueryString(range)}`),
  getInventoryReport: (range: iReportDateRange = {}) =>
    http.get<iInventoryReport>(`/reports/inventory${toQueryString(range)}`),
  downloadSalesCsv: (range: iReportDateRange = {}) => http.download(`/reports/sales/csv${toQueryString(range)}`),
  downloadInventoryCsv: (range: iReportDateRange = {}) =>
    http.download(`/reports/inventory/csv${toQueryString(range)}`),
  downloadSalesPdf: (range: iReportDateRange = {}) => http.download(`/reports/sales/pdf${toQueryString(range)}`),
  downloadInventoryPdf: (range: iReportDateRange = {}) =>
    http.download(`/reports/inventory/pdf${toQueryString(range)}`),
}

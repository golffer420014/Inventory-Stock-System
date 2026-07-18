import type { NextFunction, Request, Response } from 'express'
import { reportService } from '@/services/report.service.js'
import type { iInventoryReport, iReportDateRange, iSalesReport } from '@/types/report.types.js'
import { toCsv } from '@/utils/csv.util.js'
import { toIsoString } from '@/utils/date.util.js'
import { loadTemplate, renderPdf } from '@/utils/pdf.util.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const parseDateRange = (query: Request['query']): iReportDateRange | null => {
  const startDate = typeof query.startDate === 'string' ? query.startDate : undefined
  const endDate = typeof query.endDate === 'string' ? query.endDate : undefined

  if (startDate && !DATE_PATTERN.test(startDate)) return null
  if (endDate && !DATE_PATTERN.test(endDate)) return null

  return { startDate, endDate }
}

const sendCsv = (res: Response, filenamePrefix: string, csv: string): void => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filenamePrefix}-${Date.now()}.csv"`)
  res.send(csv)
}

const salesReportToCsv = (report: iSalesReport): string => {
  const rows = report.rows.map((row) => [
    row.invoiceNumber,
    row.orderNumber,
    row.orderStatus,
    row.totalAmount,
    toIsoString(row.createdAt),
  ])

  return toCsv(['Invoice Number', 'Order Number', 'Order Status', 'Total Amount', 'Created At'], rows)
}

const inventoryReportToCsv = (report: iInventoryReport): string => {
  const summaryRows: (string | number)[][] = [
    ['Total Stock Quantity', report.totalStockQuantity],
    ['Low Stock Product Count', report.lowStockProductCount],
    ['Total In', report.totalIn],
    ['Total Out', report.totalOut],
    ['Total Adjustment', report.totalAdjustment],
    [],
    ['SKU', 'Name', 'Stock Quantity', 'Low Stock'],
  ]

  const productRows = report.products.map((product) => [
    product.sku,
    product.name,
    product.stockQuantity,
    product.isLowStock ? 'Yes' : 'No',
  ])

  return toCsv([], [...summaryRows, ...productRows])
}

const sendPdf = (res: Response, filenamePrefix: string, pdf: Buffer): void => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filenamePrefix}-${Date.now()}.pdf"`)
  res.send(pdf)
}

const formatDateRangeText = (range: iReportDateRange): string | null => {
  if (!range.startDate && !range.endDate) return null
  return `${range.startDate ?? '...'} ถึง ${range.endDate ?? '...'}`
}

const salesReportToPdf = (report: iSalesReport, range: iReportDateRange): Promise<Buffer> => {
  return renderPdf(loadTemplate('salesReport'), {
    generatedAt: new Date(),
    dateRangeText: formatDateRangeText(range),
    ...report,
  })
}

const inventoryReportToPdf = (report: iInventoryReport, range: iReportDateRange): Promise<Buffer> => {
  return renderPdf(loadTemplate('inventoryReport'), {
    generatedAt: new Date(),
    dateRangeText: formatDateRangeText(range),
    ...report,
  })
}

export const reportController = {
  sales: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getSalesReport(range)
      res.json(report)
    } catch (err) {
      next(err)
    }
  },

  inventory: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getInventoryReport(range)
      res.json(report)
    } catch (err) {
      next(err)
    }
  },

  salesCsv: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getSalesReport(range)
      sendCsv(res, 'sales-report', salesReportToCsv(report))
    } catch (err) {
      next(err)
    }
  },

  inventoryCsv: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getInventoryReport(range)
      sendCsv(res, 'inventory-report', inventoryReportToCsv(report))
    } catch (err) {
      next(err)
    }
  },

  salesPdf: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getSalesReport(range)
      const pdf = await salesReportToPdf(report, range)
      sendPdf(res, 'sales-report', pdf)
    } catch (err) {
      next(err)
    }
  },

  inventoryPdf: async (req: Request, res: Response, next: NextFunction) => {
    const range = parseDateRange(req.query)
    if (!range) {
      res.status(400).json({ message: 'รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD' })
      return
    }

    try {
      const report = await reportService.getInventoryReport(range)
      const pdf = await inventoryReportToPdf(report, range)
      sendPdf(res, 'inventory-report', pdf)
    } catch (err) {
      next(err)
    }
  },
}

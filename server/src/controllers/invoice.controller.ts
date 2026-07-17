import type { Request, Response } from 'express'
import { invoiceService } from '@/services/invoice.service.js'

export const invoiceController = {
  list: async (_req: Request, res: Response) => {
    const invoices = await invoiceService.getAllInvoices()
    res.json(invoices)
  },
}

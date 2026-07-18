import type { NextFunction, Request, Response } from 'express'
import { invoiceService } from '@/services/invoice.service.js'
import { loadTemplate, renderPdf } from '@/utils/pdf.util.js'

const sendPdf = (res: Response, filenamePrefix: string, pdf: Buffer): void => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filenamePrefix}-${Date.now()}.pdf"`)
  res.send(pdf)
}

export const invoiceController = {
  list: async (_req: Request, res: Response) => {
    const invoices = await invoiceService.getAllInvoices()
    res.json(invoices)
  },

  pdf: async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'รหัส Invoice ไม่ถูกต้อง' })
      return
    }

    try {
      const invoice = await invoiceService.getInvoiceById(id)
      if (!invoice) {
        res.status(404).json({ message: 'ไม่พบ Invoice นี้' })
        return
      }

      const pdf = await renderPdf(loadTemplate('invoice'), {
        generatedAt: new Date(),
        ...invoice,
        items: invoice.items.map((item) => ({ ...item, subtotal: item.quantity * item.unitPrice })),
      })
      sendPdf(res, invoice.invoiceNumber, pdf)
    } catch (err) {
      next(err)
    }
  },
}

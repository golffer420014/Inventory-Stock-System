import { invoiceRepository } from '@/repositories/invoice.repository.js'
import type { iInvoice, iInvoiceDetail } from '@/types/salesOrder.types.js'

export const invoiceService = {
  getAllInvoices: async (): Promise<iInvoice[]> => {
    return invoiceRepository.findAll()
  },

  getInvoiceById: async (id: number): Promise<iInvoiceDetail | null> => {
    return invoiceRepository.findById(id)
  },
}

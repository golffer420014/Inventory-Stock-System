import { invoiceRepository } from '@/repositories/invoice.repository.js'
import type { iInvoice } from '@/types/salesOrder.types.js'

export const invoiceService = {
  getAllInvoices: async (): Promise<iInvoice[]> => {
    return invoiceRepository.findAll()
  },
}

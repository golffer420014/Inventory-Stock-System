import { http } from '@/services/http'
import type { iInvoice } from '@/types/salesOrder.types'

export const invoiceService = {
  getAllInvoices: () => http.get<iInvoice[]>('/invoices'),
  downloadInvoicePdf: (id: number) => http.download(`/invoices/${id}/pdf`),
}

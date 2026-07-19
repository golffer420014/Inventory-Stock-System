import { http } from '@/services/http'
import type { iSalesOrder, iSalesOrderInput, iSalesOrderPaymentInput } from '@/types/salesOrder.types'

export const salesOrderService = {
  getAllSalesOrders: () => http.get<iSalesOrder[]>('/sales-orders'),
  createSalesOrder: (input: iSalesOrderInput) => http.post<iSalesOrder>('/sales-orders', input),
  addPayment: (id: number, input: iSalesOrderPaymentInput) =>
    http.post<iSalesOrder>(`/sales-orders/${id}/payments`, input),
  confirmSalesOrder: (id: number) => http.post<iSalesOrder>(`/sales-orders/${id}/confirm`, {}),
  fulfillSalesOrder: (id: number) => http.post<iSalesOrder>(`/sales-orders/${id}/fulfill`, {}),
  cancelSalesOrder: (id: number) => http.post<iSalesOrder>(`/sales-orders/${id}/cancel`, {}),
}

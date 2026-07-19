import { acceptHMRUpdate, defineStore } from 'pinia'
import { invoiceService } from '@/services/invoice.service'
import type { iInvoice } from '@/types/salesOrder.types'
import { triggerBrowserDownload } from '@/utils/download.util'
import { previewPdf } from '@/utils/print.util'

interface iInvoiceStore {
  invoiceList: iInvoice[]
  isLoading: boolean
  error: string | null
}

export const useInvoiceStore = defineStore('invoice', {
  state: (): iInvoiceStore => ({
    invoiceList: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดรายการ Invoice ทั้งหมด
     */
    async fetchInvoices() {
      this.isLoading = true
      this.error = null

      try {
        this.invoiceList = await invoiceService.getAllInvoices()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ดาวน์โหลด Invoice ที่ระบุเป็นไฟล์ PDF
     */
    async exportInvoicePdf(id: number) {
      const { blob, filename } = await invoiceService.downloadInvoicePdf(id)
      triggerBrowserDownload(blob, filename)
    },

    /**
     * เปิด print preview ของ Invoice ที่ระบุ (PDF) ด้วย printJS แทนการดาวน์โหลดไฟล์
     */
    async previewInvoicePdf(id: number) {
      const { blob } = await invoiceService.downloadInvoicePdf(id)
      await previewPdf(blob, 'Invoice')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInvoiceStore, import.meta.hot))
}

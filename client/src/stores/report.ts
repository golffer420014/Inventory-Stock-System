import { acceptHMRUpdate, defineStore } from 'pinia'
import { reportService } from '@/services/report.service'
import type { iInventoryReport, iReportDateRange, iSalesReport } from '@/types/report.types'
import { triggerBrowserDownload } from '@/utils/download.util'
import { previewPdf } from '@/utils/print.util'

interface iReportStore {
  salesReport: iSalesReport | null
  inventoryReport: iInventoryReport | null
  isLoading: boolean
  error: string | null
  isExporting: boolean
  exportError: string | null
}

export const useReportStore = defineStore('report', {
  state: (): iReportStore => ({
    salesReport: null,
    inventoryReport: null,
    isLoading: false,
    error: null,
    isExporting: false,
    exportError: null,
  }),

  actions: {
    /**
     * โหลดรายงานยอดขาย ตามช่วงวันที่ที่กำหนด (ไม่ระบุ = ทั้งหมด)
     */
    async fetchSalesReport(range: iReportDateRange = {}) {
      this.isLoading = true
      this.error = null

      try {
        this.salesReport = await reportService.getSalesReport(range)
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * โหลดรายงานคลังสินค้า ตามช่วงวันที่ที่กำหนด (ไม่ระบุ = ทั้งหมด)
     */
    async fetchInventoryReport(range: iReportDateRange = {}) {
      this.isLoading = true
      this.error = null

      try {
        this.inventoryReport = await reportService.getInventoryReport(range)
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * ดาวน์โหลดรายงานยอดขายเป็นไฟล์ CSV ตามช่วงวันที่ที่กำหนด
     */
    async exportSalesCsv(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob, filename } = await reportService.downloadSalesCsv(range)
        triggerBrowserDownload(blob, filename)
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'ดาวน์โหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },

    /**
     * ดาวน์โหลดรายงานคลังสินค้าเป็นไฟล์ CSV ตามช่วงวันที่ที่กำหนด
     */
    async exportInventoryCsv(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob, filename } = await reportService.downloadInventoryCsv(range)
        triggerBrowserDownload(blob, filename)
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'ดาวน์โหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },

    /**
     * ดาวน์โหลดรายงานยอดขายเป็นไฟล์ PDF ตามช่วงวันที่ที่กำหนด
     */
    async exportSalesPdf(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob, filename } = await reportService.downloadSalesPdf(range)
        triggerBrowserDownload(blob, filename)
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'ดาวน์โหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },

    /**
     * ดาวน์โหลดรายงานคลังสินค้าเป็นไฟล์ PDF ตามช่วงวันที่ที่กำหนด
     */
    async exportInventoryPdf(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob, filename } = await reportService.downloadInventoryPdf(range)
        triggerBrowserDownload(blob, filename)
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'ดาวน์โหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },

    /**
     * เปิด print preview ของรายงานยอดขาย (PDF) ด้วย printJS แทนการดาวน์โหลดไฟล์
     */
    async previewSalesPdf(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob } = await reportService.downloadSalesPdf(range)
        await previewPdf(blob, 'Sales Report')
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'เปิด PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },

    /**
     * เปิด print preview ของรายงานคลังสินค้า (PDF) ด้วย printJS แทนการดาวน์โหลดไฟล์
     */
    async previewInventoryPdf(range: iReportDateRange = {}) {
      this.isExporting = true
      this.exportError = null

      try {
        const { blob } = await reportService.downloadInventoryPdf(range)
        await previewPdf(blob, 'Inventory Report')
      } catch (e) {
        this.exportError = e instanceof Error ? e.message : 'เปิด PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isExporting = false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportStore, import.meta.hot))
}

import { acceptHMRUpdate, defineStore } from 'pinia'
import { salesOrderService } from '@/services/salesOrder.service'
import { uploadService } from '@/services/upload.service'
import type { iSalesOrder, iSalesOrderInput } from '@/types/salesOrder.types'

interface iSalesOrderStore {
  salesOrderList: iSalesOrder[]
  isLoading: boolean
  error: string | null
}

export const useSalesOrderStore = defineStore('salesOrder', {
  state: (): iSalesOrderStore => ({
    salesOrderList: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดรายการ Sales Order ทั้งหมด
     */
    async fetchSalesOrders() {
      this.isLoading = true
      this.error = null

      try {
        this.salesOrderList = await salesOrderService.getAllSalesOrders()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้าง Sales Order ใหม่ (สถานะ DRAFT) แล้วเติมเข้า list ทันที
     */
    async createSalesOrder(input: iSalesOrderInput) {
      const order = await salesOrderService.createSalesOrder(input)
      this.salesOrderList.unshift(order)
    },

    /**
     * แนบไฟล์หลักฐานการชำระเงินให้ Sales Order — อัปโหลดไฟล์ก่อนแล้วค่อยบันทึก URL ผูกกับคำสั่งขาย แล้วอัปเดต list ทันที
     */
    async attachPayment(id: number, file: File) {
      const uploaded = await uploadService.uploadImage(file)
      const order = await salesOrderService.addPayment(id, { fileUrl: uploaded.url, fileName: file.name })
      const index = this.salesOrderList.findIndex((o) => o.id === id)
      if (index !== -1) this.salesOrderList[index] = order
    },

    /**
     * ยืนยันคำสั่งขาย (DRAFT -> CONFIRMED) แล้วอัปเดตสถานะใน list ทันที
     */
    async confirmSalesOrder(id: number) {
      const order = await salesOrderService.confirmSalesOrder(id)
      const index = this.salesOrderList.findIndex((o) => o.id === id)
      if (index !== -1) this.salesOrderList[index] = order
    },

    /**
     * ให้คลังดำเนินการตัดสต๊อก (CONFIRMED -> FULFILLED) แล้วอัปเดตสถานะใน list ทันที
     */
    async fulfillSalesOrder(id: number) {
      const order = await salesOrderService.fulfillSalesOrder(id)
      const index = this.salesOrderList.findIndex((o) => o.id === id)
      if (index !== -1) this.salesOrderList[index] = order
    },

    /**
     * ยกเลิกคำสั่งขาย แล้วอัปเดตสถานะใน list ทันที
     */
    async cancelSalesOrder(id: number) {
      const order = await salesOrderService.cancelSalesOrder(id)
      const index = this.salesOrderList.findIndex((o) => o.id === id)
      if (index !== -1) this.salesOrderList[index] = order
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSalesOrderStore, import.meta.hot))
}

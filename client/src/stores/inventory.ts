import { acceptHMRUpdate, defineStore } from 'pinia'
import { inventoryService } from '@/services/inventory.service'
import type { iInventoryMovement, iStockAdjustmentInput, iStockMovementInput } from '@/types/inventory.types'

interface iInventoryStore {
  movementList: iInventoryMovement[]
  isLoading: boolean
  error: string | null
}

export const useInventoryStore = defineStore('inventory', {
  state: (): iInventoryStore => ({
    movementList: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดประวัติการเคลื่อนไหวของสินค้า (Stock In / Stock Out / Adjustment)
     */
    async fetchMovements() {
      this.isLoading = true
      this.error = null

      try {
        this.movementList = await inventoryService.getAllMovements()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * บันทึกรับสินค้าเข้าคลัง แล้วเติมรายการเคลื่อนไหวใหม่เข้า list ทันที
     */
    async createStockIn(input: iStockMovementInput) {
      const movement = await inventoryService.createStockIn(input)
      this.movementList.unshift(movement)
    },

    /**
     * บันทึกเบิกสินค้าออกจากคลัง แล้วเติมรายการเคลื่อนไหวใหม่เข้า list ทันที
     */
    async createStockOut(input: iStockMovementInput) {
      const movement = await inventoryService.createStockOut(input)
      this.movementList.unshift(movement)
    },

    /**
     * บันทึกปรับปรุงจำนวนสินค้า แล้วเติมรายการเคลื่อนไหวใหม่เข้า list ทันที
     */
    async createAdjustment(input: iStockAdjustmentInput) {
      const movement = await inventoryService.createAdjustment(input)
      this.movementList.unshift(movement)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInventoryStore, import.meta.hot))
}

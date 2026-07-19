import { acceptHMRUpdate, defineStore } from 'pinia'
import { productService } from '@/services/product.service'
import type { iProduct, iProductInput } from '@/types/product.types'

interface iProductStore {
  productList: iProduct[]
  isLoading: boolean
  error: string | null
}

export const useProductStore = defineStore('product', {
  state: (): iProductStore => ({
    productList: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดรายการสินค้าทั้งหมด
     * ใช้ตอน initial load ของหน้าสินค้า
     */
    async fetchProducts() {
      this.isLoading = true
      this.error = null

      try {
        this.productList = await productService.getAllProducts()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้างสินค้าใหม่ แล้วเติมเข้า list ทันทีโดยไม่ต้อง fetch ซ้ำ
     */
    async createProduct(input: iProductInput) {
      const product = await productService.createProduct(input)
      this.productList.push(product)
    },

    /**
     * แก้ไขสินค้า แล้วอัปเดตใน list ทันที
     */
    async updateProduct(id: number, input: iProductInput) {
      const product = await productService.updateProduct(id, input)
      const index = this.productList.findIndex((p) => p.id === id)
      if (index !== -1) this.productList[index] = product
    },

    /**
     * ลบสินค้า แล้วตัดออกจาก list ทันที
     */
    async deleteProduct(id: number) {
      await productService.deleteProduct(id)
      this.productList = this.productList.filter((p) => p.id !== id)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductStore, import.meta.hot))
}

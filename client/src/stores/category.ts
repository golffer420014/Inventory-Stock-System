import { acceptHMRUpdate, defineStore } from 'pinia'
import { categoryService } from '@/services/category.service'
import type { iCategory } from '@/types/product.types'

interface iCategoryStore {
  categoryList: iCategory[]
  isLoading: boolean
  error: string | null
}

export const useCategoryStore = defineStore('category', {
  state: (): iCategoryStore => ({
    categoryList: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดรายการหมวดหมู่ทั้งหมด
     * ใช้ตอน initial load ของหน้าจัดการหมวดหมู่ และเติม dropdown หมวดหมู่ในฟอร์มสินค้า
     */
    async fetchCategories() {
      this.isLoading = true
      this.error = null

      try {
        this.categoryList = await categoryService.getAllCategories()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * สร้างหมวดหมู่ใหม่ แล้วเติมเข้า list ทันทีโดยไม่ต้อง fetch ซ้ำ
     */
    async createCategory(name: string, code: string) {
      const category = await categoryService.createCategory(name, code)
      this.categoryList.push(category)
    },

    /**
     * แก้ไขชื่อและ prefix ของหมวดหมู่ แล้วอัปเดตใน list ทันที
     */
    async updateCategory(id: number, name: string, code: string) {
      const category = await categoryService.updateCategory(id, name, code)
      const index = this.categoryList.findIndex((c) => c.id === id)
      if (index !== -1) this.categoryList[index] = category
    },

    /**
     * ลบหมวดหมู่ แล้วตัดออกจาก list ทันที
     */
    async deleteCategory(id: number) {
      await categoryService.deleteCategory(id)
      this.categoryList = this.categoryList.filter((c) => c.id !== id)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoryStore, import.meta.hot))
}

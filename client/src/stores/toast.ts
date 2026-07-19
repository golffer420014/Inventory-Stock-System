import { acceptHMRUpdate, defineStore } from 'pinia'

type tToastVariant = 'success' | 'destructive'

interface iActionToast {
  id: number
  variant: tToastVariant
  message: string
}

interface iToastStore {
  toasts: iActionToast[]
  nextId: number
}

const TOAST_DURATION_MS = 4000

export const useToastStore = defineStore('toast', {
  state: (): iToastStore => ({
    toasts: [],
    nextId: 1,
  }),

  actions: {
    /**
     * แสดง toast แจ้งผลลัพธ์ของ action ที่ผู้ใช้เพิ่งทำ (บันทึก/ยืนยัน/ลบ ฯลฯ) แล้วลบตัวเองออกอัตโนมัติหลังครบเวลา
     * ใช้แทนการปิด dialog เงียบๆ โดยไม่บอกผลลัพธ์
     */
    push(message: string, variant: tToastVariant = 'success') {
      const id = this.nextId++
      this.toasts.push({ id, variant, message })

      setTimeout(() => this.dismiss(id), TOAST_DURATION_MS)
    },

    dismiss(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}

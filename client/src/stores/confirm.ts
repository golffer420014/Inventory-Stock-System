import { acceptHMRUpdate, defineStore } from 'pinia'

interface iConfirmRequest {
  title: string
  message: string
  confirmText: string
  cancelText: string
  danger: boolean
}

interface iConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface iConfirmStore {
  request: iConfirmRequest | null
}

let resolveRequest: ((value: boolean) => void) | null = null

export const useConfirmStore = defineStore('confirm', {
  state: (): iConfirmStore => ({
    request: null,
  }),

  actions: {
    /**
     * เปิด confirm dialog แบบ imperative แทน window.confirm แล้วรอผลลัพธ์จากผู้ใช้
     * ใช้ await เพื่อรับค่า true (กดยืนยัน) หรือ false (กดยกเลิก/ปิด dialog)
     */
    ask(options: iConfirmOptions): Promise<boolean> {
      this.request = {
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'ยืนยัน',
        cancelText: options.cancelText ?? 'ยกเลิก',
        danger: options.danger ?? false,
      }

      return new Promise((resolve) => {
        resolveRequest = resolve
      })
    },

    resolve(result: boolean) {
      this.request = null
      resolveRequest?.(result)
      resolveRequest = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfirmStore, import.meta.hot))
}

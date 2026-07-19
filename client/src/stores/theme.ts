import { acceptHMRUpdate, defineStore } from 'pinia'

interface iThemeStore {
  isDark: boolean
}

const THEME_STORAGE_KEY = 'theme'

export const useThemeStore = defineStore('theme', {
  state: (): iThemeStore => ({
    isDark: false,
  }),

  actions: {
    /**
     * โหลด theme ที่ผู้ใช้เคยเลือกไว้จาก localStorage
     * ถ้ายังไม่เคยเลือก ให้ใช้ค่า preference ของระบบปฏิบัติการแทน
     */
    init() {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      this.isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
      this.applyTheme()
    },

    /**
     * สลับ theme ระหว่าง light/dark และจดจำค่าที่เลือกไว้ใน localStorage
     */
    toggleTheme() {
      this.isDark = !this.isDark
      localStorage.setItem(THEME_STORAGE_KEY, this.isDark ? 'dark' : 'light')
      this.applyTheme()
    },

    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot))
}

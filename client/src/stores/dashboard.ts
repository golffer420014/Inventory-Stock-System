import { acceptHMRUpdate, defineStore } from 'pinia'
import { dashboardService } from '@/services/dashboard.service'
import type { iDashboardSummary } from '@/types/dashboard.types'

interface iDashboardStore {
  summary: iDashboardSummary | null
  isLoading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): iDashboardStore => ({
    summary: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * โหลดข้อมูลสรุปภาพรวมสำหรับหน้า Dashboard
     */
    async fetchSummary() {
      this.isLoading = true
      this.error = null

      try {
        this.summary = await dashboardService.getSummary()
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      } finally {
        this.isLoading = false
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDashboardStore, import.meta.hot))
}

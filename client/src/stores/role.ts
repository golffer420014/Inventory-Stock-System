import { acceptHMRUpdate, defineStore } from 'pinia'
import type { tRole } from '@/types/role.types'

interface iRoleStore {
  currentRole: tRole
}

export const useRoleStore = defineStore('role', {
  state: (): iRoleStore => ({
    currentRole: 'Admin',
  }),

  actions: {
    /**
     * เปลี่ยน demo role เพื่อทดลองสิทธิ์การเข้าถึงของแต่ละตำแหน่ง (Admin/Sales/Warehouse/Viewer)
     */
    setRole(role: tRole) {
      this.currentRole = role
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoleStore, import.meta.hot))
}

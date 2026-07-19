import { computed } from 'vue'
import { useRoleStore } from '@/stores/role'
import type { tRole } from '@/types/role.types'

/**
 * ตรวจสอบสิทธิ์ของ role ปัจจุบันเทียบกับ Permission Matrix (README ข้อ 5)
 */
export const usePermission = () => {
  const roleStore = useRoleStore()

  const hasRole = (...allowedRoles: tRole[]) => computed(() => allowedRoles.includes(roleStore.currentRole))

  return { hasRole }
}

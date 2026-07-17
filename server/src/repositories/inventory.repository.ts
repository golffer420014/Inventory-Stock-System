import type { iInventoryMovement } from '@/types/inventory.types.js'

// TODO: ต่อ query จริงกับ PostgreSQL เมื่อเลือก DB client (pg / Knex / Prisma) แล้ว
export const inventoryRepository = {
  findAllMovements: async (): Promise<iInventoryMovement[]> => {
    return []
  },
}

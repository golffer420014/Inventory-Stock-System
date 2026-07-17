import type { iSalesOrder } from '@/types/salesOrder.types.js'

// TODO: ต่อ query จริงกับ PostgreSQL เมื่อเลือก DB client (pg / Knex / Prisma) แล้ว
export const salesOrderRepository = {
  findAll: async (): Promise<iSalesOrder[]> => {
    return []
  },
}

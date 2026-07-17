import type { iInvoice } from '@/types/salesOrder.types.js'

// TODO: ต่อ query จริงกับ PostgreSQL เมื่อเลือก DB client (pg / Knex / Prisma) แล้ว
export const invoiceRepository = {
  findAll: async (): Promise<iInvoice[]> => {
    return []
  },
}

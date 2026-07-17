import { env } from '@/config/env.js'

// DB client (pg / Knex / Prisma) ยังไม่ได้เลือก — ต่อ client จริงที่นี่เมื่อตัดสินใจแล้ว
export const databaseUrl = env.databaseUrl

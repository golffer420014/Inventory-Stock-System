import { Pool } from 'pg'
import { env } from '@/config/env.js'

// Supabase Postgres ต้องต่อผ่าน SSL เสมอ
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
})

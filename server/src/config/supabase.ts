import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env.js'

// ใช้ secret key (service role) ฝั่ง server เท่านั้น เพื่อให้ bypass RLS ตอนอัปโหลดไฟล์เข้า Storage
export const supabase = createClient(env.supabaseUrl, env.supabaseSecretKey)

export const UPLOADS_BUCKET = 'uploads'

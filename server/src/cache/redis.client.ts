import { env } from '@/config/env.js'

// Redis client ยังไม่ได้ต่อจริง — เก็บ config ไว้ก่อน รอเลือก library (ioredis / redis)
export const redisUrl = env.redisUrl

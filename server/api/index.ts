// Entry point สำหรับ Vercel Serverless Function - import Express app ที่ build แล้ว (dist/app.js, alias @/* ถูก
// tsc-alias resolve เป็น relative path ไปแล้วตอน build) แล้ว export ตรงๆ โดยไม่เรียก app.listen()
// Vercel รัน `npm run build` (tsc + tsc-alias) ให้อัตโนมัติก่อน bundle function นี้เสมอ
import { app } from '../dist/app.js'

export default app

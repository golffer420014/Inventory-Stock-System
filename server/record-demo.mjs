// สคริปต์อัดภาพหน้าจอเป็นเฟรมสำหรับทำ docs/screenshots/demo.gif
// วิธีใช้: node record-demo.mjs <output-frames-dir> (ต้องรัน client dev server ที่ localhost:5173 ไว้ก่อน)
//
// หมายเหตุสำคัญ: ห้ามเรียก page.screenshot() พร้อมกับตอนที่ page กำลัง navigate (page.goto/page.click ที่เปลี่ยนหน้า)
// เพราะ headless Chromium (headless: 'new') จะค้าง Page.captureScreenshot ไม่ยอม resolve เลยถ้าเฟรมกำลัง
// navigate อยู่พอดี - ต้อง navigate ให้เสร็จ (waitForSelector) ก่อน แล้วค่อย burst screenshot ทีหลังเสมอ
//
// หลังได้เฟรมแล้ว ประกอบเป็น gif ด้วย ffmpeg (สอง pass เพื่อคุณภาพสี):
//   ffmpeg -y -framerate 11 -i <dir>/f%05d.png -vf "fps=11,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer" -loop 0 docs/screenshots/demo.gif
import puppeteer from 'puppeteer'
import fs from 'fs'

const outDir = process.argv[2] || '.'
fs.mkdirSync(outDir, { recursive: true })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
// อัด viewport กว้างกว่าขนาด gif จริง (900x525) ไว้ก่อน เพราะ sidebar มี breakpoint พับอัตโนมัติที่ max-width: 959px
// ถ้าตั้ง viewport แคบตรง ๆ sidebar จะพับเหลือแต่ไอคอนทันที ไม่ตรงกับ demo.gif เดิมที่ทำจาก viewport กว้างแล้วค่อย scale ลง
// 1500x875 คงอัตราส่วน 12:7 เท่ากับ 900x525 พอดี ย่อด้วย ffmpeg ทีหลังจะไม่มีภาพยืด/ครอป
await page.setViewport({ width: 1500, height: 875 })
// บังคับ light theme เสมอ กัน headless Chromium สุ่ม default เป็น dark
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])

let frameIndex = 0

/** ถ่ายภาพต่อเนื่อง count ครั้ง ห่างกัน intervalMs - เรียกได้เฉพาะตอนหน้านิ่งแล้วเท่านั้น (ห้ามคาบเกี่ยวกับ navigate) */
async function burst(count, intervalMs) {
  for (let i = 0; i < count; i++) {
    const buf = await page.screenshot({ encoding: 'binary' })
    fs.writeFileSync(`${outDir}/f${String(frameIndex++).padStart(5, '0')}.png`, buf)
    await sleep(intervalMs)
  }
}

console.log('start')

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 })
await page.waitForSelector('.step-card', { timeout: 15000 })
await burst(20, 85) // หน้า Home + workflow card fade-in stagger
console.log('home done, frames:', frameIndex)

await page.click('a.sidebar-link[href="/dashboard"]')
await page.waitForSelector('.kpi-card', { timeout: 15000 })
await burst(26, 85) // KPI + chart card fade-in stagger
console.log('dashboard done, frames:', frameIndex)

await page.click('a.sidebar-link[href="/products"]')
await page.waitForSelector('.product-card', { timeout: 15000 })
await burst(12, 85) // product card fade-up stagger
const box = await page.$eval('.product-card', (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
})
await page.mouse.move(box.x, box.y, { steps: 15 })
await burst(10, 85) // hover lift settle + hold
console.log('products done, frames:', frameIndex)

await page.click('a.sidebar-link[href="/sales-orders"]')
await page.waitForSelector('.order-row', { timeout: 15000 })
await burst(18, 85)
console.log('sales orders done, frames:', frameIndex)

await page.click('a.sidebar-link[href="/inventory/movements"]')
await page.waitForSelector('.movement-row', { timeout: 15000 })
await burst(18, 85)
console.log('inventory movement done, frames:', frameIndex)

await browser.close()
console.log('frames captured:', frameIndex)

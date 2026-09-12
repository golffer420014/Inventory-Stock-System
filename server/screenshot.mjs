import puppeteer from 'puppeteer'

const outDir = process.argv[2] || '.'

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 960 })
// บังคับ prefers-color-scheme เป็น light เสมอ กัน headless Chromium สุ่ม default เป็น dark
// แล้วทำให้ label light/dark ของภาพสลับกันโดยไม่ตั้งใจ
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})

// ใช้ domcontentloaded + waitForSelector แทน networkidle0 เพราะ SSE (แจ้งเตือนสินค้าใกล้หมด)
// เปิด connection ค้างตลอด ทำให้ network ไม่มีวัน idle และ networkidle0 timeout ทุกครั้ง
async function shot(path, name, waitSelector) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
  if (waitSelector) await page.waitForSelector(waitSelector, { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: `${outDir}/${name}.png` })
}

// light home
await shot('/', 'home-light', '.step-card')
// light dashboard
await shot('/dashboard', 'dashboard-light', '.kpi-card')

// toggle to dark theme by clicking the theme toggle button in sidebar footer
await page.click('.sidebar-footer .theme-toggle')
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: `${outDir}/dashboard-dark.png` })

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.step-card', { timeout: 15000 })
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: `${outDir}/home-dark.png` })

console.log('errors:', JSON.stringify(errors))
await browser.close()

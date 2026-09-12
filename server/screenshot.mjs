import puppeteer from 'puppeteer'

const outDir = process.argv[2] || '.'

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 960 })

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})

async function shot(path, name) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle0', timeout: 20000 })
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: `${outDir}/${name}.png` })
}

// light home
await shot('/', 'home-light')
// light dashboard
await shot('/dashboard', 'dashboard-light')

// toggle to dark theme by clicking the theme toggle button in sidebar footer
await page.click('.sidebar-footer .theme-toggle')
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: `${outDir}/dashboard-dark.png` })

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: `${outDir}/home-dark.png` })

console.log('errors:', JSON.stringify(errors))
await browser.close()

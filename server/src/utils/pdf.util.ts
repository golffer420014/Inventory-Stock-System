import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'
import chromium from '@sparticuz/chromium'
import puppeteer, { type Browser } from 'puppeteer-core'
import { env } from '@/config/env.js'
import { toThaiBahtText } from './thaiBahtText.util.js'

/** ใช้ในเทมเพลตเป็น {{formatDate someDate}} จัดรูปแบบวันเวลาเป็นภาษาไทย เช่น "18 ก.ค. 2569 21:08" */
Handlebars.registerHelper('formatDate', (value: string | Date) => {
  return new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
})

/** ใช้ในเทมเพลตเป็น {{formatCurrency totalAmount}} ใส่ comma คั่นหลักพันตามธรรมเนียมไทย */
Handlebars.registerHelper('formatCurrency', (value: number) => {
  return Number(value).toLocaleString('th-TH')
})

/** ใช้ในเทมเพลตเป็น {{formatBahtText totalAmount}} แปลงยอดเงินเป็นคำอ่านภาษาไทยสำหรับช่อง "จำนวนเงินเป็นตัวอักษร" */
Handlebars.registerHelper('formatBahtText', (value: number) => {
  return toThaiBahtText(Number(value))
})

const TEMPLATES_DIR = fileURLToPath(new URL('../templates', import.meta.url))

const templateCache = new Map<string, string>()

/**
 * อ่านไฟล์ .hbs จาก server/src/templates (dev) หรือ dist/templates (prod หลัง build คัดลอกมาแล้ว)
 * cache เนื้อหาไว้ในหน่วยความจำ กันอ่านไฟล์ซ้ำทุกครั้งที่มีการ export PDF
 */
export const loadTemplate = (name: string): string => {
  const cached = templateCache.get(name)
  if (cached) return cached

  const content = readFileSync(`${TEMPLATES_DIR}/${name}.hbs`, 'utf-8')
  templateCache.set(name, content)
  return content
}

let browserPromise: Promise<Browser> | null = null

/**
 * ใช้ Chromium instance เดียวซ้ำทุก request กัน overhead เปิด/ปิด browser ทุกครั้งที่ export PDF
 * production (Vercel serverless) ใช้ @sparticuz/chromium ที่ bundle ไบนารีขนาดเล็กพอสำหรับ serverless function
 * dev ใช้ Chromium เต็มที่ดาวน์โหลดมากับ devDependency `puppeteer` ผ่าน executablePath ของมัน
 */
const getBrowser = async (): Promise<Browser> => {
  if (!browserPromise) {
    browserPromise =
      env.nodeEnv === 'production'
        ? puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
          })
        : (async () => {
            const { default: devPuppeteer } = await import('puppeteer')
            return puppeteer.launch({
              executablePath: await devPuppeteer.executablePath(),
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
            })
          })()
  }
  return browserPromise
}

/**
 * Render Handlebars template ด้วยข้อมูลที่ส่งเข้ามาเป็น HTML แล้วแปลงเป็น PDF buffer ด้วย Puppeteer
 */
export const renderPdf = async (template: string, data: Record<string, unknown>): Promise<Buffer> => {
  const html = Handlebars.compile(template)(data)

  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'load' })
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
    })
    return Buffer.from(pdf)
  } finally {
    await page.close()
  }
}

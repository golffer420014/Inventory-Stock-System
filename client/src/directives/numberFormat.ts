import type { Directive } from 'vue'

interface iNumberFormatElement extends HTMLInputElement {
  __numberFormatHandler__?: (event: Event) => void
  __numberFormatSyncing__?: boolean
}

/**
 * แปลงตัวเลขดิบให้เป็น string ที่มี comma คั่นหลักพัน
 * รองรับจุดทศนิยม (ตัดเหลือ 2 ตำแหน่ง) และเครื่องหมายลบ
 */
export const formatNumber = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.-]/g, '')
  const isNegative = cleaned.startsWith('-')
  const [intPart, ...rest] = cleaned.replace(/-/g, '').split('.')
  const decimalPart = rest.length ? rest.join('').slice(0, 2) : ''
  const groupedInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const value = rest.length ? `${groupedInt}.${decimalPart}` : groupedInt

  return isNegative && value ? `-${value}` : value
}

const applyFormat = (el: iNumberFormatElement) => {
  if (el.__numberFormatSyncing__) return

  const cursorFromEnd = el.value.length - (el.selectionEnd ?? el.value.length)
  const formatted = formatNumber(el.value)

  if (formatted === el.value) return

  el.value = formatted
  el.__numberFormatSyncing__ = true
  el.dispatchEvent(new Event('input'))
  el.__numberFormatSyncing__ = false

  const nextPos = Math.max(formatted.length - cursorFromEnd, 0)
  el.setSelectionRange(nextPos, nextPos)
}

/**
 * v-number-format
 * จัดรูปแบบ input ตัวเลขให้ใส่ comma คั่นหลักพันอัตโนมัติระหว่างพิมพ์
 * ใช้ร่วมกับ v-model บน <input> ได้โดยตรง (ค่าที่ได้จะเป็น string ที่มี comma)
 */
export const vNumberFormat: Directive<HTMLInputElement> = {
  mounted(el: iNumberFormatElement) {
    if (el.value) el.value = formatNumber(el.value)

    const handler = () => applyFormat(el)
    el.__numberFormatHandler__ = handler
    el.addEventListener('input', handler)
  },

  updated(el: iNumberFormatElement) {
    if (el.__numberFormatSyncing__) return
    if (document.activeElement === el) return

    const formatted = formatNumber(el.value)
    if (formatted !== el.value) el.value = formatted
  },

  unmounted(el: iNumberFormatElement) {
    if (el.__numberFormatHandler__) {
      el.removeEventListener('input', el.__numberFormatHandler__)
    }
  },
}

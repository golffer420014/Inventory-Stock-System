const THAI_DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const THAI_POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

/**
 * แปลงตัวเลข 1 กลุ่ม (0 - 999999) เป็นคำอ่านภาษาไทย รวม special case "ยี่สิบ" และ "เอ็ด"
 * (เลข 1 ในหลักหน่วยอ่านเป็น "เอ็ด" เมื่อมีหลักอื่นนำหน้าอยู่ในตัวเลขทั้งจำนวน)
 */
const readGroup = (groupValue: number, hasMoreDigitsBefore: boolean): string => {
  const digits = String(groupValue).split('').map(Number)
  const len = digits.length
  let result = ''

  digits.forEach((digit, index) => {
    if (digit === 0) return
    const position = len - index - 1

    if (position === 0) {
      const isLeadingDigitOfWholeNumber = index === 0 && !hasMoreDigitsBefore
      result += digit === 1 && !isLeadingDigitOfWholeNumber ? 'เอ็ด' : THAI_DIGITS[digit]
    } else if (position === 1) {
      result += digit === 1 ? 'สิบ' : digit === 2 ? 'ยี่สิบ' : `${THAI_DIGITS[digit]}สิบ`
    } else {
      result += `${THAI_DIGITS[digit]}${THAI_POSITIONS[position]}`
    }
  })

  return result
}

/**
 * แปลงจำนวนเต็ม (ไม่เกิน 6 หลักต่อกลุ่ม คั่นด้วย "ล้าน") เป็นคำอ่านภาษาไทยเต็มจำนวน
 */
const readInteger = (value: number): string => {
  if (value === 0) return 'ศูนย์'

  const groups: number[] = []
  let remaining = value
  while (remaining > 0) {
    groups.push(remaining % 1_000_000)
    remaining = Math.floor(remaining / 1_000_000)
  }

  let result = ''
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    result += readGroup(groups[i], i < groups.length - 1 || result.length > 0)
    result += 'ล้าน'.repeat(i)
  }

  return result
}

/**
 * แปลงจำนวนเงิน (บาท) เป็นข้อความภาษาไทยแบบเอกสารทางการ เช่น 1250.5 -> "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์"
 * ใช้ในเทมเพลต PDF (invoice, sales report) ผ่าน Handlebars helper {{formatBahtText totalAmount}}
 */
export const toThaiBahtText = (amount: number): string => {
  const rounded = Math.round(Math.abs(amount) * 100) / 100
  const baht = Math.floor(rounded)
  const satang = Math.round((rounded - baht) * 100)

  const bahtText = `${readInteger(baht)}บาท`
  const satangText = satang === 0 ? 'ถ้วน' : `${readInteger(satang)}สตางค์`

  return `${bahtText}${satangText}`
}

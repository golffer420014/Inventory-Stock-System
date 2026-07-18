const escapeCsvCell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * แปลง header + rows เป็นข้อความ CSV พร้อม UTF-8 BOM (จำเป็นสำหรับให้ Excel แสดงภาษาไทยถูกต้อง)
 */
const UTF8_BOM = '﻿'

export const toCsv = (headers: string[], rows: (string | number)[][]): string => {
  const allRows = headers.length > 0 ? [headers, ...rows] : rows
  const lines = allRows.map((row) => row.map(escapeCsvCell).join(','))
  return UTF8_BOM + lines.join('\r\n')
}

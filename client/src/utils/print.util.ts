import printJS from 'print-js'

/** แปลง Blob เป็น base64 (ไม่รวม data URL prefix) เพราะ printJS ต้องการ base64 ดิบเมื่อใช้ option base64: true */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.readAsDataURL(blob)
  })
}

/**
 * เปิด print preview ของไฟล์ PDF ด้วย printJS - โหลดผ่าน base64 แทนการยิง URL ตรง ๆ
 * เพราะ printJS fetch เองไม่รู้จัก header x-demo-role ที่ API ต้องการ (ต้องดึงไฟล์ผ่าน axios ก่อนแล้วค่อยส่งต่อ)
 */
export const previewPdf = async (blob: Blob, documentTitle: string): Promise<void> => {
  const base64 = await blobToBase64(blob)
  printJS({ printable: base64, type: 'pdf', base64: true, documentTitle })
}

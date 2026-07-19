/** สั่งให้ browser ดาวน์โหลดไฟล์จาก Blob โดยจำลองการคลิกลิงก์ชั่วคราว แล้วเก็บกวาด object URL ทิ้งทันที */
export const triggerBrowserDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

import { EventEmitter } from 'node:events'

export interface iLowStockEvent {
  productId: number
  sku: string
  name: string
  stockQuantity: number
}

/** ใช้ในหน่วยความจำเดียวกัน (single-instance) เป็น pub/sub ระหว่าง request ที่ปรับสต๊อก กับ SSE connection ของแต่ละ client ที่เปิดค้างไว้ */
export const notificationBus = new EventEmitter()
notificationBus.setMaxListeners(50)

export const emitLowStock = (event: iLowStockEvent): void => {
  notificationBus.emit('low-stock', event)
}

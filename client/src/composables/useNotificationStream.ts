import { onBeforeUnmount, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { notificationService } from '@/services/notification.service'
import type { iLowStockEvent } from '@/types/notification.types'

const POLL_INTERVAL_MS = 15_000

/**
 * Poll รายการสินค้าที่สต๊อกต่ำกว่าเกณฑ์เป็นระยะ (แทน SSE เดิม ที่ใช้ EventEmitter ในหน่วยความจำฝั่ง server
 * ซึ่งใช้ไม่ได้บน serverless เพราะแต่ละ request อาจไปคนละ instance กัน)
 * เทียบค่าสต๊อกล่าสุดของแต่ละสินค้ากับที่เคยเห็น ถ้าเปลี่ยน (ลดลงอีก หรือเพิ่งต่ำกว่าเกณฑ์) ถึงจะ toast
 * รอบแรกที่โหลด ไม่ toast สินค้าที่ต่ำกว่าเกณฑ์อยู่แล้วตั้งแต่ก่อนเปิดหน้า
 */
export const useNotificationStream = () => {
  const notificationStore = useNotificationStore()
  let intervalId: ReturnType<typeof setInterval> | null = null
  let isFirstPoll = true
  const lastSeenStock = new Map<number, number>()

  const poll = async () => {
    try {
      const lowStockProducts = await notificationService.getLowStock()

      lowStockProducts.forEach((product: iLowStockEvent) => {
        const previousQuantity = lastSeenStock.get(product.productId)
        if (!isFirstPoll && previousQuantity !== product.stockQuantity) {
          notificationStore.pushLowStockAlert(product)
        }
        lastSeenStock.set(product.productId, product.stockQuantity)
      })

      isFirstPoll = false
    } catch {
      // เงียบไว้ รอ poll รอบถัดไป ไม่ต้อง toast error รบกวนผู้ใช้
    }
  }

  onMounted(() => {
    poll()
    intervalId = setInterval(poll, POLL_INTERVAL_MS)
  })

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
  })
}

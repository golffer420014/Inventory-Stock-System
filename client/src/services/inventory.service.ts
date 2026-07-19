import { http } from '@/services/http'
import type { iInventoryMovement, iStockAdjustmentInput, iStockMovementInput } from '@/types/inventory.types'

export const inventoryService = {
  getAllMovements: () => http.get<iInventoryMovement[]>('/inventory/movements'),
  createStockIn: (input: iStockMovementInput) => http.post<iInventoryMovement>('/inventory/stock-in', input),
  createStockOut: (input: iStockMovementInput) => http.post<iInventoryMovement>('/inventory/stock-out', input),
  createAdjustment: (input: iStockAdjustmentInput) => http.post<iInventoryMovement>('/inventory/adjustment', input),
}

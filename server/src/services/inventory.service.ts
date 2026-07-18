import { inventoryRepository } from '@/repositories/inventory.repository.js'
import type { iInventoryMovement, iStockAdjustmentInput, iStockMovementInput } from '@/types/inventory.types.js'

export const inventoryService = {
  getAllMovements: async (): Promise<iInventoryMovement[]> => {
    return inventoryRepository.findAllMovements()
  },

  createStockIn: async (input: iStockMovementInput): Promise<iInventoryMovement> => {
    return inventoryRepository.createStockIn(input.productId, input.quantity, input.note)
  },

  createStockOut: async (input: iStockMovementInput): Promise<iInventoryMovement> => {
    return inventoryRepository.createStockOut(input.productId, input.quantity, input.note)
  },

  createAdjustment: async (input: iStockAdjustmentInput): Promise<iInventoryMovement> => {
    return inventoryRepository.createAdjustment(input.productId, input.quantity, input.note)
  },
}

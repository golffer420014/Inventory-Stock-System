import { inventoryRepository } from '@/repositories/inventory.repository.js'
import type { iInventoryMovement } from '@/types/inventory.types.js'

export const inventoryService = {
  getAllMovements: async (): Promise<iInventoryMovement[]> => {
    return inventoryRepository.findAllMovements()
  },
}

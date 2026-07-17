import { productRepository } from '@/repositories/product.repository.js'
import type { iProduct } from '@/types/product.types.js'

export const productService = {
  getAllProducts: async (): Promise<iProduct[]> => {
    return productRepository.findAll()
  },
}

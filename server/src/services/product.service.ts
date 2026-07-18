import { productRepository } from '@/repositories/product.repository.js'
import type { iProduct, iProductInput } from '@/types/product.types.js'

export const productService = {
  getAllProducts: async (): Promise<iProduct[]> => {
    return productRepository.findAll()
  },

  createProduct: async (input: iProductInput): Promise<iProduct> => {
    return productRepository.create(input)
  },

  updateProduct: async (id: number, input: iProductInput): Promise<iProduct | null> => {
    return productRepository.update(id, input)
  },

  deleteProduct: async (id: number): Promise<boolean> => {
    return productRepository.remove(id)
  },
}

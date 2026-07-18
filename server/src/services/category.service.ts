import { categoryRepository } from '@/repositories/category.repository.js'
import type { iCategory } from '@/types/product.types.js'

export const categoryService = {
  getAllCategories: async (): Promise<iCategory[]> => {
    return categoryRepository.findAll()
  },

  createCategory: async (name: string, code: string): Promise<iCategory> => {
    return categoryRepository.create(name, code)
  },

  updateCategory: async (id: number, name: string, code: string): Promise<iCategory | null> => {
    return categoryRepository.update(id, name, code)
  },

  deleteCategory: async (id: number): Promise<boolean> => {
    return categoryRepository.remove(id)
  },
}

import { Category } from '@/models/category.model.js'
import type { iCategory } from '@/types/product.types.js'

const toApiCategory = (category: Category): iCategory => ({
  id: category.id,
  name: category.name,
  code: category.code,
})

export const categoryRepository = {
  findAll: async (): Promise<iCategory[]> => {
    const categories = await Category.findAll({ orderBy: 'id' })
    return categories.map(toApiCategory)
  },

  create: async (name: string, code: string): Promise<iCategory> => {
    const category = await Category.create({ name, code })
    return toApiCategory(category)
  },

  update: async (id: number, name: string, code: string): Promise<iCategory | null> => {
    const category = await Category.updateById(id, { name, code })
    return category ? toApiCategory(category) : null
  },

  remove: async (id: number): Promise<boolean> => {
    return Category.deleteById(id)
  },
}

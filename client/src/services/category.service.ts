import { http } from '@/services/http'
import type { iCategory } from '@/types/product.types'

export const categoryService = {
  getAllCategories: () => http.get<iCategory[]>('/categories'),
  createCategory: (name: string, code: string) => http.post<iCategory>('/categories', { name, code }),
  updateCategory: (id: number, name: string, code: string) =>
    http.put<iCategory>(`/categories/${id}`, { name, code }),
  deleteCategory: (id: number) => http.delete(`/categories/${id}`),
}

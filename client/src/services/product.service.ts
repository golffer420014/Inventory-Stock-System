import { http } from '@/services/http'
import type { iProduct, iProductInput } from '@/types/product.types'

export const productService = {
  getAllProducts: () => http.get<iProduct[]>('/products'),
  createProduct: (input: iProductInput) => http.post<iProduct>('/products', input),
  updateProduct: (id: number, input: iProductInput) => http.put<iProduct>(`/products/${id}`, input),
  deleteProduct: (id: number) => http.delete(`/products/${id}`),
}

import type { Request, Response } from 'express'
import { productService } from '@/services/product.service.js'

export const productController = {
  list: async (_req: Request, res: Response) => {
    const products = await productService.getAllProducts()
    res.json(products)
  },
}

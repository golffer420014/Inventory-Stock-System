import type { iProduct } from '@/types/product.types.js'

// Category: 1 = Laptop, 2 = Monitor, 3 = Accessory, 4 = Component, 5 = Storage
const productSeed: iProduct[] = [
  { id: 1, sku: 'LAP-001', name: 'Laptop Dell Inspiron', brand: 'Dell', categoryId: 1, unit: 'เครื่อง', price: 18900, stockQuantity: 12 },
  { id: 2, sku: 'LAP-002', name: 'MacBook Air M3', brand: 'Apple', categoryId: 1, unit: 'เครื่อง', price: 39900, stockQuantity: 8 },
  { id: 3, sku: 'MON-001', name: 'Monitor 24 inch', brand: 'Samsung', categoryId: 2, unit: 'เครื่อง', price: 3990, stockQuantity: 20 },
  { id: 4, sku: 'MON-002', name: 'Monitor 27 inch', brand: 'LG', categoryId: 2, unit: 'เครื่อง', price: 6990, stockQuantity: 15 },
  { id: 5, sku: 'KB-001', name: 'Mechanical Keyboard', brand: 'Logitech', categoryId: 3, unit: 'ชิ้น', price: 1590, stockQuantity: 30 },
  { id: 6, sku: 'MS-001', name: 'Wireless Mouse', brand: 'Logitech', categoryId: 3, unit: 'ชิ้น', price: 590, stockQuantity: 45 },
  { id: 7, sku: 'RAM-001', name: 'DDR5 RAM 16GB', brand: 'Kingston', categoryId: 4, unit: 'ชิ้น', price: 1990, stockQuantity: 25 },
  { id: 8, sku: 'SSD-001', name: 'SSD NVMe 1TB', brand: 'Kingston', categoryId: 5, unit: 'ชิ้น', price: 2490, stockQuantity: 18 },
  { id: 9, sku: 'USB-001', name: 'USB-C Hub', brand: 'Ugreen', categoryId: 3, unit: 'ชิ้น', price: 890, stockQuantity: 22 },
]

// TODO: ต่อ query จริงกับ PostgreSQL เมื่อเลือก DB client (pg / Knex / Prisma) แล้ว — ตอนนี้ใช้ seed data ชั่วคราว
export const productRepository = {
  findAll: async (): Promise<iProduct[]> => {
    return productSeed
  },
}

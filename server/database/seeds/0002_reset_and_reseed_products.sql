-- 0002_reset_and_reseed_products.sql
-- ล้างข้อมูลทั้งหมด (sales order, invoice, ประวัติเคลื่อนไหวสต๊อก, สินค้า, หมวดหมู่)
-- แล้ว seed สินค้าเริ่มต้นใหม่ 10 รายการ สต็อกคงเหลือ 50 ทุกชิ้น พร้อมรูปภาพ

TRUNCATE TABLE
  sales_order_payments,
  invoices,
  sales_order_items,
  sales_orders,
  inventory_movements,
  products,
  categories
RESTART IDENTITY CASCADE;

INSERT INTO categories (name, code) VALUES
  ('Laptop',    'LAP'),
  ('Monitor',   'MON'),
  ('Accessory', 'ACC'),
  ('Component', 'COM'),
  ('Storage',   'STO');

INSERT INTO products (sku, name, brand, category_id, unit, price, stock_quantity, image_url) VALUES
  ('LAP-001', 'Inspiron 15',         'Dell',     1, 'เครื่อง', 18900, 50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Dell+Inspiron+15'),
  ('LAP-002', 'MacBook Air M3',      'Apple',    1, 'เครื่อง', 39900, 50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=MacBook+Air+M3'),
  ('MON-001', 'Monitor 24" IPS',     'Samsung',  2, 'เครื่อง', 3990,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Samsung+24in'),
  ('MON-002', 'Monitor 27" 4K',      'LG',       2, 'เครื่อง', 8990,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=LG+27in+4K'),
  ('ACC-001', 'Mechanical Keyboard', 'Logitech', 3, 'ชิ้น',    1590,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Logitech+Keyboard'),
  ('ACC-002', 'Wireless Mouse',      'Logitech', 3, 'ชิ้น',    590,   50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Logitech+Mouse'),
  ('COM-001', 'DDR5 RAM 16GB',       'Kingston', 4, 'ชิ้น',    1990,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Kingston+RAM+16GB'),
  ('COM-002', 'CPU Air Cooler',      'Deepcool', 4, 'ชิ้น',    1290,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Deepcool+Cooler'),
  ('STO-001', 'SSD NVMe 1TB',        'Kingston', 5, 'ชิ้น',    2490,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Kingston+SSD+1TB'),
  ('STO-002', 'External HDD 2TB',    'Seagate',  5, 'ชิ้น',    2190,  50, 'https://placehold.co/400x400/3b2f22/d8a34d?text=Seagate+HDD+2TB');

-- 0001_seed_products.sql

INSERT INTO categories (name, code) VALUES
  ('Laptop',    'LAP'),
  ('Monitor',   'MON'),
  ('Accessory', 'ACC'),
  ('Component', 'COM'),
  ('Storage',   'STO');

INSERT INTO products (sku, name, brand, category_id, unit, price, stock_quantity) VALUES
  ('LAP-001', 'Laptop Dell Inspiron',  'Dell',      1, 'เครื่อง', 18900, 12),
  ('LAP-002', 'MacBook Air M3',        'Apple',     1, 'เครื่อง', 39900, 8),
  ('MON-001', 'Monitor 24 inch',       'Samsung',   2, 'เครื่อง', 3990,  20),
  ('MON-002', 'Monitor 27 inch',       'LG',        2, 'เครื่อง', 6990,  15),
  ('ACC-001', 'Mechanical Keyboard',   'Logitech',  3, 'ชิ้น',    1590,  30),
  ('ACC-002', 'Wireless Mouse',        'Logitech',  3, 'ชิ้น',    590,   45),
  ('COM-001', 'DDR5 RAM 16GB',         'Kingston',  4, 'ชิ้น',    1990,  25),
  ('STO-001', 'SSD NVMe 1TB',          'Kingston',  5, 'ชิ้น',    2490,  18),
  ('ACC-003', 'USB-C Hub',             'Ugreen',    3, 'ชิ้น',    890,   22);

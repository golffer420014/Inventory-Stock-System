-- 0002_sales_order_invoice.sql
-- sales_orders, sales_order_items, invoices

CREATE TABLE sales_orders (
  id            SERIAL PRIMARY KEY,
  order_number  TEXT UNIQUE,
  status        TEXT NOT NULL CHECK (status IN ('DRAFT', 'CONFIRMED', 'FULFILLED', 'CANCELLED')) DEFAULT 'DRAFT',
  total_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN sales_orders.id           IS 'รหัส Sales Order';
COMMENT ON COLUMN sales_orders.order_number IS 'เลขที่คำสั่งขาย สร้างอัตโนมัติจาก id หลัง insert (เช่น SO-000001) - ปล่อย NULL ชั่วคราวระหว่าง insert เพื่อเลี่ยงชน UNIQUE (Postgres ยอมให้ NULL ซ้ำได้)';
COMMENT ON COLUMN sales_orders.status       IS 'สถานะ: DRAFT=ร่าง, CONFIRMED=ยืนยันแล้ว (มี Invoice แล้ว), FULFILLED=ตัดสต๊อกแล้ว, CANCELLED=ยกเลิก';
COMMENT ON COLUMN sales_orders.total_amount IS 'ยอดรวมของคำสั่งขาย คำนวณจากรายการสินค้า';
COMMENT ON COLUMN sales_orders.created_at   IS 'วันเวลาที่สร้างคำสั่งขาย';
COMMENT ON COLUMN sales_orders.updated_at   IS 'วันเวลาที่แก้ไขสถานะล่าสุด';

CREATE TABLE sales_order_items (
  id              SERIAL PRIMARY KEY,
  sales_order_id  INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(12, 2) NOT NULL
);

COMMENT ON COLUMN sales_order_items.id             IS 'รหัสรายการสินค้าในคำสั่งขาย';
COMMENT ON COLUMN sales_order_items.sales_order_id IS 'คำสั่งขายที่รายการนี้สังกัดอยู่';
COMMENT ON COLUMN sales_order_items.product_id     IS 'สินค้าที่สั่งขาย อ้างอิงตาราง products';
COMMENT ON COLUMN sales_order_items.quantity       IS 'จำนวนที่สั่งขาย';
COMMENT ON COLUMN sales_order_items.unit_price     IS 'ราคาต่อหน่วย ณ วันที่สั่งขาย (snapshot จาก products.price ตอนสร้างคำสั่งขาย)';

CREATE TABLE invoices (
  id              SERIAL PRIMARY KEY,
  invoice_number  TEXT UNIQUE,
  sales_order_id  INTEGER NOT NULL UNIQUE REFERENCES sales_orders(id),
  total_amount    NUMERIC(12, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN invoices.id             IS 'รหัส Invoice';
COMMENT ON COLUMN invoices.invoice_number IS 'เลขที่ใบแจ้งหนี้ สร้างอัตโนมัติจาก id หลัง insert (เช่น INV-000001)';
COMMENT ON COLUMN invoices.sales_order_id IS 'Sales Order ที่ใช้สร้าง Invoice นี้ (สร้างอัตโนมัติตอนยืนยันคำสั่งขาย)';
COMMENT ON COLUMN invoices.total_amount   IS 'ยอดรวม คัดลอกมาจากคำสั่งขาย ณ วันที่ยืนยัน';
COMMENT ON COLUMN invoices.created_at     IS 'วันเวลาที่สร้าง Invoice';

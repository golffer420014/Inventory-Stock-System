-- 0001_init_schema.sql
-- categories, products, inventory_movements

CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE
);

COMMENT ON COLUMN categories.id   IS 'รหัสหมวดหมู่สินค้า';
COMMENT ON COLUMN categories.name IS 'ชื่อหมวดหมู่สินค้า';
COMMENT ON COLUMN categories.code IS 'คำนำหน้า (prefix) ใช้สร้าง SKU สินค้าในหมวดหมู่นี้อัตโนมัติ';

CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  sku             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  brand           TEXT NOT NULL,
  category_id     INTEGER NOT NULL REFERENCES categories(id),
  unit            TEXT NOT NULL,
  price           NUMERIC(12, 2) NOT NULL,
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN products.id             IS 'รหัสสินค้า';
COMMENT ON COLUMN products.sku            IS 'รหัส SKU ใช้อ้างอิงสินค้า (สร้างอัตโนมัติจาก code ของหมวดหมู่ + running number)';
COMMENT ON COLUMN products.name           IS 'ชื่อสินค้า';
COMMENT ON COLUMN products.brand          IS 'ยี่ห้อ/แบรนด์';
COMMENT ON COLUMN products.category_id    IS 'หมวดหมู่สินค้า อ้างอิงตาราง categories';
COMMENT ON COLUMN products.unit           IS 'หน่วยนับ เช่น ชิ้น, เครื่อง';
COMMENT ON COLUMN products.price          IS 'ราคาต่อหน่วย (บาท)';
COMMENT ON COLUMN products.stock_quantity IS 'จำนวนสต๊อกคงเหลือรวม (สต๊อกเดียว ไม่แยกคลัง)';
COMMENT ON COLUMN products.image_url      IS 'URL รูปภาพสินค้า (ไฟล์จริงเก็บใน Supabase Storage)';
COMMENT ON COLUMN products.created_at     IS 'วันเวลาที่สร้างข้อมูล';
COMMENT ON COLUMN products.updated_at     IS 'วันเวลาที่แก้ไขล่าสุด';

CREATE TABLE inventory_movements (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  type        TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUSTMENT')),
  quantity    INTEGER NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN inventory_movements.id         IS 'รหัสรายการเคลื่อนไหวสต๊อก';
COMMENT ON COLUMN inventory_movements.product_id IS 'สินค้าที่เกี่ยวข้อง';
COMMENT ON COLUMN inventory_movements.type       IS 'ประเภท: IN=รับเข้า, OUT=จ่ายออก, ADJUSTMENT=ปรับยอด';
COMMENT ON COLUMN inventory_movements.quantity   IS 'จำนวนที่เคลื่อนไหว';
COMMENT ON COLUMN inventory_movements.note       IS 'หมายเหตุ (ถ้ามี)';
COMMENT ON COLUMN inventory_movements.created_at IS 'วันเวลาที่เกิดรายการ';

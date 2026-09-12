-- 0004_low_stock_notifications.sql
-- low_stock_notifications: ประวัติการแจ้งเตือนสินค้าใกล้หมด ให้ bell icon ฝั่ง client แสดงย้อนหลังได้

CREATE TABLE low_stock_notifications (
  id              SERIAL PRIMARY KEY,
  product_id      INTEGER NOT NULL REFERENCES products(id),
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  stock_quantity  INTEGER NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN low_stock_notifications.id             IS 'รหัสการแจ้งเตือน';
COMMENT ON COLUMN low_stock_notifications.product_id     IS 'สินค้าที่เกี่ยวข้อง อ้างอิงตาราง products';
COMMENT ON COLUMN low_stock_notifications.sku            IS 'SKU สินค้า ณ เวลาที่แจ้งเตือน (เก็บสำเนาไว้ กันชื่อ/SKU เปลี่ยนภายหลังแล้วประวัติเพี้ยน)';
COMMENT ON COLUMN low_stock_notifications.name           IS 'ชื่อสินค้า ณ เวลาที่แจ้งเตือน (เก็บสำเนาไว้เช่นเดียวกับ sku)';
COMMENT ON COLUMN low_stock_notifications.stock_quantity IS 'จำนวนสต๊อกคงเหลือ ณ เวลาที่แจ้งเตือน';
COMMENT ON COLUMN low_stock_notifications.is_read        IS 'ผู้ใช้เปิดดูแล้วหรือยัง ใช้กับ badge จำนวนที่ยังไม่ได้อ่านบน bell icon';
COMMENT ON COLUMN low_stock_notifications.created_at     IS 'วันเวลาที่เกิดการแจ้งเตือน';

CREATE INDEX idx_low_stock_notifications_created_at ON low_stock_notifications (created_at DESC);

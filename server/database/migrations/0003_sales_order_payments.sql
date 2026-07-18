-- 0003_sales_order_payments.sql
-- sales_order_payments: หลักฐานการชำระเงินที่แนบกับ Sales Order (ต้องมีอย่างน้อย 1 ไฟล์ก่อนยืนยันคำสั่งขาย)

CREATE TABLE sales_order_payments (
  id              SERIAL PRIMARY KEY,
  sales_order_id  INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN sales_order_payments.id             IS 'รหัสไฟล์แนบหลักฐานการชำระเงิน';
COMMENT ON COLUMN sales_order_payments.sales_order_id IS 'คำสั่งขายที่แนบไฟล์นี้';
COMMENT ON COLUMN sales_order_payments.file_url       IS 'URL ไฟล์ที่อัปโหลดไว้ (ผ่าน endpoint /uploads เดิม)';
COMMENT ON COLUMN sales_order_payments.file_name      IS 'ชื่อไฟล์ต้นฉบับตอนอัปโหลด ใช้แสดงผลในหน้ารายการ';
COMMENT ON COLUMN sales_order_payments.uploaded_at    IS 'วันเวลาที่แนบไฟล์';

CREATE INDEX idx_sales_order_payments_sales_order_id ON sales_order_payments(sales_order_id);
